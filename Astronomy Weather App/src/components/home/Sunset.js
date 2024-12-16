import React, {useEffect, useState} from 'react'
import './Sunset.css'
import sunrise from '../assets/sunrise.png'
import sunset from '../assets/sunset.png'


// Sunset component to display the time until sunset or sunrise
function Sunset({sunriseUnix, sunsetUnix, timezone}) {

    const sunriseDate = new Date(sunriseUnix * 1000)
    const [weatherState, setWeatherState] = useState('sunset')
    const [currTime, setTime] = useState(timezone)
    const [timeUntilSunrise, setTimeUntilSunrise] = useState(1)
    const [timeUntilSunset, setTimeUntilSunset] = useState(1)
    const sunsetDate = new Date(sunsetUnix * 1000)
    const [circleX, setCircleX] = useState(0)
    const [circleY, setCircleY] = useState(0)

    const svgWidth = 150;
    const svgHeight = 100;

    // Bezier curve path for the sun's movement
    const sunPathD = "M0,150 C100,50 300,50 400,150";
    

    // Calculate the position of the sun based on the current time
    function calculateBezierPoint(t, start, cp1, cp2, end) {

        // formula B(t) = (1-t)3P0 + 3(1-t)2tP1 + 3(1-t)t2P2 + t3P3, link for reference: https://www.gamedeveloper.com/business/how-to-work-with-bezier-curve-in-games-with-unity
        const x = Math.pow(1-t, 3)*start.x+3*Math.pow(1-t, 2)*t*cp1.x+3*(1-t)*t*t*cp2.x+t*t*t*end.x;
        const y = Math.pow(1-t, 3)*start.y+3*Math.pow(1-t, 2)*t*cp1.y+3*(1-t)*t*t*cp2.y+t*t*t*end.y;
        return { x, y };
      }
      
      const start = { x: 0, y: 150 };
      const cp1 = { x: 100, y: 50 }; // control points of the bezier curve
      const cp2 = { x: 300, y: 50 };
      const end = { x: 400, y: 150 };



      function convertMsToHoursMinutes(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
      
        return { hours, minutes };
      }
      

      // Update the position of the sun based on the current time
      function updateSunPosition() {
        const timezoneOffsetInSeconds = timezone;
        const localDate = new Date();
        const localTime = localDate.getTime();
        const localOffset = localDate.getTimezoneOffset() * 60000;
        const utc = localTime + localOffset; 
        const timezoneDate = new Date(utc + (timezoneOffsetInSeconds * 1000));

        const currentTime = timezoneDate

        let timeUntilSunrise = sunriseDate - currentTime;
        let timeUntilSunset = sunsetDate - currentTime;
        
        timeUntilSunrise = Math.abs(timeUntilSunrise)
        timeUntilSunset = Math.abs(timeUntilSunset)

        setTimeUntilSunset(convertMsToHoursMinutes(timeUntilSunset))
        setTimeUntilSunrise(convertMsToHoursMinutes(timeUntilSunrise))
          
        // Calculate the start of the day (midnight) in milliseconds
        const startOfDay = new Date(new Date(currentTime).setHours(0, 0, 0, 0)).getTime() 
        let dayProgress = (currentTime - startOfDay) / (24 * 60 * 60 * 1000); // Calculate day progress as a fraction of the 24-hour day
        const sunPosition = calculateBezierPoint(dayProgress, start, cp1, cp2, end);
        return { x: sunPosition.x, y: sunPosition.y };
      }
      
      useEffect(() => {
        const { x, y } = updateSunPosition();
        setCircleX(x);
        setCircleY(y);
      }, [timezone, circleX, circleY]);
  

      // Update the weather state based on the current time
    useEffect(() => {
        let desc;
        const timezoneOffsetInSeconds = timezone;
        const localDate = new Date();
        const localTime = localDate.getTime();
        const localOffset = localDate.getTimezoneOffset() * 60000;
        const utc = localTime + localOffset; 
        const timezoneDate = new Date(utc + (timezoneOffsetInSeconds * 1000));

        const currentDate = timezoneDate
        if (currentDate >= sunriseDate && currentDate < sunsetDate) {
            desc = 'Before Sunset';
            setWeatherState("Sunset");
        } else {
            desc = `Sunrise at ${formatTime(sunriseDate)}`;
            setWeatherState("Sunrise");
        }

        console.log("time",timeUntilSunrise.hours, timeUntilSunrise.minutes)

    }, [sunriseUnix, sunsetUnix]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Return the Sunset component
    return (
      <div className="app-sunset-wrapper">
        <div className="app-title">
          {weatherState === 'Sunset' ? (
            <img src={sunset} alt="" className='app-sunset-image'/>
          ) : (
            <img src={sunrise} alt="" className='app-sunset-image' />
          )}
          <h3>{weatherState}</h3>
        </div>
        <div className="app-description">
          {weatherState === 'Sunset' ? (
            <p className='app-desc'>Time until Sunset {timeUntilSunset.hours}h {timeUntilSunset.minutes}m</p>
          ) : (
            <p className='app-desc'>Time until Sunrise {timeUntilSunrise.hours}h {timeUntilSunrise.minutes}m</p> 
          )}
        </div>
        <div className="app-svg">
          <svg width={svgWidth} height={svgHeight} viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
            <path d={sunPathD} stroke="white" strokeWidth="5" fill="none"/>
            <circle cx={circleX} cy={circleY} r="10" fill="orange" />
          </svg>
        </div>
        <div className="app-description"></div>
      </div>
  )
}

export default Sunset
