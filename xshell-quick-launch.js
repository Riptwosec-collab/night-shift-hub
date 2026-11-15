/* Night Shift Hub — One-click Xshell 8 (three fixed sessions).
   The browser hands a fixed URL to a locally registered Windows protocol handler.
   No JavaScript can directly start a native process without this prior setup. */
(() => {
  'use strict';
  const PROTOCOL = 'nightshifthub-xshell://open-all';

  function mount() {
    const deviceGrid = document.querySelector('.device-grid');
    if (!deviceGrid || document.getElementById('nsh-xshell-all-toolbar')) return;

    const style = document.createElement('style');
    style.id = 'nsh-xshell-oneclick-style';
    style.textContent = [
      '.nsh-xshell-toolbar{margin:12px 14px 0;padding:12px 14px;border:1px solid rgba(11,185,247,.36);border-radius:9px;background:linear-gradient(120deg,rgba(3,37,62,.9),rgba(2,16,30,.98));display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
      '.nsh-xshell-title{font-size:12px;font-weight:850;color:#eefaff}',
      '.nsh-xshell-desc{font-size:10px;color:#8cb8cf;margin-top:3px;line-height:1.5}',
      '.nsh-xshell-open-all{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:8px 14px;border-radius:7px;white-space:nowrap;font-size:11px;font-weight:800;text-decoration:none;cursor:pointer;color:#fff;background:linear-gradient(180deg,#0bc4ff,#087bca);border:1px solid #46d9ff;box-shadow:0 0 15px rgba(0,190,255,.14);transition:background .15s ease,border-color .15s ease}',
      '.nsh-xshell-open-all:hover,.nsh-xshell-open-all:focus-visible{background:#168ac7;border-color:#95ebff}',
      '@media(max-width:760px){.nsh-xshell-toolbar{margin:10px 10px 0;padding:11px;gap:10px}.nsh-xshell-open-all{width:100%}}',
      '@media(prefers-reduced-motion:reduce){.nsh-xshell-open-all{transition:none}}'
    ].join('');
    document.head.appendChild(style);

    const toolbar = document.createElement('div');
    toolbar.id = 'nsh-xshell-all-toolbar';
    toolbar.className = 'nsh-xshell-toolbar';

    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'nsh-xshell-title';
    title.textContent = 'Xshell 8 • เปิด 3 อุปกรณ์';
    const detail = document.createElement('p');
    detail.className = 'nsh-xshell-desc';
    detail.textContent = '10.1.100.3 → 10.1.100.1 → 10.1.100.2';
    info.append(title, detail);

    const launch = document.createElement('a');
    launch.className = 'nsh-xshell-open-all';
    launch.href = PROTOCOL;
    launch.textContent = 'เปิด Xshell ทั้ง 3';
    launch.setAttribute('aria-label', 'เปิด Xshell ทั้ง 3 อุปกรณ์ตามลำดับ');
    launch.title = 'เรียก Xshell บน Windows ผ่านตัวเชื่อมที่ติดตั้งไว้ในเครื่อง';
    toolbar.append(info, launch);
    deviceGrid.parentNode.insertBefore(toolbar, deviceGrid);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
