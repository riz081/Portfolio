package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rizqika/portfolio/backend/internal/config"
	appmw "github.com/rizqika/portfolio/backend/internal/middleware"
	"github.com/rizqika/portfolio/backend/internal/repository"
	"github.com/rizqika/portfolio/backend/internal/storage"
)

type Handler struct {
	cfg   *config.Config
	repo  *repository.Repository
	store storage.Storage
}

func New(cfg *config.Config, repo *repository.Repository, store storage.Storage) *Handler {
	return &Handler{cfg: cfg, repo: repo, store: store}
}

type errorBody struct {
	Code    string   `json:"code"`
	Message string   `json:"message"`
	Details []string `json:"details,omitempty"`
}

type errorResponse struct {
	Error errorBody `json:"error"`
}

func writeError(c echo.Context, status int, code, message string, details ...string) error {
	return c.JSON(status, errorResponse{Error: errorBody{
		Code:    code,
		Message: message,
		Details: details,
	}})
}

func writeData(c echo.Context, status int, data any) error {
	return c.JSON(status, map[string]any{"data": data})
}

func (h *Handler) Register(e *echo.Echo) {
	// custom error handler for consistent JSON errors
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}
		var (
			status = http.StatusInternalServerError
			code   = "INTERNAL_ERROR"
			msg    = "internal server error"
		)
		if he, ok := err.(*echo.HTTPError); ok {
			status = he.Code
			if m, ok := he.Message.(string); ok {
				msg = m
			}
			switch status {
			case http.StatusUnauthorized:
				code = "UNAUTHORIZED"
			case http.StatusNotFound:
				code = "NOT_FOUND"
			case http.StatusBadRequest:
				code = "VALIDATION_ERROR"
			case http.StatusRequestEntityTooLarge:
				code = "UPLOAD_ERROR"
			}
		}
		_ = c.JSON(status, errorResponse{Error: errorBody{Code: code, Message: msg}})
	}

	// global middleware
	e.Use(middleware.Recover())
	e.Use(middleware.Logger())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     h.cfg.CORS,
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	api := e.Group("/api/v1")

	// public
	api.GET("/portfolio", h.GetPortfolio)
	api.GET("/projects", h.ListProjects)
	api.GET("/projects/:id", h.GetProject)
	api.GET("/experiences", h.ListExperiences)
	api.GET("/education", h.ListEducation)
	api.GET("/skills", h.ListSkills)
	api.GET("/bio", h.GetBio)

	// admin auth (public)
	admin := api.Group("/admin")
	admin.POST("/auth/login", h.Login)
	admin.POST("/auth/logout", h.Logout)

	// admin protected
	admin.Use(appmw.JWTAuth(h.cfg.JWT.Secret))
	admin.GET("/me", h.Me)

	admin.PUT("/bio", h.UpdateBio)

	admin.GET("/projects", h.ListProjects)
	admin.POST("/projects", h.CreateProject)
	admin.PUT("/projects/:id", h.UpdateProject)
	admin.DELETE("/projects/:id", h.DeleteProject)

	admin.POST("/experiences", h.CreateExperience)
	admin.PUT("/experiences/:id", h.UpdateExperience)
	admin.DELETE("/experiences/:id", h.DeleteExperience)

	admin.POST("/education", h.CreateEducation)
	admin.PUT("/education/:id", h.UpdateEducation)
	admin.DELETE("/education/:id", h.DeleteEducation)

	admin.POST("/skills", h.CreateSkillGroup)
	admin.PUT("/skills/:id", h.UpdateSkillGroup)
	admin.DELETE("/skills/:id", h.DeleteSkillGroup)

	admin.POST("/upload", h.Upload)
}
