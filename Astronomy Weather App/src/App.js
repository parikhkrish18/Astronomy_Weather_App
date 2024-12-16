import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Homepage from './components/home/Home'
import Amk from './components/SiteFinder/Amk'
import Calendar from './components/calendar/Calendar'


// Setup of the routes here
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />}></Route>
        <Route path='/Calendar' element={<Calendar />}></Route>
        <Route path='/Finder' element={<Amk />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
