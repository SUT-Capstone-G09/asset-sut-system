package config

import (
	"os"
	"fmt"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
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

/*func loadEnvFile() error {
	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %w", err)
	}

	possiblePaths := []string{
		filepath.Join(cwd, ".env"),
		filepath.Join(cwd, "..", ".env"),
		filepath.Join(cwd, "..", "..", ".env"),
		filepath.Join(cwd, "..", "..", "..", ".env"),
		filepath.Join(cwd, "..", "..", "..", "..", ".env"),
	}

	var loaded bool
	for _, path := range possiblePaths {
		if err := godotenv.Load(path); err == nil {
			loaded = true
			break
		}
	}

	if !loaded {
		return fmt.Errorf("no .env file found in expected locations")
	}

	return nil
}*/

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