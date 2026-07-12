package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type BuildingRepository struct {
	db *gorm.DB
}

func NewBuildingRepository(db *gorm.DB) *BuildingRepository {
	return &BuildingRepository{db: db}
}

// ค้นหาสิ่งก่อสร้างหรือพื้นที่ทั้งหมดเรียงตามชื่อตัวอักษร
func (r *BuildingRepository) FindAll() ([]models.Buildings, error) {
	var buildingList []models.Buildings

	err := r.db.
			Order("name asc").
			Find(&buildingList).
			Error

	return buildingList, err
}

// ค้นหาสิ่งก่อสร้างหรือพื้นที่ทีละตัวด้วย ID
func (r *BuildingRepository) FindByID(id uint) (*models.Buildings, error) {
	var building models.Buildings

	err := r.db.
			First(&building, id).
			Error

	return &building, err
}

// บันทึกข้อมูลสิ่งก่อสร้างหรือพื้นที่ใหม่
func (r *BuildingRepository) Create(building *models.Buildings) error {
	return r.db.Create(building).Error
}

// อัปเดตข้อมูลสิ่งก่อสร้างหรือพื้นที่
func (r *BuildingRepository) Update(building *models.Buildings) error {
	return r.db.Save(building).Error
}

// ลบ (Soft delete)
func (r *BuildingRepository) Delete(id uint) error {
	return r.db.Delete(&models.Buildings{}, id).Error
}
