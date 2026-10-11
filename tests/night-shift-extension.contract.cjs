'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ext=path.join(root,'extension');
const manifest=JSON.parse(fs.readFileSync(path.join(ext,'manifest.json'),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.equal(manifest.options_ui.page,'dashboard.html');
assert.equal(manifest.options_ui.open_in_tab,true);
assert.equal(manifest.action.default_popup,undefined);
assert.deepEqual(manifest.permissions,[]);
assert.match(manifest.content_security_policy.extension_pages,/script-src 'self'/);
const pairs=[['index.html','dashboard.html'],['styles.css','styles.css'],
 ['app.js','app.js'],['section-toggle.js','section-toggle.js'],
 ['temperature-auto.js','temperature-auto.js'],['secret-link.js','secret-link.js'],
 ['custom-links.js','custom-links.js'],['noc-table.js','noc-table.js']];
for(const [original,copy] of pairs)
 assert.deepEqual(fs.readFileSync(path.join(root,original)),fs.readFileSync(path.join(ext,copy)),
   'Extension source drift: '+original+' -> '+copy);
const html=fs.readFileSync(path.join(ext,'dashboard.html'),'utf8');
assert.equal([...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>\s*\S/gi)].length,0);
assert.doesNotMatch(html,/\son(?:click|load|submit)\s*=/);
const scripts=[...html.matchAll(/<script\b[^>]*src="\.\/([^"?]+)"/g)].map(x=>x[1]);
assert.deepEqual(scripts,['app.js','section-toggle.js','temperature-auto.js',
 'secret-link.js','custom-links.js','noc-table.js']);
for(const src of scripts)assert.ok(fs.existsSync(path.join(ext,src)));
assert.match(html,/href="\.\/styles\.css"/);
assert.ok(fs.existsSync(path.join(ext,'icon-128.png')));
assert.match(fs.readFileSync(path.join(ext,'background.js'),'utf8'),/openOptionsPage/);
console.log('PASS: Night Shift Hub Full Dashboard MV3 package/source parity (static checks).');
