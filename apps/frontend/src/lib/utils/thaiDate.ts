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

// ── Official-document date range formatting ─────────────────────────────────

export interface ThaiDateRange {
  start: string; // yyyy-MM-dd
  end: string;   // yyyy-MM-dd
}

function toEpochDay(dateStr: string): number {
  const { d, m, y } = parseDate(dateStr);
  return Date.UTC(y, m - 1, d) / 86400000;
}

// จัดกลุ่มวันที่ (รับมาลำดับใดก็ได้ ซ้ำได้) ให้เป็นช่วงต่อเนื่องกันทางปฏิทิน —
// ต่อเนื่องข้ามเดือน/ข้ามปีได้ เช่น 31 ก.ค. ต่อกับ 1 ส.ค. ถือว่าต่อเนื่องกัน
export function groupConsecutiveDates(dates: string[]): ThaiDateRange[] {
  const sorted = Array.from(new Set(dates)).sort();
  const ranges: ThaiDateRange[] = [];
  for (const dateStr of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && toEpochDay(dateStr) - toEpochDay(last.end) === 1) {
      last.end = dateStr;
    } else {
      ranges.push({ start: dateStr, end: dateStr });
    }
  }
  return ranges;
}

type DateCluster =
  | { type: "range"; start: string; end: string }
  | { type: "list"; days: string[] };

// จุดอ้างอิงของแต่ละ cluster สำหรับตัดสินใจว่าจะโชว์เดือน/ปีกำกับไหม — คือวันที่
// ปรากฏหลังสุดใน cluster นั้น (ท้ายช่วงสำหรับ range, วันสุดท้ายของ list)
function clusterAnchor(c: DateCluster): string {
  return c.type === "range" ? c.end : c.days[c.days.length - 1];
}
function clusterMonth(c: DateCluster): number { return parseDate(clusterAnchor(c)).m; }
function clusterYear(c: DateCluster): number  { return parseDate(clusterAnchor(c)).y; }
function clusterBE(c: DateCluster): number    { return parseDate(clusterAnchor(c)).be; }

// รวมวัน "เดี่ยว" (ไม่ต่อเนื่องกับวันอื่น) ที่อยู่เดือน/ปีเดียวกันติดๆ กันเป็น
// list เดียว (เช่น 2,4,6 ส.ค. → list เดียว) ส่วน range คงเป็น cluster ของตัวเอง
// เสมอ ไม่ merge กับอะไร
function clusterRanges(ranges: ThaiDateRange[]): DateCluster[] {
  const clusters: DateCluster[] = [];
  for (const r of ranges) {
    const isSingle = r.start === r.end;
    const last = clusters[clusters.length - 1];
    if (isSingle && last?.type === "list") {
      const cur = parseDate(r.start);
      const prev = parseDate(last.days[last.days.length - 1]);
      if (cur.m === prev.m && cur.y === prev.y) {
        last.days.push(r.start);
        continue;
      }
    }
    clusters.push(isSingle ? { type: "list", days: [r.start] } : { type: "range", start: r.start, end: r.end });
  }
  return clusters;
}

function joinDayList(days: string[]): string {
  const nums = days.map((d) => String(parseDate(d).d));
  if (nums.length === 1) return nums[0];
  if (nums.length === 2) return `${nums[0]} และ ${nums[1]}`;
  return `${nums.slice(0, -1).join(", ")} และ ${nums[nums.length - 1]}`;
}

function clusterDayPart(c: DateCluster): string {
  if (c.type === "list") return joinDayList(c.days);
  const sp = parseDate(c.start);
  const ep = parseDate(c.end);
  if (sp.m === ep.m && sp.y === ep.y) return `${sp.d} ถึงวันที่ ${ep.d}`;
  // ช่วงเดียวกันแต่คาบเกี่ยวข้ามเดือน/ปี (เช่น 30 ก.ค. ต่อเนื่องถึง 2 ส.ค.) —
  // ต้องกำกับเดือน(/ปี)ของฝั่งเริ่มไว้ด้วย ไม่งั้นจะดูเหมือนทั้งคู่อยู่เดือนเดียวกับฝั่งจบ
  const startMonthYear = sp.y !== ep.y
    ? `${THAI_MONTHS_LONG[sp.m - 1]} พ.ศ. ${sp.be}`
    : THAI_MONTHS_LONG[sp.m - 1];
  return `${sp.d} ${startMonthYear} ถึงวันที่ ${ep.d}`;
}

// แปลง array วันที่ (ลำดับ/ซ้ำได้ตามใจ) เป็นข้อความช่วงวันแบบเอกสารราชการไทย
// ครอบคลุมวันเดียว / หลายวันต่อเนื่อง / หลายวันไม่ต่อเนื่อง / ผสม / ข้ามเดือน / ข้ามปี
// โดยไม่แยกกิ่งเป็น 4 เคสตายตัว — ใช้ groupConsecutiveDates หาช่วงต่อเนื่องก่อน
// แล้วค่อยตัดสินใจการแสดงเดือน/ปีจากการเทียบ cluster ที่ติดกัน (ครอบคลุมทุก
// combination โดยไม่ต้องเขียนซ้ำ logic ต่อเนื่อง/ไม่ต่อเนื่องในแต่ละเคส)
//
// isCommandDocument มีผลเฉพาะกรณี "วันเดียว" เท่านั้น (ตามสเปคต้นฉบับ) — เพิ่ม
// "วันที่" นำหน้า สำหรับหนังสือคำสั่ง/ประกาศ
//
// หมายเหตุ: ต่างจากสเปคตั้งต้นตรงที่ใส่ "พ.ศ." กำกับปีเสมอในทุกเคส (ไม่ใช่แค่
// วันเดียว) ให้ตรงกับรูปแบบที่ใช้จริงในเอกสารของระบบนี้ (ดู fmtLong ด้านบน)
export function formatThaiOfficialDate(dates: string[], isCommandDocument = false): string {
  if (dates.length === 0) return "";
  const ranges = groupConsecutiveDates(dates);

  if (ranges.length === 1 && ranges[0].start === ranges[0].end) {
    const { d, be, m } = parseDate(ranges[0].start);
    const month = THAI_MONTHS_LONG[m - 1];
    return isCommandDocument ? `วันที่ ${d} ${month} พ.ศ. ${be}` : `${d} ${month} พ.ศ. ${be}`;
  }

  const clusters = clusterRanges(ranges);
  const parts = clusters.map((c, i) => {
    const isLast = i === clusters.length - 1;
    const next = clusters[i + 1];
    const monthChanges = isLast || clusterMonth(c) !== clusterMonth(next);
    const yearChanges = isLast || clusterYear(c) !== clusterYear(next);
    let text = clusterDayPart(c);
    if (monthChanges || yearChanges) {
      text += ` ${THAI_MONTHS_LONG[clusterMonth(c) - 1]}`;
      if (yearChanges) text += ` พ.ศ. ${clusterBE(c)}`;
    }
    return text;
  });

  const body = parts.join(" และวันที่ ");
  const prefix = clusters[0].type === "range" ? "ระหว่างวันที่" : "วันที่";
  return `${prefix} ${body}`;
}
