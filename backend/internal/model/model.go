package model

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Bio is a singleton row (id = 1).
type Bio struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `json:"name"`
	Roles       pq.StringArray `gorm:"type:text[]" json:"roles"`
	Description string         `gorm:"type:text" json:"description"`
	Github      string         `json:"github"`
	Resume      string         `json:"resume"`
	LinkedIn    string         `gorm:"column:linkedin" json:"linkedin"`
	Insta       string         `json:"insta"`
	Facebook    string         `json:"facebook"`
	AvatarURL   string         `json:"avatar_url"`
	CreatedAt   time.Time      `json:"-"`
	UpdatedAt   time.Time      `json:"-"`
}

type SkillGroup struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `json:"title"`
	Sort      int       `gorm:"default:0" json:"sort"`
	Skills    []Skill   `gorm:"foreignKey:GroupID;constraint:OnDelete:CASCADE" json:"skills"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

type Skill struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	GroupID   uint      `json:"group_id"`
	Name      string    `json:"name"`
	ImageURL  string    `json:"image_url"`
	Sort      int       `gorm:"default:0" json:"sort"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

type Experience struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Role      string         `json:"role"`
	Company   string         `json:"company"`
	Date      string         `json:"date"`
	Desc      string         `gorm:"type:text" json:"desc"`
	ImgURL    string         `json:"img_url"`
	DocURL    string         `json:"doc_url"`
	Skills    pq.StringArray `gorm:"type:text[]" json:"skills"`
	Sort      int            `gorm:"default:0" json:"sort"`
	CreatedAt time.Time      `json:"-"`
	UpdatedAt time.Time      `json:"-"`
}

type Education struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	School    string    `json:"school"`
	Degree    string    `json:"degree"`
	Date      string    `json:"date"`
	Grade     string    `json:"grade"`
	Desc      string    `gorm:"type:text" json:"desc"`
	ImgURL    string    `json:"img_url"`
	Sort      int       `gorm:"default:0" json:"sort"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

type Project struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Date        string    `json:"date"`
	Description string    `gorm:"type:text" json:"description"`
	ImageURL    string    `json:"image_url"`
	Category    string    `json:"category"`
	GithubURL   string    `json:"github_url"`
	WebappURL   string    `json:"webapp_url"`
	Featured    bool      `gorm:"default:false" json:"featured"`
	Sort        int       `gorm:"default:0" json:"sort"`
	Tags        []Tag     `gorm:"many2many:project_tags;constraint:OnDelete:CASCADE" json:"tags"`
	Members     []Member  `gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE" json:"members"`
	CreatedAt   time.Time `json:"-"`
	UpdatedAt   time.Time `json:"-"`
}

type Tag struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex" json:"name"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

type Member struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ProjectID   uint      `json:"project_id"`
	Name        string    `json:"name"`
	ImgURL      string    `json:"img_url"`
	GithubURL   string    `json:"github_url"`
	LinkedinURL string    `json:"linkedin_url"`
	Sort        int       `gorm:"default:0" json:"sort"`
	CreatedAt   time.Time `json:"-"`
	UpdatedAt   time.Time `json:"-"`
}

type Certification struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Title         string    `json:"title"`
	Issuer        string    `json:"issuer"`
	Date          string    `json:"date"`
	Credential    string    `json:"credential"`
	CredentialURL string    `json:"credential_url"`
	Sort          int       `gorm:"default:0" json:"sort"`
	CreatedAt     time.Time `json:"-"`
	UpdatedAt     time.Time `json:"-"`
}

type Admin struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"uniqueIndex" json:"username"`
	PasswordHash string         `json:"-"`
	CreatedAt    time.Time      `json:"-"`
	UpdatedAt    time.Time      `json:"-"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// List of all entities for AutoMigrate.
func MigrateModels() []any {
	return []any{
		&Bio{},
		&SkillGroup{},
		&Skill{},
		&Experience{},
		&Education{},
		&Project{},
		&Certification{},
		&Tag{},
		&Member{},
		&Admin{},
	}
}
