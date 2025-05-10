package main

import (
	"embed"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

var version = "dev"

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp(version)

	// Create application with options
	err := wails.Run(&options.App{
		Title:         "clock-dashboard",
		Width:         800,
		Height:        480,
		DisableResize: false,
		Fullscreen:         false,
		WindowStartState:   options.Normal,
		Frameless: false,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		_, _ = runtime.MessageDialog(app.ctx, runtime.MessageDialogOptions{
			Type:          runtime.ErrorDialog,
			Title:         "Application Error",
			Message:       err.Error(),
		})
	}
}
