package main

import (
	"embed"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"net/http"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

type FileLoader struct {
    http.Handler
}

func NewFileLoader() *FileLoader {
    return &FileLoader{}
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
    var err error
    requestedFilename := strings.TrimPrefix(req.URL.Path, "/")
    println("Requesting file:", requestedFilename)
    fileData, err := os.ReadFile("/src/"+requestedFilename)
    if err != nil {
        res.WriteHeader(http.StatusBadRequest)
		_, _ = res.Write([]byte(fmt.Sprintf("Could not load file %s", requestedFilename)))
    }

	_, _ = res.Write(fileData)
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

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
			Handler: NewFileLoader(),
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
