# Night Shift Hub - Windows Xshell 8 one-click launcher installer.
# Sets up an optional, fixed-purpose custom URL protocol: nightshifthub-xshell://open-all
# Only three predefined hosts are opened. No remote scripts or website parameters execute.
# Scope: current Windows user (HKCU), no Administrator required.
[CmdletBinding()]
param(
    [string]$XshellPath = '',
    [switch]$Uninstall
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scheme = 'nightshifthub-xshell'
$registryKey = 'HKCU:\Software\Classes\' + $scheme
$folder = Join-Path $env:LOCALAPPDATA 'NightShiftHub\XshellLauncher'
$launchScriptPath = Join-Path $folder 'open-3-xshell.ps1'
$pathConfig = Join-Path $folder 'xshell-path.txt'

if ($Uninstall) {
    if (Test-Path $registryKey) {
        $actualCommandKey = Join-Path $registryKey 'shell\open\command'
        $actualCommand = if (Test-Path $actualCommandKey) { (Get-Item $actualCommandKey).GetValue('') } else { '' }
        if ($actualCommand -notlike '*NightShiftHub\XshellLauncher\open-3-xshell.ps1*') {
            throw 'Protocol handler no longer points at Night Shift Hub. Refusing to remove another program handler.'
        }
        Remove-Item -LiteralPath $registryKey -Recurse -Force
        Write-Host 'Removed Night Shift Hub Windows protocol handler.'
    }
    if (Test-Path $folder) { Remove-Item -LiteralPath $folder -Recurse -Force }
    Write-Host 'Uninstall completed.'
    return
}

$programFilesX86 = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
$candidates = @()
if ($programFilesX86) {
    $candidates += (Join-Path $programFilesX86 'NetSarang\Xshell 8\Xshell.exe')
}
if ($env:ProgramFiles) {
    $candidates += (Join-Path $env:ProgramFiles 'NetSarang\Xshell 8\Xshell.exe')
}
if ($env:LOCALAPPDATA) {
    $candidates += (Join-Path $env:LOCALAPPDATA 'Programs\NetSarang\Xshell 8\Xshell.exe')
}
if (-not $XshellPath) {
    $found = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    if ($found) { $XshellPath = $found }
}
if (-not $XshellPath) {
    $command = Get-Command -Name 'Xshell.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($command -and $command.Source) { $XshellPath = $command.Source }
}
if (-not $XshellPath) {
    Write-Host 'Could not locate Xshell 8 automatically.'
    $XshellPath = Read-Host 'Paste the full Xshell.exe path from shortcut Properties > Target'
}
$XshellPath = $XshellPath.Trim().Trim('"')
if (-not (Test-Path -LiteralPath $XshellPath -PathType Leaf)) {
    throw "Xshell.exe was not found at: $XshellPath"
}
$XshellPath = (Resolve-Path -LiteralPath $XshellPath).ProviderPath
if ([IO.Path]::GetFileName($XshellPath) -ine 'Xshell.exe') {
    throw 'Please select the real Xshell.exe executable.'
}
$powershell = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
if (-not (Test-Path -LiteralPath $powershell -PathType Leaf)) {
    throw 'Windows PowerShell executable was not found.'
}

$launchScript = @'
# Locally installed by Night Shift Hub. Accepts only the fixed open-all URL.
param([Parameter(Position = 0)][string]$Uri = '')
$ErrorActionPreference = 'Stop'
if ($Uri -notmatch '^nightshifthub-xshell://open-all/?$') {
    Write-Host 'Rejected unexpected Night Shift Hub request.'
    exit 2
}

try {
    $exePath = (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'xshell-path.txt') -Raw).Trim()
    if (([IO.Path]::GetFileName($exePath) -ine 'Xshell.exe') -or
        (-not (Test-Path -LiteralPath $exePath -PathType Leaf))) {
        throw 'Xshell executable path is invalid.'
    }
    $hosts = @('10.1.100.3','10.1.100.1','10.1.100.2')
    $index = 0
    foreach ($hostIp in $hosts) {
        $index++
        Write-Host ("[{0}/3] Opening Xshell SSH {1}" -f $index,$hostIp)
        Start-Process -FilePath $exePath -ArgumentList @('-url', ('ssh://' + $hostIp))
        Start-Sleep -Milliseconds 900
    }
    Write-Host 'Requested 3 Xshell sessions in the specified order.'
    Write-Host 'For 3 tabs in one window: Xshell > Tools > Options > Advanced > Open multiple sessions in a single Xshell window.'
} catch {
    $logPath = Join-Path $PSScriptRoot 'launcher-error.log'
    Add-Content -LiteralPath $logPath -Value ((Get-Date -Format 's') + ' ' + $_.Exception.Message)
    exit 1
}
'@

Write-Host ''
Write-Host 'Night Shift Hub - Xshell 8 one-click launcher setup' -ForegroundColor Cyan
Write-Host ('Detected Xshell: ' + $XshellPath)
Write-Host 'One click on the Night Shift Hub website will:'
Write-Host '  1. Open a PowerShell window (local fixed script)'
Write-Host '  2. Open Xshell SSH 10.1.100.3'
Write-Host '  3. Open Xshell SSH 10.1.100.1'
Write-Host '  4. Open Xshell SSH 10.1.100.2'
Write-Warning 'Any website can request this custom protocol; the local script accepts only the exact open-all action.'
Write-Warning 'This will register the URL scheme under HKCU; it does not change the ssh:// default app.'
Write-Host ''
$answer = Read-Host 'Type YES to install (anything else cancels)'
if ($answer -cne 'YES') {
    Write-Host 'Cancelled. No changes were made.'
    return
}

New-Item -ItemType Directory -Path $folder -Force | Out-Null
Set-Content -LiteralPath $launchScriptPath -Value $launchScript -Encoding UTF8
Set-Content -LiteralPath $pathConfig -Value $XshellPath -Encoding UTF8

$commandString = '"' + $powershell + '" -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $launchScriptPath + '" "%1"'
New-Item -Path $registryKey -Force | Out-Null
Set-Item -LiteralPath $registryKey -Value 'URL:Night Shift Hub Xshell Launcher'
New-ItemProperty -LiteralPath $registryKey -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
$commandKey = Join-Path $registryKey 'shell\open\command'
New-Item -Path $commandKey -Force | Out-Null
Set-Item -LiteralPath $commandKey -Value $commandString

Write-Host ''
Write-Host 'Installation completed.' -ForegroundColor Green
Write-Host 'Open Night Shift Hub in Chrome/Edge, then click: เปิด Xshell ทั้ง 3'
Write-Host 'Windows/Chrome may ask for permission to open this locally installed application.'
Write-Host 'To uninstall: powershell -NoProfile -File .\install-nightshift-xshell.ps1 -Uninstall'
