package main

import (
	"context"
	"log"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/rizqika/portfolio/backend/internal/config"
	"github.com/rizqika/portfolio/backend/internal/db"
	"github.com/rizqika/portfolio/backend/internal/handler"
	"github.com/rizqika/portfolio/backend/internal/repository"
	"github.com/rizqika/portfolio/backend/internal/storage"
)

func main() {
	cfg := config.Load()

	gormDB, err := db.Connect(cfg)
	if err != nil {
		log.Fatalf("[db] connect failed: %v", err)
	}
	if err := db.Migrate(gormDB, cfg); err != nil {
		log.Fatalf("[db] migrate failed: %v", err)
	}
	log.Println("[db] connected & migrated")

	// storage (S3/MinIO)
	var store storage.Storage
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	minioStore, err := storage.NewMinio(cfg.S3)
	if err != nil {
		log.Printf("[storage] minio client init failed (upload disabled): %v", err)
	} else if err := minioStore.EnsureBucket(ctx); err != nil {
		log.Printf("[storage] ensure bucket failed (upload disabled): %v", err)
	} else {
		store = minioStore
		log.Printf("[storage] minio ready, bucket=%q", cfg.S3.Bucket)
	}

	repo := repository.New(gormDB)
	h := handler.New(cfg, repo, store)

	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	h.Register(e)

	addr := ":" + cfg.Port
	log.Printf("[server] listening on %s", addr)
	if err := e.Start(addr); err != nil {
		log.Fatalf("[server] shutdown: %v", err)
	}
}
