/* Extension-only Xshell quick launch: Windows handles ssh:// links. */
(() => {
  'use strict';
  const hosts = [
    { index: 0, ip: '10.1.100.3', name: 'IT05-C3750X-Intra-Inter' },
    { index: 1, ip: '10.1.100.1', name: 'IT06-C9500-CSW1-A01' },
    { index: 2, ip: '10.1.100.2', name: 'IT06-C9500-CSW2-A02' }
  ];
  function toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 3000);
  }
  async function copy(url) {
    try { await navigator.clipboard.writeText(url); toast('คัดลอก ' + url + ' แล้ว'); }
    catch {
      const el = document.createElement('textarea');
      el.value = url; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select();
      const ok = document.execCommand('copy'); el.remove();
      toast(ok ? 'คัดลอก ' + url + ' แล้ว' : 'คัดลอกไม่สำเร็จ: ' + url);
    }
  }
  function mount() {
    const style = document.createElement('style');
    style.textContent = [
      '.nsh-xshell-row{display:flex;flex-wrap:wrap;gap:7px;margin:9px 11px 12px;padding-top:9px;border-top:1px solid rgba(0,183,255,.2)}',
      '.nsh-xshell-row a,.nsh-xshell-row button{display:inline-flex;align-items:center;justify-content:center;min-height:31px;padding:6px 10px;border-radius:7px;font-size:11px;font-weight:750;text-decoration:none;cursor:pointer}',
      '.nsh-xshell-open{background:linear-gradient(180deg,#0c83bd,#055782);color:#f0fbff;border:1px solid #21b7ef}',
      '.nsh-xshell-open:hover,.nsh-xshell-open:focus-visible{background:#087dae;border-color:#57dbff}',
      '.nsh-xshell-copy{background:#071829;color:#afdef0;border:1px solid #185976}',
      '.nsh-xshell-copy:hover,.nsh-xshell-copy:focus-visible{border-color:#24bcf3;color:#fff}',
      '@media(max-width:540px){.nsh-xshell-row a,.nsh-xshell-row button{flex:1 1 auto}}'
    ].join('');
    document.head.appendChild(style);
    for (const host of hosts) {
      const card = document.querySelector('.device-card[data-device="' + host.index + '"]');
      if (!card || card.querySelector('.nsh-xshell-row')) continue;
      if (!(card.querySelector('.device-head p')?.textContent || '').includes(host.ip)) continue;
      const row = document.createElement('div'); row.className = 'nsh-xshell-row';
      const a = document.createElement('a');
      a.href = 'ssh://' + host.ip; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.className = 'nsh-xshell-open'; a.textContent = 'เปิด Xshell';
      a.title = 'Windows ต้องกำหนด Xshell เป็นตัวเปิด ssh:// ก่อน';
      a.setAttribute('aria-label','เปิด Xshell '+host.name+' '+host.ip);
      a.addEventListener('click',() => toast('ส่งลิงก์ SSH ให้ Windows แล้ว — ถ้าไม่เปิดให้ตรวจการตั้งค่า ssh://'));
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'nsh-xshell-copy'; b.textContent = 'คัดลอก SSH';
      b.addEventListener('click',() => copy('ssh://' + host.ip));
      row.append(a,b); card.appendChild(row);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
