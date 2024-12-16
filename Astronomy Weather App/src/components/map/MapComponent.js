/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet'
import { initializeMap, addMarkersToClusterGroup, calculateDistance, displayLocationsOnMap} from '../../utils/mapUtils';
import useFetchCsvData from '../../hooks/useFetchCsvData';
import useConvertCityToCoordinates from '../../hooks/useConvertAddressToCoordinates';
import axios from 'axios';


const OPEN_WEATHER_MAP_API_KEY = '3ad593c6cbfa1278cff9813652a6b926';


// MapComponent to display a map with locations
const MapComponent = ({options = {} }) => {
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [center, setCenter] = useState({ lat: 51.4718528, lng: -1.8307164 });
  const [radius, setRadius] = useState(20);
  const [userRadius, setUserRadius] = useState(30);
  const [city, setCity] = useState('')
  const [coordinates, setCoordinates] = useState(null)
  const [markers, setMarkers] = useState([])

  // Function to convert city name to coordinates
  const geocode = async(cityName) => {
      setCoordinates(null)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${"AIzaSyCJlatvgYxPMzStsBSEuTkY00LsAq6rCvU"}`

      try {
          if (!cityName){
              console.error("No city provided for conversion to coordinates.")
              return
          }

          const response = await axios.get(url)
          const data = response.data
          if (data.status !== "OK"){
              throw new Error("Geocoding API", data.status)
          }

          const location = data.results[0].geometry.location
          setCoordinates({lat: location.lat, lng: location.lng})
      } catch(error){
          console.error(error)
      }
  };

  const defaultIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [48, 48],
  });


  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault()
    const coord = await geocode(city)
    if (coord) {
        setCenter(coord)
        setRadius()
        console.log('pos changed',center)
        setCoordinates(coord)
        console.log('pos changed',coord)
    } else {
        // Handle the case where geocode does not return coordinates
    }
}

  const {csvData, loading, error } = useFetchCsvData('site_coor.csv');
  const [locationsProp, setLocationsProp] = useState([]);

  useEffect(() => {
    if (!loading && csvData.length > 0) {
      setLocationsProp(csvData);
    }
  }, [csvData, loading]);
  
  
  // Function to fetch weather data for a location
  const fetchWeatherDataForLocation = async (location) => {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${OPEN_WEATHER_MAP_API_KEY}`
    );
    return response;
  };


  // Function to find locations within a given radius
  const findLocationsWithinRadius = useCallback(async () => {
    console.log(locationsProp)
    const withinRadius = (await Promise.all(locationsProp.map(async (location) => {
      const distance = calculateDistance(center.lat, center.lng, location.lat, location.lng);
      if (distance <= radius * 1000) {
        try {
          const response = await fetchWeatherDataForLocation(location);
          console.log('API response for location', location, ':', response);
          return {
            ...location,
            weatherData: {
              visibility: response.data.visibility,
              clouds: response.data.clouds.all,
              distance: Math.round(distance / 1000),
            },
            name: response.data[0].formatted_address,
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      }
      return null;
    }))).filter(loc => loc !== null);

    // Sort locations by visibility, clouds, and distance
    withinRadius.sort((a, b) => {
        if (a.weatherData.visibility === b.weatherData.visibility) {
          if (a.weatherData.clouds === b.weatherData.clouds) {
            return a.weatherData.distance - b.weatherData.distance;
          }
          return a.weatherData.clouds - b.weatherData.clouds;
        }
        return b.weatherData.visibility - a.weatherData.visibility;
      });
    
      if (JSON.stringify(withinRadius) !== JSON.stringify(filteredLocations)) {
        setFilteredLocations(withinRadius);
      }
    }, [locationsProp, center, radius, filteredLocations]);



  useEffect(() => {
  
    if (mapContainerRef.current && !mapInstance) {
      console.log('Initializing map');
      const instance = initializeMap(mapContainerRef.current, options);
      setMapInstance(instance);
      console.log('Map instance created:', instance);
    }
  
    return () => {
      if (mapInstance) {
        console.log('Removing map');
        mapInstance.remove();
      }
    };
  }, []); 

  // Add markers to the map when the map instance is available
  useEffect(() => {
    console.log("Filtered locations:", filteredLocations);
    if (mapInstance) {
      console.log('Adding markers to map:', filteredLocations);
      addMarkersToClusterGroup(mapInstance, locationsProp, { icon: defaultIcon, title: 'Location' });
    }
  }, [mapInstance, locationsProp]);

  // Find locations within the radius when the center or radius changes
  useEffect(() => {
    console.log("Calling findLocationsWithinRadius from useEffect");
    findLocationsWithinRadius();
  }, [center, radius, locationsProp]);


  // Add markers to the map when the map instance is available
  useEffect(() => {
    if (mapInstance) {
      // Clear existing markers before adding new ones
      // Add only the filtered markers to the map
      addMarkersToClusterGroup(mapInstance, filteredLocations, { icon: defaultIcon, title: 'Location' });
    }
  }, [mapInstance, filteredLocations]);

  useEffect(() => {
    console.log('Center updated:', center);
  }, [center]);
  
  // Return the MapComponent
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          disabled={loading}
        />
        <input
          type="number"
          value={userRadius}
          onChange={(e) => setUserRadius(e.target.value)}
          placeholder="Radius in km"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Find Locations</button>
      </form>
      {coordinates && <p>Coordinates: {coordinates.lat}, {coordinates.lng}</p>}
      {<div ref={mapContainerRef} style={{ height: '400px', width: '100%' }} />}
    </div>
  );
};


export default MapComponent;
