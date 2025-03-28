import {useEffect, useState} from 'react';
import {GetSettings, SetSettings as SetBackendSettings} from "../wailsjs/go/main/App";
import Clock from './clock';
import Weather from './weather';
import Icon from "./components/icon.jsx";
import Settings from "./settings.jsx";

const App = () => {
    const [showSettings, setShowSettings] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [settings, setSettings] = useState({})
    useEffect(() => {
        SetBackendSettings(JSON.stringify(settings))
    }, [settings])
    useEffect(() => {
        GetSettings().then(data => {
            data = JSON.parse(data)
            setSettings(data)
            if(data.first_run) {
                setShowSettings(true)
            }
            setIsLoading(false)
        });
    }, []);


    if (isLoading) {
        return <div className="fixed inset-0 flex flex-col justify-center items-center text-center">
            <div className="font-mono text-xs uppercase">Loading...</div>
        </div>;
    }

    return <div className="bg-cover bg-no-repeat fixed inset-0" style={{backgroundImage: 'url(/src/assets/images/hide-obara-TeX_yWATaBA-unsplash.jpg)'}}>
        <div className="flex p-8 bg-slate-800/75 fixed inset-0 backdrop-blur-2xl">
            <button type="button" className="fixed top-4 right-4 rounded-full px-2.5 py-2" onClick={() => setShowSettings(true)}>
                <Icon size="6" path="M8 12.14V2H6V12.14C4.28 12.59 3 14.14 3 16S4.28 19.41 6 19.86V22H8V19.86C9.72 19.41 11 17.86 11 16S9.72 12.59 8 12.14M7 14C8.1 14 9 14.9 9 16S8.1 18 7 18C5.9 18 5 17.1 5 16S5.9 14 7 14M18 2H16V4.14C14.28 4.59 13 6.14 13 8S14.28 11.41 16 11.86V22H18V11.86C19.72 11.41 21 9.86 21 8S19.72 4.59 18 4.14V2M17 6C18.1 6 19 6.9 19 8S18.1 10 17 10C15.9 10 15 9.1 15 8S15.9 6 17 6Z" />
            </button>

            {showSettings && <Settings settings={settings} onUpdate={newSettings => {setSettings(newSettings); setShowSettings(false)}} onClose={() => setShowSettings(false)} />}

            <div className="max-w-[1280px] max-h-[720px] mx-auto my-auto flex items-start justify-around text-light font-sans gap-x-8">
                <div className="py-0">
                    <Clock settings={settings} />
                </div>
                <div className="mt-2">
                    <Weather settings={settings} />
                </div>
            </div>
        </div>
    </div>;
}

export default App
