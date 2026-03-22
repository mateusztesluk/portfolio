package monitor

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Monitor struct {
	ID             int        `json:"id"`
	Name           string     `json:"name"`
	URL            string     `json:"url"`
	Status         string     `json:"status"`
	LastStatusCode *int       `json:"last_status_code"`
	ResponseTimeMS *int       `json:"response_time_ms"`
	LastCheckedAt  *time.Time `json:"last_checked_at"`
	ErrorMessage   *string    `json:"error_message"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type CreateInput struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

type Service struct {
	db          *sqlx.DB
	httpTimeout time.Duration
}

func NewService(db *sqlx.DB, httpTimeout time.Duration) *Service {
	return &Service{
		db:          db,
		httpTimeout: httpTimeout,
	}
}

type monitorRecord struct {
	ID             int            `db:"id"`
	Name           string         `db:"name"`
	URL            string         `db:"url"`
	Status         string         `db:"status"`
	LastStatusCode sql.NullInt64  `db:"last_status_code"`
	ResponseTimeMS sql.NullInt64  `db:"response_time_ms"`
	LastCheckedAt  sql.NullTime   `db:"last_checked_at"`
	ErrorMessage   sql.NullString `db:"error_message"`
	CreatedAt      time.Time      `db:"created_at"`
	UpdatedAt      time.Time      `db:"updated_at"`
}

func (service *Service) List(ctx context.Context) ([]Monitor, error) {
	records := make([]monitorRecord, 0)
	err := service.db.SelectContext(ctx, &records, `
		SELECT id, name, url, status, last_status_code, response_time_ms, last_checked_at, error_message, created_at, updated_at
		FROM monitors
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}

	monitors := make([]Monitor, 0, len(records))
	for _, record := range records {
		monitors = append(monitors, record.toMonitor())
	}

	return monitors, nil
}

func (service *Service) Create(ctx context.Context, input CreateInput) (Monitor, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.URL = strings.TrimSpace(input.URL)

	if input.Name == "" || input.URL == "" {
		return Monitor{}, errors.New("name and url are required")
	}

	if err := validateURL(input.URL); err != nil {
		return Monitor{}, err
	}

	var record monitorRecord
	err := service.db.GetContext(ctx, &record, `
		INSERT INTO monitors (name, url)
		VALUES ($1, $2)
		RETURNING id, name, url, status, last_status_code, response_time_ms, last_checked_at, error_message, created_at, updated_at
	`, input.Name, input.URL)
	if err != nil {
		return Monitor{}, err
	}

	return record.toMonitor(), nil
}

func (service *Service) CheckNow(ctx context.Context, id int) (Monitor, error) {
	monitor, err := service.GetByID(ctx, id)
	if err != nil {
		return Monitor{}, err
	}

	result := service.checkTarget(monitor.URL)

	var record monitorRecord
	err = service.db.GetContext(ctx, &record, `
		UPDATE monitors
		SET status = $2,
			last_status_code = $3,
			response_time_ms = $4,
			last_checked_at = $5,
			error_message = $6,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, url, status, last_status_code, response_time_ms, last_checked_at, error_message, created_at, updated_at
	`,
		id,
		result.Status,
		result.LastStatusCode,
		result.ResponseTimeMS,
		result.LastCheckedAt,
		result.ErrorMessage,
	)
	if err != nil {
		return Monitor{}, err
	}

	return record.toMonitor(), nil
}

func (service *Service) GetByID(ctx context.Context, id int) (Monitor, error) {
	var record monitorRecord
	err := service.db.GetContext(ctx, &record, `
		SELECT id, name, url, status, last_status_code, response_time_ms, last_checked_at, error_message, created_at, updated_at
		FROM monitors
		WHERE id = $1
	`, id)
	if err != nil {
		return Monitor{}, err
	}

	return record.toMonitor(), nil
}

type CheckResult struct {
	Status         string
	LastStatusCode *int
	ResponseTimeMS *int
	LastCheckedAt  time.Time
	ErrorMessage   *string
}

func (service *Service) checkTarget(targetURL string) CheckResult {
	client := &http.Client{
		Timeout: service.httpTimeout,
	}

	startTime := time.Now()
	response, err := client.Get(targetURL)
	elapsedMS := int(time.Since(startTime).Milliseconds())
	checkedAt := time.Now().UTC()

	if err != nil {
		errorMessage := err.Error()
		return CheckResult{
			Status:         "down",
			LastCheckedAt:  checkedAt,
			ResponseTimeMS: &elapsedMS,
			ErrorMessage:   &errorMessage,
		}
	}
	defer response.Body.Close()

	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 1024))

	statusCode := response.StatusCode
	status := "down"
	if statusCode >= http.StatusOK && statusCode < http.StatusBadRequest {
		status = "up"
	}

	var errorMessage *string
	if status == "down" {
		message := fmt.Sprintf("unexpected response status %d", statusCode)
		errorMessage = &message
	}

	return CheckResult{
		Status:         status,
		LastStatusCode: &statusCode,
		ResponseTimeMS: &elapsedMS,
		LastCheckedAt:  checkedAt,
		ErrorMessage:   errorMessage,
	}
}

func (record monitorRecord) toMonitor() Monitor {
	monitor := Monitor{
		ID:        record.ID,
		Name:      record.Name,
		URL:       record.URL,
		Status:    record.Status,
		CreatedAt: record.CreatedAt,
		UpdatedAt: record.UpdatedAt,
	}

	if record.LastStatusCode.Valid {
		value := int(record.LastStatusCode.Int64)
		monitor.LastStatusCode = &value
	}

	if record.ResponseTimeMS.Valid {
		value := int(record.ResponseTimeMS.Int64)
		monitor.ResponseTimeMS = &value
	}

	if record.LastCheckedAt.Valid {
		value := record.LastCheckedAt.Time
		monitor.LastCheckedAt = &value
	}

	if record.ErrorMessage.Valid {
		value := record.ErrorMessage.String
		monitor.ErrorMessage = &value
	}

	return monitor
}

func validateURL(rawURL string) error {
	parsedURL, err := url.ParseRequestURI(rawURL)
	if err != nil {
		return errors.New("url must be a valid absolute address")
	}

	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return errors.New("url must include scheme and host")
	}

	return nil
}
