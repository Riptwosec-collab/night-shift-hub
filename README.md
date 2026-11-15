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
