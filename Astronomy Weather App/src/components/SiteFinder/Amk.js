import React, { useEffect, useState, useCallback, lazy, useRef } from "react";
import Home from '../assets/home.png'
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, L } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faCalendar } from '@fortawesome/free-solid-svg-icons';
import "./LocationPanel.css";
import LocationList from "./LocationList";
import RadiusSlider from "./RadiusSlider";
import LatitudeSlider from "./LatitudeSlider";
import LongitudeSlider from "./LongitudeSlider";
import Url from '../Route/Url'
import calendar from '../assets/calendar.png'
import logo from "./Logo.png";


const API_KEY = "AIzaSyCJlatvgYxPMzStsBSEuTkY00LsAq6rCvU";

const api = {
  key: "3ad593c6cbfa1278cff9813652a6b926",
  base: "https://api.openweathermap.org/data/2.5/",
};


// Method to fetch location data from a CSV file

const fetchCsvData = async (setCsvData) => {
  try {
    const response = await fetch("./site_coor.csv");
    if (!response.ok) throw new Error("Network response was not ok");

    const text = await response.text();

    const lines = text
      .split("\n")
      .slice(1)
      .map((line) => {
        const [lat, lng] = line.split(",").map(Number);
        return { lat, lng };
      })
      .filter((line) => !isNaN(line.lat) && !isNaN(line.lng));

    setCsvData(lines);
  } catch (error) {
    console.error("Failed to fetch or parse CSV data:", error);
  }
};


// Method to convert an address to geo coordinates using Google maps API
const convertAddressToCoordinates = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${API_KEY}`
    );
    const data = response.data;
    if (!data || data.status === "ZERO_RESULTS") {
      throw new Error("Could not find the location for the specified address");
    }
    return data.results[0].geometry.location;
  } catch (error) {
    console.error("Failed to convert address to coordinates:", error);
    throw error;
  }
};

// Method to calculate the distance between two geo coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const to_Radians = (angle) => (Math.PI / 180) * angle;
  const R = 6371e3;
  const φ1 = to_Radians(lat1);
  const φ2 = to_Radians(lat2);
  const Δφ = to_Radians(lat2 - lat1);
  const Δλ = to_Radians(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Amk = () => {

  // hooks 
  const [csvData, setCsvData] = useState([]);
  const [centerLat, setCenterLat] = useState(51.5074);
  const [centerLon, setCenterLon] = useState(-0.1278);
  const [radius, setRadius] = useState(100);
  const [search, setSearch] = useState("");
  const [loc, setLoc] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [city, setCity] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [locations, setLocations] = useState(csvData);
  
  const radiusMin = 0;
  const radiusMax = 300;
  const radiusStep = 10;
  const latMin = -90;
  const latMax = 90;
  const latStep = 0.01;

  const pageRef = useRef(null)

  useEffect(() => {
    fetchCsvData(setCsvData);
  }, []);

  // Handler for event change 
  const LocationChange = (event) => {
    setSearch(event.target.value);
  };

  const RadiusChange = (event) => {
    setRadius(parseInt(event.target.value, 10));
  };

  const searchPressed = () => {
    try {
      fetch(`${api.base}weather?q=${search}&units=metric&APPID=${api.key}`)
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          setLoc(result.coord);
          setCenterLat(result.coord.lat);
          setCenterLon(result.coord.lon);
        });
    } catch (error) {
      console.error("Error fetching location's data", error);
    }
  };


  // Method to generate starry background
  useEffect(() => {
    const phoneLayout = pageRef.current;
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

  // reverse geocoding from coordinates to city details using google maps api
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const data = response.data;
      console.log("data", data)
      if (data.status === "OK") {
        const address = data.results[0].formatted_address;
        const name = data.results[0].address_components[0].long_name;
        return { address, name };
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Address lookup failed";
    }
  };

  const handleMarkerClick = async (marker) => {
    if (!marker.address) {
      try {
        const { address, name } = await reverseGeocode(marker.lat, marker.lng);
        marker.info = {
          address: address,
          name: name,
        };
        setMarkers((prevMarkers) =>
          prevMarkers.map((m) =>
            m.lat === marker.lat && m.lng === marker.lng
              ? { ...m, address, name }
              : m
          )
        );
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    }
  };

  useEffect(() => {
    displayLocations(csvData, centerLat, centerLon, radius); // Effect hook to display locations whithin a radius
  }, [csvData, centerLat, centerLon]);

// Displays all given locations as markers on a map without filtering by radius.
  const displayLocations = async (locations, centerLat, centerLon, radius) => {
    const withinRadius = []; // Temporary storage for locations
    for (const location of locations) {
      try {
        withinRadius.push(location); // Adds each location to array
      } catch (error) {
        console.error(error); // Error handling
      }
    }
    setMarkers(withinRadius); // Displays locations as markers on the map
  };

  // Fetches weather data for a specific location usign OPW API
  const fetchWeatherDataForLocation = async (location) => {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${api.key}`
    );
    return response;
  };

  // Filters location in a specified radius from a center point and fetches their weather data
  const findLocationsWithinRadius = async (
    locations,
    centerLat,
    centerLon,
    radius
  ) => {
    const withinRadius = [];
    for (const location of locations) {
      try {
        const distance = calculateDistance(
          centerLat,
          centerLon,
          location.lat,
          location.lng
        );
        if (distance <= radius * 1000) {
          const response = await fetchWeatherDataForLocation(location);
          console.log(response)
          location.weatherData = {
            visibility: response.data.visibility,
            clouds: response.data.clouds.all,
            distance: Math.round(distance / 1000),
          };
          location.info = {
            name: response.data.name,
            country: response.data.sys.country,
            sunrise: response.data.sys.sunrise,
            sunset: response.data.sys.sunset,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            wind_speed: response.data.wind.speed,
          };
          withinRadius.push(location);
        }
      } catch (error) {
        console.error(error);
      }
    }

    // sorting of the locations based on visibility, cloud coverage, and distance
    withinRadius.sort((a, b) => {
      if (a.weatherData.visibility === b.weatherData.visibility) {
        if (a.weatherData.clouds === b.weatherData.clouds) {
          return a.weatherData.distance - b.weatherData.distance;
        }
        return a.weatherData.clouds - b.weatherData.clouds;
      }
      return b.weatherData.visibility - a.weatherData.visibility;
    });

    setLocations(withinRadius);
    setMarkers(withinRadius);
  };

  // new custom Icon
  const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [38, 38],
  });

  const userLocationIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/149/149059.png",
    iconSize: [38, 38],
  });

  const handleInputChange = useCallback((event) => {
    setTempValue(event.target.value);
  }, []);

  const handleFormSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSearchValue(tempValue);

      console.log("Form submitted with value:", tempValue);

      if (tempValue) {
        const coordinates = await convertCityToCoordinates(tempValue);
        if (coordinates) {
          setCenterLat(coordinates.lat);
          setCenterLon(coordinates.lng);
          console.log("Coordinates received:", coordinates);
        }
      }
    },
    [tempValue]
  );

  const [tempRadius, setTempRadius] = useState("");

  // handlers
  const handleRadiusChange = (event) => {
    setTempRadius(event.target.value);
  };
  const handleRadiusSubmit = (event) => {
    event.preventDefault();
    setRadius(parseInt(tempRadius, 10));
    console.log("Radius submitted", tempRadius);
  };
  // Converts specified city to coordinate points
  const convertCityToCoordinates = async (city) => {
    try {
      if (!city) {
        console.error("No city provided for conversion to coordinates.");
        return;
      }
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          city
        )}&key=${API_KEY}`
      );

      const data = response.data;
      if (data.status !== "OK") {
        throw new Error("Geocoding Api return an error: " + data.status);
      }

      const location = data.results[0].geometry.location;

      setCenterLat(location.lat);
      setCenterLon(location.lng);

      setCity(location);
    } catch (error) {
      console.error("Error converting city to coordinates", error);
    }
  };
  const handleLocationSelect = (lat, lng) => {
    setCenterLat(lat);
    setCenterLon(lng);
  };

  const [openSections, setOpenSections] = useState({});

  // Helper function to toggle the accordion
  const toggleAccordion = useCallback((sectionKey) => {
    setOpenSections((prevSections) => ({
      ...prevSections,
      [sectionKey]: !prevSections[sectionKey],
    }));
  }, []);

  // Accordion section, showing details on the location
  const AccordionSection = ({ title, children, isOpen, toggle }) => {
    useEffect(() => {
      console.log("section has been re-rendered");
    }, []);

    return (
      <div className="accordion-section">
        <button className="accordion-title" onClick={toggle}>
          {title}
          <span className="accordion-icon">
            {isOpen ? (
              <FontAwesomeIcon icon={faCaretDown} />
            ) : (
              <FontAwesomeIcon icon={faCaretUp} />
            )}
          </span>
        </button>
        {isOpen && <div className="accordion-content">{children}</div>}
      </div>
    );
  };

  // setting bounds for lat and lng
  const lngMax = 180;
  const lngMin = -180;

  return (
    <div className="page" ref={pageRef}>
      <div className="map-description">
      <div className="title"><h1> > Site Finder</h1></div>
        <div className="search-container" id='nav_bar1'>
          <div className="nav"><h1>CALENDAR</h1></div>
          <div className="homepage">
            <img src={logo} alt="" className="logo"/> 
            <h1>GO STARGAZING</h1>
          </div>
        </div>


        <div className="searchbar-container">
        <SearchBar
              value={tempValue}
              onChange={handleInputChange}
              onSubmit={handleFormSubmit}
            />
        </div>
        <div className="container">
          <div className="search-container2">
            <div className="search-filter">
              <div className="accordion-container">
                <AccordionSection
                  title="Location"
                  isOpen={!!openSections["InputCoordinates"]}
                  toggle={() => toggleAccordion("InputCoordinates")}
                >
                  <LatitudeSlider
                    min={latMin}
                    max={latMax}
                    step={latStep}
                    centerLat={centerLat}
                    setCenterLat={setCenterLat}
                  />
                  <br />
                  <hr />
                  <br />
                  <LongitudeSlider
                    min={lngMin}
                    max={lngMax}
                    step={latStep}
                    centerLng={centerLon}
                    setCenterLng={setCenterLon}
                  />
                  <br />
                  <hr />
                  <br />
                  <RadiusSlider
                    min={radiusMin}
                    max={radiusMax}
                    step={radiusStep}
                    radius={radius}
                    setRadius={setRadius}
                  />
                </AccordionSection>
                <AccordionSection
                  title="Nearest Best Boroughs to Stargaze - Details"
                  isOpen={!!openSections["Second Section"]}
                  toggle={() => toggleAccordion("Second Section")}
                >
                {locations.length > 0 ? (
                  locations.slice(0,3).map((location, index) => (
                    <div key={index}>
                      <div className="data-row">
                        <div className="data-label"><strong><p>{index + 1}. Name:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value">{location.info.name}</div>
                      </div>

                      <div className="data-row">
                        <div className="data-label"><strong><p>Country:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value">{location.info.country}</div>
                      </div>


                      <div className="data-row">
                        <div className="data-label"><strong><p>Visibility:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value">{(location.weatherData.visibility * 100) / 10000}%</div>
                      </div>

                      <div className="data-row">
                        <div className="data-label"><strong><p>Clouds:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value">{location.weatherData.clouds}%</div>
                      </div>


                      <div className="data-row">
                        <div className="data-label"><strong><p>Distance:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value">{location.weatherData.distance}km</div>
                      </div>

                      <div className="data-row">
                        <div className="data-label"><strong><p>Sunrise:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value"> {new Date(location.info.sunrise * 1000).toLocaleTimeString()}</div>
                      </div>

                      <div className="data-row">
                        <div className="data-label"><strong><p>Sunset:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value">{new Date(location.info.sunset * 1000).toLocaleTimeString()}</div>
                      </div>

                      <div className="data-row">
                        <div className="data-label"><strong><p>Wind Speed:</p></strong></div>
                        <div className="data-line"></div>
                        <div className="data-value">{location.info.wind_speed} m/s</div>
                      </div>
                      <br />
                    </div>
                  ))
                ) : (
                  <p>No location selected or data available.</p>
                )}
                </AccordionSection>
                <AccordionSection
                  title="10 Nearest Best Stargazing Sites"
                  isOpen={!!openSections["Locations"]}
                  toggle={() => toggleAccordion("Locations")}
                >

                  {locations && locations.length > 0 ? (
                    <LocationList locations={locations} />

                  ) : (
                    <p>No location entered</p>
                  )}
                </AccordionSection>
              </div>
              <button
              onClick={() =>
                findLocationsWithinRadius(csvData, centerLat, centerLon, radius)
              }
            >
              Find Locations
            </button>
            </div>
          </div>
          <MapContainer
            center={[centerLat, centerLon]}
            zoom={6}
            className="map-container"
          >
            <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
            <MarkerClusterGroup chunckedLoading>
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={[marker.lat, marker.lng]}
                  icon={customIcon}
                  eventHandlers={{ click: () => handleMarkerClick(marker) }}
                >
                  <Popup>
                    <p>{marker.name || "Loading name..."}</p>
                    <p>{marker.address || "Loading address..."}</p>
                    <p>Dark Sky Discovery Site</p>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            <Marker position={[centerLat, centerLon]} icon={userLocationIcon}>
              <Popup>
                <p>Your location!</p>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      

      <div className="footer">
      {/* Moves to Finder */}
      <Url imageSrc={Home} navigateTo={"/"}/>
      <Url imageSrc={calendar} navigateTo={"/calendar"}/>
    </div>
    </div>
  );
};

export default Amk;
