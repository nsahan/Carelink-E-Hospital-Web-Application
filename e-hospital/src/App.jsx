import React, { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import axios from 'axios';
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Context from './pages/Context'
import Find from './pages/Find'
import Appointment from './pages/Appointment'
import Profile from './pages/Profile'
import Appo from './pages/Appo'
import Navbar from './components/Navbar'
import Pharmacy from './pages/pharmacy'
import Footer from './components/Footer'
import ChatPage from './pages/ChatPage'
import StressRelief from './pages/StressRelief'

// Import your context provider
import { AppContextProvider } from './context/AppContext'
import Orders from './pages/Orders'
import { Toaster } from 'react-hot-toast';

const App = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await axios.get('http://localhost:9000/v1/api/settings/maintenance');
        setMaintenanceMode(res.data.maintenanceMode);
      } catch (err) {
        console.error('Error fetching maintenance mode:', err);
        setMaintenanceMode(false);
      }
    };
    fetchMaintenance();

    // Add polling to periodically check maintenance mode
    const maintenanceInterval = setInterval(fetchMaintenance, 60000); // Check every minute

    return () => clearInterval(maintenanceInterval);
  }, []);

  return (
    // Wrap the entire application with AppContextProvider to provide context
    <AppContextProvider>
      <div className='mx-4 sm:mx-[10%]'>
        <Toaster position="top-right" />
        <Navbar maintenanceMode={maintenanceMode} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Context />} />
          <Route path='/find' element={<Find />} />
          <Route path='/appointment' element={<Appointment />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/appointments/:docId' element={<Appo />} />
          <Route path='/pharmacy' element={<Pharmacy />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/chat' element={<ChatPage />} />
          <Route path='/stress-relief' element={<StressRelief />} />
        </Routes>
        <Footer />
      </div>
    </AppContextProvider>
  )
}

export default App
