import React, { useState } from 'react';


// Latitude slider component to allow the users to select a lat value within a specific range
const LatitudeSlider = ({ min, max, step, setCenterLat, centerLat}) => {

  const handleSliderChange = (e) => {
    setCenterLat(e.target.value);
  };

  const handleInputChange = (e) => {
    const value = Math.max(min, Math.min(max, Number(e.target.value))); // Ensures the value is within the range
    setCenterLat(value);
  };

  return (
    <div className="latitude-slider-container">
      <label htmlFor="latitude-slider" className="slider-label">Latitude:</label>
      <input
        id="latitude-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={centerLat}
        onChange={handleSliderChange}
        className="slider"
      />
      <input
        type="number"
        value={centerLat}
        onChange={handleInputChange}
        className="number-input"
      />
    </div>
  );
};

export default LatitudeSlider;
