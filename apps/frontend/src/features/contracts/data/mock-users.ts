export interface MockUser {
  id: string;
  name: string;
  email: string;
}

export const mockUsers: MockUser[] = [
  { id: "user_01", name: "คุณ สมชาย แข็งขัน", email: "somchai.k@sut.ac.th" },
  { id: "user_02", name: "คุณ มะลิ สวยงาม", email: "mali.s@sut.ac.th" },
  { id: "user_03", name: "คุณ วิชา การดี", email: "wicha.k@sut.ac.th" },
  { id: "user_04", name: "คุณ นารี จิตใจดี", email: "naree.j@sut.ac.th" },
  { id: "user_05", name: "คุณ ปองพล ขยันยิ่ง", email: "pongpol.k@sut.ac.th" },
];
