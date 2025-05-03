import {useState, useEffect} from 'react';

const OfflineIndicator = ({children}) => {
    const [online, setOnline] = useState(window.navigator.onLine);

    const callbackOnline = () => setOnline(true);
    const callbackOffline = () => setOnline(false);

    useEffect(() => {
        window.addEventListener('online', callbackOnline);
        window.addEventListener('offline', callbackOffline);

        return () => {
            window.removeEventListener('online', callbackOnline);
            window.removeEventListener('offline', callbackOffline);
        }
    })

    return <>
        {online && children}
        {!online && (
            <div className="relative">
                <div className="absolute -inset-4 bg-slate-900/80 backdrop-blur text-slate-500 text-xl flex items-center justify-center z-10">
                    Currently Offline
                </div>
                <div className="z-0">
                    {children}
                </div>
            </div>
        )}
    </>;
}

export default OfflineIndicator;