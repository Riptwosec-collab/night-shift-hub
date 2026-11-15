'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const repair=fs.readFileSync(path.join(root,'repair-nightshift-excelpdf.ps1'),'utf8');
const installer=fs.readFileSync(path.join(root,'install-nightshift-excelpdf.ps1'),'utf8');
const page=fs.readFileSync(path.join(root,'excel-pdf-auto.js'),'utf8');
assert.equal(repair.charCodeAt(0),0xFEFF,'Repair script needs BOM for Windows PowerShell 5.1');
assert.match(repair,/function UniquePdf\(\[string\]\$source\)/);
assert.match(repair,/\$name\+'\.pdf'/);
assert.match(repair,/\$name\+'_'+\$i+'\.pdf'/);
assert.match(repair,/Copy-Item -LiteralPath \$installed -Destination \$backup/);
assert.match(repair,/UTF8Encoding\]::new\(\$true\)/);
assert.match(repair,/RenameExisting/);
assert.match(repair,/Type RENAME/);
assert.match(repair,/Rename-Item -LiteralPath \$entry\.Old -NewName \$entry\.NewName/);
assert.match(repair,/Test-Path -LiteralPath \$target/);
assert.doesNotMatch(repair,/Invoke-WebRequest|DownloadString|Invoke-Expression|Remove-Item|SaveAs|SaveCopyAs/i);
assert.match(installer,/\$suffix=if\(\$i -eq 1\)\{'\.pdf'\}else\{'_'\+\$i\+'\.pdf'\}/);
assert.match(page,/nightshifthub-excelpdf:\/\/run/);
const cleanPattern=/^(?<clean>.+?)_(?:[^\\/]{1,80}_)?A4(?:_\d+)?$/;
for(const pair of [
  ['สรุปรายงานเหตุการณ์ วันที่ 15 พฤศจิกายน 2569 เวลา 06.00 น.-20.30 น_เธเธฑเธ”เธซเธเนเธฒ_A4','สรุปรายงานเหตุการณ์ วันที่ 15 พฤศจิกายน 2569 เวลา 06.00 น.-20.30 น'],
  ['รายงาน_จัดหน้า_A4','รายงาน'],['รายงาน_A4','รายงาน']
]) assert.equal(pair[0].match(cleanPattern)?.groups.clean,pair[1]);
console.log('PASS: Excel PDF local filename repair source contract');
