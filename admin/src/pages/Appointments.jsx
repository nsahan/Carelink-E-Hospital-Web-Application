import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';

const Appointments = () => {
  const { backendUrl } = useContext(AdminContext);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('atoken');
      if (!token) {
        setError('Admin authentication token not found. Please login again.');
        return;
      }

      setError(null);
      setIsLoading(true);
      const response = await axios.get(`${backendUrl}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('Network error - Cannot connect to server');
      } else if (error.response?.status === 500) {
        setError('Server error - Please try again later');
        toast.error('Server error occurred while fetching appointments');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch appointments');
      }
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('atoken');
      if (!token) {
        toast.error('Admin authentication token not found. Please login again.');
        return;
      }

      await axios.put(`${backendUrl}/api/appointments/${appointmentId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Appointment status updated successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - Cannot connect to server');
      } else if (error.response?.status === 500) {
        toast.error('Server error occurred while updating status');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update appointment status');
      }
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    filter === 'all' ? true : apt.status === filter
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchAppointments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointments Management</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <tr key={appointment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appointment.userId.name}</div>
                      <div className="text-sm text-gray-500">{appointment.userId.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Dr. {appointment.doctorId.name}</div>
                  <div className="text-sm text-gray-500">{appointment.doctorId.specialty}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">{appointment.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirm</option>
                    <option value="cancelled">Cancel</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
