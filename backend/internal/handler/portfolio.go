package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/rizqika/portfolio/backend/internal/repository"
)

func (h *Handler) GetPortfolio(c echo.Context) error {
	bio, err := h.repo.GetBio()
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load bio")
	}
	skillGroups, err := h.repo.ListSkillGroups()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load skills")
	}
	experiences, err := h.repo.ListExperiences()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load experiences")
	}
	education, err := h.repo.ListEducation()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load education")
	}
	projects, err := h.repo.ListProjects("")
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load projects")
	}
	certifications, err := h.repo.ListCertifications()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load certifications")
	}

	return writeData(c, http.StatusOK, echo.Map{
		"bio":            bio,
		"skill_groups":   skillGroups,
		"experiences":    experiences,
		"education":      education,
		"projects":       projects,
		"certifications": certifications,
	})
}

func (h *Handler) ListProjects(c echo.Context) error {
	category := c.QueryParam("category")
	projects, err := h.repo.ListProjects(category)
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load projects")
	}
	return writeData(c, http.StatusOK, projects)
}

func (h *Handler) GetProject(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid id")
	}
	p, err := h.repo.GetProject(uint(id))
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return writeError(c, http.StatusNotFound, "NOT_FOUND", "project not found")
		}
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load project")
	}
	return writeData(c, http.StatusOK, p)
}

func (h *Handler) ListExperiences(c echo.Context) error {
	items, err := h.repo.ListExperiences()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load experiences")
	}
	return writeData(c, http.StatusOK, items)
}

func (h *Handler) ListEducation(c echo.Context) error {
	items, err := h.repo.ListEducation()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load education")
	}
	return writeData(c, http.StatusOK, items)
}

func (h *Handler) ListSkills(c echo.Context) error {
	groups, err := h.repo.ListSkillGroups()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load skills")
	}
	return writeData(c, http.StatusOK, groups)
}

func (h *Handler) GetBio(c echo.Context) error {
	bio, err := h.repo.GetBio()
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return writeError(c, http.StatusNotFound, "NOT_FOUND", "bio not found")
		}
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load bio")
	}
	return writeData(c, http.StatusOK, bio)
}

func (h *Handler) ListCertifications(c echo.Context) error {
	items, err := h.repo.ListCertifications()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load certifications")
	}
	return writeData(c, http.StatusOK, items)
}
