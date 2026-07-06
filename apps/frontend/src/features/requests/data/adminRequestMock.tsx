import React from 'react';
import {
  Wrench, ShoppingCart, Calendar as CalendarIcon, RotateCcw
} from 'lucide-react';

export const DEFAULT_ADMIN_REQUESTS = [
  { id: 'REQ-2023-0842', type: 'แจ้งซ่อม', icon: <Wrench size={14}/>, title: 'เครื่องปรับอากาศขัดข้อง', asset: 'AC-F12-004', sender: 'สมชาย ใจดี', location: 'อาคารบรรณสาร', status: 'URGENT', date: '24 ต.ค. 2566' },
  { id: 'REQ-2023-0841', type: 'เบิกจ่าย', icon: <ShoppingCart size={14}/>, title: 'ขอเบิกอุปกรณ์สำนักงาน', asset: 'NB-SUT-112', sender: 'วิภาวรรณ มั่นคง', location: 'ตึกศูนย์เครื่องมือ', status: 'IN-PROGRESS', date: '23 ต.ค. 2566' },
  { id: 'REQ-2023-0840', type: 'จองสถานที่', icon: <CalendarIcon size={14}/>, title: 'จองห้องประชุม', asset: 'R-CONF-02', sender: 'ศ.ดร. มานะ ชูเกียรติ', location: 'อาคารวิชาการ 1', status: 'RESOLVED', date: '22 ต.ค. 2566' },
];

export const DEFAULT_ADMIN_INQUIRIES = [
  { 
    id: "INQ-2026-0042", 
    name: "ผู้ใช้งาน ทั่วไป", 
    phone: "0957013361", 
    email: "user@example.com", 
    subject: "วิธีการขอเช่าพื้นที่", 
    detail: "ต้องการสอบถามขั้นตอนและเอกสารที่ต้องใช้ในการขอเช่าพื้นที่เชิงพาณิชย์บริเวณอาคารเรียนรวม 1 สำหรับเปิดร้านกาแฟครับ", 
    date: "วันนี้, 16:18 น.", 
    status: "unread", 
    type: "สอบถามข้อมูล" 
  },
  { 
    id: "INQ-2026-0041", 
    name: "สมชาย รักเรียน", 
    phone: "08123456XX", 
    email: "somchais@sut.ac.th", 
    subject: "สอบถามเวลาทำการช่วงปิดเทอม", 
    detail: "ช่วงปิดภาคเรียนฤดูร้อน ส่วนบริหารสินทรัพย์ยังเปิดทำการตามปกติไหมครับ พอดีจะเข้าไปติดต่อเรื่องเงินประกันหอพัก", 
    date: "เมื่อวานนี้, 10:30 น.", 
    status: "replied", 
    type: "ทั่วไป" 
  }
];

export const DEFAULT_DASHBOARD_STATS = [
  { label: 'คำร้องทั้งหมด', value: '1,284', sub: 'Update Today', color: 'bg-[#E9652B]', textColor: 'text-white' },
  { label: 'รอดำเนินการ', value: '42', sub: 'เพิ่มขึ้น 2 รายการวันนี้', color: 'bg-white', textColor: 'text-red-500' },
  { label: 'กำลังดำเนินการ', value: '156', sub: 'อัปเดตล่าสุด 10:30 น.', color: 'bg-white', textColor: 'text-blue-500' },
  { label: 'เสร็จสิ้น', value: '1,086', sub: '92% ของคำร้องทั้งหมด', color: 'bg-white', textColor: 'text-green-500' },
];

export const DEFAULT_DASHBOARD_REQUESTS = [
  { id: '#REQ-2023-0842', type: 'แจ้งซ่อม', icon: <Wrench size={14}/>, title: 'เครื่องปรับอากาศขัดข้อง', asset: 'Asset ID: AC-F12-004', sender: 'สมชาย ใจดี', email: 'somchai.j@sut.ac.th', location: 'อาคารบรรณสาร', status: 'เร่งด่วน', date: '24 ม.ค.', statusColor: 'text-red-500 bg-red-50' },
  { id: '#REQ-2023-0841', type: 'เบิกจ่าย', icon: <ShoppingCart size={14}/>, title: 'ขอเบิกอุปกรณ์สำนักงาน', asset: 'Asset ID: NB-SUT-112', sender: 'วิภาวรรณ มั่นคง', email: 'wipawan.m@sut.ac.th', location: 'ดิสศูนย์เครื่องมือ', status: 'กำลังดำเนินการ', statusColor: 'text-blue-500 bg-blue-50' },
  { id: '#REQ-2023-0840', type: 'จองสถานที่', icon: <CalendarIcon size={14}/>, title: 'จองห้องประชุม', asset: 'Room ID: R-CONF-02', sender: 'ศ.ดร. มานะ ชูเกียรติ', email: 'mana.c@sut.ac.th', location: 'อาคารวิชาการ 1', status: 'เสร็จสิ้น', statusColor: 'text-green-500 bg-green-50' },
  { id: '#REQ-2023-0839', type: 'คืนสินทรัพย์', icon: <RotateCcw size={14}/>, title: 'คืนอุปกรณ์ยืม', asset: 'Asset ID: CAM-009', sender: 'Guest User', email: 'visitor_332@gmail.com', location: 'ศูนย์นวัตกรรม', status: 'รอตรวจสอบ', statusColor: 'text-gray-500 bg-gray-50' },
];
