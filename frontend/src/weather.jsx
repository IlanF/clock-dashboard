import weatherCodeIcons from "./assets/weather-icons.json";
import {DateTime} from "luxon";
import {useEffect, useState} from 'react';
import Icon from "./components/icon.jsx";
import WeatherIcon from "./components/weather-icon.jsx";

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

    useEffect(() => {
        const timer = setInterval(updateWeather, updateIntervalMinutes * 60 * 1000)
        if(!currentWeather || DateTime.fromISO(currentWeather.current.time, {zone: currentWeather.timezone}).diffNow(currentWeather.current_units.interval) >= currentWeather.current.interval) {
            updateWeather();
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
    }, [currentWeather]);

    if (!currentWeather || !currentWeather.current) {
        return;
    }

    return <>
        <div className="text-7xl">
            <WeatherIcon className="mb-2" size={14} type={currentWeather.current?.weather_code} />
            <span className="inline-block mx-1">{Math.round(convertTemp((currentWeather.current?.temperature_2m || 0), currentWeather.current_units.temperature_2m, settings.temp_unit))}&deg;</span>
        </div>

        <div className="mt-4 flex space-x-8">
            <div>
                {next8hours.map(hour => <div className="flex items-center" key={hour.time.toISOTime()}>
                    <span className="opacity-40 mr-auto">{hour.time.diffNow('hours') < 1 ? 'Now' : hour.time.toLocaleString(DateTime.TIME_24_SIMPLE)}</span>
                    <WeatherIcon className="mx-2 my-0.5" type={hour.weather_code} />
                    <span>{Math.round(convertTemp(hour.temperature_2m, currentWeather.hourly_units.temperature_2m, settings.temp_unit))}&deg;</span>
                </div>)}
            </div>
            <div>
                {currentWeather.daily.time.map((date, index) => <div className="flex items-center" key={date}>
                    <span className="opacity-40 mr-auto">{date === DateTime.now().setZone(currentWeather.timezone).toISODate() ? 'Today' : DateTime.fromISO(date, {zone: currentWeather.timezone}).setZone().toFormat('EEE')}</span>
                    <WeatherIcon className="mx-2 my-0.5" type={currentWeather.daily.weather_code[index]} />
                    <span className="">{Math.round(convertTemp(currentWeather.daily.temperature_2m_min[index], currentWeather.daily_units.temperature_2m_min, settings.temp_unit))}&deg; &ndash; {Math.round(convertTemp(currentWeather.daily.temperature_2m_max[index], currentWeather.daily_units.temperature_2m_min, settings.temp_unit))}&deg;</span>
                </div>)}
            </div>
        </div>
    </>;
}

export default Weather
