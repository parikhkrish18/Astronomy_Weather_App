import {useEffect, useState, useContext, useRef} from 'react'

// components
import Input from './TransparentInput';
import { WeatherContext } from './WeatherContext'
import CloudCover from './CloudCover'
import Sunset from './Sunset'
import WeatherInfo from './WeatherInfo'

// Routes
import Url from '../Route/Url'


// assets
import fullmoon from '../assets/full-moon.png';
import rain from '../assets/rain.png';
import sun from '../assets/sun.png'
import cloud from '../assets/cloud.png'
import calendar from '../assets/calendar.png'
import clock from '../assets/clock.png'
import witness from '../assets/witness.png'
import snow from '../assets/snow.png'
import search from '../assets/search.png'


// styling
import './homepage.css';

import axios from 'axios';

function Home() {
    const [city, setCity] = useState('London');
    const [coordinates, setCoordinates] = useState({})
    const [cityDetails, setCityDetails] = useState({})
    const [weatherForecast, setWeatherForecast] = useState([])

    const {weather, setWeather} = useContext(WeatherContext);
    const phoneLayoutRef = useRef(null)
        
    // starry background animation
    useEffect(() => {
        const phoneLayout = phoneLayoutRef.current;
        const numberOfStars = 50;
    
        for (let i = 0; i < numberOfStars; i++) {
          let star = document.createElement('div');
          star.className = 'star';
          star.style.top = `${Math.random() * 100}%`;
          star.style.left = `${Math.random() * 100}%`;
          star.style.width = `${Math.random() * 3 + 1}px`;
          star.style.height = star.style.width;
          star.style.animation = `twinkle ${Math.random() * 5 + 5}s linear infinite`;
          phoneLayout.appendChild(star);
        }
      }, []);

    const API_KEY = "3ad593c6cbfa1278cff9813652a6b926";


    // Fetch coordinates for a given city name
    async function fetchCoordinates(cityName) {
        const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        const url = `${baseUrl}?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`;
    
        try {
            const response = await axios.get(url);
            const data = response.data;
            let coords = null;
            
            if (data && data.coord) { 
                coords = { lat: data.coord.lat, lon: data.coord.lon };
            }

        
            setCoordinates(coords);
            console.log(coords)
        } catch (error) {
            console.error('Error fetching coordinates', error);
        }
    }
    
    // Fetch current weather data for a given set of coordinates
    const UppercaseFirstLetters = (sentence) => {
        return sentence
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };


      // Fetch current weather data for a given set of coordinates
    const fetchCurrentWeatherDataForCoordinates = async (location) => {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`
          );

          console.log(response)
    
          const currentWeather = {
            visibility: response.data.visibility,
            weatherMain: response.data.weather[0].main,
            weatherDescription: UppercaseFirstLetters(response.data.weather[0].description),
            temp: Math.round(response.data.main.temp - 273.15),
            tempMin: Math.round(response.data.main.temp_min - 273.15),
            tempMax: Math.round(response.data.main.temp_max - 273.15),
            clouds: response.data.clouds.all,
            current_time: response.data.timezone,
            name: response.data.name
          };

          console.log(currentWeather)
          
          if (response.data.sys) {
            currentWeather.sunrise = response.data.sys.sunrise;
            currentWeather.sunset = response.data.sys.sunset;
          }
          
          if (response.data.rain) {
            currentWeather.rain = response.data.rain['1h'];
          }
    
          setWeather(currentWeather);
        } catch (error) {
          console.error('Error fetching weather data', error);
        }
      };

      // Fetch forecast weather data for a given set of coordinates
      const fetchForecastWeatherDataForCoordinates = async (location) => {
        try {
          const response = await axios.get(
            `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`
          );


          const sunriseD = response.data.city.sunrise * 1000;
          const sunsetD = response.data.city.sunset * 1000;
          
          const forecastData = response.data.list.map((item) => {
            const itemDate = new Date(item.dt_txt);
          
            return {
              dateTime: item.dt_txt,
              temp: Math.round(item.main.temp - 273.15),
              tempMin: Math.round(item.main.temp_min - 273.15),
              tempMax: Math.round(item.main.temp_max - 273.15),
              weatherMain: item.weather[0].main,
              weatherDescription: item.weather[0].description,
              windSpeed: item.wind.speed,
              windDeg: item.wind.deg,
              windGust: item.wind.gust,
              visibility: (item.visibility * 100) / 10000,
              pop: item.pop,
              rain: item.rain ? item.rain['1h'] : null,
              sunset: sunsetD,
              sunrise: sunriseD,
              time_dt: new Date(item.dt_txt),
              time_sun: new Date(sunsetD),
              time_sr: new Date(sunriseD)
            };
          });
    
          setWeatherForecast(forecastData);
        } catch (error) {
          console.error('Error fetching weather data', error);
        }
      };

      // Calculate the time until the next sunrise or sunset
      const closestTo = (sunrise, sunset, datetime) => {
        const sunriseDate = new Date(sunrise);
        const sunsetDate = new Date(sunset);
        const datetimeDate = new Date(datetime);
      
        const timeUntilSunrise = Math.abs(datetimeDate - sunriseDate);
        const timeUntilSunset = Math.abs(sunsetDate - datetimeDate);
      
        // Return the smallest difference in hours and minutes
        const closestTimeInHours = Math.min(timeUntilSunrise, timeUntilSunset) / (1000 * 60 * 60);
      
        const hours = Math.floor(closestTimeInHours);
        const minutes = Math.round((closestTimeInHours - hours) * 60);
      
        return `${hours}hr : ${minutes}min`;
      };
      
    const iconUrls = [
        "https://www.flaticon.com/free-icon/partly-cloudy_9369757",
        "https://www.flaticon.com/free-icon/rain_9369725",
        "https://www.flaticon.com/free-icon/cloud_9369779",
        "https://www.flaticon.com/free-icon/full-moon_9369705",
        "https://www.flaticon.com/free-icon/sun_9369693"
    ]
    
    // Check if the event date is in the future
    function checkDate(eventTime){
        const monthToNumber = {
            "January": "01",
            "February": "02",
            "March": "03",
            "April": "04",
            "May": "05",
            "June": "06",
            "July": "07",
            "August": "08",
            "September": "09",
            "October": "10",
            "November": "11",
            "December": "12"
        };
    
        const currentTime = new Date();
        const formattedMonth = currentTime.getMonth() + 1; 
        const formattedDay = currentTime.getDate();
        
        const eventParts = eventTime.split(' '); 
        const eventMonth = monthToNumber[eventParts[0]];
        const eventDay = parseInt(eventParts[1], 10);
    
        if (parseInt(formattedMonth, 10) > parseInt(eventMonth, 10)) {
            return false;
        } else if (parseInt(formattedMonth, 10) < parseInt(eventMonth, 10)) {
            return true;
        } else {
            if (formattedDay === eventDay) {
                return true;
            } else if (formattedDay > eventDay) {
                return false;
            } else {
                return true;
            }
        }
    }
    
    // Load events from the API
    async function loadEvents() {    
        try {
            const url = 'https://astronomy-calendar.p.rapidapi.com/events.php?year=2024';
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '35049d77a6msh3b3d08fc049b981p16593ajsneabb789048ae',
                    'X-RapidAPI-Host': 'astronomy-calendar.p.rapidapi.com'
                }
            };
            const response = await fetch(url, options);
            if (!response.ok){
                throw new Error("Could not fetch resource");
            }
            const data = await response.json();
            let weekly_events_image = [];
            let images = document.getElementsByClassName("image");
            let titles = document.getElementsByClassName("title");
            let dates = document.getElementsByClassName("date");
            let counterim = 0;
    
            for (const event of data) {
                let is_upcoming_event = false;
                let event_details = {};
                
                for (const [key, value] of Object.entries(event)) {
                    if (key === "date" && await checkDate(value)) {
                        is_upcoming_event = true;
                    }
                    event_details[key] = value;
                    if (key === "image") {
                        weekly_events_image.push(value);
                    }
                }
                const eventsContainer = document.getElementById("eventsContainer");
    
                if (is_upcoming_event) {
                    const eventDiv = document.createElement("div");
                    eventDiv.className = "event";
                    
                    const imageSrc = event.image ? event.image : "";
                    const date = event.date ? event.date : "No Date Provided";
    
                    const titleElement = document.createElement("h3");
                    eventDiv.appendChild(titleElement);
    
                    if (imageSrc) {
                        const imageElement = document.createElement("img");
                        imageElement.src = imageSrc;
                        eventDiv.appendChild(imageElement);
                    }
    
                    const dateElement = document.createElement("p");
                    dateElement.textContent = `${date}`;
                    eventDiv.appendChild(dateElement);
    
                    eventsContainer.appendChild(eventDiv);
                }
            }
        } catch (error) {
            console.error("Failed to load events:", error);
        }
    }


    const handleCityChange = (event) => {
        // Update the city state with the new value from the input
        setCity(event.target.value);
      };
      
    useEffect(() => {
        fetchCoordinates(city)

    }, [city])

    useEffect(() => {
        console.log(weather)
    }, [weather])

    useEffect(() => {
        console.log(weatherForecast)
    }, [weatherForecast])

    useEffect(() => {
        if (coordinates.lat && coordinates.lon){
            fetchCurrentWeatherDataForCoordinates(coordinates)
            fetchForecastWeatherDataForCoordinates(coordinates)
        }
    },[coordinates.lat, coordinates.lon])

    const handleCitySubmit = (newCity) => {
        setCity(newCity);
        fetchCoordinates(newCity)
    }

    useEffect(() => {
        loadEvents()
    },[])


return (
    <div className="phone-layout">
    <div className="wrapper">


    <div className="city-details-container">
            <div className="city-name">

            </div>
            <div className="weather-info" ref={phoneLayoutRef}>
                {weather != null ? (
                <>
                    <div className="location input-container">
                        <Input value={city} onChange={handleCityChange} onSubmit={handleCitySubmit} className="input" placeholder="Istanbul" />
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
                </>
                ) : (
                <div>Loading cloud cover...</div> // or render nothing
                )}
            </div>
            <div className="forecast-visibility">
                <img src={witness} alt="" className='calendar-logo'/>
                <p className='relative'>Visibility</p>
            </div>
            <div className="forecast-title">
                <img src={clock} alt="" className='calendar-logo'/>
                <p className='relative'>Hourly Forecast</p>
            </div>

            <div className="scrollable-div">
                <div className="inner-content forecast-container">
                <table>
                    <tbody>
                        <tr>
                        {weatherForecast.map((item, index) => (
                            <td key={index}>{item.dateTime.split(' ')[1].split(':')[0]}</td>
                        ))}
                        </tr>
                        <tr>
                        {weatherForecast.map((item, index) => (
                            <td key={index}>
                            {item.weatherMain === 'Rain' ? (
                                <img src={rain} alt="Rain" className='weatherIcon'/>
                            ) : item.weatherMain === 'Clouds' ? (
                                <img src={cloud} alt="Clouds" className='weatherIcon'/>
                            ) : (item.weatherMain === 'Clear' && item.time_dt.getTime() >= item.time_sr.getTime() && item.time_dt.getTime() < item.time_sun.getTime()) ? (
                                <img src={sun} alt="Clear Day" className='weatherIcon'/>
                            ) : (item.weatherMain === 'Clear') ? (
                                <img src={fullmoon} alt="Clear Night" className='weatherIcon' />
                            ) : (item.weatherMain === 'Snow') ? (
                                <img src={snow} alt="Snow" className='weatherIcon' />
                            ) : null}
                            </td>
                        ))}
                        </tr>
                        <tr>
                        {weatherForecast.map((item, index) => (
                            <td key={index}>{item.temp}°C</td>
                        ))}
                        </tr>
                        <tr>
                        {weatherForecast.map((item, index) => (
                            <td key={index} className='visibility'>{item.visibility}%</td>
                        ))}
                        </tr>
                    </tbody>
                    </table>
                </div>
            </div>


            <div className="metrics">
            {weather != null ? (
                <CloudCover percentage={weather.clouds} desc={weather.weatherDescription} />
            ) : (
                <div>Loading cloud cover...</div>
            )}
            {weather != null && weather!= null ? (
                <Sunset sunriseUnix={weather.sunrise} sunsetUnix={weather.sunset} timezone={weather.current_time} />
            ) : (
                <div>Loading sunset and sunrise times...</div>
            )}
            </div>

            <div className="scrollable-div">
                <div className="calendar-desc">
                            <img src={calendar} alt="" className='calendar-logo' />
                            <p className='calendar-title'> Calendar</p>
                        </div>
                <div id="eventsContainer" className="inner-content forecast-container">
                </div>
            </div>
        </div>
        <br />
        <div className="footer">
    {/* Moves to Finder */}
    {/* <h1>Header</h1> */}
    <Url imageSrc={search} navigateTo={"Finder"}/>
    <Url imageSrc={calendar} navigateTo={"Calendar"}/>
  </div>
    </div>

</div>
  )
}
 
export default Home;
