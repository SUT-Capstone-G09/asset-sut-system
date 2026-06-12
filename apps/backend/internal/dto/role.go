package dto

type CreateRoleRequest struct {
	Name          string `json:"name" binding:"required"`
	PermissionIDs []uint `json:"permission_ids"`
}

type UpdateRoleRequest struct {
	Name          string `json:"name"`
	PermissionIDs []uint `json:"permission_ids"`
}

type RoleResponse struct {
	ID          uint                 `json:"id"`
	Name        string               `json:"name"`
	Permissions []PermissionResponse `json:"permissions"`
}

type PermissionResponse struct {
	ID     uint   `json:"id"`
	Module string `json:"module"`
	Action string `json:"action"`
}
