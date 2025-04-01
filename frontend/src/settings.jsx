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
            <fieldset className="w-1/2 space-y-4">
                <legend className="text-xl text-emerald-400">Clock</legend>

                <div>
                    <label>Type</label>
                    <select name="clock_type" className="w-1/2">
                        <option value="12" selected={settings.clock_type === '12'}>12 Hours</option>
                        <option value="24" selected={settings.clock_type === '24'}>24 Hours</option>
                    </select>
                </div>
            </fieldset>

            <fieldset className="w-1/2 space-y-4">
                <legend className="text-xl text-emerald-400">Weather</legend>

                <div>
                    <label>Unit</label>
                    <select name="temp_unit" className="w-1/2">
                        <option value="c" selected={settings.temp_unit === 'c'}>Celsius</option>
                        <option value="f" selected={settings.temp_unit === 'f'}>Farenheit</option>
                    </select>
                </div>

                <fieldset className="">
                    <legend>Location</legend>

                    <div className="flex space-x-2">
                        <div className="">
                            <label className="text-sm text-slate-400">Latitude</label>
                            <input type="text" name="lat" defaultValue={settings.lat} />
                        </div>
                        <div className="">
                            <label className="text-sm text-slate-400">Longtitude</label>
                            <input type="text" name="lon" defaultValue={settings.lon} />
                        </div>
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