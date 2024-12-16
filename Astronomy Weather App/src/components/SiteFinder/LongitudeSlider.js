import React, { useState } from 'react';

// Longitude slider component to allow the users to select a lng value within a specific range
const LongitudeSlider = ({ min, max, step, setCenterLng, centerLng}) => {

  const handleSliderChange = (e) => {
    setCenterLng(e.target.value);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = Math.max(min, Math.min(max, Number(e.target.value)));
    setCenterLng(value);
  };

  return (
    <div className="longitude-slider-container">
      <label htmlFor="longitude-slider" className="slider-label">Latitude:</label>
      <input
        id="longitude-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={centerLng}
        onChange={handleSliderChange}
        className="slider"
      />
      <input
        type="number"
        value={centerLng}
        onChange={handleInputChange}
        className="number-input"
      />
    </div>
  );
};

export default LongitudeSlider;
