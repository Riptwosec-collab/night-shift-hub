/* Night Shift Hub — Xshell 8: one-click three-session launch and per-device SSH.
   Browser cannot run PowerShell directly: Windows must first register this fixed protocol. */
(() => {
  'use strict';
  const PROTOCOL = 'nightshifthub-xshell://open-all';
  const DEVICES = [
    { index: 0, ip: '10.1.100.3', name: 'IT05-C3750X-Intra-Inter' },
    { index: 1, ip: '10.1.100.1', name: 'IT06-C9500-CSW1-A01' },
    { index: 2, ip: '10.1.100.2', name: 'IT06-C9500-CSW2-A02' }
  ];
  function toast(message) {
    const element = document.getElementById('toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => element.classList.remove('show'), 3200);
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('คัดลอก ' + text + ' แล้ว');
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const success = document.execCommand('copy');
      field.remove();
      toast(success ? 'คัดลอก ' + text + ' แล้ว' : 'ไม่สามารถคัดลอกอัตโนมัติได้');
    }
  }
  function button(label, className) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = className;
    el.textContent = label;
    return el;
  }
  function mountStyles() {
    if (document.getElementById('nsh-xshell-v2-style')) return;
    const style = document.createElement('style');
    style.id = 'nsh-xshell-v2-style';
    style.textContent = [
      '.nsh-xshell-toolbar{margin:12px 14px 0;padding:12px 14px;border:1px solid rgba(11,185,247,.36);border-radius:9px;background:linear-gradient(120deg,rgba(3,37,62,.9),rgba(2,16,30,.98));display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}',
      '.nsh-xshell-title{font-size:12px;font-weight:850;color:#eefaff}',
      '.nsh-xshell-desc{font-size:10px;color:#8cb8cf;margin-top:3px;line-height:1.5}',
      '.nsh-xshell-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}',
      '.nsh-xshell-toolbar a,.nsh-xshell-row a,.nsh-xshell-row button{display:inline-flex;align-items:center;justify-content:center;min-height:32px;gap:6px;padding:7px 12px;border-radius:7px;font-size:11px;font-weight:750;text-decoration:none;cursor:pointer;transition:background .15s ease,border-color .15s ease}',
      '.nsh-xshell-open-all{color:#fff;background:linear-gradient(180deg,#0bc4ff,#087bca);border:1px solid #46d9ff;box-shadow:0 0 15px rgba(0,190,255,.14)}',
      '.nsh-xshell-open-all:hover,.nsh-xshell-open-all:focus-visible{background:#168ac7;border-color:#95ebff}',
      '.nsh-xshell-install{color:#b1e5fa;background:#031727;border:1px solid rgba(24,130,180,.7)}',
      '.nsh-xshell-install:hover,.nsh-xshell-install:focus-visible{border-color:#22cbff;color:#fff}',
      '.nsh-xshell-row{display:flex;flex-wrap:wrap;gap:7px;margin:9px 11px 12px;padding-top:9px;border-top:1px solid rgba(0,183,255,.2)}',
      '.nsh-xshell-row a,.nsh-xshell-row button{min-height:30px;padding:6px 10px}',
      '.nsh-xshell-open{background:linear-gradient(180deg,#0c83bd,#055782);color:#f0fbff;border:1px solid #21b7ef}',
      '.nsh-xshell-open:hover,.nsh-xshell-open:focus-visible{background:#087dae;border-color:#57dbff}',
      '.nsh-xshell-copy{background:#071829;color:#afdef0;border:1px solid #185976}',
      '.nsh-xshell-copy:hover,.nsh-xshell-copy:focus-visible{border-color:#24bcf3;color:#fff}',
      '@media(max-width:760px){.nsh-xshell-toolbar{margin:10px 10px 0;padding:11px}.nsh-xshell-actions{width:100%}.nsh-xshell-actions a{flex:1 1 auto}}',
      '@media(max-width:540px){.nsh-xshell-row a,.nsh-xshell-row button{flex:1 1 auto}}',
      '@media(prefers-reduced-motion:reduce){.nsh-xshell-toolbar a,.nsh-xshell-row a,.nsh-xshell-row button{transition:none}}'
    ].join('');
    document.head.appendChild(style);
  }
  function mountToolbar() {
    const grid = document.querySelector('.device-grid');
    if (!grid || document.getElementById('nsh-xshell-all-toolbar')) return;
    const toolbar = document.createElement('div');
    toolbar.id = 'nsh-xshell-all-toolbar';
    toolbar.className = 'nsh-xshell-toolbar';
    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'nsh-xshell-title';
    title.textContent = 'Xshell 8 • เปิด 3 อุปกรณ์ในคลิกเดียว';
    const desc = document.createElement('p');
    desc.className = 'nsh-xshell-desc';
    desc.textContent = '10.1.100.3 → 10.1.100.1 → 10.1.100.2 • เปิดแท็บตามลำดับ';
    info.append(title, desc);
    const actions = document.createElement('div');
    actions.className = 'nsh-xshell-actions';
    const launch = document.createElement('a');
    launch.className = 'nsh-xshell-open-all';
    launch.href = PROTOCOL;
    launch.textContent = 'เปิด Xshell ทั้ง 3';
    launch.title = 'ต้องติดตั้งตัวเปิด PowerShell บน Windows ครั้งเดียวก่อน';
    launch.addEventListener('click', () => toast('ส่งคำขอเปิด Xshell 3 เครื่องให้ Windows — อาจมีหน้าต่างยืนยันเปิดแอป'));
    const install = document.createElement('a');
    install.className = 'nsh-xshell-install';
    install.href = './install-nightshift-xshell.ps1';
    install.download = 'install-nightshift-xshell.ps1';
    install.textContent = 'ติดตั้งตัวเปิด (ครั้งแรก)';
    install.title = 'ดาวน์โหลดสคริปต์ PowerShell สำหรับลงทะเบียนตัวเปิดที่กำหนดไว้ตายตัว';
    actions.append(launch, install);
    toolbar.append(info, actions);
    grid.parentNode.insertBefore(toolbar, grid);
  }
  function mountDevices() {
    for (const device of DEVICES) {
      const card = document.querySelector('.device-card[data-device="' + device.index + '"]');
      if (!card || card.querySelector('.nsh-xshell-row')) continue;
      if (!(card.querySelector('.device-head p')?.textContent || '').includes(device.ip)) continue;
      const row = document.createElement('div');
      row.className = 'nsh-xshell-row';
      const link = document.createElement('a');
      link.href = 'ssh://' + device.ip;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'nsh-xshell-open';
      link.textContent = 'เปิด Xshell';
      link.title = 'ต้องมีแอปสำหรับเปิด ssh:// ใน Windows';
      link.setAttribute('aria-label', 'เปิด Xshell ' + device.name);
      link.addEventListener('click', () => toast('ส่งคำขอเปิด SSH ' + device.ip + ' แล้ว'));
      const copyBtn = button('คัดลอก SSH','nsh-xshell-copy');
      copyBtn.addEventListener('click', () => copy('ssh://' + device.ip));
      row.append(link,copyBtn);
      card.appendChild(row);
    }
  }
  function mount() {
    mountStyles();
    mountToolbar();
    mountDevices();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
  else mount();
})();
