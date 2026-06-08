package config

import (
	"fmt"
	"os"
	"path/filepath"
	"slices"
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
	Minio   MinioConfig
	GDrive   GDriveConfig
	Payment PaymentConfig
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

type MinioConfig struct {
	Endpoint      string
	AccessKey     string
	SecretKey     string
	Bucket        string
	UseSSL        bool
	URLExpiry     time.Duration
}

type GDriveConfig struct {
	ClientEmail  string
	PrivateKey   string
	// FolderRoutes: folder name → Drive folder ID
	// driven by GDRIVE_FOLDER_ROUTES=booking-docs:1ABC,payment-slip:4DEF
	FolderRoutes map[string]string
}

// PaymentConfig holds the payee (university) details used to build EMVCo QR
// payloads. These are fixed per deployment, so they live in .env rather than
// being supplied per request.
type PaymentConfig struct {
	PromptPayID  string // phone (10 digits) or national/tax id (13 digits)
	BillerID     string // 15 digits, for the "biller" bill-payment mode
	BillerRef1   string // optional default reference for biller mode
	BillerRef2   string // optional secondary reference for biller mode
	MerchantName string
	MerchantCity string
}

func LoadConfig() (*Config, error) {
	if err := loadEnvFile(); err != nil {
		return nil, err
	}

	cfg := &Config{
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
			AllowOrigins:     parseStringSlice(getEnv("CORS_ALLOW_ORIGINS", "http://localhost:3000")),
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
		Minio: MinioConfig{
			Endpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
			AccessKey: getEnv("MINIO_ACCESS_KEY", "minioadmin"),
			SecretKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
			Bucket:    getEnv("MINIO_BUCKET", "payment-qr"),
			UseSSL:    getEnv("MINIO_USE_SSL", "false") == "true",
			URLExpiry: parseDuration(getEnv("MINIO_URL_EXPIRY", "15m")),
		},
		GDrive: GDriveConfig{
			ClientEmail:  getEnv("GDRIVE_CLIENT_EMAIL", ""),
			PrivateKey:   cleanPrivateKey(getEnv("GDRIVE_PRIVATE_KEY", "")),
			FolderRoutes: parseDriveFolderRoutes(getEnv("GDRIVE_FOLDER_ROUTES", "")),
		},
		Payment: PaymentConfig{
			PromptPayID:  getEnv("PROMPTPAY_ID", ""),
			BillerID:     getEnv("BILLER_ID", ""),
			BillerRef1:   getEnv("BILLER_REF1", ""),
			BillerRef2:   getEnv("BILLER_REF2", ""),
			MerchantName: getEnv("PAYMENT_MERCHANT_NAME", "SUT"),
			MerchantCity: getEnv("PAYMENT_MERCHANT_CITY", "Nakhon Ratchasima"),
		},
	}

	// Wildcard origins with credentials lets any site read authenticated
	// responses; the CORS library does not reject this combination, so guard here.
	if cfg.CORS.AllowCredentials && slices.Contains(cfg.CORS.AllowOrigins, "*") {
		return nil, fmt.Errorf("invalid CORS config: CORS_ALLOW_ORIGINS cannot be '*' when CORS_ALLOW_CREDENTIALS is true; list explicit origins")
	}

	return cfg, nil
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
	for range 10 {
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

// parseDriveFolderRoutes แปลง "booking-docs:1ABC,payment-slip:4DEF" เป็น map
func parseDriveFolderRoutes(s string) map[string]string {
	m := make(map[string]string)
	for _, pair := range strings.Split(s, ",") {
		parts := strings.SplitN(strings.TrimSpace(pair), ":", 2)
		if len(parts) == 2 && parts[0] != "" && parts[1] != "" {
			m[parts[0]] = parts[1]
		}
	}
	return m
}

// cleanPrivateKey แปลง literal \n ที่มาจาก .env ให้เป็น newline จริง
// รองรับทั้ง \\n (double-escaped) และ \n (single-escaped)
func cleanPrivateKey(key string) string {
	key = strings.ReplaceAll(key, `\\n`, "\n")
	key = strings.ReplaceAll(key, `\n`, "\n")
	return strings.TrimSpace(key)
}