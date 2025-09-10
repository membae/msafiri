import { useState } from 'react'
import { Router,Routes,Route} from "react-router-dom"
import Signup from './components/signup'
import Login from './components/Login'
import './App.css'
import Home from './components/Home'
import Bookings from './components/Bookings'


function App() {
 

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/home' element={<Home/>} />
        <Route path='/booking' element={<Bookings/>} />
      </Routes>
    </>
  )
}

export default App
