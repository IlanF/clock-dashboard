package main

import (
	"context"
	"encoding/json"
)

type AppSettings struct {
	Lat    float64 `json:"lat"`
	Lon    float64 `json:"lon"`
	Locale string  `json:"locale"`
	TempUnit string `json:"temp_unit"`
	ClockType string `json:"clock_type"`
}

// App struct
type App struct {
	ctx      context.Context
	settings AppSettings
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// TODO: load settings from DB or somewhere
	a.settings = AppSettings{
		Lat:    0,
		Lon:    0,
		Locale: "en",
		TempUnit: "c",
		ClockType: "24",
	}
}

// GetSettings returns a the application settings
func (a *App) GetSettings() string {
	data, _ := json.Marshal(a.settings)
	return string(data)
}

// SetSettings updates an application setting
func (a *App) SetSettings(key string, value any) string {
	// TODO: update the settings in the DB or whatever
	return a.GetSettings()
}
