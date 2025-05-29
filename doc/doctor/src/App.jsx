import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';

const ProtectedRoute = ({ children }) => {
  const doctorToken = localStorage.getItem('doctorToken');
  if (!doctorToken) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
