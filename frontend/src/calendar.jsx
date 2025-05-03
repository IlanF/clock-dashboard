import {DateTime} from "luxon";
import {useEffect, useState} from 'react';
import OfflineIndicator from "./components/offline-indicator.jsx";

const updateIntervalMinutes = 60;

const Calendar = ({settings}) => {
    if(!settings.google_calendar_api_key || !settings.google_calendars_list || settings.google_calendars_list.length <= 0) {
        return null;
    }

    const calendarData = JSON.parse(localStorage.getItem('calendar'))
    const [events, setEvents] = useState(calendarData && calendarData.events ? calendarData.events : []);

    const updateCalendar = async () => {
        const events = [];
        const startTime = DateTime.now().set({hour: 0, minute: 0}).setZone('UTC').toISO()
        const endTime = DateTime.now().set({hour: 0, minute: 0}).plus({months: 1, days: 1}).setZone('UTC').toISO()
        const results = await Promise.all(settings.google_calendars_list.map(calendarKey => fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarKey)}/events?key=${encodeURIComponent(settings.google_calendar_api_key)}&timeMin=${encodeURIComponent(startTime)}&timeMax=${encodeURIComponent(endTime)}`)))

        await Promise.all(results.map(async response => {
            const result = await response.json()

            result.items.forEach(event => {
                const startDate = DateTime.fromISO(event.start.date);

                if(events.find(e => e.label === event.summary && e.start.toISO() === startDate.toISO())) {
                    return;
                }

                events.push({
                    id: event.id,
                    start: startDate,
                    label: event.summary,
                })
            });

            events.sort((a, b) => a.start - b.start)
        }))

        setEvents(events)
        localStorage.setItem('calendar', JSON.stringify({calendars: settings.google_calendars_list, events}))
    }

    useEffect(() => {
        const timer = setInterval(updateCalendar, updateIntervalMinutes * 60 * 1000)
        if(!calendarData || JSON.stringify(settings.google_calendars_list) !== JSON.stringify(calendarData.calendars)) {
            updateCalendar();
        }

        return () => {
            clearInterval(timer)
        }
    }, [settings]);

    if(events.length <= 0) {
        return null;
    }

    return <OfflineIndicator>
        <div className="mx-1.5 font-semibold text-slate-200">Upcoming:</div>
        <div className="mx-1.5 text-sm">
            {events.slice(0, 7).map(event => {
                const date = DateTime.fromISO(event.start);
                const diff = Math.round(date.diff(DateTime.now(), 'days').as('days'));

                return <div key={event.id} className="w-full flex justify-between">
                    <span className="text-sm font-semibold text-slate-400 me-2 capitalize">
                        {diff >= 3 ? date.toLocaleString({month: 'long', day: 'numeric'}) : date.toRelativeCalendar()}
                    </span>
                    <span className="text-slate-300">{event.label}</span>
                </div>;
            })}
        </div>
    </OfflineIndicator>;
}
export default Calendar
