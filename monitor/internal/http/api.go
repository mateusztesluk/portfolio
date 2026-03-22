package http

import (
	"database/sql"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"website-monitor-go/internal/monitor"
)

type API struct {
	service *monitor.Service
	db      *sqlx.DB
}

func NewRouter(service *monitor.Service, db *sqlx.DB) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	api := &API{
		service: service,
		db:      db,
	}

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	v1 := router.Group("/api/v1")
	v1.GET("/health", api.health)
	v1.GET("/monitors", api.listMonitors)
	v1.POST("/monitors", api.createMonitor)
	v1.POST("/monitors/:id/check", api.checkMonitor)

	return router
}

func (api *API) health(ctx *gin.Context) {
	if err := api.db.PingContext(ctx.Request.Context()); err != nil {
		ctx.JSON(503, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{
		"status": "ok",
	})
}

func (api *API) listMonitors(ctx *gin.Context) {
	monitors, err := api.service.List(ctx.Request.Context())
	if err != nil {
		ctx.JSON(500, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(200, monitors)
}

func (api *API) createMonitor(ctx *gin.Context) {
	var payload monitor.CreateInput
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(400, gin.H{"message": "invalid json payload"})
		return
	}

	createdMonitor, err := api.service.Create(ctx.Request.Context(), payload)
	if err != nil {
		ctx.JSON(400, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(201, createdMonitor)
}

func (api *API) checkMonitor(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(400, gin.H{"message": "invalid monitor id"})
		return
	}

	checkedMonitor, err := api.service.CheckNow(ctx.Request.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			ctx.JSON(404, gin.H{"message": "monitor not found"})
			return
		}

		ctx.JSON(500, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(200, checkedMonitor)
}
