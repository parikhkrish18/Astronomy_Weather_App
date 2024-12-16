import React from 'react';
import ReactDOM from 'react-dom/client';



// Using WeatherContext, here to simplify the state management in homepage
import {WeatherProvider} from './components/home/WeatherContext'

import Home from './components/home/Home';
import Amk from './components/SiteFinder/Amk'
import App from './App'

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <WeatherProvider>
        <App />
    </WeatherProvider>

);

reportWebVitals();
