import {DateTime} from "luxon";
import {useEffect, useState} from 'react';

const Clock = ({settings, onClockTick = () => {}}) => {
    const [currentTime, setCurrentTime] = useState(DateTime.now())

    useEffect(() => {
        onClockTick(currentTime)

        const timer = setInterval(() => {
            const now = DateTime.now()
            setCurrentTime(now)
            onClockTick(now)
        }, 1000)
        return () => {
            clearInterval(timer)
        }
    }, []);

    const weekdays = {
        "Sunday": 7,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
    }

    const [hours, minutes] = currentTime.toLocaleString({
        hour: '2-digit',
        minute: '2-digit',
        hour12: settings.clock_type === '12',
    }).replace('AM', '')
        .replace('PM', '')
        .trim()
        .split(':');

    return <div className="flex justify-start items-stretch">
        <div className="flex flex-col">
            <div className="text-8xl leading-none">
                <span>{hours}</span>
                <span className="relative bottom-2 font-sans animate-[pulse_2s_linear_infinite]">:</span>
                <span>{minutes}</span>
            </div>
            <div className="mt-1 mx-1.5 text-left text-2xl">{currentTime.toLocaleString(DateTime.DATE_FULL)}</div>
        </div>
        <div className="ml-4 py-1 flex flex-col justify-between text-xs uppercase font-thin">
            {Object.keys(weekdays).map(day => <span
                className={currentTime.weekday === weekdays[day] ? 'font-medium border-l-2 border-blue-500 pl-1.5' : 'border-l-2 border-transparent pl-1.5 opacity-70'}
                key={day}
            >
                {day}
            </span>)}
        </div>
        {settings.clock_type === '12' && <div className="ml-4 mt-5 mb-auto">
            <div className={currentTime.toFormat('a') === 'AM' ? 'font-medium border-b-2 border-blue-500' : 'opacity-70 border-b-2 border-transparent'}>AM</div>
            <div className={currentTime.toFormat('a') === 'PM' ? 'font-medium border-b-2 border-blue-500' : 'opacity-70 border-b-2 border-transparent'}>PM</div>
        </div>}
    </div>;
}
export default Clock
