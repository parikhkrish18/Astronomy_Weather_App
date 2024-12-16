import React from 'react';
import './WeatherInfo.css';

function WeatherInfo({ weather }) {
  return (
    <div className="weather-info">
      <div className="location">
        {weather.name}
      </div>
      <div className="temperature">
        {Math.round(weather.temp)}°
      </div>
      <div className="weather-description">
        {weather.weatherDescription}
      </div>
      <div className="temperature-range">
        Max: {Math.round(weather.tempMax)}°  Min: {Math.round(weather.tempMin)}°
      </div>
    </div>
  );
}

export default WeatherInfo;
