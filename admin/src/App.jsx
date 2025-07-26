import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Doctors from './pages/Doctors';
import AddDoctor from './pages/AddDoctor';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Medicines from './pages/Medicines';
import AddMedicine from './pages/AddMedicine';
import SupplierManagement from './pages/SupplierManagement';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import { ThemeProviderWrapper } from './theme/ThemeContext';
import DoctorRoute from './components/DoctorRoute';
import MedicalTerms from './pages/MedicalTerms';
import EditAbout from './pages/EditAbout';
import HospitalPricing from './pages/HospitalPricing';

const App = () => {
  const { atoken } = useContext(AdminContext)
  const dtoken = localStorage.getItem('dtoken');

  // Show login if neither token exists
  if (!atoken && !dtoken) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  // Show doctor dashboard for doctor login
  if (dtoken) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Routes>
          <Route
            path="/doctor/dashboard"
            element={
              <DoctorRoute>
                <DoctorDashboard />
              </DoctorRoute>
            }
          />
          <Route path="*" element={<Navigate to="/doctor/dashboard" />} />
        </Routes>
      </div>
    );
  }

  // Show admin dashboard for admin login
  return (
    <ThemeProviderWrapper>
      <div className='bg-[#F8F9FD]'>
        <ToastContainer />
        <Navbar />
        <Sidebar />
        <Routes>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/doctors" element={<Doctors />} />
          <Route path="/admin/add-doctor" element={<AddDoctor />} />
          <Route path="/admin/appointments" element={<Appointments />} />
          <Route path="/admin/patients" element={<Patients />} />
          <Route path="/admin/medicines" element={<Medicines />} />
          <Route path="/admin/add-medicine" element={<AddMedicine />} />
          <Route path="/admin/suppliers" element={<SupplierManagement />} />
          <Route path="/admin/medical-terms" element={<MedicalTerms />} />
          <Route path="/admin/prescriptions" element={<Prescriptions />} />
          <Route path="/admin/billing" element={<Billing />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/edit-about" element={<EditAbout />} />
          <Route path="/admin/hospital-pricing" element={<HospitalPricing />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </ThemeProviderWrapper>
  );
}

export default App;
