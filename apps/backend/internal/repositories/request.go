package repositories

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"gorm.io/gorm"
)

type RequestRepository struct {
	db *gorm.DB
}

func NewRequestRepository(db *gorm.DB) *RequestRepository {
	return &RequestRepository{db: db}
}

func (r *RequestRepository) Create(request *models.Requests) error {
	return r.db.Create(request).Error
}

func (r *RequestRepository) FindStatusByName(name string) (*models.RequestStatus, error) {
	var status models.RequestStatus
	err := r.db.Where("LOWER(status) = LOWER(?)", name).First(&status).Error
	return &status, err
}

func (r *RequestRepository) FindByID(id uint) (*models.Requests, error) {
	var req models.Requests
	err := r.db.
		Preload("User").
		Preload("RequestType").
		Preload("Status").
		Preload("Staff").
		First(&req, id).Error
	return &req, err
}

func (r *RequestRepository) FindAllRequestTypes() ([]models.RequestTypes, error) {
	var reqTypes []models.RequestTypes
	err := r.db.Find(&reqTypes).Error
	return reqTypes, err
}

func (r *RequestRepository) FindAllByUserID(userID uint) ([]models.Requests, error) {
	var reqs []models.Requests
	err := r.db.
		Preload("User").
		Preload("RequestType").
		Preload("Status").
		Preload("Staff").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&reqs).Error
	return reqs, err
}

func (r *RequestRepository) FindByRefcode(refcode string) (*models.Requests, error) {
	var req models.Requests
	err := r.db.
		Preload("User.Profiles").
		Preload("RequestType").
		Preload("Status").
		Preload("Staff.Profiles").
		Where("refcode = ?", refcode).
		First(&req).Error
	return &req, err
}

func (r *RequestRepository) FindHistoriesByRequestID(requestID uint) ([]models.ActionHistories, error) {
	var histories []models.ActionHistories
	err := r.db.
		Preload("Status").
		Preload("AssignedStaff.Profiles").
		Preload("Admin.Profiles").
		Where("request_id = ?", requestID).
		Order("created_at desc").
		Find(&histories).Error
	return histories, err
}

func (r *RequestRepository) FindChatMessagesByRequestID(requestID uint) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	err := r.db.
		Preload("User.Profiles").
		Where("request_id = ?", requestID).
		Order("created_at asc").
		Find(&messages).Error
	return messages, err
}

func (r *RequestRepository) UpdateRequestStatusAndStaff(requestID uint, statusID uint, staffID *uint, adminID uint, detail string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"status_id": statusID,
		}
		if staffID != nil {
			updates["staff_id"] = *staffID
		}
		
		if err := tx.Model(&models.Requests{}).Where("id = ?", requestID).Updates(updates).Error; err != nil {
			return err
		}

		history := models.ActionHistories{
			RequestID:       requestID,
			StatusID:        statusID,
			AssignedStaffID: staffID,
			AdminID:         adminID,
			Detail:          detail,
		}
		
		if err := tx.Create(&history).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *RequestRepository) FindAllRequests() ([]models.Requests, error) {
	var reqs []models.Requests
	err := r.db.
		Preload("User").
		Preload("RequestType").
		Preload("Status").
		Preload("Staff").
		Order("created_at desc").
		Find(&reqs).Error
	return reqs, err
}
