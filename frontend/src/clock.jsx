import {DateTime} from "luxon";
import {useEffect, useState} from 'react';

const Clock = ({settings}) => {
    const [currentTime, setCurrentTime] = useState(DateTime.now())
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(DateTime.now())
        }, 1000)
        return () => {
            clearInterval(timer)
        }
    }, []);

    const weekdays = {
        "Sun": 7,
        "Mon": 1,
        "Tue": 2,
        "Wed": 3,
        "Thu": 4,
        "Fri": 5,
        "Sat": 6,
    }

    const [hours, minutes] = currentTime.toLocaleString({
        hour: '2-digit',
        minute: '2-digit',
        hour12: settings.clock_type === '12',
    }).replace('AM', '')
        .replace('PM', '')
        .trim()
        .split(':');

    return <>
        <div className="flex justify-start">
            <div className="text-9xl">
                <span>{hours}</span>
                <span className="relative bottom-2 font-sans animate-[pulse_2s_linear_infinite]">:</span>
                <span>{minutes}</span>
            </div>
            {settings.clock_type === '12' && <div className="ml-4 mt-5 mb-auto">
                <div className={currentTime.toFormat('a') === 'AM' ? 'font-medium' : 'opacity-40'}>AM</div>
                <div className={currentTime.toFormat('a') === 'PM' ? 'font-medium' : 'opacity-40'}>PM</div>
            </div>}
        </div>

        <div className="mx-1.5 text-left font-thin uppercase space-x-2">
            {Object.keys(weekdays).map(day => <span
                className={currentTime.weekday === weekdays[day] ? 'font-medium' : 'opacity-40'}
                key={day}
            >
                {day}
            </span>)}
        </div>

        <div className="mx-1.5 text-left">{currentTime.toLocaleString(DateTime.DATE_FULL)}</div>
    </>;
}
export default Clock
