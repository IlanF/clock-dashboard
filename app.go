package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"path"
)

type AppSettings struct {
	FirstRun bool `json:"first_run"`
	Lat    float64 `json:"lat"`
	Lon    float64 `json:"lon"`
	Locale string  `json:"locale"`
	TempUnit string `json:"temp_unit"`
	ClockType string `json:"clock_type"`
	Fullscreen bool `json:"fullscreen"`
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

	// set default settings
	a.settings = AppSettings{
		FirstRun: true,
		Lat:    0,
		Lon:    0,
		Locale: "en",
		TempUnit: "c",
		ClockType: "24",
		Fullscreen: false,
	}

	a.LoadSettings()

	if a.settings.Fullscreen {
		runtime.WindowFullscreen(a.ctx)
	}
}

// GetSettings returns a the application settings
func (a *App) GetSettings() string {
	data, _ := json.Marshal(a.settings)
	return string(data)
}

// SetSettings updates an application setting
func (a *App) SetSettings(newSettings string) string {
	_ = json.Unmarshal([]byte(newSettings), &a.settings)
	a.SaveSettings()
	return a.GetSettings()
}

func (a *App) LoadSettings() {
	defer func() {
		if err := recover(); err != nil {
			_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
				Type:          runtime.ErrorDialog,
				Title:         "Application Error",
				Message:       fmt.Sprint(err),
			})

			runtime.Quit(a.ctx)
		}
	}()

	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic("Error opening config directory: "+err.Error())
	}

	configPath := path.Join(homeDir, ".config", "clock-dashboard.json")
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		a.SaveSettings()
	}

	configFile, err := os.OpenFile(configPath, os.O_RDONLY|os.O_CREATE, 0644)
	defer func(configFile *os.File) {
		_ = configFile.Close()
	}(configFile)
	if err != nil {
		panic("Error opening config file: "+err.Error())
	}

	jsonParser := json.NewDecoder(configFile)
	err = jsonParser.Decode(&a.settings)
	if err != nil {
		// attempt to recover corrupted settings file
		_ = configFile.Close()
		a.SaveSettings()

		configFile, err = os.OpenFile(configPath, os.O_RDONLY|os.O_CREATE, 0644)
		defer func(configFile *os.File) {
			_ = configFile.Close()
		}(configFile)

		if err != nil {
			panic("Error decoding app config: "+err.Error())
		}
	}
}

func (a *App) SaveSettings() {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic("Error opening config directory: "+err.Error())
	}

	configPath := path.Join(homeDir, ".config", "clock-dashboard.json")
	configFile, err := os.OpenFile(configPath, os.O_WRONLY|os.O_CREATE, 0644)
	defer func(configFile *os.File) {
		_ = configFile.Close()
	}(configFile)
	if err != nil {
		panic("Error opening config file: "+err.Error())
	}

	encoder := json.NewEncoder(configFile)
	err = encoder.Encode(a.settings)
	if err != nil {
		panic("Error saving config file: "+err.Error())
	}
}

func (a *App) ToggleFullscreen() {
	if runtime.WindowIsFullscreen(a.ctx) {
		runtime.WindowUnfullscreen(a.ctx)
		a.settings.Fullscreen = false
	} else {
		runtime.WindowFullscreen(a.ctx)
		a.settings.Fullscreen = true
	}

	a.SaveSettings()
}