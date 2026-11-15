/* Excel -> PDF local workflow. The website only requests a fixed Windows protocol.
   Actual file selection and Excel COM automation stay on the user's PC. */
(() => {
  'use strict';
  const link = 'nightshifthub-excelpdf://run';
  function mount() {
    const grid = document.querySelector('.cards-grid');
    if (!grid || document.getElementById('nightshift-excel-pdf')) return;

    const style = document.createElement('style');
    style.id = 'nightshift-excel-pdf-styles';
    style.textContent = [
      '#nightshift-excel-pdf{grid-column:1/-1;min-height:auto}',
      '.nsh-pdf-body{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding:14px}',
      '.nsh-pdf-details{min-width:210px;flex:1 1 300px}',
      '.nsh-pdf-steps{margin:8px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:6px;list-style:none}',
      '.nsh-pdf-steps li{border:1px solid #155a7c;border-radius:5px;padding:5px 8px;background:#031421;color:#a6d7e8;font-size:10px}',
      '.nsh-pdf-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px}',
      '.nsh-pdf-start{display:inline-flex;justify-content:center;align-items:center;min-height:39px;padding:9px 15px;border:1px solid #48dbff;border-radius:7px;background:linear-gradient(180deg,#0abff0,#077cbb);color:#fff;font-weight:800;text-decoration:none;box-shadow:0 0 15px rgba(9,188,255,.12)}',
      '.nsh-pdf-start:hover,.nsh-pdf-start:focus-visible{border-color:#a0f1ff;background:#168cc1}',
      '.nsh-pdf-setup{color:#88d9f4;font-size:10px;text-decoration:underline;text-underline-offset:3px}',
      '.nsh-pdf-note{margin-top:8px;font-size:10px;line-height:1.55;color:#8cb2c8}',
      '@media(max-width:680px){.nsh-pdf-body{padding:12px}.nsh-pdf-start{width:100%}.nsh-pdf-actions{width:100%}}'
    ].join('');
    document.head.appendChild(style);

    const article = document.createElement('article');
    article.className = 'panel link-card';
    article.id = 'nightshift-excel-pdf';

    const heading = document.createElement('div');
    heading.className = 'section-heading compact-heading';
    const headingLeft = document.createElement('div');
    headingLeft.className = 'heading-left';
    const number = document.createElement('span');
    number.className = 'step-badge';
    number.textContent = 'PDF';
    const titleWrap = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Excel → PDF Auto';
    const subtitle = document.createElement('p');
    subtitle.textContent = 'จัดหน้ารายงาน A4 แนวนอนและแปลง PDF ผ่าน Excel บน Windows';
    titleWrap.append(title, subtitle);
    headingLeft.append(number, titleWrap);
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = 'Local • ไม่อัปโหลด';
    heading.append(headingLeft, chip);

    const body = document.createElement('div');
    body.className = 'nsh-pdf-body';
    const details = document.createElement('div');
    details.className = 'nsh-pdf-details';
    const steps = document.createElement('ol');
    steps.className = 'nsh-pdf-steps';
    ['เลือกไฟล์ Excel (เลือกหลายไฟล์ได้)', 'ปรับฟอนต์และ A4 แนวนอน', 'A–J กว้างหน้าเดียว', 'สร้างและเปิด PDF'].forEach(label => {
      const item = document.createElement('li');
      item.textContent = label;
      steps.appendChild(item);
    });
    const note = document.createElement('p');
    note.className = 'nsh-pdf-note';
    note.textContent = 'กดครั้งเดียว → Windows เปิดตัวเลือกไฟล์ → แปลงอัตโนมัติจนจบ ไม่แก้ไข Excel ต้นฉบับ';
    details.append(steps, note);

    const actions = document.createElement('div');
    actions.className = 'nsh-pdf-actions';
    const start = document.createElement('a');
    start.className = 'nsh-pdf-start';
    start.href = link;
    start.textContent = 'เลือก Excel → สร้าง PDF อัตโนมัติ';
    start.title = 'ต้องติดตั้งตัวเชื่อม Windows ครั้งแรกก่อน';
    start.addEventListener('click', () => {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = 'กำลังเรียกตัวแปลง Excel บน Windows (หากไม่เปิด โปรดติดตั้งตัวเชื่อมครั้งแรก)';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3800);
    });
    const setup = document.createElement('a');
    setup.className = 'nsh-pdf-setup';
    setup.href = './install-nightshift-excelpdf.ps1';
    setup.download = 'install-nightshift-excelpdf.ps1';
    setup.textContent = 'ตั้งค่าบน Windows ครั้งแรก';
    setup.title = 'ดาวน์โหลดสคริปต์ติดตั้งตัวเชื่อมในเครื่อง (ต้องตรวจสอบและยืนยันก่อนติดตั้ง)';
    actions.append(start, setup);
    body.append(details, actions);
    article.append(heading, body);
    grid.appendChild(article);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
