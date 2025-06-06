import {useEffect, useState} from 'react';
import {GetSettings, SetSettings as SetBackendSettings, CheckForUpdates} from "../wailsjs/go/main/App";
import Clock from './clock';
import Weather from './weather';
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
        <div className="flex p-8 bg-slate-900 fixed inset-0">
            <button type="button" className="z-50 fixed top-4 right-4 rounded-full px-2.5 py-2 bg-slate-700/55 border-0" onClick={() => setShowSettings(true)}>
                <Settings2 size={24}/>
            </button>

            {showSettings && <Settings settings={settings} onUpdate={newSettings => {setSettings(newSettings); setShowSettings(false)}} onClose={() => setShowSettings(false)} />}

            <div className="max-w-[1280px] max-h-[720px] mx-auto my-auto flex items-start justify-around text-light font-sans gap-x-8">
                <div className="py-0">
                    <Clock settings={settings} /*onClockTick={updateBackgroundImage}*/ />
                    <Calendar settings={settings} />
                </div>
                <div className="mt-2">
                    <Weather settings={settings} />
                </div>
            </div>
        </div>
    </div>;
}

export default App
