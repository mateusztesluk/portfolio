package config

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	AppPort     string
	DBHost      string
	DBPort      int
	DBName      string
	DBUser      string
	DBPassword  string
	DBSSLMode   string
	HTTPTimeout time.Duration
}

func Load() Config {
	configReader := viper.New()
	configReader.SetDefault("MONITOR_APP_PORT", "8085")
	configReader.SetDefault("MONITOR_DB_HOST", "localhost")
	configReader.SetDefault("MONITOR_DB_PORT", 5432)
	configReader.SetDefault("MONITOR_DB_NAME", "monitor")
	configReader.SetDefault("MONITOR_DB_USER", "monitor_user")
	configReader.SetDefault("MONITOR_DB_PASSWORD", "monitor_pass")
	configReader.SetDefault("MONITOR_DB_SSLMODE", "disable")
	configReader.SetDefault("MONITOR_HTTP_TIMEOUT_SECONDS", 8)
	configReader.AutomaticEnv()

	timeoutSeconds := configReader.GetInt("MONITOR_HTTP_TIMEOUT_SECONDS")

	return Config{
		AppPort:     configReader.GetString("MONITOR_APP_PORT"),
		DBHost:      configReader.GetString("MONITOR_DB_HOST"),
		DBPort:      configReader.GetInt("MONITOR_DB_PORT"),
		DBName:      configReader.GetString("MONITOR_DB_NAME"),
		DBUser:      configReader.GetString("MONITOR_DB_USER"),
		DBPassword:  configReader.GetString("MONITOR_DB_PASSWORD"),
		DBSSLMode:   configReader.GetString("MONITOR_DB_SSLMODE"),
		HTTPTimeout: time.Duration(timeoutSeconds) * time.Second,
	}
}

func (cfg Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d dbname=%s user=%s password=%s sslmode=%s",
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBSSLMode,
	)
}
