const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const THAI_MONTHS_LONG  = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

export function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { d, m, y, be: y + 543 };
}

export function fmtLong(dateStr: string) {
  const { d, m, be } = parseDate(dateStr);
  return `${d} ${THAI_MONTHS_LONG[m - 1]} พ.ศ. ${be}`;
}

export function fmtShortD(dateStr: string) { return String(parseDate(dateStr).d); }
export function fmtShortM(dateStr: string) { return THAI_MONTHS_SHORT[parseDate(dateStr).m - 1]; }
export function fmtShortBE(dateStr: string) { return String(parseDate(dateStr).be); }

export function todayParts() {
  const n = new Date();
  return { d: n.getDate(), m: THAI_MONTHS_LONG[n.getMonth()], be: n.getFullYear() + 543 };
}
