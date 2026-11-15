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
assert.match(script, /ติดตั้งตัวเปิด \(ครั้งแรก\)/);
assert.match(script, /เปิด Xshell ทั้ง 3/);
assert.match(script, /install-nightshift-xshell\.ps1/);
assert.match(script, /\.device-grid/);
assert.match(script, /\.device-card\[data-device/);
for (const ip of ['10.1.100.3','10.1.100.1','10.1.100.2']) {
 assert.ok(script.includes(ip), 'Missing host '+ip);
 assert.ok(install.includes(ip), 'Missing IP in PowerShell '+ip);
}
assert.match(install, /Start-Process/);
assert.match(install, /HKCU:\\Software\\Classes\\/);
assert.match(install, /\^nightshifthub-xshell:\/\/open-all\/\?\$/);
assert.match(install, /Read-Host 'Type YES to install/);
assert.doesNotMatch(script, /eval\s*\(|new\s+Function\s*\(/);
assert.doesNotMatch(script, /chrome\.scripting|child_process|ActiveXObject/);
console.log('PASS: Night Shift Hub one-click Xshell launcher static source contract');
