package handler

import (
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
)

const maxUploadSize = 5 << 20 // 5 MB

var allowedExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true,
	".webp": true, ".svg": true, ".gif": true,
}

func (h *Handler) Upload(c echo.Context) error {
	if h.store == nil {
		return writeError(c, http.StatusInternalServerError, "UPLOAD_ERROR", "storage not configured")
	}

	file, err := c.FormFile("file")
	if err != nil {
		return writeError(c, http.StatusBadRequest, "VALIDATION_ERROR", "file field is required")
	}
	if file.Size > maxUploadSize {
		return writeError(c, http.StatusRequestEntityTooLarge, "UPLOAD_ERROR", "file too large (max 5 MB)")
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExt[ext] {
		return writeError(c, http.StatusBadRequest, "UPLOAD_ERROR", "unsupported file type")
	}

	src, err := file.Open()
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to read file")
	}
	defer src.Close()

	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = detectContentType(src, ext)
	}

	folder := c.FormValue("folder")
	if folder == "" {
		folder = "misc"
	}

	ctx := c.Request().Context()
	url, _, err := h.store.Upload(ctx, src, file.Size, contentType, ext, folder)
	if err != nil {
		return writeError(c, http.StatusInternalServerError, "UPLOAD_ERROR", "failed to upload file: "+err.Error())
	}

	return writeData(c, http.StatusCreated, echo.Map{"url": url})
}

func detectContentType(file multipart.File, ext string) string {
	// read first 512 bytes for sniffing
	buf := make([]byte, 512)
	n, _ := file.Read(buf)
	file.Seek(0, 0)
	if n > 0 {
		return http.DetectContentType(buf[:n])
	}
	switch ext {
	case ".svg":
		return "image/svg+xml"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	case ".png":
		return "image/png"
	default:
		return "image/jpeg"
	}
}
