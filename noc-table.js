(() => {
  'use strict';

  const FOLLOWERS = [
    'นายนลิทัศน์ นาภรณ์',
    'นายกิตติ ยอดนนท์',
    'นายดรีมดนัย ศิริมาตย์',
    'นายวัชระ ภูเกิด',
    'นายสถิตย์ พันธ์แตง',
    'นายเสถียร มาสา',
    'นายพัชร สันต์พลี',
    'นายอิศเรศ เวียงอินทร์',
    'นายกษิดิศ โพธิ์ไทรย์'
  ];

  let rowCount = 0;

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function fmtDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }

  function getNextDayStr(dateStr) {
    const parts = String(dateStr).split('/');
    if (parts.length !== 3) return dateStr;
    const date = new Date(Number(parts[2]) - 543, Number(parts[1]) - 1, Number(parts[0]));
    date.setDate(date.getDate() + 1);
    return fmtDate(date);
  }

  function injectStyles() {
    if (document.getElementById('nocTableStyle')) return;
    const style = document.createElement('style');
    style.id = 'nocTableStyle';
    style.textContent = `
      body.noc-table-open{overflow:hidden}
      .noc-builder-card .action-row{padding-top:8px}
      .noc-builder-page{
        position:fixed;inset:0;z-index:11000;display:none;overflow:auto;color:var(--text);
        background:radial-gradient(circle at 18% 0%,rgba(0,132,220,.12),transparent 32%),linear-gradient(180deg,#010712 0%,#020914 48%,#01050d 100%);
      }
      .noc-builder-page.show{display:block;animation:nocPageIn .18s ease-out}
      @keyframes nocPageIn{from{opacity:0;transform:scale(.993)}to{opacity:1;transform:scale(1)}}
      .noc-builder-shell{width:min(1180px,calc(100% - 24px));margin:12px auto 40px}
      .noc-builder-topbar{
        position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;margin-bottom:14px;padding:12px 14px;
        border:1px solid var(--line);border-radius:10px;background:rgba(2,13,27,.94);backdrop-filter:blur(14px);box-shadow:var(--shadow);
      }
      .noc-builder-back{min-height:34px;border:1px solid #176c95;border-radius:7px;background:#04101d;color:#eafaff;padding:6px 11px;font-weight:800;font-size:10px;cursor:pointer}
      .noc-builder-back:hover{border-color:var(--cyan);box-shadow:0 0 12px rgba(0,183,255,.12)}
      .noc-builder-topbar h2{margin:0;color:#f1fbff;font-size:16px}
      .noc-builder-topbar p{margin:3px 0 0;color:#739bb0;font-size:9px}
      .noc-panel{margin-bottom:14px;padding:16px;border:1px solid var(--line);border-radius:10px;background:linear-gradient(180deg,rgba(3,18,36,.96),rgba(1,10,22,.96));box-shadow:var(--shadow)}
      .noc-panel h3{margin:0 0 13px;padding-bottom:10px;border-bottom:1px solid rgba(8,123,178,.32);font-size:14px;color:#f1fbff}
      .noc-controls{display:flex;flex-wrap:wrap;gap:12px}
      .noc-control{display:flex;flex-direction:column;gap:5px;min-width:160px;flex:1 1 190px}
      .noc-control label,.noc-input-group label{font-size:10px;font-weight:800;color:#83bdd4}
      .noc-control select,.noc-input-group input,.noc-input-group textarea{
        width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #07577d;border-radius:6px;background:#031321;color:#e9faff;font:11px Tahoma,sans-serif;outline:none;
      }
      .noc-control select:focus,.noc-input-group input:focus,.noc-input-group textarea:focus{border-color:#0dbcf5;box-shadow:0 0 0 2px rgba(13,188,245,.08)}
      .noc-paste-zone{width:100%;height:90px;box-sizing:border-box;margin-bottom:12px;padding:10px;border:1px dashed #16a466;border-radius:7px;background:rgba(21,154,95,.06);color:#dff8ff;font:11px Tahoma,sans-serif;resize:vertical;outline:none}
      .noc-paste-zone:focus{border-color:#38d98f;box-shadow:0 0 0 2px rgba(56,217,143,.07)}
      .noc-input-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
      .noc-input-group{display:flex;flex-direction:column;gap:4px}
      .noc-full{grid-column:1/-1}
      .noc-add-btn,.noc-copy-btn{width:100%;min-height:40px;border:0;border-radius:7px;color:white;font-weight:850;font:12px Tahoma,sans-serif;cursor:pointer;transition:.18s ease}
      .noc-add-btn{background:linear-gradient(180deg,#119fff,#087cc8);box-shadow:0 0 20px rgba(0,166,255,.10)}
      .noc-add-btn:hover{filter:brightness(1.08)}
      .noc-copy-btn{background:linear-gradient(180deg,#17b86e,#078b4e);font-size:13px;box-shadow:0 0 20px rgba(23,184,110,.10)}
      .noc-copy-btn:hover{filter:brightness(1.08)}
      .noc-copy-note{text-align:center;color:#6fa5bb;font-size:9px;margin:8px 0 12px}
      .noc-table-wrapper{overflow-x:auto;background:white;padding:10px;border:1px solid #d7d7d7;border-radius:6px}
      .noc-excel-table{border-collapse:collapse;font-family:Tahoma,sans-serif;font-size:11pt;table-layout:fixed;color:#111;background:white;min-width:1090px}
      .noc-excel-table td{padding:5px;vertical-align:top;white-space:pre-wrap}
      .noc-border-all{border:1px solid black}
      .noc-head-cell{background:#e7e6e6;text-align:center;font-weight:bold;vertical-align:middle!important;border:1px solid black}
      .noc-head-green{background:#00b050;text-align:center;font-weight:bold;vertical-align:middle!important;border:1px solid black}
      @media(max-width:680px){.noc-builder-shell{width:min(100% - 12px,1180px);margin-top:6px}.noc-builder-topbar{padding:10px}.noc-input-grid{grid-template-columns:1fr}.noc-full{grid-column:auto}}
      @media(prefers-reduced-motion:reduce){.noc-builder-page.show{animation:none}}
    `;
    document.head.appendChild(style);
  }

  function followerOptions(includeAidsares = false) {
    const extra = includeAidsares ? '<option value="Aidsares.v">Aidsares.v</option>' : '';
    return `<option value="">-- ไม่ระบุ --</option>${FOLLOWERS.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}${extra}`;
  }

  function createLaunchCard() {
    const grid = document.querySelector('.cards-grid');
    if (!grid || document.getElementById('nocBuilderCard')) return;

    const card = document.createElement('article');
    card.id = 'nocBuilderCard';
    card.className = 'panel link-card noc-builder-card';
    card.innerHTML = `
      <div class="section-heading compact-heading">
        <div class="heading-left">
          <span class="step-badge">7</span>
          <div><h2>NOC@RD Table Builder</h2><p>วาง Ticket → สร้างตาราง → Copy ไป Excel</p></div>
        </div>
        <span class="chip">เครื่องมือ</span>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" id="openNocBuilder" type="button">เปิด Table Builder</button>
      </div>`;
    grid.appendChild(card);
  }

  function createPage() {
    if (document.getElementById('nocBuilderPage')) return;
    const page = document.createElement('section');
    page.id = 'nocBuilderPage';
    page.className = 'noc-builder-page';
    page.setAttribute('aria-hidden', 'true');
    page.innerHTML = `
      <div class="noc-builder-shell">
        <header class="noc-builder-topbar">
          <button class="noc-builder-back" id="nocBuilderBack" type="button">← กลับ</button>
          <div><h2>NOC@RD Table Builder</h2><p>Perfect Excel Layout / Ticket Follow-up</p></div>
        </header>

        <div class="noc-panel">
          <h3>1. ตั้งค่าการรายงาน</h3>
          <div class="noc-controls">
            <div class="noc-control"><label>วันที่</label><select id="nocDateSelect"></select></div>
            <div class="noc-control"><label>กะเวลา</label><select id="nocTimeSelect"><option value="08.30 น.">08.30 น. (กะเช้า)</option><option value="20.30 น.">20.30 น. (กะดึก)</option></select></div>
            <div class="noc-control"><label>ผู้ติดตามงานคนที่ 1</label><select id="nocFollower1">${followerOptions(true)}</select></div>
            <div class="noc-control"><label>ผู้ติดตามงานคนที่ 2</label><select id="nocFollower2">${followerOptions(false)}</select></div>
          </div>
        </div>

        <div class="noc-panel">
          <h3>2. เพิ่มใบงาน</h3>
          <textarea id="nocPasteZone" class="noc-paste-zone" placeholder="กด Ctrl+V วางข้อความจากระบบ Ticket ที่นี่..."></textarea>
          <div class="noc-input-grid">
            <div class="noc-input-group"><label>หมายเลขใบงาน</label><input type="text" id="nocTicket"></div>
            <div class="noc-input-group"><label>วัน/เวลารับแจ้ง</label><input type="text" id="nocOpenDate"></div>
            <div class="noc-input-group"><label>ปัญหา</label><input type="text" id="nocProblem"></div>
            <div class="noc-input-group"><label>หน่วยงาน</label><textarea id="nocLocation" rows="2"></textarea></div>
            <div class="noc-input-group noc-full"><label>สถานการณ์ล่าสุด</label><textarea id="nocStatus" rows="2"></textarea></div>
          </div>
          <button class="noc-add-btn" id="nocAddRow" type="button">บันทึกใบงานนี้ลงตาราง (เพิ่มแถวใหม่)</button>
        </div>

        <div class="noc-panel">
          <button class="noc-copy-btn" id="nocCopyTable" type="button">3. กดเพื่อคัดลอกตารางไปวางใน Excel</button>
          <p class="noc-copy-note">จัดโครงสร้างและตำแหน่งคอลัมน์ให้ตรงตามไฟล์ตัวอย่าง</p>
          <div class="noc-table-wrapper" id="nocTableContainer">
            <table class="noc-excel-table">
              <colgroup>
                <col style="width:50px"><col style="width:80px"><col style="width:120px"><col style="width:140px"><col style="width:200px"><col style="width:300px"><col style="width:100px"><col style="width:100px">
              </colgroup>
              <tr><td colspan="6" class="noc-head-cell">แบบฟอร์มติดตามงานค้าง NOC@RD</td><td colspan="2" class="noc-head-cell" id="nocHeadDate">วันที่ ...</td></tr>
              <tr>
                <td rowspan="2" class="noc-head-cell">ลำดับ</td><td rowspan="2" class="noc-head-cell">หมายเลขใบ<br>งาน</td><td rowspan="2" class="noc-head-cell">วัน/เวลารับแจ้ง</td><td rowspan="2" class="noc-head-cell">หน่วยงาน</td><td rowspan="2" class="noc-head-cell">ปัญหา</td><td rowspan="2" class="noc-head-cell">สถานการณ์ตามงานล่าสุด</td><td class="noc-head-green">กะเช้า</td><td class="noc-head-cell">กะดึก</td>
              </tr>
              <tr><td class="noc-head-cell">วัน/เวลาที่ตามงาน<br>ล่าสุด</td><td class="noc-head-cell">วัน/เวลานัดหมาย<br>ดำเนินการ</td></tr>
              <tbody id="nocTableBody"></tbody>
              <tbody>
                <tr><td style="height:15px"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height:15px"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height:15px"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
              <tbody>
                <tr><td class="noc-border-all">ผู้ติดตามงาน</td><td class="noc-border-all" style="text-align:center" id="nocF1Name"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td class="noc-border-all">วันที่ :</td><td class="noc-border-all nocFDate" style="text-align:center"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td class="noc-border-all">เวลา :</td><td class="noc-border-all nocFTime" style="text-align:center"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height:10px"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td class="noc-border-all">ผู้ติดตามงาน</td><td class="noc-border-all" style="text-align:center" id="nocF2Name"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td class="noc-border-all">วันที่ :</td><td class="noc-border-all nocFDate" style="text-align:center"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td class="noc-border-all">เวลา :</td><td class="noc-border-all nocFTime" style="text-align:center"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height:15px"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td class="nocFDate"></td><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td id="nocSumTime" class="noc-border-all"></td><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td>งานวงจร UIH จำนวน 3 ใบงาน</td><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td>งาน MA จำนวน 3 ใบงาน</td><td></td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td>งาน NOC จำนวน 12 ใบงาน</td><td style="text-align:center">งานของ NOC ทำ</td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td>งานโครงการ 3 ใบงาน</td><td style="text-align:center">งาน SDWAN / Wifi</td><td></td><td></td><td></td></tr>
                <tr><td></td><td></td><td></td><td>รวมจำนวน 21 ใบงาน</td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    document.body.appendChild(page);
  }

  function initDateSelect() {
    const select = document.getElementById('nocDateSelect');
    if (!select) return;
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    select.innerHTML = `
      <option value="${fmtDate(today)}">วันที่ปัจจุบัน (${fmtDate(today)})</option>
      <option value="${fmtDate(yesterday)}">เมื่อวาน (${fmtDate(yesterday)})</option>
      <option value="${fmtDate(tomorrow)}">วันถัดไป (${fmtDate(tomorrow)})</option>`;
    document.getElementById('nocFollower1').value = 'นายอิศเรศ เวียงอินทร์';
    updateGlobal();
  }

  function updateGlobal() {
    const date = document.getElementById('nocDateSelect')?.value || '';
    const time = document.getElementById('nocTimeSelect')?.value || '';
    const f1 = document.getElementById('nocFollower1')?.value || '';
    const f2 = document.getElementById('nocFollower2')?.value || '';
    const parts = date.split('/');

    const headDate = document.getElementById('nocHeadDate');
    if (headDate && parts.length === 3) headDate.innerText = `วันที่ ...${parts[0]}..../...${parts[1]}.../...${parts[2]}...`;
    const f1Name = document.getElementById('nocF1Name'); if (f1Name) f1Name.innerText = f1;
    const f2Name = document.getElementById('nocF2Name'); if (f2Name) f2Name.innerText = f2;
    document.querySelectorAll('.nocFDate').forEach(el => { el.innerText = date; });
    document.querySelectorAll('.nocFTime').forEach(el => { el.innerText = time; });
    const sumTime = document.getElementById('nocSumTime'); if (sumTime) sumTime.innerText = `เวลา ${time}`;
    document.querySelectorAll('.noc-auto-dt').forEach(el => { el.innerText = `${date}\n${time}`; });
  }

  function parseText() {
    const text = document.getElementById('nocPasteZone')?.value || '';
    const ticketMatch = text.match(/\b\d{6}\b/);
    if (ticketMatch) document.getElementById('nocTicket').value = ticketMatch[0];

    const dateMatch = text.match(/Open Date[\s:]*([\d]{1,2}\/[\d]{1,2}\/[\d]{4}\s*[\d]{1,2}:[\d]{2})/i);
    if (dateMatch) document.getElementById('nocOpenDate').value = dateMatch[1];

    const probMatches = text.match(/([^\n\r\t]*ขัดข้อง[^\n\r\t]*)/g);
    if (probMatches?.length) {
      document.getElementById('nocProblem').value = probMatches[probMatches.length - 1].replace(/Request Type/i, '').trim();
    }

    const locMatch = text.match(/(?:หน่วยงาน|Room)[\s:;]*([^\s\n\r]+)/i);
    const provMatch = text.match(/(?:จังหวัด|Location)[\s:;]*([^\s\n\r]+)/i);
    let location = '';
    if (locMatch) location += `${locMatch[1].startsWith('สส.') ? locMatch[1] : `สส.${locMatch[1]}`}\n`;
    if (provMatch) location += `จังหวัด : ${provMatch[1]}`;
    if (location) document.getElementById('nocLocation').value = location.trim();

    const opMatch = text.match(/(เจ้าหน้าที่[^\n]+)/);
    if (opMatch) document.getElementById('nocStatus').value = opMatch[1].trim();
  }

  function clearInputs() {
    ['nocPasteZone','nocTicket','nocOpenDate','nocProblem','nocLocation','nocStatus'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  }

  function addRow() {
    const ticket = document.getElementById('nocTicket').value;
    const openDate = document.getElementById('nocOpenDate').value;
    const problem = document.getElementById('nocProblem').value;
    const location = document.getElementById('nocLocation').value;
    const status = document.getElementById('nocStatus').value;
    if (!ticket && !problem) { alert('กรุณาวางข้อความก่อนครับ'); return; }

    rowCount += 1;
    const date = document.getElementById('nocDateSelect').value;
    const time = document.getElementById('nocTimeSelect').value;
    const followText = `${date}\n${time}`;
    const targetText = `${getNextDayStr(date)}\n08.30 น.`;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="noc-border-all" style="text-align:center">${rowCount}</td>
      <td class="noc-border-all" style="text-align:center">${escapeHtml(ticket)}</td>
      <td class="noc-border-all" style="text-align:center">${escapeHtml(openDate)}</td>
      <td class="noc-border-all" style="text-align:center">${escapeHtml(location)}</td>
      <td class="noc-border-all" style="text-align:center">${escapeHtml(problem)}</td>
      <td class="noc-border-all">${escapeHtml(status)}</td>
      <td class="noc-border-all noc-auto-dt" style="text-align:center">${escapeHtml(followText)}</td>
      <td class="noc-border-all" style="text-align:center">${escapeHtml(targetText)}</td>`;
    document.getElementById('nocTableBody').appendChild(tr);
    clearInputs();

    const button = document.getElementById('nocAddRow');
    const original = 'บันทึกใบงานนี้ลงตาราง (เพิ่มแถวใหม่)';
    button.textContent = `เพิ่มใบที่ ${rowCount} สำเร็จ!`;
    button.style.background = '#00b050';
    setTimeout(() => { button.textContent = original; button.style.background = ''; }, 1000);
  }

  function copyTable() {
    if (rowCount === 0 && !confirm('ตารางยังว่างอยู่ คัดลอกเลยหรือไม่?')) return;
    const container = document.getElementById('nocTableContainer');
    const range = document.createRange();
    range.selectNode(container);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    selection.removeAllRanges();

    const button = document.getElementById('nocCopyTable');
    const original = '3. กดเพื่อคัดลอกตารางไปวางใน Excel';
    button.textContent = copied ? 'คัดลอกสำเร็จ! กด Ctrl+V ใน Excel ได้เลย' : 'คัดลอกไม่สำเร็จ — ลองใหม่อีกครั้ง';
    setTimeout(() => { button.textContent = original; }, 3000);
  }

  function openPage(pushHistory = true) {
    const page = document.getElementById('nocBuilderPage');
    if (!page) return;
    page.classList.add('show');
    page.setAttribute('aria-hidden', 'false');
    document.body.classList.add('noc-table-open');
    page.scrollTop = 0;
    if (pushHistory && location.hash !== '#noc-table') history.pushState({ nocTablePage: true }, '', '#noc-table');
    setTimeout(() => document.getElementById('nocBuilderBack')?.focus(), 20);
  }

  function closePage(fromHistory = false) {
    const page = document.getElementById('nocBuilderPage');
    if (!page) return;
    page.classList.remove('show');
    page.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('noc-table-open');
    if (!fromHistory && location.hash === '#noc-table') history.back();
    setTimeout(() => document.getElementById('openNocBuilder')?.focus(), 20);
  }

  function bindEvents() {
    document.getElementById('openNocBuilder')?.addEventListener('click', () => openPage(true));
    document.getElementById('nocBuilderBack')?.addEventListener('click', () => closePage(false));
    ['nocDateSelect','nocTimeSelect','nocFollower1','nocFollower2'].forEach(id => document.getElementById(id)?.addEventListener('change', updateGlobal));
    document.getElementById('nocPasteZone')?.addEventListener('input', parseText);
    document.getElementById('nocAddRow')?.addEventListener('click', addRow);
    document.getElementById('nocCopyTable')?.addEventListener('click', copyTable);

    window.addEventListener('popstate', () => {
      if (location.hash === '#noc-table') openPage(false);
      else if (document.getElementById('nocBuilderPage')?.classList.contains('show')) closePage(true);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.getElementById('nocBuilderPage')?.classList.contains('show')) closePage(false);
    });
  }

  function init() {
    injectStyles();
    createLaunchCard();
    createPage();
    initDateSelect();
    bindEvents();
    if (location.hash === '#noc-table') openPage(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
