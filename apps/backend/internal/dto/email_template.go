package dto

type CreateEmailTemplateRequest struct {
	Key          string `json:"key" binding:"required"`
	Name         string `json:"name" binding:"required"`
	Subject      string `json:"subject" binding:"required"`
	ProjectData  string `json:"project_data"`
	CompiledHTML string `json:"compiled_html" binding:"required"`
	IsActive     *bool  `json:"is_active"`
}

type UpdateEmailTemplateRequest struct {
	Name         *string `json:"name"`
	Subject      *string `json:"subject"`
	ProjectData  *string `json:"project_data"`
	CompiledHTML *string `json:"compiled_html"`
	IsActive     *bool   `json:"is_active"`
}

type EmailTemplateResponse struct {
	ID           uint   `json:"id"`
	Key          string `json:"key"`
	Name         string `json:"name"`
	Subject      string `json:"subject"`
	ProjectData  string `json:"project_data"`
	CompiledHTML string `json:"compiled_html"`
	IsActive     bool   `json:"is_active"`
}
