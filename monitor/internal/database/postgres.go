package database

import (
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"github.com/jmoiron/sqlx"

	"website-monitor-go/internal/config"
)

func Open(cfg config.Config) (*sqlx.DB, error) {
	db, err := sqlx.Open("postgres", cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("sql open: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return db, nil
}
