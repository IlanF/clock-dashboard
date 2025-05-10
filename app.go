package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/blang/semver"
	"github.com/rhysd/go-github-selfupdate/selfupdate"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"log"
	"os"
	"os/exec"
	"path"
	"regexp"
)

type AppSettings struct {
	FirstRun bool `json:"first_run"`
	Lat    float64 `json:"lat"`
	Lon    float64 `json:"lon"`
	Locale string  `json:"locale"`
	TempUnit string `json:"temp_unit"`
	ClockType string `json:"clock_type"`
	Fullscreen bool `json:"fullscreen"`
	CalendarApiKey string `json:"google_calendar_api_key"`
	CalendarsList []string `json:"google_calendars_list"`
}

// App struct
type App struct {
	ctx      context.Context
	settings AppSettings
	version string
}

// NewApp creates a new App application struct
func NewApp(version string) *App {
	return &App{version: version}
}

func (a *App) restart() error {
	execPath, err := os.Executable()
	if err != nil {
		return err
	}

	// when updating the current executable path becomes /path/to/bin/.executable-name.exe.old
	re := regexp.MustCompile(`^(.+?[\\/])\.(.+?)\.old$`)
	if re.MatchString(execPath) {
		execPath = re.ReplaceAllString(execPath, "$1$2")
	}

	var cmd *exec.Cmd
	env := runtime.Environment(a.ctx)
	switch env.Platform {
	case "windows":
		cmd = exec.Command("cmd", "/C", "start", "", execPath)
	default:
		cmd = exec.Command(execPath)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
	}

	err = cmd.Start()
	if err != nil {
		return err
	}

	os.Exit(0)
	return nil
}
func (a *App) doSelfUpdate() {
    v, err := semver.Parse(a.version)
	if err != nil {
		log.Printf("Could not parse version string '%s'\n", a.version)
		return
	}

    latest, err := selfupdate.UpdateSelf(v, "IlanF/clock-dashboard")
    if err != nil {
        log.Println("Binary update failed:", err)
        return
    }
    if latest.Version.Equals(v) {
        // latest version is the same as current version. It means current binary is up to date.
        log.Println("Current binary is the latest version", a.version)

//		_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
//			Type:          runtime.InfoDialog,
//			Title:         "Automatic Update",
//			Message:       fmt.Sprintf("Current binary is the latest version %s.", a.version),
//		})

		return
    }

	log.Println("Successfully updated to version", latest.Version)
	log.Println("Release note:\n", latest.ReleaseNotes)

	_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:          runtime.InfoDialog,
		Title:         "Automatic Update",
		Message:       fmt.Sprintf("Successfully updated to version %s.\nApplication will now restart.", latest.Version.String()),
	})

	err = a.restart()
	if err != nil {
		_, _ = runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:          runtime.ErrorDialog,
			Title:         "Application Restart Failed",
			Message:       fmt.Sprintf("Could not restart the application:\n%s\nPlease exit the application and launch it again.", err.Error()),
		})
	}
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
		CalendarApiKey: "",
		CalendarsList: make([]string, 0),
	}

	a.LoadSettings()

	if a.settings.Fullscreen {
		runtime.WindowFullscreen(a.ctx)
	}
}

func (a *App) CheckForUpdates() {
	a.doSelfUpdate()
}

func (a *App) GetVersion() string {
	return a.version
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