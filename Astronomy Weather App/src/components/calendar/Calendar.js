import React, { useState, useEffect, useRef} from 'react';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Url from '../Route/Url'
import search from '../assets/search.png'
import home from '../assets/home.png'


// Main Calendar component responsible for displaying a date picker, fetching astronomical event data
// and showing events for the selected date

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [astroData, setAstroData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const pageRef = useRef(null)

  // Fetches astronomical event data
  useEffect(() => {
    const fetchData = async () => {
      const url = 'https://astronomy-calendar.p.rapidapi.com/events.php';
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'ede2c22f5amshf947680616aa310p171ea5jsn51a1694dc2e3',
          'X-RapidAPI-Host': 'astronomy-calendar.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        const formattedAstroData = result.map(event => ({
          ...event,
          date: formatDate(event.date)
        }));

        setAstroData(formattedAstroData);
        setErrorMessage('');
      } catch (error) {
        console.error(error);
        setErrorMessage('An error occurred while fetching data');
        setAstroData([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    // Call handleResize at initial load
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to create a starry background
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

  // Util function to format event dates from string to a standard format
  function formatDate(eventTime) {
    // converts month name to number and formats date
    const monthToNumber = {
      "January": "01",
      "February": "02",
      "March": "03",
      "April": "04",
      "May": "05",
      "June": "06",
      "July": "07",
      "August": "08",
      "September": "09",
      "October": "10",
      "November": "11",
      "December": "12"
    };

    const eventParts = eventTime.split(' ');
    const eventMonth = monthToNumber[eventParts[0]];
    const eventDay = parseInt(eventParts[1], 10);
    return `2024-${eventMonth}-${eventDay < 10 ? '0' + eventDay : eventDay}`;
  }

  // filter data to find events matching the selected date
  const filteredEvents = astroData.filter(event => {
    return event.date === selectedDate.toISOString().split('T')[0];
  });

  // Render method for the calendar comp
  return (
    <div className="app" ref={pageRef}>
      <div className="header">
      </div>
      <div className="main" style={{ display: "flex", flexDirection: "column" }}>
          <div className="calendar-wrapper" style={{ flex: 1 , textAlign:"center", marginTop:"100px"}}>
            <DatePicker
              onChange={(date) => setSelectedDate(date)}
              selected={selectedDate}
              dateFormat="yyyy-MM-dd"
              style={{ display: "hidden" ,width: "100%", borderRadius: "0" }}
              holidays={astroData}
              customInput={<CustomInput />}
              open
            />
          </div>
        {filteredEvents.length > 0 && (
          <div className="events-container" style={{ width: "100%" }}>
            {filteredEvents.map((event, index) => (
              <div key={index} className="event-details">
                <div className="event-title">
                  <img src={event.image} alt={event.title} style={{ maxWidth: "60px", height: "60px" }} />
                  <div className="event-date">
                    <p>{event.title}</p>
                    <p className="event-date">{event.date}</p>
                  </div>
                </div>
                <p className="event-content">{event.content}</p>
              </div>
            ))}
          </div>
        )}
        {errorMessage && <p className="error-message">{errorMessage}</p>}


      </div>
      <div className="footeri">
          {/* Moves to Finder */}
          {/* <h1>Header</h1> */}
          <Url imageSrc={home} navigateTo={"/"}/>
          <Url imageSrc={search} navigateTo={"/Finder"}/>
  </div>
    </div>
  );
}


// Custom input comp for the date picker

const CustomInput = ({ value, onClick }) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    style={{
      width: "100%",
      borderRadius: "0",
      fontSize: "30px",
      fontFamily: "Helvetica",
      color: "white",
      background: "transparent",
      border: "1px solid white",
      textAlign: "center",
    }}
    readOnly
  />
);


export default Calendar;
