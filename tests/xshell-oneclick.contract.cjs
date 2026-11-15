'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'xshell-quick-launch.js'), 'utf8');
const install = fs.readFileSync(path.join(root, 'install-nightshift-xshell.ps1'), 'utf8');
assert.ok(html.includes('<script src="./xshell-quick-launch.js"></script>'), 'Website must load launcher');
assert.deepEqual(
 [...html.matchAll(/<script\s+src="\.\/([^"]+)"/g)].map(m=>m[1]),
 ['app.js','section-toggle.js','temperature-auto.js','secret-link.js','custom-links.js','noc-table.js','xshell-quick-launch.js']
);
assert.match(script, /nightshifthub-xshell:\/\/open-all/);
assert.match(script, /เปิด Xshell ทั้ง 3/);
assert.match(script, /nsh-xshell-all-toolbar/);
assert.doesNotMatch(script, /ติดตั้งตัวเปิด|คัดลอก SSH|nsh-xshell-row|nsh-xshell-install|ssh:\/\//);
assert.doesNotMatch(script, /eval\s*\(|new\s+Function\s*\(/);
assert.doesNotMatch(script, /chrome\.scripting|child_process|ActiveXObject/);
for (const ip of ['10.1.100.3','10.1.100.1','10.1.100.2']) {
 assert.ok(script.includes(ip), 'Missing host '+ip);
 assert.ok(install.includes(ip), 'Missing host in PowerShell '+ip);
}
assert.match(install, /-WindowStyle Hidden/);
assert.match(install, /Start-Process/);
assert.match(install, /HKCU:\\Software\\Classes\\/);
assert.match(install, /\^nightshifthub-xshell:\/\/open-all\/\?\$/);
assert.match(install, /Read-Host 'Type YES to install/);
console.log('PASS: Night Shift Hub single-button Xshell launcher static source contract');
