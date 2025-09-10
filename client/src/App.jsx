import { useState } from 'react'
import { Router,Routes,Route} from "react-router-dom"
import Signup from './components/signup'
import Login from './components/Login'
import './App.css'
import Home from './components/Home'
import Bookings from './components/Bookings'
import Buses from './components/Buses'
import Navbar from './components/Navbar'
import Profile from './components/Profile'
import Logout from './components/Logout'


function App() {
 

  return (
    <>
      <Routes>
        <Route path='/navbar' element={<Navbar />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/' element={<Home/>} />
        <Route path='/booking' element={<Bookings/>} />
        <Route path='/bus' element={<Buses/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/logout' element={<Logout/>} />
      </Routes>
    </>
  )
}

export default App
