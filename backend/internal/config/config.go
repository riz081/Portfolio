package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port     string
	Database DatabaseConfig
	JWT      JWTConfig
	Admin    AdminConfig
	S3       S3Config
	CORS     []string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	DSN      string
}

type JWTConfig struct {
	Secret string
	TTL    string
}

type AdminConfig struct {
	Username string
	Password string
}

type S3Config struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	UseSSL    bool
	PublicURL string
}

func Load() *Config {
	return &Config{
		Port: getEnv("APP_PORT", "9998"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "portfolio"),
			Password: getEnv("DB_PASSWORD", "portfolio"),
			Name:     getEnv("DB_NAME", "portfolio"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
			DSN:      os.Getenv("DATABASE_URL"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "change-me-in-production"),
			TTL:    getEnv("JWT_TTL", "24h"),
		},
		Admin: AdminConfig{
			Username: getEnv("ADMIN_USER", "admin"),
			Password: getEnv("ADMIN_PASS", "admin123"),
		},
		S3: S3Config{
			Endpoint:  getEnv("S3_ENDPOINT", "localhost:9000"),
			AccessKey: getEnv("S3_ACCESS_KEY", "minioadmin"),
			SecretKey: getEnv("S3_SECRET_KEY", "minioadmin"),
			Bucket:    getEnv("S3_BUCKET", "portfolio"),
			UseSSL:    getEnv("S3_USE_SSL", "false") == "true",
			PublicURL: getEnv("S3_PUBLIC_URL", "http://localhost:9000/portfolio"),
		},
		CORS: []string{getEnv("CORS_ORIGINS", "http://localhost:9999,http://localhost:5173")},
	}
}

// DBDSN returns the effective DSN, preferring explicit DATABASE_URL if set.
func (c *Config) DBDSN() string {
	if c.Database.DSN != "" {
		return c.Database.DSN
	}
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
	)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
