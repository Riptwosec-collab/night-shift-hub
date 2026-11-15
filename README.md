# Night Shift Hub

เว็บสำหรับงาน Night Shift โทน Dark / Neon Cyan รวมเครื่องมือและลิงก์งานที่ใช้บ่อยไว้ในหน้าเดียว

- ตรวจสอบและบันทึกอุณหภูมิอุปกรณ์ 3 ตัว
- สร้างข้อความรายงานตามวันที่/ช่วงวันที่และช่วงเวลา
- Copy รายงานและ Cisco environment command
- เปิด Work Links และ Google Sheet ที่เกี่ยวข้อง
- เปิด NetFlow 14 จุดแบบกดทีละลิงก์
- บันทึกสถานะงานและค่าที่กรอกไว้ใน localStorage
- Responsive สำหรับ Desktop / Tablet / Mobile

## ใช้งาน
เปิด `index.html` ด้วย Chrome/Edge ได้ทันที หรือ Deploy ผ่าน Vercel

Repository: `Riptwosec-collab/night-shift-hub`

## เปิด Xshell ทั้งสามอุปกรณ์ด้วยปุ่มเดียว

บนเว็บไซต์จะมีปุ่มเดียวคือ **เปิด Xshell ทั้ง 3** บริเวณเหนือการ์ดอุณหภูมิ ไม่มีปุ่มเปิดทีละเครื่อง/คัดลอก SSH และไม่มีปุ่มติดตั้งบนหน้าเว็บ

- เปิดตามลำดับ `10.1.100.3`, `10.1.100.1`, `10.1.100.2` ผ่าน Xshell 8
- เว็บไซต์ส่ง `nightshifthub-xshell://open-all` ให้ Windows ไปยังตัวเชื่อมที่ต้องติดตั้งครั้งแรกบนเครื่องที่ใช้งาน ตัวเชื่อมจะสั่ง PowerShell แบบซ่อนหน้าต่างและเปิด Xshell ให้เห็น
- **ต้องติดตั้งตัวเชื่อมบน Windows ครั้งแรกก่อน** ดาวน์โหลดไฟล์ [install-nightshift-xshell.ps1](./install-nightshift-xshell.ps1) จาก Repository ตรวจสอบไฟล์ แล้วรันจาก PowerShell ในโฟลเดอร์ที่เก็บไฟล์:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install-nightshift-xshell.ps1"

- พิมพ์ `YES` เมื่อแสดงข้อมูล IP ที่จะเปิดและยืนยันลงทะเบียน Windows custom URL scheme ภายใต้บัญชีตัวเอง (HKCU) ไม่ใช่การเปลี่ยน SSH handler หลัก
- ตั้ง Xshell ให้เปิดหลาย Session ในหน้าต่างเดียว หากต้องการ 3 แท็บแทน 3 หน้าต่าง (เมนู Tools > Options > Advanced)
- Chrome/Edge อาจขออนุญาตเปิดโปรแกรมภายนอก แม้ลงทะเบียนแล้ว เว็บไม่สามารถข้ามการยืนยันนี้หรือรัน PowerShell ด้วยตัวเองได้
- หากไม่สำเร็จ ให้ตรวจ `%LOCALAPPDATA%\NightShiftHub\XshellLauncher\launcher-error.log` และการติดตั้ง Xshell
- ถอนการติดตั้งได้ด้วย `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install-nightshift-xshell.ps1" -Uninstall`

เว็บไม่ได้เก็บรหัสผ่าน/SSH credentials และไม่ยืนยันว่าการเชื่อมต่อสำเร็จ การเปิดใช้งานต้องมีสิทธิ์เข้าถึงเครือข่ายตามปกติ

## Excel -> PDF Auto (Windows Desktop)

New Excel → PDF Auto card in Night Shift Hub. Click เลือก Excel → สร้าง PDF อัตโนมัติ. The browser requests the fixed local URL nightshifthub-excelpdf://run, which invokes the installed Windows helper. Windows opens its file picker; select one or multiple Excel workbooks and conversion continues automatically. PDF output is saved next to each original Excel file; existing PDF filenames are not overwritten. One converted PDF is opened automatically; for multiple exports, Explorer opens the first PDF location.

**One-time Windows setup:** From the website choose ตั้งค่าบน Windows ครั้งแรก to download install-nightshift-excelpdf.ps1, review its contents, then from that Downloads directory run:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install-nightshift-excelpdf.ps1"

Enter YES when prompted. This registers the fixed nightshifthub-excelpdf://run handler for the current Windows account only; it does not affect Xshell protocol bindings or global PowerShell policy. Microsoft Excel Desktop is required.

Conversion keeps source .xlsx/.xls/.xlsm files intact by opening them read-only, and formats the first worksheet for the user-supplied 23-event report reference: nonbold used-cell font (two Bold toggles), print range A1:J[last row], A4 landscape, one-page-wide with automatic vertical pagination, no repeated header, original merges/borders/widths intact. If the workbook matches the reference header and 27 used rows, a manual break is added before row 20. Other workbook structures may require different print settings; exact pixel parity with a PDF cannot be guaranteed without the original Excel source.

Security: the website does not upload or read local Excel data. Browser-side JavaScript cannot run Excel/PowerShell independently. The native helper rejects all protocol requests except the fixed run action, never executes script from the browser, disables Excel VBA macros, and asks the user to select files. Any other website could request the same registered URL; the browser may prompt for approval. Uninstall by running the same installer with -Uninstall from its original folder.

The browser/Windows/Excel end-to-end workflow must be verified on an actual Windows machine; source-level/static checks are not a substitute.

### Excel -> PDF bug fix (v1.1.1)

Fixed an Excel COM automation error: Unable to set the FitToPagesTall property of the PageSetup class. The earlier PowerShell helper incorrectly assigned numeric 0; the updated helper uses Boolean $false as required by Excel. If the Excel/printer integration still rejects this setting, the helper retries with PrintCommunication turned off/on and gives a printer-specific diagnostic.

**IMPORTANT for users with existing installations:** Reloading the website alone does NOT replace the PowerShell script already installed in %LOCALAPPDATA%\NightShiftHub\ExcelPDF. Click the updated website link **ติดตั้ง / อัปเดตตัวแปลง Windows** to download the new installer and run it again in PowerShell. It overwrites only this helper and updates the per-user protocol registration after confirmation. The original Excel workbooks are still opened read-only.

If this specific error remains after updating, check Windows Settings > Bluetooth & devices > Printers & scanners, verify a working default printer (e.g. Microsoft Print to PDF), then retest. Actual Windows Excel and printer integration must be validated on the user's machine.

### Output filename encoding repair (v1.1.2)

On Windows PowerShell 5.1 an installer decoded without a UTF-8 BOM can corrupt the non-ASCII Thai filename suffix. The installer now has a UTF-8 BOM and the output suffix is ASCII-only. The generated PDF preserves the **original Excel filename** (including Thai) and appends `_A4.pdf`; if already present, `_A4_2.pdf`, `_A4_3.pdf`, etc. Existing PDFs are never renamed or overwritten automatically. The Excel data and PDF formatting logic remain unchanged.

If you already installed a previous version, download **ติดตั้ง / อัปเดตตัวแปลง Windows** from the website and run the installer again, then enter `YES` to replace the local helper. The website alone cannot replace a locally installed Windows script.
