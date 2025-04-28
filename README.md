# README

## About

A small project to add a clock to my computer table.

Running on a Raspberry PI with a touchscreen.

![Image](https://github.com/user-attachments/assets/9fb1c0ed-0c5b-464e-b0ec-96681ddce6aa)

### Parts used if you wanted to replicate:
- Raspberry PI 3B+
- [BTT TFT50](https://biqu.equipment/products/bigtreetech-pi-tft43-v2-0-screen-board)
- [Raspberry Pi 3B+ with BTT TFT50 Screen Enclosure ](https://www.printables.com/model/810131-raspberry-pi-3b-with-btt-tft50-screen-enclosure-kl) (Had to modify a little bit with a file for my v1.2 screen)

The OS was set to launch the app on startup.

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.
