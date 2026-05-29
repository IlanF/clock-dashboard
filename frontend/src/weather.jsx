import {DateTime} from "luxon";
import {Fragment} from 'react';
import WeatherIcon from "./components/weather-icon.jsx";
import {Sunrise, Sunset} from "lucide-react";
import OfflineIndicator from "./components/offline-indicator.jsx";
import {convertTemp} from "./useWeather.js";

export const CurrentConditions = ({settings, currentWeather, sunrise, sunset}) => {
    if (!currentWeather || !currentWeather.current) {
        return null;
    }

    return <OfflineIndicator>
        <div className="flex flex-col items-end">
            <div className="text-[6.5rem] leading-none flex items-center">
                <WeatherIcon className="" size={18} type={currentWeather.current?.weather_code}/>
                <span className="inline-block ml-3">{Math.round(convertTemp((currentWeather.current?.temperature_2m || 0), currentWeather.current_units.temperature_2m, settings.temp_unit))}&deg;</span>
            </div>
            <div className="mt-3 flex gap-x-5 text-base text-slate-300 opacity-80">
                <span>
                    <Sunrise size="1.4em" className="me-1 -mt-1"/>
                    {sunrise.replace(/([AP]M)/, ' $1')}
                </span>
                <span>
                    <Sunset size="1.4em" className="me-1 -mt-1"/>
                    {sunset.replace(/([AP]M)/, ' $1')}
                </span>
            </div>
        </div>
    </OfflineIndicator>;
}

export const HourlyForecast = ({settings, currentWeather, next8hours}) => {
    if (!currentWeather || !currentWeather.hourly || next8hours.length <= 0) {
        return null;
    }

    return <OfflineIndicator>
        <div className="flex justify-between gap-x-2">
            {next8hours.map(hour => <div key={hour.time.toISOTime()} className="flex flex-col items-center gap-y-1">
                <span className="text-sm font-semibold text-slate-400">{hour.time.diffNow('hours') < 1 ? 'Now' : hour.time.toLocaleString(DateTime.TIME_24_SIMPLE)}</span>
                <WeatherIcon type={hour.weather_code}/>
                <span>{Math.round(convertTemp(hour.temperature_2m, currentWeather.hourly_units.temperature_2m, settings.temp_unit))}&deg;</span>
            </div>)}
        </div>
    </OfflineIndicator>;
}

export const DailyForecast = ({settings, currentWeather}) => {
    if (!currentWeather || !currentWeather.daily) {
        return null;
    }

    return <OfflineIndicator>
        <div className="flex justify-between gap-x-2">
            {currentWeather.daily.time.map((date, index) => <div key={date} className="flex flex-col items-center gap-y-1">
                <span className="text-sm font-semibold text-slate-400">{date === DateTime.now().setZone(currentWeather.timezone).toISODate() ? 'Today' : DateTime.fromISO(date, {zone: currentWeather.timezone}).setZone().toFormat('EEE')}</span>
                <WeatherIcon type={currentWeather.daily.weather_code[index]}/>
                <span className="text-sm whitespace-nowrap">{Math.round(convertTemp(currentWeather.daily.temperature_2m_min[index], currentWeather.daily_units.temperature_2m_min, settings.temp_unit))}&deg; &ndash; {Math.round(convertTemp(currentWeather.daily.temperature_2m_max[index], currentWeather.daily_units.temperature_2m_min, settings.temp_unit))}&deg;</span>
            </div>)}
        </div>
    </OfflineIndicator>;
}
