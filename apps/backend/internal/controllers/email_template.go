package controllers

import (
	"errors"

	"github.com/SUT-Capstone-G09/asset-sut-system/internal/dto"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/pkg/response"
	"github.com/SUT-Capstone-G09/asset-sut-system/internal/services"
	"github.com/gin-gonic/gin"
)

type EmailTemplateController struct {
	service *services.EmailTemplateService
}

func NewEmailTemplateController(service *services.EmailTemplateService) *EmailTemplateController {
	return &EmailTemplateController{service: service}
}

func (c *EmailTemplateController) GetAll(ctx *gin.Context) {
	templates, err := c.service.GetAll()
	if err != nil {
		response.InternalError(ctx, err.Error())
		return
	}
	response.OK(ctx, templates)
}

func (c *EmailTemplateController) GetByID(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	t, err := c.service.GetByID(id)
	if err != nil {
		response.NotFound(ctx, "email template not found")
		return
	}
	response.OK(ctx, t)
}

func (c *EmailTemplateController) Create(ctx *gin.Context) {
	var req dto.CreateEmailTemplateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	t, err := c.service.Create(req)
	if err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	response.Created(ctx, t)
}

func (c *EmailTemplateController) Update(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	var req dto.UpdateEmailTemplateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, err.Error())
		return
	}
	t, err := c.service.Update(id, req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidTemplateSyntax) {
			response.BadRequest(ctx, err.Error())
			return
		}
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, t)
}

func (c *EmailTemplateController) Delete(ctx *gin.Context) {
	id, err := parseID(ctx)
	if err != nil {
		response.BadRequest(ctx, "invalid id")
		return
	}
	if err := c.service.Delete(id); err != nil {
		response.NotFound(ctx, err.Error())
		return
	}
	response.OK(ctx, gin.H{"message": "deleted"})
}
