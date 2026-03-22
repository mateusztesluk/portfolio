package main

import (
	"log"
	"net/http"
	"time"

	"website-monitor-go/internal/config"
	"website-monitor-go/internal/database"
	api "website-monitor-go/internal/http"
	"website-monitor-go/internal/migrations"
	"website-monitor-go/internal/monitor"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	service := monitor.NewService(db, cfg.HTTPTimeout)

	if err := migrations.Run(db.DB); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	server := &http.Server{
		Addr:              ":" + cfg.AppPort,
		Handler:           api.NewRouter(service, db),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("website monitor API listening on :%s", cfg.AppPort)
	log.Fatal(server.ListenAndServe())
}
