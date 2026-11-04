package main

import (
	"encoding/json"
	"log"
	"os"

	"github.com/rizqika/portfolio/backend/internal/config"
	"github.com/rizqika/portfolio/backend/internal/db"
	"github.com/rizqika/portfolio/backend/internal/model"
	"github.com/rizqika/portfolio/backend/internal/repository"
	"gorm.io/gorm"
)

type seedData struct {
	Bio         seedBio          `json:"Bio"`
	Skills      []seedSkillGroup `json:"skills"`
	Experiences []seedExperience `json:"experiences"`
	Education   []seedEducation  `json:"education"`
	Projects    []seedProject    `json:"projects"`
}

type seedBio struct {
	Name        string   `json:"name"`
	Roles       []string `json:"roles"`
	Description string   `json:"description"`
	Github      string   `json:"github"`
	Resume      string   `json:"resume"`
	Linkedin    string   `json:"linkedin"`
	Insta       string   `json:"insta"`
	Facebook    string   `json:"facebook"`
}

type seedSkillGroup struct {
	Title  string      `json:"title"`
	Skills []seedSkill `json:"skills"`
}

type seedSkill struct {
	Name  string `json:"name"`
	Image string `json:"image"`
}

type seedExperience struct {
	Role    string   `json:"role"`
	Company string   `json:"company"`
	Date    string   `json:"date"`
	Desc    string   `json:"desc"`
	Img     string   `json:"img"`
	Doc     string   `json:"doc"`
	Skills  []string `json:"skills"`
}

type seedEducation struct {
	School string `json:"school"`
	Degree string `json:"degree"`
	Date   string `json:"date"`
	Grade  string `json:"grade"`
	Desc   string `json:"desc"`
	Img    string `json:"img"`
}

type seedProject struct {
	Title       string       `json:"title"`
	Date        string       `json:"date"`
	Description string       `json:"description"`
	Image       string       `json:"image"`
	Tags        []string     `json:"tags"`
	Category    string       `json:"category"`
	Github      string       `json:"github"`
	Webapp      string       `json:"webapp"`
	Member      []seedMember `json:"member"`
}

type seedMember struct {
	Name     string `json:"name"`
	Img      string `json:"img"`
	Github   string `json:"github"`
	Linkedin string `json:"linkedin"`
}

func cleanup(gormDB *gorm.DB) error {
	return gormDB.Exec(
		"TRUNCATE TABLE project_tags, members, projects, tags, experiences, educations, skills, skill_groups RESTART IDENTITY CASCADE",
	).Error
}

func main() {
	dataPath := os.Getenv("SEED_FILE")
	if dataPath == "" {
		dataPath = "seed/data.json"
	}

	raw, err := os.ReadFile(dataPath)
	if err != nil {
		log.Fatalf("[seed] read %s: %v", dataPath, err)
	}
	var data seedData
	if err := json.Unmarshal(raw, &data); err != nil {
		log.Fatalf("[seed] parse: %v", err)
	}

	cfg := config.Load()
	gormDB, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("[seed] db connect: %v", err)
	}
	if err := db.Migrate(gormDB, cfg); err != nil {
		log.Fatalf("[seed] migrate: %v", err)
	}
	repo := repository.New(gormDB)

	if err := cleanup(gormDB); err != nil {
		log.Fatalf("[seed] cleanup: %v", err)
	}

	// Bio
	if _, err := repo.UpdateBio(&model.Bio{
		Name:        data.Bio.Name,
		Roles:       data.Bio.Roles,
		Description: data.Bio.Description,
		Github:      data.Bio.Github,
		Resume:      data.Bio.Resume,
		LinkedIn:    data.Bio.Linkedin,
		Insta:       data.Bio.Insta,
		Facebook:    data.Bio.Facebook,
	}); err != nil {
		return
	}

	// Skills
	for i, g := range data.Skills {
		group := &model.SkillGroup{Title: g.Title, Sort: i + 1}
		for j, s := range g.Skills {
			group.Skills = append(group.Skills, model.Skill{Name: s.Name, ImageURL: s.Image, Sort: j + 1})
		}
		if err := repo.CreateSkillGroup(group); err != nil {
			log.Printf("[seed] skill group %q: %v", g.Title, err)
		}
	}

	// Experiences
	for i, e := range data.Experiences {
		exp := &model.Experience{
			Role:    e.Role,
			Company: e.Company,
			Date:    e.Date,
			Desc:    e.Desc,
			ImgURL:  e.Img,
			DocURL:  e.Doc,
			Skills:  e.Skills,
			Sort:    i + 1,
		}
		if err := repo.CreateExperience(exp); err != nil {
			log.Printf("[seed] experience %q: %v", e.Company, err)
		}
	}

	// Education
	for i, e := range data.Education {
		edu := &model.Education{
			School: e.School,
			Degree: e.Degree,
			Date:   e.Date,
			Grade:  e.Grade,
			Desc:   e.Desc,
			ImgURL: e.Img,
			Sort:   i + 1,
		}
		if err := repo.CreateEducation(edu); err != nil {
			log.Printf("[seed] education %q: %v", e.School, err)
		}
	}

	// Projects
	for i, p := range data.Projects {
		proj := &model.Project{
			Title:       p.Title,
			Date:        p.Date,
			Description: p.Description,
			ImageURL:    p.Image,
			Category:    p.Category,
			GithubURL:   p.Github,
			WebappURL:   p.Webapp,
			Sort:        i + 1,
		}
		for j, m := range p.Member {
			proj.Members = append(proj.Members, model.Member{
				Name:        m.Name,
				ImgURL:      m.Img,
				GithubURL:   m.Github,
				LinkedinURL: m.Linkedin,
				Sort:        j + 1,
			})
		}
		if err := repo.CreateProject(proj, p.Tags); err != nil {
			log.Printf("[seed] project %q: %v", p.Title, err)
		}
	}

	log.Printf("[seed] done: %d skill groups, %d experiences, %d education, %d projects",
		len(data.Skills), len(data.Experiences), len(data.Education), len(data.Projects))
}
