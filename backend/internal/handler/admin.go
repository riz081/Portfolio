package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/rizqika/portfolio/backend/internal/model"
	"github.com/rizqika/portfolio/backend/internal/repository"
)

type projectRequest struct {
	Title       string         `json:"title"`
	Date        string         `json:"date"`
	Description string         `json:"description"`
	ImageURL    string         `json:"image_url"`
	Category    string         `json:"category"`
	GithubURL   string         `json:"github_url"`
	WebappURL   string         `json:"webapp_url"`
	Featured    bool           `json:"featured"`
	Sort        int            `json:"sort"`
	Tags        []string       `json:"tags"`
	Members     []model.Member `json:"members"`
}

func parseID(c echo.Context) (uint, error) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

// ---------- Bio ----------

func (h *Handler) UpdateBio(c echo.Context) error {
	var in model.Bio
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	bio, err := h.repo.UpdateBio(&in)
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update bio")
	}
	return writeData(c, http.StatusOK, bio)
}

// ---------- Skill Groups ----------

func (h *Handler) CreateSkillGroup(c echo.Context) error {
	var in model.SkillGroup
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if in.Title == "" {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "title is required")
	}
	if err := h.repo.CreateSkillGroup(&in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create skill group")
	}
	return writeData(c, http.StatusCreated, in)
}

func (h *Handler) UpdateSkillGroup(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	var in model.SkillGroup
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if err := h.repo.UpdateSkillGroup(id, &in); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return writeError(c, http.StatusNotFound, "NOT_FOUND", "skill group not found")
		}
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update skill group")
	}
	return writeData(c, http.StatusOK, echo.Map{"id": id})
}

func (h *Handler) DeleteSkillGroup(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	if err := h.repo.DeleteSkillGroup(id); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete skill group")
	}
	return c.NoContent(http.StatusNoContent)
}

// ---------- Experiences ----------

func (h *Handler) CreateExperience(c echo.Context) error {
	var in model.Experience
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if in.Role == "" {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "role is required")
	}
	if err := h.repo.CreateExperience(&in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create experience")
	}
	return writeData(c, http.StatusCreated, in)
}

func (h *Handler) UpdateExperience(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	var in model.Experience
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if err := h.repo.UpdateExperience(id, &in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update experience")
	}
	return writeData(c, http.StatusOK, echo.Map{"id": id})
}

func (h *Handler) DeleteExperience(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	if err := h.repo.DeleteExperience(id); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete experience")
	}
	return c.NoContent(http.StatusNoContent)
}

// ---------- Education ----------

func (h *Handler) CreateEducation(c echo.Context) error {
	var in model.Education
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if err := h.repo.CreateEducation(&in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create education")
	}
	return writeData(c, http.StatusCreated, in)
}

func (h *Handler) UpdateEducation(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	var in model.Education
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if err := h.repo.UpdateEducation(id, &in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update education")
	}
	return writeData(c, http.StatusOK, echo.Map{"id": id})
}

func (h *Handler) DeleteEducation(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	if err := h.repo.DeleteEducation(id); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete education")
	}
	return c.NoContent(http.StatusNoContent)
}

// ---------- Projects ----------

func (h *Handler) CreateProject(c echo.Context) error {
	var req projectRequest
	if err := c.Bind(&req); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if req.Title == "" {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "title is required")
	}
	p := &model.Project{
		Title:       req.Title,
		Date:        req.Date,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
		GithubURL:   req.GithubURL,
		WebappURL:   req.WebappURL,
		Featured:    req.Featured,
		Sort:        req.Sort,
		Members:     req.Members,
	}
	if err := h.repo.CreateProject(p, req.Tags); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create project")
	}
	created, err := h.repo.GetProject(p.ID)
	if err != nil {
		return writeData(c, http.StatusCreated, p)
	}
	return writeData(c, http.StatusCreated, created)
}

func (h *Handler) UpdateProject(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	var req projectRequest
	if err := c.Bind(&req); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	p := &model.Project{
		Title:       req.Title,
		Date:        req.Date,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
		GithubURL:   req.GithubURL,
		WebappURL:   req.WebappURL,
		Featured:    req.Featured,
		Sort:        req.Sort,
		Members:     req.Members,
	}
	if err := h.repo.UpdateProject(id, p, req.Tags); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return writeError(c, http.StatusNotFound, "NOT_FOUND", "project not found")
		}
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update project")
	}
	return writeData(c, http.StatusOK, echo.Map{"id": id})
}

func (h *Handler) DeleteProject(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	if err := h.repo.DeleteProject(id); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete project")
	}
	return c.NoContent(http.StatusNoContent)
}

// ---------- Certifications ----------

func (h *Handler) CreateCertification(c echo.Context) error {
	var in model.Certification
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if in.Title == "" {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "title is required")
	}
	if err := h.repo.CreateCertification(&in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create certification")
	}
	return writeData(c, http.StatusCreated, in)
}

func (h *Handler) UpdateCertification(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	var in model.Certification
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if err := h.repo.UpdateCertification(id, &in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update certification")
	}
	return writeData(c, http.StatusOK, echo.Map{"id": id})
}

func (h *Handler) DeleteCertification(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	if err := h.repo.DeleteCertification(id); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete certification")
	}
	return c.NoContent(http.StatusNoContent)
}
