package seeder

import (
	"log"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/config"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

func seedRequests(db *gorm.DB, cfg *config.Config) error {
	// Find user "user@example.com"
	var user models.Users
	if err := db.Where("email = ?", "user@example.com").First(&user).Error; err != nil {
		log.Println("User user@example.com not found, skipping requests seeding.")
		return nil
	}

	// Find status IDs (canonical lowercase values)
	var pendingStatus, inProgressStatus, completedStatus, cancelledStatus models.RequestStatus
	if err := db.Where("LOWER(status) = ?", "pending").First(&pendingStatus).Error; err != nil {
		return err
	}
	if err := db.Where("LOWER(status) = ?", "in_progress").First(&inProgressStatus).Error; err != nil {
		return err
	}
	if err := db.Where("LOWER(status) = ?", "completed").First(&completedStatus).Error; err != nil {
		return err
	}
	if err := db.Where("LOWER(status) = ?", "cancelled").First(&cancelledStatus).Error; err != nil {
		return err
	}

	// Find request types
	var repairType, areaProblemType models.RequestTypes
	if err := db.Where("name = ?", "แจ้งซ่อมครุภัณฑ์").First(&repairType).Error; err != nil {
		return err
	}
	if err := db.Where("name = ?", "แจ้งปัญหาการใช้งานพื้นที่").First(&areaProblemType).Error; err != nil {
		return err
	}

	requests := []models.Requests{
		{
			UserID:        user.ID,
			Refcode:       "REQ-2026-000123",
			RequestTypeID: repairType.ID,
			Title:         "แจ้งซ่อมเครื่องปรับอากาศมีเสียงดังผิดปกติ",
			Description:   "เครื่องปรับอากาศในห้องทำงาน B1213 มีเสียงดังผิดปกติและไม่ทำความเย็น แจ้งขอตรวจสอบและดำเนินการแก้ไขเร่งด่วน เนื่องจากส่งผลกระทบต่อการทำงาน",
			Location:      "อาคารวิชาการ 1 ห้อง B1213",
			StatusID:      inProgressStatus.ID,
			ContactInfo:   "ผู้ใช้งาน ทั่วไป (081-234-5678)",
			EvidenceUrls:  pq.StringArray{},
		},
		{
			UserID:        user.ID,
			Refcode:       "REQ-2026-000098",
			RequestTypeID: areaProblemType.ID,
			Title:         "กลอนประตูกระจกชำรุด",
			Description:   "ประตูกระจกห้องเรียน 2402 ชำรุด กลอนประตูล็อกไม่ได้ เกรงว่าจะไม่ปลอดภัยช่วงค่ำครับ",
			Location:      "อาคารเรียนรวม 2 ชั้น 4 ห้อง 2402",
			StatusID:      completedStatus.ID,
			ContactInfo:   "ผู้ใช้งาน ทั่วไป (081-234-5678)",
			EvidenceUrls:  pq.StringArray{},
		},
		{
			UserID:        user.ID,
			Refcode:       "REQ-2026-000077",
			RequestTypeID: repairType.ID,
			Title:         "หลอดไฟเสียบริเวณทางเดินชั้น 1",
			Description:   "หลอดไฟบริเวณทางเดินชั้น 1 ฝั่งทิศเหนือดับ 3 ดวง ทำให้มืดมากตอนค่ำ รบกวนช่วยเปลี่ยนด้วยครับ",
			Location:      "อาคารเรียนรวม 1 ชั้น 1 ทางเดินฝั่งเหนือ",
			StatusID:      pendingStatus.ID,
			ContactInfo:   "ผู้ใช้งาน ทั่วไป (081-234-5678)",
			EvidenceUrls:  pq.StringArray{},
		},
		{
			UserID:        user.ID,
			Refcode:       "REQ-2026-000042",
			RequestTypeID: areaProblemType.ID,
			Title:         "ก๊อกน้ำห้องน้ำชายชั้น 3 รั่ว",
			Description:   "ก๊อกน้ำในห้องน้ำชายชั้น 3 ปิดไม่สนิท น้ำหยดตลอดเวลา สิ้นเปลืองน้ำมาก",
			Location:      "อาคารวิชาการ 2 ชั้น 3 ห้องน้ำชาย",
			StatusID:      cancelledStatus.ID,
			ContactInfo:   "ผู้ใช้งาน ทั่วไป (081-234-5678)",
			EvidenceUrls:  pq.StringArray{},
		},
	}

	for _, req := range requests {
		// FirstOrCreate based on Refcode
		var existing models.Requests
		err := db.Where("refcode = ?", req.Refcode).First(&existing).Error
		if err == gorm.ErrRecordNotFound {
			if err := db.Create(&req).Error; err != nil {
				return err
			}
		} else if err == nil {
			// Update properties
			if err := db.Model(&existing).Updates(map[string]interface{}{
				"request_type_id": req.RequestTypeID,
				"title":           req.Title,
				"description":     req.Description,
				"location":        req.Location,
				"status_id":       req.StatusID,
				"contact_info":    req.ContactInfo,
			}).Error; err != nil {
				return err
			}
		} else {
			return err
		}
	}

	log.Println("Requests seeded successfully.")
	return nil
}

