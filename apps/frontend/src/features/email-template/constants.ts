// Variables an admin can drop into a template. The token must match the Go
// template placeholder the backend interpolates (see services/email.go).
export const TEMPLATE_VARIABLES: { token: string; label: string }[] = [
  { token: "{{.userName}}", label: "ชื่อผู้ใช้" },
  { token: "{{.assetName}}", label: "ชื่อสินทรัพย์/ห้อง" },
  { token: "{{.amount}}", label: "จำนวนเงิน" },
  { token: "{{.paymentUrl}}", label: "ลิงก์ชำระเงิน" },
];
