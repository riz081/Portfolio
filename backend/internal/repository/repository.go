package repository

import (
	"errors"

	"github.com/rizqika/portfolio/backend/internal/model"
	"gorm.io/gorm"
)

var ErrNotFound = errors.New("record not found")

type Repository struct {
	db *gorm.DB
}

func New(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// ---------- Bio ----------

func (r *Repository) GetBio() (*model.Bio, error) {
	var bio model.Bio
	if err := r.db.First(&bio, 1).Error; err != nil {
		return nil, err
	}
	return &bio, nil
}

func (r *Repository) UpdateBio(in *model.Bio) (*model.Bio, error) {
	var bio model.Bio
	if err := r.db.First(&bio, 1).Error; err != nil {
		return nil, err
	}
	in.ID = bio.ID
	if err := r.db.Model(&bio).Updates(map[string]any{
		"name":        in.Name,
		"roles":       in.Roles,
		"description": in.Description,
		"github":      in.Github,
		"resume":      in.Resume,
		"linkedin":    in.LinkedIn,
		"insta":       in.Insta,
		"facebook":    in.Facebook,
		"avatar_url":  in.AvatarURL,
	}).Error; err != nil {
		return nil, err
	}
	return r.GetBio()
}

// ---------- Skill Groups ----------

func (r *Repository) ListSkillGroups() ([]model.SkillGroup, error) {
	var groups []model.SkillGroup
	err := r.db.Preload("Skills", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort asc, id asc")
	}).Order("sort asc, id asc").Find(&groups).Error
	return groups, err
}

func (r *Repository) CreateSkillGroup(g *model.SkillGroup) error {
	return r.db.Create(g).Error
}

func (r *Repository) UpdateSkillGroup(id uint, g *model.SkillGroup) error {
	var existing model.SkillGroup
	if err := r.db.First(&existing, id).Error; err != nil {
		return err
	}
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&existing).Updates(map[string]any{
			"title": g.Title,
			"sort":  g.Sort,
		}).Error; err != nil {
			return err
		}
		// Replace nested skills.
		if err := tx.Where("group_id = ?", id).Delete(&model.Skill{}).Error; err != nil {
			return err
		}
		for i := range g.Skills {
			g.Skills[i].GroupID = id
			if err := tx.Create(&g.Skills[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *Repository) DeleteSkillGroup(id uint) error {
	return r.db.Select("Skills").Delete(&model.SkillGroup{}, id).Error
}

// ---------- Experiences ----------

func (r *Repository) ListExperiences() ([]model.Experience, error) {
	var items []model.Experience
	err := r.db.Order("sort asc, id asc").Find(&items).Error
	return items, err
}

func (r *Repository) CreateExperience(e *model.Experience) error { return r.db.Create(e).Error }

func (r *Repository) UpdateExperience(id uint, e *model.Experience) error {
	return r.db.Model(&model.Experience{}).Where("id = ?", id).Updates(map[string]any{
		"role": e.Role, "company": e.Company, "date": e.Date, "desc": e.Desc,
		"img_url": e.ImgURL, "doc_url": e.DocURL, "skills": e.Skills, "sort": e.Sort,
	}).Error
}

func (r *Repository) DeleteExperience(id uint) error {
	return r.db.Delete(&model.Experience{}, id).Error
}

// ---------- Education ----------

func (r *Repository) ListEducation() ([]model.Education, error) {
	var items []model.Education
	err := r.db.Order("sort asc, id asc").Find(&items).Error
	return items, err
}

func (r *Repository) CreateEducation(e *model.Education) error { return r.db.Create(e).Error }

func (r *Repository) UpdateEducation(id uint, e *model.Education) error {
	return r.db.Model(&model.Education{}).Where("id = ?", id).Updates(map[string]any{
		"school": e.School, "degree": e.Degree, "date": e.Date, "grade": e.Grade,
		"desc": e.Desc, "img_url": e.ImgURL, "sort": e.Sort,
	}).Error
}

func (r *Repository) DeleteEducation(id uint) error {
	return r.db.Delete(&model.Education{}, id).Error
}

// ---------- Projects ----------

func (r *Repository) ListProjects(category string) ([]model.Project, error) {
	var items []model.Project
	q := r.db.Preload("Tags").Preload("Members", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort asc, id asc")
	}).Order("sort asc, id asc")
	if category != "" {
		q = q.Where("category = ?", category)
	}
	err := q.Find(&items).Error
	return items, err
}

func (r *Repository) GetProject(id uint) (*model.Project, error) {
	var p model.Project
	err := r.db.Preload("Tags").Preload("Members").First(&p, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &p, err
}

func (r *Repository) CreateProject(p *model.Project, tagNames []string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		tags, err := resolveTags(tx, tagNames)
		if err != nil {
			return err
		}
		p.Tags = tags
		return tx.Create(p).Error
	})
}

func (r *Repository) UpdateProject(id uint, p *model.Project, tagNames []string) error {
	var existing model.Project
	if err := r.db.First(&existing, id).Error; err != nil {
		return err
	}
	return r.db.Transaction(func(tx *gorm.DB) error {
		tags, err := resolveTags(tx, tagNames)
		if err != nil {
			return err
		}
		if err := tx.Model(&existing).Updates(map[string]any{
			"title": p.Title, "date": p.Date, "description": p.Description,
			"image_url": p.ImageURL, "category": p.Category, "github_url": p.GithubURL,
			"webapp_url": p.WebappURL, "featured": p.Featured, "sort": p.Sort,
		}).Error; err != nil {
			return err
		}
		if err := tx.Model(&existing).Association("Tags").Replace(tags); err != nil {
			return err
		}
		// Replace members (has-many).
		if err := tx.Where("project_id = ?", id).Delete(&model.Member{}).Error; err != nil {
			return err
		}
		for i := range p.Members {
			p.Members[i].ProjectID = id
			if err := tx.Create(&p.Members[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *Repository) DeleteProject(id uint) error {
	return r.db.Select("Tags", "Members").Delete(&model.Project{}, id).Error
}

// resolveTags finds existing tags by name (case-insensitive) or creates them.
func resolveTags(tx *gorm.DB, names []string) ([]model.Tag, error) {
	var tags []model.Tag
	for _, name := range names {
		if name == "" {
			continue
		}
		var tag model.Tag
		if err := tx.Where("LOWER(name) = LOWER(?)", name).First(&tag).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				tag = model.Tag{Name: name}
				if err := tx.Create(&tag).Error; err != nil {
					return nil, err
				}
			} else {
				return nil, err
			}
		}
		tags = append(tags, tag)
	}
	return tags, nil
}

// ---------- Admin ----------

func (r *Repository) GetAdminByUsername(username string) (*model.Admin, error) {
	var a model.Admin
	err := r.db.Where("username = ?", username).First(&a).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &a, err
}
