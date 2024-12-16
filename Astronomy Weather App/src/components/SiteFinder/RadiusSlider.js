import React, { useState } from 'react';

// Radius slider component to allow the users to select a radius value within a specific range

const RadiusSlider = ({ min, max, step, setRadius, radius}) => {

  const handleSliderChange = (e) => {
    setRadius(e.target.value);
  };

  const handleInputChange = (e) => {
    const value = Math.max(min, Math.min(max, Number(e.target.value))); // Ensure the value is within the range
    setRadius(value);
  };

  return (
    <div className="radius-slider-container">
        <label> Radius</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={radius}
        onChange={handleSliderChange}
        className="slider"
      />
      <input
        type="number"
        value={radius}
        onChange={handleInputChange}
        className="radius-input"
      />
    </div>
  );
};

export default RadiusSlider;
