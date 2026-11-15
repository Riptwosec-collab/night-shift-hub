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

### Output filename exact-match correction (v1.1.3)

PDFs now use the exact same base filename as the selected Excel file, with only the extension changed to `.pdf`. For example: `สรุปรายงานเหตุการณ์ วันที่ 15 พฤศจิกายน 2569 เวลา 06.00 น.-20.30 น.xlsx` becomes `สรุปรายงานเหตุการณ์ วันที่ 15 พฤศจิกายน 2569 เวลา 06.00 น.-20.30 น.pdf`. No `_A4` or `_จัดหน้า` suffix is added. Only when that PDF name already exists, the converter saves `..._2.pdf`, `..._3.pdf`, etc., to avoid overwriting user files. It still retains the UTF-8 BOM for Windows PowerShell 5.1.

**Already installed?** The fix requires downloading and re-running `install-nightshift-excelpdf.ps1` from the website (v1.1.3) and typing `YES`; simply refreshing the website will not change the installed local script.

### Website cleanup — 2026-11-15

Removed the **ติดตั้ง / อัปเดตตัวแปลง Windows** link from the Excel → PDF Auto card and removed the entire **ลิงก์เพิ่มเติม** custom-links card (including its JavaScript loader). The main Excel → PDF Auto button still works with the already-installed Windows protocol helper; the PowerShell installer file remains in the repository for future manual upgrades. Custom-link entries already saved in browser localStorage were **not deleted**. No network/temperature/report/Xshell code was changed.


## NetFlow 14-node automatic Chrome launch

The NetFlow card now includes the single button **เปิด NetFlow ทั้ง 14 จุด**, next to the existing Open Google Sheet / Copy Link / Mark Done controls. The manually selectable 14 links remain intact.

**One-time Windows setup** (no new installer button on the website): download and review install-nightshift-netflow.ps1 from the repository root. Open PowerShell in the downloaded file's directory and run:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install-nightshift-netflow.ps1"

After reviewing the details, type YES to confirm. This registers nightshifthub-netflow://open-all for the current Windows user (HKCU), without replacing any Xshell or Excel/PDF association. The website cannot directly run PowerShell; the locally installed fixed-purpose handler is required for reliable opening of 14 tabs rather than risking browser popup blocking.

Clicking the NetFlow card button asks Windows to launch one Google Chrome NEW WINDOW with 14 tabs in exactly this order:
3677, 3723, 7163, 3843, 3841, 2597, 3853, 3854, 3855, 3856, 3861, 3863, 3865, 3866.
All pages use https://nocorion.rd.go.th/Orion/TrafficAnalysis/NetflowNodeDetails.aspx?NetObject=NN:<ID>.

The launcher stores no passwords, accepts no URLs or code from the website, and rejects all inputs except the exact fixed protocol action. Any website can request that protocol, but it can only trigger these predefined tabs. Chrome may ask permission to open an external program, and intranet pages still require normal VPN/login access. If Chrome is missing the launcher reports an error and writes a local log in LOCALAPPDATA/NightShiftHub/NetFlowLauncher/netflow-launcher-error.log.

To uninstall, run the same installer with -Uninstall.

Live Windows/Chrome end-to-end testing is still necessary; a successful request does not establish that the intranet pages loaded.

### NetFlow loading repair — sequential foreground warmup

The original launcher opened all 14 URLs simultaneously, leaving many SolarWinds charts in background tabs. Background-tab throttling may contribute to Loading... status but has not been confirmed as the only cause.

The revised Windows launcher opens the first NetFlow URL in a new Chrome window, waits 15 seconds by default, and requests one more NetFlow URL in Chrome at each interval. Chrome normally opens a requested URL as a foreground tab in its last active window. This is an automatic best-effort workaround, not an inspection of graph/AJAX completion.

Keep the new Chrome window in front while loading; switching windows can direct new tabs elsewhere or cause the tabs to become backgrounded. The 14 NetFlow URLs and browser profile are unchanged.

Progress is written to %LOCALAPPDATA%/NightShiftHub/NetFlowLauncher/netflow-warmup.log. The delay can be changed from 15 to an integer 5–60 by editing %LOCALAPPDATA%/NightShiftHub/NetFlowLauncher/warmup-seconds.txt; the installer preserves existing choices.

IMPORTANT: existing users must download install-nightshift-netflow.ps1 again, review and run it with PowerShell, then type YES to upgrade the installed local helper. A website refresh alone cannot change it.

For Chrome, open chrome://settings/performance and optionally add nocorion.rd.go.th to Always keep these sites active. This prevents memory discarding but does not guarantee hidden-tab graph rendering. If a chart remains loading when the tab is foreground, check SolarWinds API requests, VPN and user session.

No change to Xshell, Excel PDF, passwords or other website features.

### NetFlow warmup delay — 5 seconds (2026-11-16)

The launcher now defaults to **5 seconds** between NetFlow tabs, retaining the exact order of all 14 nodes. An existing Windows installation reads `%LOCALAPPDATA%\NightShiftHub\NetFlowLauncher\warmup-seconds.txt`; update that file directly with `Set-Content "$env:LOCALAPPDATA\NightShiftHub\NetFlowLauncher\warmup-seconds.txt" -Value "5"` to apply immediately, without reinstalling. Fresh installs use 5 seconds by default; reinstalling preserves a valid previous custom delay. This shorter delay is best-effort and does not guarantee SolarWinds finishes rendering each chart before switching tabs.

### Excel → PDF card placement — 2026-11-16

The PDF converter is displayed in the **right-hand column directly beside NOC@RD Table Builder** on desktop by inserting its card immediately after `#nocBuilderCard` and using the site's existing two-column grid. It stacks beneath Table Builder on screens 680px or narrower. The card heading is **รายงานเหตุการณ์การเฝ้าระวังเว็บไซต์กรมสรรพากร Excel → PDF Auto**. The one-click Windows conversion workflow and its `nightshifthub-excelpdf://run` URL remain unchanged, and no installer button was reintroduced.

## NOC External AutoFill V3.9 — launch the user's local CMD

The **NOC@RD Table Builder** card has two buttons: **เปิด Table Builder** (original website table) and **เปิด NOC External Form** (launches the user's Windows OPEN_NOC_FORM.cmd). The existing table builder, Excel/PDF and other modules are unchanged.

### First-time Windows setup (per Windows account)

1. Keep your OWN `OPEN_NOC_FORM.cmd` and `NOC_External_Form.ps1` together in the same folder. These two files are not hosted on the public GitHub repository.
2. Download and review [`install-nightshift-nocform.ps1`](./install-nightshift-nocform.ps1) from this repository.
3. Open PowerShell and run `powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File "<full path to install-nightshift-nocform.ps1>"`.
4. The installer displays a file picker for `OPEN_NOC_FORM.cmd`, verifies that `NOC_External_Form.ps1` is beside it, and shows the SHA256 hashes.
5. Type `YES` after reviewing the warnings. The installer copies those two files into `%LOCALAPPDATA%\NightShiftHub\NOCExternalForm` and registers a fixed per-user Windows custom protocol `nightshifthub-nocform://`.
6. Open the NOC report in Microsoft Excel Desktop with editing enabled, click **เปิด NOC External Form** on Night Shift Hub and approve Chrome's external-application prompt if shown.

Browser security: a website cannot execute a CMD/PowerShell program directly. The installed URL handler accepts no arguments or commands from the web; it can only start the user's fixed local form. Any website can request the registered protocol, so approve external-app prompts only from trusted sites.

Original uploaded `OPEN_NOC_FORM.cmd` starts the WinForms PowerShell 5.1 program with `-STA`. The uploaded README describes adding/updating individual or multiple Tickets in the Excel workbook that is already open, **without automatically saving**. Disable Excel AutoSave if necessary, review changes, and save manually with Ctrl+S.

**Privacy:** user-supplied NOC CMD/PS1 files and workbook contents are not uploaded to GitHub or transmitted by this website. They remain stored only on the Windows PC where they are installed. The installer is published; the two operational scripts are not.

**Uninstall:** run the same Windows installer with `-Uninstall` to remove the protocol registration and the installed copies (not your original files). The effect of opening the program and writing data through Excel COM must be tested on Windows; static tests only check that the button and installer are wired correctly.


### NOC External Form launcher reliability repair — 2026-11-16

- Removed the old **เปิด Table Builder** button. The **เปิด NOC External Form** button is now the primary action in card 7.
- Added a small help link for downloading the one-time Windows installer, because a web browser cannot execute local CMD/PowerShell without a registered handler.
- The Windows URL handler now passes the clicked URL as \"%1\" and accepts only `nightshifthub-nocform://open`. This URL cannot supply file paths or commands.
- To avoid the Windows CMD association issue, the handler now launches the user's **local** `NOC_External_Form.ps1` with PowerShell 5.1 `-STA` directly. The originally uploaded `OPEN_NOC_FORM.cmd` does the same and is still copied/validated during setup.
- **Must reinstall the updated Windows bridge once.** The website alone cannot update the copy already in Windows. Use the installer file and confirm `YES`; then test in Windows PowerShell using `Start-Process 'nightshifthub-nocform://open'`.
- Do not put the private CMD, PowerShell form or Excel workbook into this public GitHub repository. If launching fails check `%LOCALAPPDATA%\NightShiftHub\NOCExternalForm\launcher-error.log`.

The program still edits the already-open Excel workbook without automatic Save. Windows program launch and Excel COM behavior require testing on the user's computer.

### Repair corrupted PDF filenames on an already-installed Windows converter

If a new export still ends with a corrupted Thai suffix followed by _A4.pdf, the installed local PowerShell converter likely differs from the current GitHub installer. The hosted website does not write PDF filenames itself, and existing PDFs are not automatically renamed.

Download and review [repair-nightshift-excelpdf.ps1](./repair-nightshift-excelpdf.ps1), then run from Windows PowerShell 5.1:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<full path to repair-nightshift-excelpdf.ps1>"

The repair utility inspects the local installed file at %LOCALAPPDATA%\NightShiftHub\ExcelPDF\convert-excel-to-pdf.ps1, makes a timestamped local backup, and replaces only the UniquePdf function with an ASCII-only suffix policy: the original Excel base filename followed by .pdf, or _2.pdf / _3.pdf if a file already exists. It does not edit Excel data, delete files, run network requests, or change protocol handlers.

To rename a previously created PDF that still contains the bad _A4 suffix, rerun with -RenameExisting in an STA PowerShell:

    powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File "<full path to repair-nightshift-excelpdf.ps1>" -RenameExisting

Only user-selected PDFs are examined. The program previews proposed changes, requires typing RENAME, and skips name collisions. Review each proposed rename, because an intentionally named _A4 file could also match the pattern. The repair script is UTF-8 BOM-encoded for Windows PowerShell 5.1.
