import {DateTime} from "luxon";
import {Fragment, useEffect, useState} from 'react';
import WeatherIcon from "./components/weather-icon.jsx";
import {Sunrise, Sunset} from "lucide-react";
import OfflineIndicator from "./components/offline-indicator.jsx";

const updateIntervalMinutes = 15;
const weatherFields = {
    // https://open-meteo.com/en/docs#current=temperature_2m,apparent_temperature,is_day,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset
    daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset'],
    current: ['temperature_2m','apparent_temperature','is_day','weather_code'],
    hourly: ['temperature_2m','weather_code'],
};

const convertTemp = (temp, fromUnit, toUnit) => {
    fromUnit = fromUnit.toLowerCase().includes('f') ? 'f' : 'c'
    toUnit = toUnit.toLowerCase().includes('f') ? 'f' : 'c';

    if (fromUnit === toUnit) {
        return temp;
    }

    if (toUnit === 'f') {
        return (temp * 1.8) + 32;
    }

    return (temp - 32) / 1.8;
}

const Weather = ({settings}) => {
    const updateWeather = async () => {
        if(!settings.lat || !settings.lon) {
            return;
        }

        let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${settings.lat}&longitude=${settings.lon}&${Object.keys(weatherFields).map(f => f + '=' + weatherFields[f].join(',')).join('&')}`);
        response = await response.json();
        setCurrentWeather(response)
        localStorage.setItem('weather', JSON.stringify(response))
    }

    const [currentWeather, setCurrentWeather] = useState(JSON.parse(localStorage.getItem('weather')));
    const [next8hours, setNext8hours] = useState([])
    const [sunrise, setSunrise] = useState('')
    const [sunset, setSunset] = useState('')

    useEffect(() => {
        const timer = setInterval(updateWeather, updateIntervalMinutes * 60 * 1000)
        if(!currentWeather){
            updateWeather();
            return;
        }

        const oldLat = parseFloat(currentWeather.latitude)
        const oldLon = parseFloat(currentWeather.longitude)
        const newLat = parseFloat(settings.lat)
        const newLon = parseFloat(settings.lon)

        if(Math.abs(newLat - oldLat) >= 0.01 || Math.abs(newLon - oldLon) >= 0.01) {
            updateWeather();
            return;
        }

        const diffNow = DateTime.fromISO(currentWeather.current.time, {zone: currentWeather.timezone}).diffNow(currentWeather.current_units.interval);
         if (diffNow < 0 || diffNow >= currentWeather.current.interval) {
             updateWeather();
             return;
         }

        if(currentWeather) {
            const timeLeft = DateTime.fromISO(currentWeather.current.time, {zone: currentWeather.timezone}).plus({ [currentWeather.current_units.interval]: currentWeather.current.interval}).diffNow(currentWeather.current_units.interval);
            if(timeLeft > 0) {
                setTimeout(updateWeather, timeLeft);
            }
        }

        return () => {
            clearInterval(timer)
        }
    }, [settings]);

    useEffect(() => {
        if (!currentWeather || !currentWeather.hourly) {
            return;
        }

        const currentHourISO = DateTime.now().setZone(currentWeather.timezone).toFormat("yyyy-LL-dd'T'HH:00");
        const nowIndex = currentWeather.hourly.time.indexOf(currentHourISO)

        const next8hours = [];
        for (let i = nowIndex; i < nowIndex+8; i++) {
            next8hours.push({
                temperature_2m: currentWeather.hourly.temperature_2m[i],
                weather_code: currentWeather.hourly.weather_code[i],
                time: DateTime.fromISO(currentWeather.hourly.time[i], {zone: currentWeather.timezone}).setZone(),
            });
        }

        setNext8hours(next8hours)

        const todayIndex = currentWeather.daily.sunrise.findIndex(d => DateTime.fromISO(DateTime.fromISO(d, {zone: currentWeather.timezone}).toISODate() === DateTime.now().setZone(currentWeather.timezone).toISODate()))
        setSunrise(DateTime.fromISO(currentWeather.daily.sunrise[todayIndex], {zone: currentWeather.timezone}).setZone().toLocaleString({
            hour: '2-digit',
            minute: '2-digit',
            hour12: settings.clock_type === '12',
        }),)
        setSunset(DateTime.fromISO(currentWeather.daily.sunset[todayIndex], {zone: currentWeather.timezone}).setZone().toLocaleString({
            hour: '2-digit',
            minute: '2-digit',
            hour12: settings.clock_type === '12',
        }))
    }, [currentWeather]);

    if (!currentWeather || !currentWeather.current) {
        return;
    }

    return <OfflineIndicator>
        <div className="text-7xl text-center flex items-center justify-center">
            <WeatherIcon className="" size={14} type={currentWeather.current?.weather_code} />
            <span className="inline-block mx-2">{Math.round(convertTemp((currentWeather.current?.temperature_2m || 0), currentWeather.current_units.temperature_2m, settings.temp_unit))}&deg;</span>
            <div className="ms-4 flex flex-col text-sm space-y-2.5 pt-2 text-slate-300 opacity-80">
                <span>
                    <Sunrise size="1.5em" className="me-1 -mt-1" />
                    {sunrise.replace(/([AP]M)/, ' $1')}
                </span>
                <span>
                    <Sunset size="1.5em" className="me-1 -mt-1" />
                    {sunset.replace(/([AP]M)/, ' $1')}
                </span>
            </div>
        </div>

        <div className="mt-4 grid grid-cols-2 grid-rows-8 gap-x-8 gap-y-2">
            <div className="grid row-span-full grid-rows-subgrid grid-cols-[2fr_1fr_1fr] gap-x-2">
                {next8hours.map(hour => <Fragment key={hour.time.toISOTime()}>
                    <span className="ml-auto opacity-40">{hour.time.diffNow('hours') < 1 ? 'Now' : hour.time.toLocaleString(DateTime.TIME_24_SIMPLE)}</span>
                    <WeatherIcon className="mx-auto" type={hour.weather_code} />
                    <span className="mr-auto">{Math.round(convertTemp(hour.temperature_2m, currentWeather.hourly_units.temperature_2m, settings.temp_unit))}&deg;</span>
                </Fragment>)}
            </div>
            <div className="grid row-span-full grid-rows-subgrid grid-cols-[1fr_1fr_2fr] gap-x-2">
                {currentWeather.daily.time.map((date, index) => <Fragment key={date}>
                    <span className="ml-auto opacity-40">{date === DateTime.now().setZone(currentWeather.timezone).toISODate() ? 'Today' : DateTime.fromISO(date, {zone: currentWeather.timezone}).setZone().toFormat('EEE')}</span>
                    <WeatherIcon className="mx-auto" type={currentWeather.daily.weather_code[index]} />
                    <span className="mr-auto">{Math.round(convertTemp(currentWeather.daily.temperature_2m_min[index], currentWeather.daily_units.temperature_2m_min, settings.temp_unit))}&deg; &ndash; {Math.round(convertTemp(currentWeather.daily.temperature_2m_max[index], currentWeather.daily_units.temperature_2m_min, settings.temp_unit))}&deg;</span>
                </Fragment>)}
            </div>
        </div>
        {/*<div className="flex justify-between mt-4">*/}
        {/*    {[0, 1, 2, 3, 45, 51, 61, 71, 80, 85, 95, 100].map(t => <WeatherIcon className="mx-auto" type={t} />)}*/}
        {/*</div>*/}
    </OfflineIndicator>;
}

export default Weather
