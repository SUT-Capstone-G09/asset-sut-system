import React from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { StatusStepData } from '../components/RequestDetailStatus';
import { ChatMessage } from '../components/RequestDetailChat';

export const DEFAULT_REQUEST_INFO = {
  refNumber: 'SUT-2024-0892',
  category: 'ซ่อมบำรุงครุภัณฑ์ไฟฟ้า',
  createdAt: '12 ต.ค. 2567 | 09:30 น.',
  status: 'กำลังดำเนินการ',
  title: 'แจ้งซ่อมเครื่องปรับอากาศ ห้องบรรยาย B1102',
  description: 'ตรวจสอบพบเครื่องปรับอากาศ หมายเลขครุภัณฑ์ SUT-AC-55-012 มีอาการเสียงดังผิดปกติและลมไม่เย็นจัดในช่วงเวลาที่มีนักศึกษาเข้าใช้งานหนาแน่น เบื้องต้นได้ทำความสะอาดแผ่นกรองแล้วแต่อาการยังไม่หาย คาดว่าอาจเกิดจากระบบน้ำยาหรือคอมเพรสเซอร์มีปัญหา',
  location: 'อาคารเรียนรวม 1 ชั้น 1 ห้องบรรยาย B1102',
  eventDate: '11 ตุลาคม 2567 (ประมาณ 14:00 น.)',
  attachments: [
    'https://dasintergroup.com/daswp/wp-content/uploads/2025/07/1.1-แอร์พัง-มีไฟกระพริบ-เกิดจากอะไร.webp',
    'https://www.chiangmaiaircare.com/images/2015/04/500756.jpg',
  ]
};

export const DEFAULT_STATUS_STEPS: StatusStepData[] = [
  {
    title: "รับเรื่อง",
    desc: "เจ้าหน้าที่รับเรื่องและตรวจสอบข้อมูลเบื้องต้นเรียบร้อยแล้ว",
    time: "12 ต.ค. 67 • 09:45",
    icon: <CheckCircle2 size={24} />,
    active: true,
    done: true
  },
  {
    title: "กำลังดำเนินการ",
    desc: "ประสานงานช่างเทคนิคเพื่อเข้าตรวจสอบหน้างาน",
    time: "12 ต.ค. 67 • 13:20",
    icon: <MessageCircle size={24} />,
    active: true,
    color: "bg-orange-500"
  },
  {
    title: "เสร็จสิ้น",
    desc: "รอการปิดงานจากผู้แจ้ง",
    time: "",
    icon: <CheckCircle2 size={24} />,
    disabled: true
  }
];

export const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderType: 'staff',
    senderName: 'สมชาย',
    content: 'สวัสดีครับคุณผู้แจ้ง ผมได้รับเรื่องแจ้งซ่อมแล้วนะครับ ขณะนี้กำลังจัดคิวช่างเทคนิค คาดว่าจะเข้าตรวจสอบหน้างานได้พรุ่งนี้เช้าครับ',
    time: '09:47 น.'
  },
  {
    id: 'msg-2',
    senderType: 'user',
    content: 'ขอบคุณครับ รบกวนช่างโทรแจ้งก่อนเข้าหน้างานด้วยนะครับ พอดีห้องบรรยายจะมีเรียนช่วง 10 โมงครับ',
    time: '10:15 น.',
    read: true
  },
  {
    id: 'msg-3',
    senderType: 'staff',
    senderName: 'สมชาย',
    content: 'รับทราบครับ จะให้ช่างประสานงานก่อนเข้าครับ',
    time: '10:18 น.'
  }
];
