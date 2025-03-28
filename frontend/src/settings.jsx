import {ToggleFullscreen} from "../wailsjs/go/main/App";
import {Fullscreen, LogOut, Save, X} from "lucide-react";

const Settings = ({settings, onUpdate, onClose}) => {
    return <div className="flex flex-col px-8 pt-4 absolute inset-0 overflow-y-auto bg-gray-900 text-gray-100 bg-opacity-80 backdrop-blur-sm z-50">
        <h1 className="text-4xl">Settings</h1>

        <form onSubmit={e => {
                  e.preventDefault();
                  const newSettings = Object.fromEntries((new FormData(e.target)).entries());
                  newSettings.lat = parseFloat(newSettings.lat);
                  newSettings.lon = parseFloat(newSettings.lon);

                  if(settings.first_run) {
                      localStorage.removeItem('weather')
                      newSettings.first_run = false;
                  }

                  onUpdate(newSettings);
              }}
              className="flex flex-wrap pt-4 max-w-[1280px] max-h-[720px] mx-auto my-auto"
        >
            <fieldset className="w-1/2">
                <legend className="text-xl text-emerald-400">Clock</legend>

                <fieldset className="mt-2">
                    <legend>Type</legend>
                    <label className="mr-4 inline-block">
                        <input type="radio" name="clock_type" value="12" defaultChecked={settings.clock_type === "12"} />
                        <span className="ml-1 align-middle">12 Hours</span>
                    </label>
                    <label className="mr-4 inline-block">
                        <input type="radio" name="clock_type" value="24" defaultChecked={settings.clock_type === "24"} />
                        <span className="ml-1 align-middle">24 Hours</span>
                    </label>
                </fieldset>
            </fieldset>

            <fieldset className="w-1/2">
                <legend className="text-xl text-emerald-400">Weather</legend>

                <fieldset className="mt-2">
                    <legend>Unit</legend>
                    <label className="mr-4 inline-block">
                        <input type="radio" name="temp_unit" value="c" defaultChecked={settings.temp_unit === "c"} />
                        <span className="ml-1 align-middle">Celsius</span>
                    </label>
                    <label className="mr-4 inline-block">
                        <input type="radio" name="temp_unit" value="f" defaultChecked={settings.temp_unit === "f"} />
                        <span className="ml-1 align-middle">Farenheit</span>
                    </label>
                </fieldset>

                <fieldset className="mt-2">
                    <legend>Location</legend>

                    <div className="mr-4 inline-block">
                        <label>Latitude</label>
                        <input type="text" name="lat" defaultValue={settings.lat} />
                    </div>
                    <div className="mr-4 inline-block">
                        <label>Longtitude</label>
                        <input type="text" name="lon" defaultValue={settings.lon} />
                    </div>
                </fieldset>
            </fieldset>

            <div className="w-full flex justify-between items-center mt-12 mb-4">
                <button type="submit" className="primary">
                    <Save className="me-2" />
                    Save
                </button>
                <button type="button" onClick={onClose}>
                    <X className="me-2" />
                    Cancel
                </button>

                <button type="button" onClick={() => ToggleFullscreen()}>
                    <Fullscreen className="me-2" />
                    Toggle Fullscreen
                </button>

                <button type="button" className="ms-auto danger" onClick={() => window.runtime.Quit()}>
                    <LogOut className="me-2" />
                    Exit
                </button>
            </div>
        </form>
    </div>
}
export default Settings;