package migrations

import (
	"database/sql"
	"embed"
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	postgresmigrate "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed sql/*.sql
var migrationFiles embed.FS

func Run(db *sql.DB) error {
	driver, err := postgresmigrate.WithInstance(db, &postgresmigrate.Config{})
	if err != nil {
		return fmt.Errorf("create postgres migrate driver: %w", err)
	}

	sourceDriver, err := iofs.New(migrationFiles, "sql")
	if err != nil {
		return fmt.Errorf("create migration source: %w", err)
	}

	migrator, err := migrate.NewWithInstance("iofs", sourceDriver, "postgres", driver)
	if err != nil {
		return fmt.Errorf("create migrator: %w", err)
	}

	err = migrator.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("run up migrations: %w", err)
	}

	return nil
}
