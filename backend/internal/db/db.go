package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/rizqika/portfolio/backend/internal/config"
	"github.com/rizqika/portfolio/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	dsn := cfg.DBDSN()
	gormDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logger.Config{
				SlowThreshold:             time.Second,
				LogLevel:                  logger.Warn,
				IgnoreRecordNotFoundError: true,
			},
		),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return gormDB, nil
}

// Migrate runs AutoMigrate for all models and seeds the admin account.
func Migrate(gormDB *gorm.DB, cfg *config.Config) error {
	if err := gormDB.AutoMigrate(model.MigrateModels()...); err != nil {
		return fmt.Errorf("automigrate: %w", err)
	}

	// Seed default Bio singleton if missing.
	var count int64
	gormDB.Model(&model.Bio{}).Count(&count)
	if count == 0 {
		gormDB.Create(&model.Bio{
			ID:    1,
			Name:  "Rizqika Ibnu Khattab",
			Roles: []string{"Full Stack Developer", "Mobile Developer"},
		})
	}

	// Seed admin account.
	var adminCount int64
	gormDB.Model(&model.Admin{}).Count(&adminCount)
	if adminCount == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte(cfg.Admin.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		if err := gormDB.Create(&model.Admin{
			Username:     cfg.Admin.Username,
			PasswordHash: string(hash),
		}).Error; err != nil {
			return err
		}
		log.Printf("[seed] admin %q created", cfg.Admin.Username)
	}

	return nil
}
