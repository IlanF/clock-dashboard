import {DateTime} from "luxon";
import {useEffect, useState} from 'react';

const updateIntervalMinutes = 15;
const weatherFields = {
    // https://open-meteo.com/en/docs#current=temperature_2m,apparent_temperature,is_day,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset
    daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset'],
    current: ['temperature_2m', 'apparent_temperature', 'is_day', 'weather_code'],
    hourly: ['temperature_2m', 'weather_code'],
};

export const convertTemp = (temp, fromUnit, toUnit) => {
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

const useWeather = (settings) => {
    const updateWeather = async () => {
        if (!settings.lat || !settings.lon) {
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
        if (!currentWeather) {
            updateWeather();
            return;
        }

        const oldLat = parseFloat(currentWeather.latitude)
        const oldLon = parseFloat(currentWeather.longitude)
        const newLat = parseFloat(settings.lat)
        const newLon = parseFloat(settings.lon)

        if (Math.abs(newLat - oldLat) >= 0.01 || Math.abs(newLon - oldLon) >= 0.01) {
            updateWeather();
            return;
        }

        const diffNow = DateTime.fromISO(currentWeather.current.time, {zone: currentWeather.timezone}).diffNow(currentWeather.current_units.interval);
        if (diffNow < 0 || diffNow >= currentWeather.current.interval) {
            updateWeather();
            return;
        }

        if (currentWeather) {
            const timeLeft = DateTime.fromISO(currentWeather.current.time, {zone: currentWeather.timezone}).plus({[currentWeather.current_units.interval]: currentWeather.current.interval}).diffNow(currentWeather.current_units.interval);
            if (timeLeft > 0) {
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
        for (let i = nowIndex; i < nowIndex + 8; i++) {
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

    return {currentWeather, next8hours, sunrise, sunset};
}

export default useWeather;
