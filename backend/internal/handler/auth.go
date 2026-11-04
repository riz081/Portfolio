package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	appmw "github.com/rizqika/portfolio/backend/internal/middleware"
	"github.com/rizqika/portfolio/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *Handler) Login(c echo.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
	}
	if req.Username == "" || req.Password == "" {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "username and password are required")
	}

	admin, err := h.repo.GetAdminByUsername(req.Username)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return writeError(c, http.StatusUnauthorized, "UNAUTHORIZED", "invalid credentials")
		}
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to authenticate")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		return writeError(c, http.StatusUnauthorized, "UNAUTHORIZED", "invalid credentials")
	}

	ttl, err := time.ParseDuration(h.cfg.JWT.TTL)
	if err != nil {
		ttl = 24 * time.Hour
	}
	expiresAt := time.Now().Add(ttl)
	claims := &appmw.Claims{
		Username: admin.Username,
		AdminID:  admin.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   admin.Username,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(h.cfg.JWT.Secret))
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to sign token")
	}

	// set httpOnly cookie
	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    signed,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Expires:  expiresAt,
	})

	return writeData(c, http.StatusOK, echo.Map{
		"token":     signed,
		"expiresAt": expiresAt.Format(time.RFC3339),
	})
}

func (h *Handler) Logout(c echo.Context) error {
	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) Me(c echo.Context) error {
	username, _ := c.Get("username").(string)
	return writeData(c, http.StatusOK, echo.Map{"username": username})
}
