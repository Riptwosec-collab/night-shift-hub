# Night Shift Hub — NetFlow 14-node Chrome launcher for Windows.
# One-time install under HKCU. Browser passes only a fixed protocol URL.
[CmdletBinding()]
param([switch]$Uninstall)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$scheme='nightshifthub-netflow'
$key='HKCU:\Software\Classes\'+$scheme
$folder=Join-Path $env:LOCALAPPDATA 'NightShiftHub\NetFlowLauncher'
$launcher=Join-Path $folder 'open-netflow-14.ps1'
$powershell=Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
function Check-Handler {
    if(-not (Test-Path -LiteralPath $key)){return}
    $commandKey=Join-Path $key 'shell\open\command'
    $old=if(Test-Path -LiteralPath $commandKey){(Get-Item -LiteralPath $commandKey).GetValue('')}else{''}
    if($old -notlike '*NightShiftHub\NetFlowLauncher\open-netflow-14.ps1*'){
        throw 'An existing program owns this URL scheme. No registry change made.'
    }
}
if($Uninstall){
    Check-Handler
    if(Test-Path -LiteralPath $key){Remove-Item -LiteralPath $key -Force -Recurse}
    if(Test-Path -LiteralPath $folder){Remove-Item -LiteralPath $folder -Force -Recurse}
    Write-Host 'NetFlow launcher uninstalled.'
    return
}
if(-not (Test-Path -LiteralPath $powershell -PathType Leaf)){throw 'Windows PowerShell not found.'}
$source=@'
# Local, fixed-purpose NetFlow launcher; no user supplied URLs or commands.
param([Parameter(Position=0)][string]$Uri='')
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
if($Uri -notmatch '^nightshifthub-netflow://open-all/?$'){exit 2}
try {
    $ids=@('3677','3723','7163','3843','3841','2597','3853',
           '3854','3855','3856','3861','3863','3865','3866')
    $urls=@($ids | ForEach-Object {
        'https://nocorion.rd.go.th/Orion/TrafficAnalysis/NetflowNodeDetails.aspx?NetObject=NN:'+$_
    })
    if($urls.Count -ne 14){throw 'NetFlow target count mismatch.'}
    $paths=@()
    if($env:ProgramFiles){$paths+=(Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe')}
    $pf86=[Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
    if($pf86){$paths+=(Join-Path $pf86 'Google\Chrome\Application\chrome.exe')}
    if($env:LOCALAPPDATA){$paths+=(Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')}
    $chrome=$paths | Where-Object {Test-Path -LiteralPath $_ -PathType Leaf} | Select-Object -First 1
    if(-not $chrome){
        $cmd=Get-Command chrome.exe -ErrorAction SilentlyContinue | Select-Object -First 1
        if($cmd){$chrome=$cmd.Source}
    }
    if(-not $chrome){throw 'Google Chrome not found.'}
    # Foreground warmup: open URLs sequentially instead of all at once.
    $warmupSeconds=15
    $config=Join-Path $PSScriptRoot 'warmup-seconds.txt'
    if(Test-Path -LiteralPath $config){
        $setting=(Get-Content -LiteralPath $config -Raw).Trim()
        $parsed=0
        if([int]::TryParse($setting,[ref]$parsed) -and $parsed -ge 5 -and $parsed -le 60){
            $warmupSeconds=$parsed
        }
    }
    $progressLog=Join-Path $PSScriptRoot 'netflow-warmup.log'
    Set-Content -LiteralPath $progressLog -Value ('Started '+(Get-Date -Format 's')+' | delay '+$warmupSeconds+'s') -Encoding UTF8
    Start-Process -FilePath $chrome -ArgumentList @('--new-window',$urls[0])
    Add-Content -LiteralPath $progressLog -Value ('1/14 | NN:'+$ids[0])
    for($i=1;$i -lt $urls.Count;$i++){
        Start-Sleep -Seconds $warmupSeconds
        # Without --new-window, Chrome normally opens the URL as a foreground tab
        # in the last active Chrome window. No window or profile is forcibly changed.
        Start-Process -FilePath $chrome -ArgumentList @($urls[$i])
        Add-Content -LiteralPath $progressLog -Value (($i+1).ToString()+'/14 | NN:'+$ids[$i])
    }
    Add-Content -LiteralPath $progressLog -Value ('All 14 pages requested at '+(Get-Date -Format 's'))

} catch {
    $log=Join-Path $PSScriptRoot 'netflow-launcher-error.log'
    Add-Content -LiteralPath $log -Value ((Get-Date -Format 's')+' '+$_.Exception.Message)
    try {
        Add-Type -AssemblyName System.Windows.Forms
        [void][System.Windows.Forms.MessageBox]::Show(
            $_.Exception.Message,'Night Shift Hub NetFlow',
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error)
    } catch {}
    exit 1
}
'@
Write-Host 'Night Shift Hub NetFlow 14 — Chrome launcher' -ForegroundColor Cyan
Write-Host 'One click opens a Chrome window and loads all 14 NetFlow tabs sequentially.'
Write-Host 'Default warmup: 15 seconds per tab; configure 5-60 seconds in warmup-seconds.txt.'
Write-Warning 'Any website can request the custom URL scheme, but the installed launcher accepts only the fixed 14 URLs.'
Write-Warning 'Chrome/Windows may ask before opening the external application. Normal VPN and login permissions apply.'
$answer=Read-Host 'Type YES to install for this Windows account (anything else cancels)'
if($answer -cne 'YES'){Write-Host 'Cancelled. No changes made.';return}
Check-Handler
New-Item -ItemType Directory -Path $folder -Force | Out-Null
Set-Content -LiteralPath $launcher -Value $source -Encoding UTF8
# Preserve a local warmup delay already customized by the user.
$config=Join-Path $folder 'warmup-seconds.txt'
if(-not (Test-Path -LiteralPath $config)){
    Set-Content -LiteralPath $config -Value '15' -Encoding Ascii
}

$command='"'+$powershell+'" -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$launcher+'" "%1"'
New-Item -Path $key -Force | Out-Null
Set-Item -LiteralPath $key -Value 'URL:Night Shift Hub NetFlow Launcher'
New-ItemProperty -LiteralPath $key -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
$commandKey=Join-Path $key 'shell\open\command'
New-Item -Path $commandKey -Force | Out-Null
Set-Item -LiteralPath $commandKey -Value $command
Write-Host 'Installation completed.' -ForegroundColor Green
Write-Host 'Open Night Shift Hub then click the NetFlow 14 button.'
Write-Host 'Uninstall: rerun this installer with -Uninstall.'
