package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
	Server  ServerConfig
	CORS	CORSConfig
	JWT     JWTConfig
	Cookie  CookieConfig
}

type DatabaseConfig struct {
	Host string
	Port string
	User string
	Password string
	DBName string
	SSLMode string
	LogMode string
}

type ServerConfig struct {
	Port string
}

type CORSConfig struct {
	AllowOrigins     []string
	AllowMethods     []string
	AllowHeaders     []string
	AllowCredentials bool
	MaxAge           time.Duration
}

type JWTConfig struct {
	Secret string
}

type CookieConfig struct {
	Secure bool
}

func LoadConfig() (*Config, error) {
	if err := loadEnvFile(); err != nil {
		return nil, err
	}

	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("POSTGRES_HOST", "localhost"),
			Port:     getEnv("POSTGRES_PORT", "5432"),
			User:     mustGetEnv("POSTGRES_USER"),
			Password: mustGetEnv("POSTGRES_PASSWORD"),
			DBName:   mustGetEnv("POSTGRES_DB"),
			SSLMode:  getEnv("POSTGRES_SSLMODE", "disable"),
			LogMode:  getEnv("POSTGRES_LOGMODE", "false"),
		},
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
		},
		CORS: CORSConfig{
			AllowOrigins:     parseStringSlice(getEnv("CORS_ALLOW_ORIGINS", "*")),
			AllowMethods:     parseStringSlice(getEnv("CORS_ALLOW_METHODS", "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS")),
			AllowHeaders:     parseStringSlice(getEnv("CORS_ALLOW_HEADERS", "Origin,Content-Length,Content-Type,Authorization")),
			AllowCredentials: getEnv("CORS_ALLOW_CREDENTIALS", "true") == "true",
			MaxAge:           parseDuration(getEnv("CORS_MAX_AGE", "12h")),
		},
		JWT: JWTConfig{
			Secret: mustGetEnv("JWT_SECRET"),
		},
		Cookie: CookieConfig{
			Secure: getEnv("COOKIE_SECURE", "false") == "true",
		},
	}, nil
}

func loadEnvFile() error {
	envPath, err := findEnvFile()
	if err != nil {
		return fmt.Errorf("failed to find .env file: %w", err)
	}

	if err := godotenv.Load(envPath); err != nil {
		return fmt.Errorf("failed to load .env file: %w", err)
	}
	return nil
}


func findEnvFile() (string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to get working directory: %w", err)
	}

	currentDir := cwd

	// Search up to 10 levels up for .env file
	for i := 0; i < 10; i++ {
        // สร้าง DirFS สำหรับ directory ปัจจุบัน
        fsys := os.DirFS(currentDir)
        
        // ตรวจสอบว่า .env มีอยู่หรือไม่
        if _, err := fsys.Open(".env"); err == nil {
            return filepath.Join(currentDir, ".env"), nil
        }
        
        // ขึ้นไป 1 level
        parent := filepath.Dir(currentDir)
        if parent == currentDir {
            // ถึง root directory แล้ว
            break
        }
        currentDir = parent
    }

    return "", fmt.Errorf("no .env file found")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func mustGetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic("Environment variable " + key + " is required but not set")
	}
	return value
}

func parseStringSlice(s string) []string {
	if s == "*" {
		return []string{"*"}
	}
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 12 * time.Hour
	}
	return d
}