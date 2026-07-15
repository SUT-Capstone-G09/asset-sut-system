package dto

// ระบบคำร้องและสื่อสารกับเจ้าหน้้าที่

type CreateRequestDTO struct {
	// --- ข้อมูลฟอร์มหลัก (ซ้าย) ---
	Title         string   `json:"title" binding:"required"`
	Description   string   `json:"description" binding:"required"`
	RequestTypeID uint     `json:"request_type_id" binding:"required"`

	// --- ข้อมูลติดต่อและรายละเอียดเพิ่มเติม (ขวา) ---
	ContactInfo   string   `json:"contact_info" binding:"required"` // รองรับอีเมล/เบอร์โทรศัพท์ตามหน้าจอ
	Location      string   `json:"location" binding:"required"`     // ในหน้าจอล่าสุดปรับเป็น REQUIRED แล้ว
	IncidentDate  *string  `json:"incident_date"`                   // OPTIONAL (ใช้ pointer เพื่อให้รองรับค่า null ได้)
	EvidenceUrls  []string `json:"evidence_urls"`                   // อาเรย์เก็บ URL ของไฟล์แนบประกอบ
}

type AssignWorkDTO struct {
	StaffID uint   `json:"staff_id" binding:"required"`
	Detail  string `json:"detail"` // บันทึกโน้ตเพิ่มเติม เช่น ช่างด่วนพิเศษ
}

type RequestListResponseDTO struct {
	ID           uint   `json:"id"`
	Refcode      string `json:"refcode"`
	Title        string `json:"title"`
	Location     string `json:"location"`
	StatusName   string `json:"status_name"`   // ดึงมาจาก RequestStatus.Status โดยตรง
	RequestType  string `json:"request_type"`  // ดึงมาจาก RequestTypes.Name
	ReporterName string `json:"reporter_name"` // ดึงมาจาก Users.Name (คนแจ้ง)
	CreatedAt    string `json:"created_at"`    // แปลง DateTime เป็นฟอร์แมตอ่านง่าย เช่น "24 Oct 2024"
}

type RequestDetailResponseDTO struct {
	ID           uint                     `json:"id"`
	Refcode      string                   `json:"refcode"`
	Title        string                   `json:"title"`
	Description  string                   `json:"description"`
	Location     string                   `json:"location"`
	Status       string                   `json:"status"`
	RequestType  string                   `json:"request_type"`
	EvidenceUrls []string                 `json:"evidence_urls"`
	Reporter     UserSummaryDTO           `json:"reporter"`  // ข้อมูลผู้แจ้งย่อส่วน
	Staff        *UserSummaryDTO          `json:"staff"`     // ข้อมูลช่างย่อส่วน (ส่งเป็น Pointer เผื่อเป็น null)
	Histories    []ActionHistoryReportDTO `json:"histories"` // ประวัติการส่งงาน/อัปเดตสถานะทั้งหมด
}

// DTO ย่อยสำหรับส่งข้อมูลผู้ใช้เฉพาะฟิลด์ที่ปลอดภัย
type UserSummaryDTO struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

// DTO ย่อยสำหรับส่งรายการประวัติกิจกรรม
type ActionHistoryReportDTO struct {
	AdminName string `json:"admin_name"`
	StaffName string `json:"staff_name,omitempty"`
	Status    string `json:"status"`
	Detail    string `json:"detail"`
	Time      string `json:"time"`
}

type UpdateRequestStatusDTO struct {
	Status  string `json:"status" binding:"required"`
	StaffID *uint  `json:"staff_id"`
	Detail  string `json:"detail"`
}
