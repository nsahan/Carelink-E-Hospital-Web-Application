import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const dtoken = localStorage.getItem('dtoken');
    const doctorInfo = localStorage.getItem('doctorInfo');

    if (!dtoken || !doctorInfo) {
      navigate('/doctor/login');
      return;
    }

    setDoctor(JSON.parse(doctorInfo));

    // Fetch appointments
    const fetchDoctorData = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/doctor/appointments`, {
          headers: { Authorization: `Bearer ${dtoken}` }
        });
        
        if (response.data.success) {
          setAppointments(response.data.appointments);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        if (error.response?.status === 401) {
          navigate('/doctor/login');
        }
      }
    };

    fetchDoctorData();
  }, [navigate]);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('dtoken');
      await axios.put(`http://localhost:9000/api/appointments/${appointmentId}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? { ...apt, status } : apt
      ));
      
      toast.success(`Appointment ${status} successfully`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dtoken');
    localStorage.removeItem('doctorInfo');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome Dr. {doctor?.name}</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Information</h2>
            <p><strong>Email:</strong> {doctor?.email}</p>
            <p><strong>Specialty:</strong> {doctor?.specialty}</p>
            <p><strong>Degree:</strong> {doctor?.degree}</p>
          </div>
          <div>
            {doctor?.image && (
              <img 
                src={doctor.image} 
                alt="Doctor profile" 
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                    <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {appointment.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'approved')}
                          className="text-green-600 hover:text-green-900 px-2 py-1 rounded bg-green-100"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded bg-red-100"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <p className="text-center text-gray-500 py-4">No appointments found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
