# Repair Night Shift Hub's *installed local* Excel->PDF filename generator.
# Windows PowerShell 5.1, no administrator permissions, no network calls.
# Does not change Excel workbooks or regenerate PDF documents.
[CmdletBinding()]
param([switch]$RenameExisting)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$folder = Join-Path $env:LOCALAPPDATA 'NightShiftHub\ExcelPDF'
$installed = Join-Path $folder 'convert-excel-to-pdf.ps1'

if (-not (Test-Path -LiteralPath $installed -PathType Leaf)) {
    throw "Installed local Excel PDF converter not found at $installed. Install the Excel converter first."
}

# Replace only the named function in the local helper, not the whole program.
# ASCII-only suffix prevents Thai mojibake on PowerShell 5.1.
$replacement = @'
function UniquePdf([string]$source) {
    $folder=[IO.Path]::GetDirectoryName($source)
    $name=[IO.Path]::GetFileNameWithoutExtension($source)
    $candidate=Join-Path $folder ($name+'.pdf')
    if (-not [IO.File]::Exists($candidate)) { return $candidate }
    for($i=2;$i -le 999;$i++){
        $candidate=Join-Path $folder ($name+'_'+$i+'.pdf')
        if (-not [IO.File]::Exists($candidate)) { return $candidate }
    }
    throw ('Too many existing PDF exports for '+$name)
}
'@
$source=[IO.File]::ReadAllText($installed,[Text.Encoding]::UTF8)
$pattern='(?s)function\s+UniquePdf\s*\(\s*\[string\]\$source\s*\)\s*\{.*?(?=\r?\nfunction\s+ConvertOne\s*\()'
$matched=[regex]::Match($source,$pattern)
if (-not $matched.Success) {
    throw 'Unable to locate a compatible UniquePdf function; no local code was changed.'
}
$patched=$source.Substring(0,$matched.Index)+$replacement+$source.Substring($matched.Index+$matched.Length)
if ($patched -eq $source) {
    Write-Host 'The local filename generator already matches the repaired version.' -ForegroundColor Green
} else {
    $backup=$installed+'.backup-'+(Get-Date -Format 'yyyyMMdd-HHmmss')
    Copy-Item -LiteralPath $installed -Destination $backup -ErrorAction Stop
    [IO.File]::WriteAllText($installed,$patched,[Text.UTF8Encoding]::new($true))
    Write-Host ('Local converter repaired. Backup: '+$backup) -ForegroundColor Green
}
$verify=[IO.File]::ReadAllText($installed,[Text.Encoding]::UTF8)
$function=[regex]::Match($verify,$pattern).Value
if (-not [regex]::IsMatch($function, '\$name\+''\.pdf''') -or $function.Contains('_A4.pdf') -or $function.Contains('จัดหน้า')) {
    throw 'Validation failed. Restore the backup, and do not use the converter until it is checked.'
}
Write-Host 'Next PDF will use the original Excel basename + .pdf. Existing PDF files are NOT changed unless -RenameExisting is used.' -ForegroundColor Cyan

if(-not $RenameExisting){return}

# Optional, explicit selection and approval before renaming *existing* malformed PDFs.
Add-Type -AssemblyName System.Windows.Forms
$picker=New-Object System.Windows.Forms.OpenFileDialog
$picker.Title='Select only PDFs with a corrupted _..._A4 suffix'
$picker.Filter='PDF files (*.pdf)|*.pdf'
$picker.Multiselect=$true
$picker.CheckFileExists=$true
try {
    if($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
        Write-Host 'No files selected. Existing PDF files were not changed.'
        return
    }
    $pdfFiles=@($picker.FileNames)
} finally {$picker.Dispose()}

$changes=New-Object 'System.Collections.Generic.List[object]'
foreach($pdf in $pdfFiles) {
    $base=[IO.Path]::GetFileNameWithoutExtension($pdf)
    # Handles _A4, _จัดหน้า_A4, and text-corrupted _..._A4 variants.
    # Never use this regex on arbitrary PDFs without user selection/preview.
    if ($base -notmatch '^(?<clean>.+?)_(?:[^\\/]{1,80}_)?A4(?:_\d+)?$') {
        Write-Warning ('Not recognized as an old A4 export; skipped: '+$pdf)
        continue
    }
    $clean=$matches['clean']
    $name=$clean+'.pdf'
    $target=Join-Path ([IO.Path]::GetDirectoryName($pdf)) $name
    if(Test-Path -LiteralPath $target) {
        Write-Warning ('Target already exists, will NOT overwrite: '+$target)
        continue
    }
    $changes.Add([PSCustomObject]@{ Old=$pdf; New=$target; NewName=$name })
}
if($changes.Count -eq 0) {
    Write-Host 'Nothing to rename.';return
}
Write-Host 'EXISTING PDF RENAME PREVIEW:' -ForegroundColor Yellow
$changes | Format-Table Old,New -Wrap | Out-Host
$confirm=Read-Host 'Type RENAME to apply the preview above (anything else cancels)'
if($confirm -cne 'RENAME') {
    Write-Host 'Existing PDFs were not renamed.'
    return
}
foreach($entry in $changes) {
    if(Test-Path -LiteralPath $entry.New) {
        Write-Warning ('Skipped collision: '+$entry.New); continue
    }
    Rename-Item -LiteralPath $entry.Old -NewName $entry.NewName -ErrorAction Stop
    Write-Host ('Renamed: '+$entry.NewName) -ForegroundColor Green
}
