// Variables an admin can drop into a template. The token must match the Go
// template placeholder the backend interpolates (see services/email.go).
export const TEMPLATE_VARIABLES: { token: string; label: string }[] = [
  { token: "{{.userName}}", label: "ชื่อผู้ใช้" },
  { token: "{{.assetName}}", label: "ชื่อสินทรัพย์/ห้อง" },
  { token: "{{.amount}}", label: "จำนวนเงิน" },
  { token: "{{.paymentUrl}}", label: "ลิงก์ชำระเงิน" },
];

// SUT brand palette shown in the GrapesJS color picker (passed to spectrum as
// `colorPicker.palette`) so admins can style emails with on-brand colors in one
// click. Row 1 is the SUT orange family; row 2 is the neutral grays already used
// by the code templates (services/templates/email/booking_approved.html). Admins
// can still pick any custom color — these are just quick presets.
export const SUT_COLOR_PALETTE: string[][] = [
  ["#ea7317", "#f5934a", "#fbcfa3", "#c75f0e", "#9a4a0b"],
  [
    "#ffffff",
    "#fafafa",
    "#f4f4f5",
    "#e4e4e7",
    "#a1a1aa",
    "#71717a",
    "#3f3f46",
    "#18181b",
  ],
];
