# Night Shift Hub Excel -> PDF local Windows bridge setup (current user only).
# Review before running. No website uploads, credentials or arbitrary downloaded scripts.
[CmdletBinding()]
param([switch]$Uninstall)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$scheme = 'nightshifthub-excelpdf'
$key = 'HKCU:\Software\Classes\' + $scheme
$directory = Join-Path $env:LOCALAPPDATA 'NightShiftHub\ExcelPDF'
$launcher = Join-Path $directory 'convert-excel-to-pdf.ps1'
$powershell = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
if ($Uninstall) {
    if (Test-Path -LiteralPath $key) {
        $commandKey = Join-Path $key 'shell\open\command'
        $current = if (Test-Path -LiteralPath $commandKey) { (Get-Item -LiteralPath $commandKey).GetValue('') } else { '' }
        if ($current -notlike '*NightShiftHub\ExcelPDF\convert-excel-to-pdf.ps1*') {
            throw 'Windows protocol does not point at this tool. Refusing to remove it.'
        }
        Remove-Item -LiteralPath $key -Recurse -Force
    }
    if (Test-Path -LiteralPath $directory) { Remove-Item -LiteralPath $directory -Recurse -Force }
    Write-Host 'Excel to PDF bridge uninstalled.'
    return
}
if (-not (Test-Path -LiteralPath $powershell -PathType Leaf)) {
    throw 'Windows PowerShell was not found.'
}
$convertSource = @'
# Fixed-action helper: Windows shows file picker, then Microsoft Excel exports PDFs.
# Worker version: 1.2.0 - Unicode-safe Excel filename -> PDF filename
# Browser supplies no filenames or shell commands; only the fixed protocol request.
param([Parameter(Position=0)][string]$Uri='')
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
if ($Uri -notmatch '^nightshifthub-excelpdf://run/?$') { exit 2 }
Add-Type -AssemblyName System.Windows.Forms
function Notice([string]$message) {
    [void][System.Windows.Forms.MessageBox]::Show(
       $message,'Night Shift Hub - Excel to PDF',
       [System.Windows.Forms.MessageBoxButtons]::OK,
       [System.Windows.Forms.MessageBoxIcon]::Information)
}
function ReleaseCom([object]$obj) {
    if ($null -ne $obj -and [Runtime.InteropServices.Marshal]::IsComObject($obj)) {
        try { [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($obj) } catch {}
    }
}
function UniquePdf([string]$source) {
    # Keep the ORIGINAL Unicode filename from the selected Excel workbook.
    # .NET Path combines Unicode strings; only the ASCII extension is appended.
    $fullSource=[IO.Path]::GetFullPath($source)
    $folder=[IO.Path]::GetDirectoryName($fullSource)
    $name=[IO.Path]::GetFileNameWithoutExtension($fullSource)
    if([string]::IsNullOrWhiteSpace($name)){throw 'Excel source file has no basename.'}
    for($i=1;$i -le 999;$i++){
        $outName=if($i -eq 1){$name+'.pdf'}else{$name+'_'+$i+'.pdf'}
        $result=[IO.Path]::Combine($folder,$outName)
        if (-not [IO.File]::Exists($result)) { return $result }
    }
    throw ('Too many existing PDF exports for '+$name)
}
function Write-Trace([string]$entry) {
    # UTF-16 LE log reliably preserves Thai filenames in Windows PowerShell 5.1.
    $trace=Join-Path $env:LOCALAPPDATA 'NightShiftHub\ExcelPDF\conversion-trace.txt'
    $line=(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')+' | '+$entry+[Environment]::NewLine
    try { [IO.File]::AppendAllText($trace,$line,[Text.Encoding]::Unicode) } catch {}
}
function ConvertOne([object]$app,[string]$source) {
    $book=$null; $sheet=$null; $used=$null; $range=$null; $br=$null
    try {
        $source=[IO.Path]::GetFullPath($source)
        $sourceBase=[IO.Path]::GetFileNameWithoutExtension($source)
        Write-Trace ('SELECTED_EXCEL | '+$source)
        $book=$app.Workbooks.Open($source,0,$true) # no external link update, read-only
        $sheet=$book.Worksheets.Item(1)
        $used=$sheet.UsedRange
        $lastRow=[int]($used.Row+$used.Rows.Count-1)
        if($lastRow -lt 1 -or $lastRow -gt 10000){ throw ('Unexpected last row: '+$lastRow) }
        # Deterministic equivalent of clicking B twice, ending with non-bold cells.
        $used.Font.Bold=$true
        $used.Font.Bold=$false
        $range=$sheet.Range(('A1:J'+$lastRow))
        $page=$sheet.PageSetup
        $page.Orientation=2                 # Landscape
        $page.PaperSize=9                   # A4
        $page.Zoom=$false
        $page.FitToPagesWide=1
        # Excel COM requires a Boolean False, NOT numeric 0, for unlimited vertical pages.
        # In some Excel / printer configurations, a PrintCommunication retry is necessary.
        try {
            $page.FitToPagesTall=$false
        } catch {
            try {
                $app.PrintCommunication=$false
                try {
                    $page.Zoom=$false
                    $page.FitToPagesWide=1
                    $page.FitToPagesTall=$false
                } finally {
                    $app.PrintCommunication=$true
                }
            } catch {
                throw ('ตั้งค่าแบ่งหน้าของ Excel ไม่สำเร็จ กรุณาตรวจสอบ Windows Default Printer (เช่น Microsoft Print to PDF) และตั้งค่า Page Layout ของ Excel: '+$_.Exception.Message)
            }
        }
        $page.PrintArea=$range.Address($true,$true)
        $page.PrintTitleRows=''             # No repeated title on page two
        $page.PrintTitleColumns=''
        $page.CenterHorizontally=$true
        $page.CenterVertically=$false
        $page.PrintGridlines=$false
        $page.BlackAndWhite=$false
        $page.LeftMargin=$app.InchesToPoints(0.7)
        $page.RightMargin=$app.InchesToPoints(0.7)
        $page.TopMargin=$app.InchesToPoints(0.75)
        $page.BottomMargin=$app.InchesToPoints(0.75)
        $refHeader=$false
        try{$refHeader=([string]$sheet.Range('C4').Text).Contains('รูปแบบการโจมตี')}catch{}
        if($lastRow -eq 27 -and $refHeader){
            $br=$sheet.Range('A20')
            [void]$sheet.HPageBreaks.Add($br)
        }
        $output=UniquePdf $source
        $outName=[IO.Path]::GetFileNameWithoutExtension($output)
        $expected=$sourceBase
        # Only a numeric suffix is allowed when the original PDF name already exists.
        $valid=($outName -ceq $expected)
        if(-not $valid -and $outName.StartsWith(($expected+'_'),[StringComparison]::Ordinal)){
            $tail=$outName.Substring($expected.Length+1)
            $numeric=0
            $valid=([int]::TryParse($tail,[ref]$numeric) -and $numeric -ge 2)
        }
        if(-not $valid){ throw 'Output filename does not match the selected Excel filename.' }
        Write-Trace ('PDF_TARGET | '+$output)
        $sheet.ExportAsFixedFormat(0,$output,0,$true,$false)
        if(-not [IO.File]::Exists($output)){ throw 'Excel did not create the PDF.' }
        Write-Trace ('PDF_EXPORTED | '+$output)
        return $output
    } finally {
        if($null -ne $book){try{$book.Close($false)}catch{}}
        ReleaseCom $br; ReleaseCom $range; ReleaseCom $used
        ReleaseCom $sheet; ReleaseCom $book
    }
}
$picker=New-Object System.Windows.Forms.OpenFileDialog
$picker.Title='Night Shift Hub - เลือก Excel (เลือกหลายไฟล์ได้)'
$picker.Filter='Excel (*.xlsx;*.xlsm;*.xls)|*.xlsx;*.xlsm;*.xls'
$picker.Multiselect=$true
$picker.CheckFileExists=$true
try {
    if($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK){exit 0}
    $files=@($picker.FileNames)
} finally { $picker.Dispose() }
if($files.Count -eq 0){exit 0}

$app=$null
$done=New-Object 'System.Collections.Generic.List[string]'
$failed=New-Object 'System.Collections.Generic.List[string]'
try {
    $app=New-Object -ComObject Excel.Application
    $app.Visible=$false
    $app.DisplayAlerts=$false
    $app.ScreenUpdating=$false
    $app.AskToUpdateLinks=$false
    try{$app.AutomationSecurity=3}catch{} # No VBA execution
    foreach($file in $files){
        try {
            if([IO.Path]::GetExtension($file).ToLowerInvariant() -notin @('.xlsx','.xls','.xlsm')){
                throw 'Unsupported Excel file extension.'
            }
            $pdf=ConvertOne $app $file
            $done.Add($pdf)
        }catch{
            Write-Trace ('FAILED | '+$file+' | '+$_.Exception.Message)
            $failed.Add(([IO.Path]::GetFileName($file)+': '+$_.Exception.Message))
        }
    }
} catch {
    $failed.Add(('Cannot start Microsoft Excel: '+$_.Exception.Message))
} finally {
    if($null -ne $app){try{$app.Quit()}catch{}}
    ReleaseCom $app
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
$nl=[Environment]::NewLine
$summary='สำเร็จ '+$done.Count+' จาก '+$files.Count+' ไฟล์'
if($failed.Count -gt 0){$summary+=$nl+$nl+'ไม่สำเร็จ:'+$nl+($failed -join $nl)}
if($done.Count -gt 0){
    try {
        if($done.Count -eq 1){
            Start-Process -FilePath $done[0]
        } else {
            Start-Process explorer.exe -ArgumentList ('/select,"'+$done[0]+'"')
            $summary+=$nl+$nl+'PDF บันทึกข้างไฟล์ Excel แต่ละไฟล์'
        }
    } catch {$summary+=$nl+$nl+'เปิดไฟล์ PDF ไม่สำเร็จ: '+$_.Exception.Message}
}
Notice $summary
'@

Write-Host ''
Write-Host 'Night Shift Hub - Excel to PDF local bridge' -ForegroundColor Cyan
Write-Host 'One website click shows a local Excel file picker.'
Write-Host 'Then it converts selected workbooks to A4 landscape PDF automatically.'
Write-Host 'Excel Desktop is REQUIRED. Source workbooks are opened READ ONLY.'
Write-Warning 'No data is uploaded. Any website can request this fixed protocol action.'
Write-Warning 'Chrome/Edge may prompt to open an external application.'
$answer=Read-Host 'Type YES to install (anything else cancels)'
if($answer -cne 'YES'){Write-Host 'Cancelled; nothing changed.';return}
New-Item -ItemType Directory -Path $directory -Force | Out-Null
Set-Content -LiteralPath $launcher -Value $convertSource -Encoding UTF8
# Ensure Windows actually received the updated helper before continuing.
$installedText=[IO.File]::ReadAllText($launcher,[Text.Encoding]::UTF8)
if(-not $installedText.Contains('Worker version: 1.2.0') -or
   -not $installedText.Contains('PDF_TARGET')){
    throw 'Installed Excel PDF helper verification failed.'
}
$command='"'+$powershell+'" -NoProfile -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$launcher+'" "%1"'
New-Item -Path $key -Force | Out-Null
Set-Item -LiteralPath $key -Value 'URL:Night Shift Hub Excel PDF Converter'
New-ItemProperty -LiteralPath $key -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
$commandKey=Join-Path $key 'shell\open\command'
New-Item -Path $commandKey -Force | Out-Null
Set-Item -LiteralPath $commandKey -Value $command
Write-Host 'Installation completed. Excel PDF worker version 1.2.0 verified.' -ForegroundColor Green
Write-Host 'Open Night Shift Hub and click Excel to PDF Auto.'
Write-Host 'To uninstall, re-run this script with -Uninstall.'
