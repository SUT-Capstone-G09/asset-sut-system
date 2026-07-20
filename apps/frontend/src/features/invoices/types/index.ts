export interface Location {
  id: string;
  name: string;
  zoneId: string; // maps to tenantAreaOptions id
}

export interface Tenant {
  id: string;
  name: string;
  shortName: string;      // e.g. "MS", "KT"
  shopCode: string;       // e.g. "SHOP-B201"
  locationId: string;
  buildingId: number;     // maps to mockBuildings id
  buildingTypeId: number; // maps to mockBuildingTypes id
  contractNo: string;
  currentPeriod: string;
  outstandingAmount: number;
  status: "Active" | "Inactive" | "Expired";
  // contact info
  contactName: string;
  phone: string;
  email: string;
  // location details
  floor: string;
  room: string;
  zone: string;
  contractStartDate: string; // e.g. "01 ม.ค. 2567"
}

// ─── Invoice PDF Extraction Types ───────────────────────────────────────────

/**
 * A single column definition extracted from a PDF table.
 * The `key` is used to index into InvoiceTableRow.
 */
export interface InvoiceTableColumn {
  key: string;     // e.g. "item", "period", "amount", "discount", "total"
  label: string;   // display header e.g. "รายการ", "ประจำเดือน"
  align?: "left" | "right" | "center";
  highlight?: boolean; // highlight this column (e.g. total amount)
  width?: string; // optional CSS width e.g. "40%", "120px"
}

/**
 * A single row of data. Keys match InvoiceTableColumn.key.
 * Values are always strings to stay flexible across different PDF schemas.
 */
export type InvoiceTableRow = Record<string, string>;

/**
 * Metadata fields extracted from the invoice header section.
 */
export interface InvoiceMetadata {
  tenantName?: string;      // ชื่อหน่วยงาน / โครงการที่นิติกรจ่าย
  invoiceNo?: string;       // เลขที่เอกสาร
  invoiceDate?: string;     // วันที่เอกสาร
  receiptNo?: string;       // เลขที่ใบเสร็จรับเงิน
  [key: string]: string | undefined; // allow extra fields per-document
}

/**
 * The full structured data extracted from a single invoice PDF.
 * columns + rows let the UI render a dynamic table regardless of PDF schema.
 */
export interface InvoiceExtractedData {
  metadata: InvoiceMetadata;
  columns: InvoiceTableColumn[];
  rows: InvoiceTableRow[];
  /** parsing status */
  status: "pending" | "success" | "error";
  errorMessage?: string;
}

// ─── Saved Invoice (after user confirms & saves) ──────────────────────────────

export interface SavedInvoice {
  id: string;                  // client-side UUID until real API
  savedAt: string;             // ISO datetime string
  tenant: Tenant;
  fileName: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;         // grand total (subtotal + outstanding debt)
  subtotal: number;
  outstandingDebt: number;
  lineItems: InvoiceTableRow[];
  columns: InvoiceTableColumn[];
}
