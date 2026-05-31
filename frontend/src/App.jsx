import {useEffect, useState} from 'react';
import {GetSettings, SetSettings as SetBackendSettings, CheckForUpdates} from "../wailsjs/go/main/App";
import Clock from './clock';
import {CurrentConditions, HourlyForecast, DailyForecast} from './weather';
import useWeather from './useWeather';
import Settings from "./settings.jsx";
import Calendar from "./calendar.jsx";
import {Settings2} from "lucide-react";

const App = () => {
    const [showSettings, setShowSettings] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [settings, setSettings] = useState({})
//    const [bgImage, setBgImage] = useState('/assets/images/hide-obara-TeX_yWATaBA-unsplash.jpg')
    const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

    useEffect(() => {
        SetBackendSettings(JSON.stringify(settings))
    }, [settings])

    useEffect(() => {
        setIsCheckingUpdates(true);
        CheckForUpdates().then(() => {
            setIsCheckingUpdates(false);

            GetSettings().then(data => {
                data = JSON.parse(data)
                setSettings(data)
                if(data.first_run) {
                    setShowSettings(true)
                }
                setIsLoading(false)
            });
        })
    }, [])

//    const updateBackgroundImage = currentTime => {
//        currentTime = currentTime.toLocal();
//        if(currentTime >= DateTime.now().set({hour: 5, minute: 0})) {
//            setBgImage('/assets/images/manish-upadhyay-cK0iVcfvmR4-unsplash.jpg')
//        }
//        if(currentTime >= DateTime.now().set({hour: 11, minute: 30})) {
//            setBgImage('/assets/images/jezioramazur-EHpOfsf8bgo-unsplash.jpg')
//        }
//        if(currentTime >= DateTime.now().set({hour: 18, minute: 0})) {
//            setBgImage('/assets/images/jason-mavrommatis-GPPAjJicemU-unsplash.jpg')
//        }
//        if(currentTime >= DateTime.now().set({hour: 20, minute: 0})) {
//            setBgImage('/assets/images/benjamin-voros-U-Kty6HxcQc-unsplash.jpg')
//        }
//    }

    const {currentWeather, next8hours, sunrise, sunset} = useWeather(settings);

    if (isCheckingUpdates) {
        return <div className="fixed inset-0 flex flex-col justify-center items-center text-center">
            <div className="font-mono text-xs uppercase">Checking Updates...</div>
        </div>;
    }


    if (isLoading) {
        return <div className="fixed inset-0 flex flex-col justify-center items-center text-center">
            <div className="font-mono text-xs uppercase">Loading...</div>
        </div>;
    }

    return <div className="bg-cover bg-no-repeat fixed inset-0" /*style={{backgroundImage: `url(${bgImage})`}}*/>
        <div className={`flex px-12 py-7 ${settings.oled_mode ? 'bg-black' : 'bg-slate-900'} fixed inset-0`}>
            <button type="button" className="z-50 fixed top-4 right-4 rounded-full px-2.5 py-2 bg-slate-700/55 border-0" onClick={() => setShowSettings(true)}>
                <Settings2 size={24}/>
            </button>

            {showSettings && <Settings settings={settings} onUpdate={newSettings => {setSettings(newSettings); setShowSettings(false)}} onClose={() => setShowSettings(false)} />}

            <div className="w-full h-full flex flex-col text-light font-sans gap-y-4">
                <div className="flex items-start justify-between gap-x-8 flex-1 min-h-0">
                    <div className="flex flex-col min-w-0 flex-1">
                        <Clock settings={settings} /*onClockTick={updateBackgroundImage}*/ />
                        <div className="mt-1 min-w-0">
                            <Calendar settings={settings} />
                        </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end pr-20">
                        <CurrentConditions settings={settings} currentWeather={currentWeather} sunrise={sunrise} sunset={sunset} />
                    </div>
                </div>
                <div className="shrink-0 flex flex-col gap-y-6">
                    <HourlyForecast settings={settings} currentWeather={currentWeather} next8hours={next8hours} />
                    <DailyForecast settings={settings} currentWeather={currentWeather} />
                </div>
            </div>
        </div>
    </div>;
}

export default App
