import PropTypes from "prop-types";
import colors from 'tailwindcss/colors';
import {
  Sun,
  CloudSun,
  Cloudy,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CircleHelp,
  CloudFog
} from 'lucide-react';

const WeatherIcon = ({size, type, ...props}) => {
  size = (size ? (size / 4) * 16 : 1.5 * 16);

  //*:            WMO Weather interpretation codes (WW)
  //**:           Code Description
  switch(type) {
    //0:            Clear sky
    case 0:
      return <Sun size={size} {...props} />

    //1, 2, 3:      Mainly clear, partly cloudy, and overcast
    case 1:
      return <Sun size={size} {...props} />
    case 2:
      return <CloudSun size={size} {...props} />
    case 3:
      return <Cloudy size={size} {...props} />

    //45, 48:       Fog and depositing rime fog
    case 45:
    case 48:
      return <CloudFog size={size} {...props} />

    //51, 53, 55:   Drizzle: Light, moderate, and dense intensity
    case 51:
    case 53:
    case 55:
    //56, 57:       Freezing Drizzle: Light and dense intensity
    case 56:
    case 57:
      return <CloudDrizzle size={size} {...props} />

    //61, 63, 65:   Rain: Slight, moderate and heavy intensity
    case 61:
    case 63:
    case 65:
    //66, 67:       Freezing Rain: Light and heavy intensity
    case 66:
    case 67:
      return <CloudRain size={size} {...props} />

    //71, 73, 75:   Snow fall: Slight, moderate, and heavy intensity
    case 71:
    case 73:
    case 75:
    //77:           Snow grains
    case 77:
      return <CloudSnow size={size} {...props} />

    //80, 81, 82:   Rain showers: Slight, moderate, and violent
    case 80:
    case 81:
    case 82:
      return <CloudRain size={size} {...props} />

    //85, 86:       Snow showers slight and heavy
    case 85:
    case 86:
      return <CloudSnow size={size} {...props} />

    //***:          (*) Thunderstorm forecast with hail is only available in Central Europe
    //95:           * Thunderstorm: Slight or moderate
    case 95:
    //96, 99:       * Thunderstorm with slight and heavy hail
    case 96:
    case 99:
      return <CloudLightning size={size} {...props} />

    default:
      return <CircleHelp color={colors.slate['500']} size={size} {...props} />
  }
};

WeatherIcon.propTypes = {
    size: PropTypes.number,
    type: PropTypes.number.isRequired,
};

export default WeatherIcon;