package models

type Roles struct {
	Base
	Name string `gorm:"unique;not null" json:"name"`
	Users []Users `gorm:"many2many:user_roles" json:"users"` // ความสัมพันธ์เเบบ N[User] --- N[Role]
	Permissions []Permissions `gorm:"many2many:role_permissions" json:"permissions"` // ความสัมพันธ์เเบบ N[Role] --- N[Permission]
}