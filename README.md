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

## เปิด Xshell จากหน้าเว็บ (SSH Quick Launch)

หน้าเว็บมีปุ่ม **เปิด Xshell** และ **คัดลอก SSH** ใต้การ์ดตรวจอุณหภูมิ 3 ตัว โดยกดเปิดทีละเครื่อง:

- IT05-C3750X-Intra-Inter — `ssh://10.1.100.3`
- IT06-C9500-CSW1-A01 — `ssh://10.1.100.1`
- IT06-C9500-CSW2-A02 — `ssh://10.1.100.2`

ปุ่มเปิดจะส่ง `ssh://` ให้ Windows จัดการ ต้องตั้ง Xshell 8 เป็นแอปเริ่มต้นของลิงก์ SSH ก่อน ผู้ใช้จะต้องยืนยันการเปิดแอปภายนอกใน Chrome/Edge ตามการตั้งค่าของเบราว์เซอร์ และยังต้องมีสิทธิ์/VPN เข้าถึงอุปกรณ์ตามปกติ เมื่อไม่ตั้งค่า Handler ใช้ปุ่มคัดลอก SSH แล้ววางใน Address Bar ของ Xshell เองได้

คำสั่งเปิดโดยตรง (ทางเลือก): `Xshell -url ssh://10.1.100.3` / `Xshell -url ssh://10.1.100.1` / `Xshell -url ssh://10.1.100.2` ไม่บันทึก Username/Password ในเว็บ การเปิดลิงก์เป็นเพียงคำขอเปิด Session ไม่ได้หมายความว่าเชื่อมต่อสำเร็จ

## เปิด Xshell 8 ทั้ง 3 Session ด้วยปุ่มเดียวบนเว็บไซต์

ปุ่ม **เปิด Xshell ทั้ง 3** แสดงเหนือการ์ดตรวจอุณหภูมิ จะส่ง URL **nightshifthub-xshell://open-all** ให้ Windows เรียก PowerShell ที่ติดตั้งไว้ในเครื่อง ต้องติดตั้งตัวเปิดครั้งแรก เนื่องจากเว็บไซต์ไม่สามารถสั่งรัน PowerShell โดยตรงได้

### ตั้งค่าครั้งแรกบน Windows

1. บนเว็บไซต์คลิก **ติดตั้งตัวเปิด (ครั้งแรก)** เพื่อดาวน์โหลดไฟล์ install-nightshift-xshell.ps1
2. ตรวจสอบเนื้อหาไฟล์ เปิด PowerShell ในโฟลเดอร์ Downloads แล้วรันคำสั่งนี้:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install-nightshift-xshell.ps1"

3. หากตัวติดตั้งค้นหา Xshell.exe ไม่พบ ให้ระบุ Full Path จาก Shortcut Properties
4. ตัวติดตั้งจะแสดง IP ทั้งสามและขอให้พิมพ์ YES ก่อนลงทะเบียนตัวเปิด Windows ภายใต้ HKCU (ไม่ต้อง Run as Administrator)
5. ใน Xshell เลือก Tools > Options > Advanced > **Open multiple sessions in a single Xshell window** เพื่อให้ปรากฏสามแท็บในหน้าต่างเดียว

หลังติดตั้ง กดปุ่ม **เปิด Xshell ทั้ง 3** หนึ่งครั้ง Chrome/Edge อาจขออนุญาตเปิดแอปภายนอก PowerShell จะเปิดคำสั่งตามลำดับ โดยเว้น 900 มิลลิวินาทีต่อเครื่อง:

1. Xshell.exe -url ssh://10.1.100.3
2. Xshell.exe -url ssh://10.1.100.1
3. Xshell.exe -url ssh://10.1.100.2

ฟังก์ชันเดิมของเว็บยังใช้ได้ รวมถึงปุ่มเปิดทีละเครื่องและคัดลอกลิงก์ SSH หากยังไม่ได้ติดตั้งตัวเปิด PowerShell

### ความปลอดภัยและวิธียกเลิก

- ตัวเปิดที่ใช้คือ custom URL protocol **nightshifthub-xshell://** ไม่ได้เปลี่ยนตัวเปิดลิงก์ **ssh://** ปกติของ Windows
- สคริปต์ที่ติดตั้งในเครื่องยอมรับเฉพาะ URL สำหรับเปิดสาม Session ที่ระบุไว้ตายตัวเท่านั้น ไม่รับ PowerShell command หรือ IP จากเว็บ
- การกดปุ่มจากเว็บเป็นคำขอให้ Windows เปิดโปรแกรม ไม่ใช่การยืนยันว่าการเชื่อมต่อ SSH สำเร็จ
- เว็บอื่นอาจขอเปิด protocol เดียวกันได้เช่นกัน Windows/Chrome อาจแสดงกล่องขออนุญาต ควรตรวจสอบก่อนยืนยัน
- การใช้ -ExecutionPolicy Bypass จำกัดอยู่ที่ PowerShell โปรเซสที่เรียก ไม่ได้เปลี่ยน Execution Policy ของทั้งเครื่อง ผู้ใช้ควรอ่านไฟล์ก่อนรัน
- ถอนการติดตั้งด้วยคำสั่งนี้จากโฟลเดอร์ที่มีไฟล์เดิม:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\install-nightshift-xshell.ps1" -Uninstall

ต้องมี Xshell 8 ติดตั้งในเครื่องและได้รับอนุญาตให้เข้าถึงระบบเครือข่ายตามปกติ
