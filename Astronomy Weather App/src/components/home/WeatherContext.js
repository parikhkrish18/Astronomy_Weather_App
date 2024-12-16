import {createContext, useState} from 'react'


// WeatherContext to store the weather data
export const WeatherContext = createContext();


// WeatherProvider component to provide the weather data to the app
export const WeatherProvider = ({children}) => {
    const [weather, setWeather] = useState(null);
    const contextValue = {
        weather, setWeather
    }
  
    return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  )
}

export default WeatherContext
