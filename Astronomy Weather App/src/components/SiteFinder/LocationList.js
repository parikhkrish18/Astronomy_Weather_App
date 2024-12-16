// import react, the slider component from 'react-slick', stylesheets, carousel from 'nuka-carousel'

import React from 'react';
import "./LocationList.css";
import Carousel from "nuka-carousel"
import axios from "axios";

const API_KEY = "AIzaSyCJlatvgYxPMzStsBSEuTkY00LsAq6rCvU";


// LocationsSlider component to display a slider of locations with weather data
class LocationsSlider extends React.Component {
  
  // component state holding location addresses
  state = {
    locationAddresses: {} 
  };

  // on mount, reverse geocode the locations to get their addresses
  componentDidMount(){
    this.reverseGeocodeLocations();
  }

  // handles location click
  handleLocationClick = (lat, lng) => {
    this.props.onLocationSelect(lat, lng);
  }

  // fetches addresses for each loc via reverse geocoding and updates the state
  reverseGeocodeLocations = async () => {
    const { locations } = this.props; // gets locations as a prop
    const locationAddresses = {};
  
    const promises = locations.map((location) => { // creates and awaits the promises to reverse geocode all locations
      const { lat, lng } = location;
      return this.reverseGeocode(lat, lng).then(({ address }) => {
        locationAddresses[`${lat},${lng}`] = address;
      });
    });
  
    await Promise.all(promises);
    this.setState({ locationAddresses }); // update state with addresses
  };
  
  // geocoding for a single location
  reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const data = response.data;
      if (data.status === "OK") {
        const address = data.results[0].formatted_address;
        return { address };
      } else {
        return { address: "Address not found" };
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return { address: "Address lookup failed" };
    }
  };
  
  // renders the locations slider with addresses and weather data
  render() {
    const { locations } = this.props;
    const {locationAddresses} = this.state;

    // helper method to split the locations into specified bits
    const chunkArray = (array, size) => {
      const chunkedArray = [];
      for (let i = 0; i < array.length; i += size) {
        chunkedArray.push(array.slice(i, i + size));
      }
      return chunkedArray;
    };

    const selectedLocations = locations.slice(0, 10); // limiting the number of displayed locations to 10
    const locationGroups = chunkArray(selectedLocations, 2); // 10/2 = 2 per page
    return (
      <div className="sl-locations-container">
        <Carousel adaptiveHeight={true} className="sl-carousel">
          {locationGroups.map((group, pageIndex) => (
            <div key={pageIndex} className={`sl-carousel_page${pageIndex + 1}`}>
              {group.map((location, locationIndex) => {
                const addressKey = `${location.lat},${location.lng}`;
                const address = locationAddresses[addressKey];
                const locationDisplayIndex = pageIndex * group.length + locationIndex + 1;
                return (
                  <div 
                    key={locationIndex} 
                    className="sl-location">
                    <h3>{locationDisplayIndex}. {address}</h3>                  
                    <p>Distance: {location.weatherData.distance} km</p>
                    <p>Visibility: {location.weatherData ? (location.weatherData.visibility * 100) / 10000 : 'N/A'}%</p>
                    <p>Clouds: {location.weatherData ? location.weatherData.clouds : 'N/A'}%</p>
                  </div>
                );
              })}
            </div>
          ))}
        </Carousel>
      </div>
    );
  }
}

export default LocationsSlider;
