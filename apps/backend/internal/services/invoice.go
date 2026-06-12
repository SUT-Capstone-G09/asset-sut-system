package services

import (
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/models"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/repositories"
)

type InvoiceService struct {
	invoiceRepo *repositories.InvoiceRepository
}

func NewInvoiceService(invoiceRepo *repositories.InvoiceRepository) *InvoiceService {
	return &InvoiceService{invoiceRepo: invoiceRepo}
}

func (s *InvoiceService) GetByBookingID(bookingID uint) (*dto.InvoiceResponse, error) {
	invoice, err := s.invoiceRepo.FindByBookingID(bookingID)
	if err != nil {
		return nil, err
	}
	res := invoiceToDTO(*invoice)
	return &res, nil
}

func (s *InvoiceService) GetByID(id uint) (*dto.InvoiceResponse, error) {
	invoice, err := s.invoiceRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	res := invoiceToDTO(*invoice)
	return &res, nil
}

func invoiceToDTO(inv models.Invoices) dto.InvoiceResponse {
	res := dto.InvoiceResponse{
		ID:          inv.ID,
		BookingID:   inv.BookingID,
		TotalAmount: inv.TotalAmount,
		StatusID:    inv.StatusID,
		CreatedAt:   inv.CreatedAt,
	}
	if inv.Status != nil {
		res.Status = inv.Status.Status
	}
	return res
}
