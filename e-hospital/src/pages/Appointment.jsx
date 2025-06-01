import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, X, RefreshCw } from 'lucide-react';

const defaultDoctorImage = 'https://via.placeholder.com/100?text=Doctor'; // Add default image

const Appointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const response = await axios.get(
          `http://localhost:9000/api/appointments/user/${userId}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Ensure we're setting an array
        setAppointments(response.data?.data || []);
      } catch (err) {
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Add type checking before mapping
  const renderAppointments = () => {
    if (!Array.isArray(appointments)) {
      return (
        <div className="text-center text-gray-500 py-4">
          No appointments found
        </div>
      );
    }

    return appointments.map((appointment) => {
      // Add null checks for doctor info
      const doctorInfo = appointment?.doctorId || {};
      
      return (
        <div 
          key={appointment._id} 
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="p-4 flex items-center">
            <div className="mr-4">
              <img 
                src={doctorInfo.image || defaultDoctorImage} 
                alt={doctorInfo.name || 'Doctor'} 
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                onError={(e) => {
                  e.target.src = defaultDoctorImage;
                  e.target.onerror = null; // Prevent infinite loop
                }}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800">
                Dr. {doctorInfo.name || 'Unknown Doctor'}
              </h3>
              <p className="text-blue-600 font-medium">
                {doctorInfo.specialty || 'General Practice'}
              </p>
              
              <div className="mt-2 flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="mr-4">
                  {new Date(appointment.date).toLocaleDateString()}
                </span>
                <Clock className="w-4 h-4 mr-1" />
                <span>{appointment.time}</span>
              </div>
            </div>
            
            <div className="ml-4 flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => handleCancel(appointment._id)}
                className="px-4 py-2 flex items-center justify-center bg-white border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                <span>Cancel</span>
              </button>
              
              <button 
                onClick={() => handleReschedule(appointment.doctorId._id)}
                className="px-4 py-2 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                <span>Reschedule</span>
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  const handleCancel = async (appointmentId) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this appointment?')) {
        return;
      }

      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:9000/api/appointments/${appointmentId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Remove the cancelled appointment from state
      setAppointments(appointments.filter(app => app._id !== appointmentId));
      alert('Appointment cancelled successfully');
    } catch (err) {
      console.error('Cancel error:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleReschedule = (doctorId) => {
    navigate(`/book-appointment/${doctorId}`); // Make sure this route exists in your app
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Book New Appointment
        </button>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium mb-4">No appointments found</p>
            <button
              onClick={() => navigate('/doctors')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          renderAppointments()
        )}
      </div>
    </div>
  );
};

export default Appointment;