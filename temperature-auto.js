(() => {
  'use strict';

  function todayISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
  }

  function addDaysISO(value, days) {
    if (!value) return todayISO();
    const [year, month, day] = value.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function thaiDateLong(value) {
    if (!value) return '-';
    const [year, month, day] = value.split('-').map(Number);
    const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    return `${day} ${months[month - 1]} ${year + 543}`;
  }

  function cleanReport() {
    const output = document.getElementById('reportOutput');
    if (!output) return;
    output.value = output.value.replace(/\n?---\s*$/g, '').trimEnd();
  }

  function init() {
    const dateMode = document.getElementById('dateMode');
    const reportDate = document.getElementById('reportDate');
    const reportEndDate = document.getElementById('reportEndDate');
    const shiftSelect = document.getElementById('shiftSelect');

    if (!dateMode || !reportDate || !reportEndDate || !shiftSelect) return;

    const dateModeField = dateMode.closest('.field');
    const reportDateField = reportDate.closest('.field');
    const endDateField = reportEndDate.closest('.field');

    // รูปแบบวันที่และวันที่สิ้นสุดให้ระบบคำนวณเอง แต่วันที่เริ่มยังแก้ไขได้
    if (dateModeField) dateModeField.style.display = 'none';
    if (endDateField) endDateField.style.display = 'none';
    if (reportDateField) {
      reportDateField.style.display = '';
      const label = reportDateField.querySelector(':scope > span');
      if (label) label.textContent = 'วันที่';
      reportDateField.classList.add('editable-auto-date-field');
    }

    // ทำให้ตัวเลือกช่วงเวลาสื่อความหมายชัดเจน: วันนี้ / ข้ามคืน
    const dayOption = [...shiftSelect.options].find(option => option.value === '06.00 - 20.30 น.');
    const nightOption = [...shiftSelect.options].find(option => option.value === '20.30 - 06.00 น.');
    if (dayOption) dayOption.textContent = 'วันนี้ — 06.00 - 20.30 น.';
    if (nightOption) nightOption.textContent = 'ข้ามคืน — 20.30 - 06.00 น.';

    if (!document.getElementById('editableAutoDateStyle')) {
      const style = document.createElement('style');
      style.id = 'editableAutoDateStyle';
      style.textContent = `
        .editable-auto-date-field{position:relative}
        .editable-auto-date-tools{display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap}
        .editable-auto-date-badge{display:inline-flex;align-items:center;min-height:22px;padding:2px 7px;border:1px solid rgba(35,209,127,.45);border-radius:999px;color:#9ff1c8;background:rgba(35,209,127,.07);font-size:8px;font-weight:800;letter-spacing:.04em}
        .editable-auto-date-badge.manual{border-color:rgba(255,190,72,.5);color:#ffd58c;background:rgba(255,190,72,.07)}
        .editable-auto-date-today{min-height:24px;padding:3px 8px;border:1px solid #176c95;border-radius:6px;background:#04101d;color:#bfefff;font-size:9px;font-weight:800;cursor:pointer}
        .editable-auto-date-today:hover{border-color:var(--cyan);color:#fff}
        .editable-auto-date-preview{font-size:9px;color:#719db3}
      `;
      document.head.appendChild(style);
    }

    let badge = document.getElementById('editableAutoDateBadge');
    let preview = document.getElementById('editableAutoDatePreview');
    let todayBtn = document.getElementById('editableAutoDateToday');

    if (reportDateField && !badge) {
      const tools = document.createElement('div');
      tools.className = 'editable-auto-date-tools';
      tools.innerHTML = `
        <span class="editable-auto-date-badge" id="editableAutoDateBadge">AUTO</span>
        <button type="button" class="editable-auto-date-today" id="editableAutoDateToday">วันนี้</button>
        <span class="editable-auto-date-preview" id="editableAutoDatePreview"></span>`;
      reportDateField.appendChild(tools);
      badge = tools.querySelector('#editableAutoDateBadge');
      preview = tools.querySelector('#editableAutoDatePreview');
      todayBtn = tools.querySelector('#editableAutoDateToday');
    }

    const originalMakeReport = window.makeReport;
    if (typeof originalMakeReport === 'function' && !window.__nightShiftMakeReportPatched) {
      window.__nightShiftMakeReportPatched = true;
      window.makeReport = function (...args) {
        return String(originalMakeReport.apply(this, args)).replace(/\n?---\s*$/g, '').trimEnd();
      };
    }

    let manualDate = false;
    let autoDate = todayISO();

    function updateDateBadge() {
      if (!badge) return;
      badge.textContent = manualDate ? 'แก้ไขเอง' : 'AUTO';
      badge.classList.toggle('manual', manualDate);
      if (preview) preview.textContent = thaiDateLong(reportDate.value);
    }

    function syncShiftDateMode() {
      const isOvernight = shiftSelect.value === '20.30 - 06.00 น.';
      if (isOvernight) {
        dateMode.value = 'range';
        reportEndDate.value = addDaysISO(reportDate.value, 1);
      } else {
        dateMode.value = 'single';
        reportEndDate.value = '';
      }
    }

    function refresh() {
      syncShiftDateMode();
      updateDateBadge();
      if (typeof window.refreshReport === 'function') window.refreshReport();
      cleanReport();
    }

    function setToday() {
      autoDate = todayISO();
      manualDate = false;
      reportDate.value = autoDate;
      refresh();
    }

    // ทุกครั้งที่เปิดหน้า ให้วันที่เริ่มจากวันปัจจุบันอัตโนมัติ แต่ผู้ใช้แก้ได้ทันที
    setToday();

    reportDate.addEventListener('input', () => {
      manualDate = reportDate.value !== todayISO();
      refresh();
    });

    reportDate.addEventListener('change', () => {
      manualDate = reportDate.value !== todayISO();
      refresh();
    });

    shiftSelect.addEventListener('change', refresh);
    shiftSelect.addEventListener('input', refresh);
    todayBtn?.addEventListener('click', setToday);

    // หากเปิดค้างข้ามวัน ให้เลื่อนไปวันใหม่เฉพาะตอนที่ผู้ใช้ยังไม่ได้แก้วันที่เอง
    setInterval(() => {
      const current = todayISO();
      if (!manualDate && current !== autoDate) {
        autoDate = current;
        reportDate.value = current;
        refresh();
      }
    }, 60000);

    // กันข้อความคั่น --- กลับมาหลัง refresh จาก event เดิมของ app.js
    ['input', 'change', 'click'].forEach(eventName => {
      document.addEventListener(eventName, () => queueMicrotask(cleanReport));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
