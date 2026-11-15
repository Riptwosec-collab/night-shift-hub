# Night Shift Hub - NOC External AutoFill V3.9 Windows launcher installer.
# Installs a fixed local URL handler and private copies of user-supplied CMD + PS1.
[CmdletBinding()]
param([string]$SourceCmd='', [switch]$Uninstall)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'

$scheme='nightshifthub-nocform'
$key='HKCU:\Software\Classes\'+$scheme
$folder=Join-Path $env:LOCALAPPDATA 'NightShiftHub\NOCExternalForm'
$installedCmd=Join-Path $folder 'OPEN_NOC_FORM.cmd'
$installedPs=Join-Path $folder 'NOC_External_Form.ps1'
$launcher=Join-Path $folder 'launch-noc-form.ps1'
$psExe=Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'

function Check-HandlerOwnership {
    if(-not (Test-Path -LiteralPath $key)){return}
    $commandKey=Join-Path $key 'shell\open\command'
    $current=if(Test-Path -LiteralPath $commandKey){(Get-Item -LiteralPath $commandKey).GetValue('')}else{''}
    if($current -notlike '*NightShiftHub\NOCExternalForm\launch-noc-form.ps1*'){
        throw 'Another application owns this Windows URL scheme. No changes made.'
    }
}
if($Uninstall){
    Check-HandlerOwnership
    if(Test-Path -LiteralPath $key){Remove-Item -LiteralPath $key -Recurse -Force}
    foreach($item in @($launcher,$installedCmd,$installedPs)){
        if(Test-Path -LiteralPath $item){Remove-Item -LiteralPath $item -Force}
    }
    Write-Host 'Night Shift Hub NOC form launcher uninstalled.' -ForegroundColor Green
    return
}
if(-not (Test-Path -LiteralPath $psExe -PathType Leaf)){
    throw 'Windows PowerShell 5.1 is required.'
}
if([string]::IsNullOrWhiteSpace($SourceCmd)){
    Add-Type -AssemblyName System.Windows.Forms
    $picker=New-Object System.Windows.Forms.OpenFileDialog
    $picker.Title='Choose your existing OPEN_NOC_FORM.cmd'
    $picker.FileName='OPEN_NOC_FORM.cmd'
    $picker.Filter='OPEN_NOC_FORM.cmd|OPEN_NOC_FORM.cmd|Windows Command Files (*.cmd)|*.cmd'
    $picker.CheckFileExists=$true
    $downloads=Join-Path $env:USERPROFILE 'Downloads'
    if(Test-Path -LiteralPath $downloads){$picker.InitialDirectory=$downloads}
    try {
        if($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK){
            Write-Host 'No file selected. Installation cancelled.'
            return
        }
        $SourceCmd=$picker.FileName
    } finally {$picker.Dispose()}
}
$SourceCmd=(Resolve-Path -LiteralPath $SourceCmd -ErrorAction Stop).ProviderPath
if([IO.Path]::GetFileName($SourceCmd) -cne 'OPEN_NOC_FORM.cmd'){
    throw 'Please select a file named OPEN_NOC_FORM.cmd.'
}
$sourcePs=Join-Path ([IO.Path]::GetDirectoryName($SourceCmd)) 'NOC_External_Form.ps1'
if(-not (Test-Path -LiteralPath $sourcePs -PathType Leaf)){
    throw 'NOC_External_Form.ps1 must be in the SAME folder as OPEN_NOC_FORM.cmd.'
}
$cmdText=Get-Content -LiteralPath $SourceCmd -Raw
if($cmdText -notmatch 'NOC_External_Form\.ps1'){
    throw 'The selected CMD does not reference the expected NOC_External_Form.ps1 file.'
}
Check-HandlerOwnership

Write-Host ''
Write-Host 'NOC External AutoFill V3.9 - one-time Windows integration' -ForegroundColor Cyan
Write-Host ('CMD : '+$SourceCmd)
Write-Host ('PS1 : '+$sourcePs)
Write-Host ('CMD SHA256: '+(Get-FileHash -LiteralPath $SourceCmd -Algorithm SHA256).Hash)
Write-Host ('PS1 SHA256: '+(Get-FileHash -LiteralPath $sourcePs -Algorithm SHA256).Hash)
Write-Host ('Private local folder: '+$folder)
Write-Warning 'This form can MODIFY an already-open Excel workbook. It does NOT Save automatically. Disable Excel AutoSave before testing.'
Write-Warning 'Any website can request this protocol. Approve the browser external-app prompt only from trusted websites.'
Write-Warning 'These files will run with your Windows account permissions. Review the CMD and PS1 before installing.'
$consent=Read-Host 'Type YES to install these two LOCAL files (anything else cancels)'
if($consent -cne 'YES'){Write-Host 'Cancelled. Nothing changed.';return}

New-Item -ItemType Directory -Path $folder -Force | Out-Null
if($SourceCmd -ne $installedCmd){Copy-Item -LiteralPath $SourceCmd -Destination $installedCmd -Force}
if($sourcePs -ne $installedPs){Copy-Item -LiteralPath $sourcePs -Destination $installedPs -Force}

$source=@'
# Fixed local action. Accept only the URL of this one form.
param([Parameter(Position=0)][string]$Uri='')
$ErrorActionPreference='Stop'
if($Uri -notmatch '^nightshifthub-nocform://open/?$'){exit 2}
$folder=Join-Path $env:LOCALAPPDATA 'NightShiftHub\NOCExternalForm'
$cmd=Join-Path $folder 'OPEN_NOC_FORM.cmd'
$ps1=Join-Path $folder 'NOC_External_Form.ps1'
$exe=Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
try {
    if(-not (Test-Path -LiteralPath $cmd -PathType Leaf) -or
       -not (Test-Path -LiteralPath $ps1 -PathType Leaf)){
        throw 'NOC form files are missing. Reinstall the NOC Windows launcher.'
    }
    # The original CMD is only a wrapper for this WinForms PowerShell script.
    Start-Process -FilePath $exe -WorkingDirectory $folder -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-STA','-File',('"' + $ps1 + '"'))
} catch {
    $log=Join-Path $folder 'launcher-error.log'
    Add-Content -LiteralPath $log -Value ((Get-Date -Format 's')+' '+$_.Exception.Message)
    try {
        Add-Type -AssemblyName System.Windows.Forms
        [void][System.Windows.Forms.MessageBox]::Show(
            $_.Exception.Message,'Night Shift Hub NOC Form',
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error)
    } catch {}
    exit 1
}
'@
Set-Content -LiteralPath $launcher -Value $source -Encoding UTF8

# The local handler validates the clicked URL. Do not accept arbitrary commands.
$command='"'+$psExe+'" -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$launcher+'" "%1"'
New-Item -Path $key -Force | Out-Null
Set-Item -LiteralPath $key -Value 'URL:Night Shift Hub NOC External Form'
New-ItemProperty -LiteralPath $key -Name 'URL Protocol' -PropertyType String -Value '' -Force | Out-Null
$commandKey=Join-Path $key 'shell\open\command'
New-Item -Path $commandKey -Force | Out-Null
Set-Item -LiteralPath $commandKey -Value $command
Write-Host ''
Write-Host 'Installation completed.' -ForegroundColor Green
Write-Host 'Go to Night Shift Hub > NOC@RD Table Builder > Open NOC External Form.'
Write-Host 'No private NOC form scripts have been published to GitHub or the website.'
Write-Host 'Uninstall: rerun this file with -Uninstall.'
Write-Host 'Test: Start-Process "nightshifthub-nocform://open"'
Write-Host ('Error log: '+(Join-Path $folder 'launcher-error.log'))
