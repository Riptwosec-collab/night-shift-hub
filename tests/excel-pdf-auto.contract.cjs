'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'excel-pdf-auto.js'),'utf8');
const ps=fs.readFileSync(path.join(root,'install-nightshift-excelpdf.ps1'),'utf8');
const srcs=[...html.matchAll(/<script\b[^>]*src="\.\/([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(srcs,[
 'app.js','section-toggle.js','temperature-auto.js',
 'secret-link.js','custom-links.js','noc-table.js',
 'xshell-quick-launch.js','excel-pdf-auto.js'
]);
assert.match(js,/nightshifthub-excelpdf:\/\/run/);
assert.match(js,/\.cards-grid/);
assert.match(js,/เลือก Excel → สร้าง PDF อัตโนมัติ/);
assert.match(js,/install-nightshift-excelpdf\.ps1/);
assert.match(ps,/nightshifthub-excelpdf:\/\/run/);
assert.match(ps,/OpenFileDialog/);
assert.match(ps,/Multiselect=\$true/);
assert.match(ps,/New-Object -ComObject Excel.Application/);
assert.match(ps,/\.AutomationSecurity=3/);
assert.match(ps,/Workbooks\.Open\(\$source,0,\$true\)/);
assert.match(ps,/FitToPagesWide=1/);
assert.match(ps,/FitToPagesTall=\$false/);
assert.match(ps,/A1:J/);
assert.match(ps,/\.ExportAsFixedFormat\(0,/);
assert.match(ps,/HKCU:\\Software\\Classes\\/);
assert.match(ps,/Read-Host 'Type YES to install/);
assert.doesNotMatch(js,/eval\s*\(|new\s+Function\s*\(/);
assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest/);

assert.match(ps,/FitToPagesTall=\$false/);
assert.doesNotMatch(ps,/FitToPagesTall=0\b/);
assert.match(ps,/PrintCommunication=\$false/);
assert.match(ps,/PrintCommunication=\$true/);
assert.match(js,/อัปเดตตัวแปลง Windows/);
assert.match(js,/1\.1\.2/);
assert.match(ps,/\$suffix=if\(\$i -eq 1\)\{'_A4\.pdf'\}else\{'_A4_'\+\$i\+'\.pdf'\}/);
assert.doesNotMatch(ps,/_จัดหน้า_A4/);
assert.ok(ps.charCodeAt(0) === 0xFEFF,'UTF-8 BOM required for Windows PowerShell 5.1');
console.log('PASS: Night Shift Hub Excel to PDF source/static contract');
