import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Doctors from './pages/Doctors';
import AddDoctor from './pages/AddDoctor';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Medicines from './pages/Medicines';
import AddMedicine from './pages/AddMedicine';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import { ThemeProviderWrapper } from './theme/ThemeContext';

const App = () => {

  const {atoken} = useContext(AdminContext)

  return (
    <ThemeProviderWrapper>
      {atoken ? (
        <div className='bg-[#F8F9FD]'>
          <ToastContainer />
          <Navbar />
          <Sidebar/>
          <Routes>
            <Route path="/admin/dashboard" element={<Dashboard/>} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard/>} />
            <Route path="/admin/doctors" element={<Doctors/>} />
            <Route path="/admin/add-doctor" element={<AddDoctor/>} />
            <Route path="/admin/appointments" element={<Appointments/>} />
            <Route path="/admin/patients" element={<Patients/>} />
            <Route path="/admin/medicines" element={<Medicines/>} />
            <Route path="/admin/add-medicine" element={<AddMedicine/>} />
            <Route path="/admin/prescriptions" element={<Prescriptions/>} />
            <Route path="/admin/billing" element={<Billing/>} />
            <Route path="/admin/settings" element={<Settings/>} />
          </Routes>
        </div>
      ) : (
        <>
          <Login />
          <ToastContainer />
        </>
      )}
    </ThemeProviderWrapper>
  )
}

export default App
