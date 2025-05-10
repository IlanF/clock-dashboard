import {ToggleFullscreen, GetVersion} from "../wailsjs/go/main/App";
import {Fullscreen, LogOut, Save, X} from "lucide-react";
import {useState, useEffect} from "react";

// https://gist.github.com/dhoeric/76bd1c15168ee0ee61ad3bf1730dcb65
const calendarsList = {
    "en.judaism#holiday@group.v.calendar.google.com": "Jewish Holidays",
    "en.jewish.official#holiday@group.v.calendar.google.com": "Holidays in Israel",
    "en.usa.official#holiday@group.v.calendar.google.com": "Holidays in United States",
};

const Settings = ({settings: propSettings, onUpdate, onClose}) => {
    const [appVersion, setAppVersion] = useState('0.0.0');
    useEffect(() => {
        GetVersion().then(setAppVersion)
    }, [])

    const [settings, setSettings] = useState({
        first_run: propSettings.first_run || true,
        lat: propSettings.lat || '',
        lon: propSettings.lon || '',
        locale: propSettings.locale || 'en',
        temp_unit: propSettings.temp_unit || 'c',
        clock_type: propSettings.clock_type || '24',
        google_calendar_api_key: propSettings.google_calendar_api_key || '',
        google_calendars_list: propSettings.google_calendars_list || [],
    });

    const handleChnaged = e => {
        const newSettings = settings
        newSettings[e.target.name] = e.target.value;
        setSettings(newSettings)
    }
    const handleFloatChnaged = e => {
        const newSettings = settings
        newSettings[e.target.name] = parseFloat(e.target.value);
        setSettings(newSettings)
    }
    const handleArrayChange = e => {
        const newSettings = settings

        if(e.target.checked) {
            if(!newSettings[e.target.name].includes(e.target.value)) {
                newSettings[e.target.name].push(e.target.value)
            }
        } else {
            if(newSettings[e.target.name].includes(e.target.value)) {
                newSettings[e.target.name] = newSettings[e.target.name].filter(v => v !== e.target.value);
            }
        }

        setSettings(newSettings)
    }

    return <form className="flex flex-col fixed inset-0 overflow-y-auto bg-gray-900 text-gray-100 bg-opacity-80 backdrop-blur-sm z-50"
               onSubmit={e => {
                  e.preventDefault();

                  if(settings.first_run) {
                      localStorage.removeItem('weather')
                      settings.first_run = false;
                      setSettings(settings)
                  }

                  onUpdate(settings);
              }}
    >
        <div className="bg-black/50 px-4 py-4">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-3xl">Settings</h1>
                    <div className="text-xs text-slate-400">App Version {appVersion}</div>
                </div>
                <div>
                    <button type="button" onClick={() => ToggleFullscreen()} className="text-xs px-1.5">
                        <Fullscreen size="1.5em" className="me-2 -mt-0.5" />
                        Toggle Fullscreen
                    </button>

                    <button type="button" className="ms-auto danger text-xs px-1.5" onClick={() => window.runtime.Quit()}>
                        <LogOut size="1.5em" className="me-2 -mt-0.5" />
                        Exit
                    </button>
                </div>
            </div>
        </div>

        <div className="w-full px-4 py-4 flex flex-wrap max-w-[1280px] max-h-[720px] overflow-y-auto mx-auto my-auto">
            <div className="w-1/2 space-y-4">
                <fieldset className="space-y-4">
                    <legend className="text-xl text-emerald-400">Clock</legend>

                    <div>
                        <label>Type</label>
                        <select name="clock_type" className="w-1/2" defaultValue={settings.clock_type} onChange={handleChnaged}>
                            <option value="12">12 Hours</option>
                            <option value="24">24 Hours</option>
                        </select>
                    </div>
                </fieldset>

                <fieldset className="space-y-4">
                    <legend className="text-xl text-emerald-400">Calendar</legend>

                    <div>
                        <label>Google Calendar API Key</label>
                        <input type="text" name="google_calendar_api_key" className="w-3/4" defaultValue={settings.google_calendar_api_key} onChange={handleChnaged} />
                    </div>

                    <div>
                        <label>Calendars</label>
                        {Object.entries(calendarsList).map(([val, label]) => <label key={val}>
                            <input type="checkbox" className="me-2" name="google_calendars_list" value={val} defaultChecked={settings.google_calendars_list && settings.google_calendars_list.includes(val)} onChange={handleArrayChange} />
                            {label}
                        </label>)}
                    </div>
                </fieldset>
            </div>

            <fieldset className="w-1/2 space-y-4">
                <legend className="text-xl text-emerald-400">Weather</legend>

                <div>
                    <label>Unit</label>
                    <select name="temp_unit" className="w-1/2" defaultValue={settings.temp_unit} onChange={handleChnaged}>
                        <option value="c">Celsius</option>
                        <option value="f">Farenheit</option>
                    </select>
                </div>

                <fieldset className="">
                    <legend>Location</legend>

                    <div className="flex space-x-2">
                        <div className="">
                            <label className="text-sm text-slate-400">Latitude</label>
                            <input type="text" name="lat" defaultValue={settings.lat} onChange={handleFloatChnaged} />
                        </div>
                        <div className="">
                            <label className="text-sm text-slate-400">Longtitude</label>
                            <input type="text" name="lon" defaultValue={settings.lon} onChange={handleFloatChnaged} />
                        </div>
                    </div>
                </fieldset>
            </fieldset>

            <div className="w-full py-4">
                <button type="submit" className="primary">
                    <Save className="me-2" />
                    Save
                </button>
                <button type="button" onClick={onClose}>
                    <X className="me-2" />
                    Cancel
                </button>
            </div>
        </div>
    </form>
}
export default Settings;