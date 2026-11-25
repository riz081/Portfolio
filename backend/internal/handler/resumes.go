package handler

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/rizqika/portfolio/backend/internal/model"
	"github.com/rizqika/portfolio/backend/internal/repository"
)

func validateResume(in *model.ResumeDocument) string {
	if in.Title == "" {
		return "title is required"
	}
	switch in.SourceType {
	case "upload":
		if in.FileURL == "" {
			return "file_url is required for uploaded documents"
		}
	case "external":
		if in.ExternalURL == "" {
			return "external_url is required for external documents"
		}
	default:
		return "source_type must be upload or external"
	}
	return ""
}

// ---------- Public ----------

func (h *Handler) ListResumes(c echo.Context) error {
	docs, err := h.repo.ListResumeDocuments(true)
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list resumes")
	}
	return writeData(c, http.StatusOK, docs)
}

func (h *Handler) GetResume(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid resume id")
	}
	doc, err := h.repo.GetResumeDocument(id)
	if err != nil || !doc.IsActive {
		return writeError(c, http.StatusNotFound, "NOT_FOUND", "resume not found")
	}
	return writeData(c, http.StatusOK, doc)
}

// ---------- Admin ----------

func (h *Handler) ListResumesAdmin(c echo.Context) error {
	docs, err := h.repo.ListResumeDocuments(false)
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to list resumes")
	}
	return writeData(c, http.StatusOK, docs)
}

func (h *Handler) CreateResume(c echo.Context) error {
	var in model.ResumeDocument
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if msg := validateResume(&in); msg != "" {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", msg)
	}
	if err := h.repo.CreateResumeDocument(&in); err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create resume")
	}
	return writeData(c, http.StatusCreated, in)
}

func (h *Handler) UpdateResume(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid resume id")
	}
	var in model.ResumeDocument
	if err := c.Bind(&in); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if msg := validateResume(&in); msg != "" {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", msg)
	}
	if err := h.repo.UpdateResumeDocument(id, &in); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return writeError(c, http.StatusNotFound, "NOT_FOUND", "resume not found")
		}
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to update resume")
	}
	doc, err := h.repo.GetResumeDocument(id)
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to load resume")
	}
	return writeData(c, http.StatusOK, doc)
}

func (h *Handler) DeleteResume(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid resume id")
	}
	if err := h.repo.DeleteResumeDocument(id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return writeError(c, http.StatusNotFound, "NOT_FOUND", "resume not found")
		}
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to delete resume")
	}
	return c.NoContent(http.StatusNoContent)
}
