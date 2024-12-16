import {useEffect, useState} from 'react'


// components
import Input from './TransparentInput';

// styling
import './homepage.css';

function Homepage() {
    
    // Going to need to fetch weather data from the api
    // show darkness, cloud cover, with slider, sunset
    
    // background gonna change based on the weather description
    // cloudy clouds, clear with stars, precipitation with rain
    
    // Calendar
    // gonna have a widget that show the incoming events, maybe the moon phases

    // Not responsive
    // Should show city, temperature, desc, max temp, min temp, darkness, cloud cover

    const [city, setCity] = useState('Istanbul');


return (
    <div>
        <div className="wrapper">
            <div className="city-details-container">
                <div className="city-name">
                    <Input value={city} setValue={setCity}/>
                </div>
            </div>
        </div>
      
    </div>
  )
}

export default Homepage;
