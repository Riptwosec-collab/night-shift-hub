(() => {
  'use strict';

  function todayISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
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

    if (!dateMode || !reportDate || !reportEndDate) return;

    // Keep the original controls in the DOM because app.js still uses them,
    // but make the report date fully automatic for the user.
    [dateMode, reportDate, reportEndDate].forEach(control => {
      const field = control.closest('.field');
      if (field) field.style.display = 'none';
    });

    if (!document.getElementById('autoReportDateStyle')) {
      const style = document.createElement('style');
      style.id = 'autoReportDateStyle';
      style.textContent = `
        .auto-report-date-box{
          min-height:34px;display:flex;align-items:center;padding:0 10px;
          border:1px solid #07577d;border-radius:6px;background:#031321;
          color:#dff8ff;font-weight:800;font-size:11px;
        }
        .auto-report-date-box::after{
          content:'AUTO';margin-left:auto;padding:2px 6px;border:1px solid rgba(35,209,127,.45);
          border-radius:999px;color:#9ff1c8;background:rgba(35,209,127,.07);font-size:8px;
        }
      `;
      document.head.appendChild(style);
    }

    const formGrid = shiftSelect?.closest('.form-grid');
    if (formGrid && !document.getElementById('autoReportDateField')) {
      const autoField = document.createElement('label');
      autoField.className = 'field';
      autoField.id = 'autoReportDateField';
      autoField.innerHTML = '<span>วันที่</span><div class="auto-report-date-box" id="autoReportDateLabel"></div>';
      formGrid.insertBefore(autoField, shiftSelect.closest('.field'));
    }

    const originalMakeReport = window.makeReport;
    if (typeof originalMakeReport === 'function' && !window.__nightShiftMakeReportPatched) {
      window.__nightShiftMakeReportPatched = true;
      window.makeReport = function (...args) {
        return String(originalMakeReport.apply(this, args)).replace(/\n?---\s*$/g, '').trimEnd();
      };
    }

    let activeDate = '';
    function applyAutoDate(forceRefresh = false) {
      const current = todayISO();
      const changed = activeDate !== current || reportDate.value !== current || dateMode.value !== 'single';
      activeDate = current;
      dateMode.value = 'single';
      reportDate.value = current;
      reportEndDate.value = '';

      const label = document.getElementById('autoReportDateLabel');
      if (label) label.textContent = thaiDateLong(current);

      if ((changed || forceRefresh) && typeof window.refreshReport === 'function') {
        window.refreshReport();
      }
      cleanReport();
    }

    applyAutoDate(true);

    // Keep the report clean after any existing app control refreshes it.
    ['input', 'change', 'click'].forEach(eventName => {
      document.addEventListener(eventName, () => queueMicrotask(cleanReport));
    });

    // If the page is left open across midnight, roll the date forward automatically.
    setInterval(() => applyAutoDate(false), 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
