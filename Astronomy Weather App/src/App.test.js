// import { render, screen } from '@testing-library/react';
// import React, { useState, useEffect} from 'react';
// import App from './App';


// function EventDisplay() {
//     const [events, setEvents] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//   }


// function checkDate(eventTime){
//   const monthToNumber = {
//       "January": "01",
//       "February": "02",
//       "March": "03",
//       "April": "04",
//       "May": "05",
//       "June": "06",
//       "July": "07",
//       "August": "08",
//       "September": "09",
//       "October": "10",
//       "November": "11",
//       "December": "12"
//   };

//   const currentTime = new Date();
//   const formattedMonth = currentTime.getMonth() + 1; 
//   const formattedDay = currentTime.getDate();
  
//   const eventParts = eventTime.split(' '); 
//   const eventMonth = monthToNumber[eventParts[0]];
//   const eventDay = parseInt(eventParts[1], 10);

//   if (parseInt(formattedMonth, 10) > parseInt(eventMonth, 10)) {
//       return false;
//   } else if (parseInt(formattedMonth, 10) < parseInt(eventMonth, 10)) {
//       return true;
//   } else {
//       if (formattedDay == eventDay) {
//           return true;
//       } else if (formattedDay > eventDay) {
//           return false;
//       } else {
//           return true;
//       }
//   }
// }


// async function loadEvents() {    
//   try {
//       const url = 'https://astronomy-calendar.p.rapidapi.com/events.php?year=2024';
//       const options = {
//           method: 'GET',
//           headers: {
//               'X-RapidAPI-Key': '35049d77a6msh3b3d08fc049b981p16593ajsneabb789048ae',
//               'X-RapidAPI-Host': 'astronomy-calendar.p.rapidapi.com'
//           }
//       };
//       const response = await fetch(url, options);
//       if (!response.ok){
//           throw new Error("Could not fetch resource");
//       }
//       const data = await response.json();
//       let weekly_events_image = [];
//       let images = document.getElementsByClassName("image");
//       let titles = document.getElementsByClassName("title");
//       let dates = document.getElementsByClassName("date");
//       let counterim = 0;

//       for (const event of data) {
//           let is_upcoming_event = false;
//           let event_details = {};
          
//           for (const [key, value] of Object.entries(event)) {
//               if (key === "date" && await checkDate(value)) {
//                   is_upcoming_event = true;
//               }
//               event_details[key] = value;
//               if (key === "image") {
//                   weekly_events_image.push(value);
//               }
//           }

//           if (is_upcoming_event) {
//               console.log("Upcoming Event Details:");
//               for (const [key, value] of Object.entries(event_details)) {
//                   console.log(`${key}: ${value}`);
//                   if (key === "title") {
//                       titles[counterim].textContent = value;
//                   }
//                   if (key === "image") {
//                       images[counterim].src = value;
//                   }
//                   if (key === "date"){
//                       dates[counterim].textContent = value;
//                   }
//               }
//               counterim++;
//           }
//       }
//   } catch (error) {
//       console.error("Failed to load events:", error);
//   }
// }

