# Optional: register Xshell 8 as ssh:// opener for current Windows user.
# WARNING: Changes Windows handling of ALL ssh:// links, not just Night Shift Hub.
[CmdletBinding()]
param([string] $XshellPath)
$ErrorActionPreference = 'Stop'
$pf86 = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
$candidates = @()
if ($pf86) { $candidates += (Join-Path $pf86 'NetSarang\Xshell 8\Xshell.exe') }
if ($env:ProgramFiles) { $candidates += (Join-Path $env:ProgramFiles 'NetSarang\Xshell 8\Xshell.exe') }
if ($env:LOCALAPPDATA) { $candidates += (Join-Path $env:LOCALAPPDATA 'Programs\NetSarang\Xshell 8\Xshell.exe') }
if (-not $XshellPath) {
    $XshellPath = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
}
if (-not $XshellPath) { $XshellPath = Read-Host 'Full path to Xshell.exe (from shortcut Properties)' }
if (-not (Test-Path -LiteralPath $XshellPath -PathType Leaf)) { throw "Xshell.exe not found: $XshellPath" }
$XshellPath = (Resolve-Path -LiteralPath $XshellPath).ProviderPath
if ([IO.Path]::GetFileName($XshellPath) -ine 'Xshell.exe') { throw 'Select Xshell.exe.' }
$key = 'HKCU:\Software\Classes\ssh'
$commandKey = Join-Path $key 'shell\open\command'
$previous = if (Test-Path $commandKey) { (Get-Item $commandKey).GetValue('') } else { $null }
$newCommand = '"{0}" -url "%1"' -f $XshellPath
Write-Host ('Xshell: ' + $XshellPath)
if ($previous) { Write-Warning ('Existing ssh:// handler will be replaced: ' + $previous) }
Write-Warning 'Any app or website can request ssh:// links after this registration. Review browser prompts.'
$confirm = Read-Host 'Register Xshell for ssh:// on this Windows account? (YES/NO)'
if ($confirm -ne 'YES') { Write-Host 'Cancelled; nothing changed.'; exit }
New-Item -Path $key -Force | Out-Null
Set-Item -Path $key -Value 'URL:Xshell SSH Protocol'
New-ItemProperty -Path $key -Name 'URL Protocol' -PropertyType String -Value '' -Force | Out-Null
New-Item -Path $commandKey -Force | Out-Null
Set-Item -Path $commandKey -Value $newCommand
Write-Host 'Registered ssh:// to Xshell in HKCU.'
Write-Host 'If Windows has another default SSH handler: Settings > Apps > Default apps > Choose defaults by link type.'
