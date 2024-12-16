import React from 'react'
import './CloudCover.css'
import cloud from '../assets/cloud.png'

// CloudCover component to display the cloud cover percentage and description
function CloudCover({percentage, desc}) {
  const UppercaseFirstLetters = (sentence) => {
    return sentence
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const processedDesc = UppercaseFirstLetters(desc);

  const indicatorWidth = 10;
  const indicatorLeft = `calc(${percentage}% - ${indicatorWidth / 2}px)`;

  // Return the CloudCover component
  return (
    <div className="cloud-wrapper">
      <div className="title">
        <img src={cloud} alt="" className='cloud-cover-image'/>
        <h3>Cloud Cover</h3>
      </div>
      <div className="percentage">{percentage}%</div>
      <div className="description" id="desc">{processedDesc}</div>
      <div className="cloud-container">
        <div className="cloud-indicator" style={{left: indicatorLeft}}></div>      
      </div>
    </div>
  )
}

export default CloudCover
