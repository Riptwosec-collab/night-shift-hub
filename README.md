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
