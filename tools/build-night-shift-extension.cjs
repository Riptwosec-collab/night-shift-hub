#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'extension');
const mapping=[['index.html','dashboard.html'],['styles.css','styles.css'],
 ['app.js','app.js'],['section-toggle.js','section-toggle.js'],
 ['temperature-auto.js','temperature-auto.js'],['secret-link.js','secret-link.js'],
 ['custom-links.js','custom-links.js'],['noc-table.js','noc-table.js']];
fs.mkdirSync(target,{recursive:true});
for(const [from,to] of mapping)fs.copyFileSync(path.join(root,from),path.join(target,to));
// Extension-only SSH launch controls are deliberately NOT added to the hosted website.
const htmlPath=path.join(target,'dashboard.html');
let html=fs.readFileSync(htmlPath,'utf8');
html=html.replace('</body>', '  <script src="./xshell-quick-launch.js"></script>\n</body>');
fs.writeFileSync(htmlPath,html);

console.log('Night Shift Hub Full Dashboard refreshed from original sources ('+mapping.length+' files).');
