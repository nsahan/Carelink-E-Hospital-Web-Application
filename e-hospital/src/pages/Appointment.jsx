import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, X, RefreshCw, User, Stethoscope, Phone, MapPin, Hash } from 'lucide-react';

const defaultDoctorImage = 'https://via.placeholder.com/100?text=Doctor';

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

  const getStatusColor = (status, date) => {
    if (status === 'completed') {
      return 'bg-blue-100 text-blue-600 border-blue-200';
    } else if (status === 'cancelled') {
      return 'bg-red-100 text-red-600 border-red-200';
    }

    const appointmentDate = new Date(date);
    const now = new Date();

    if (status === 'confirmed') {
      return 'bg-green-100 text-green-700 border-green-200';
    } else if (appointmentDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    } else {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusText = (status, date) => {
    if (status === 'completed') {
      return 'Completed';
    } else if (status === 'cancelled') {
      return 'Cancelled';
    } else if (status === 'confirmed') {
      return 'Confirmed';
    }

    const appointmentDate = new Date(date);
    const now = new Date();

    if (appointmentDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return 'Upcoming';
    } else {
      return 'Scheduled';
    }
  };

  const renderAppointments = () => {
    if (!Array.isArray(appointments)) {
      return (
        <div className="text-center text-gray-500 py-8">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No appointments found</p>
        </div>
      );
    }

    return appointments.map((appointment) => {
      const doctorInfo = appointment?.doctorId || {};
      const statusColor = getStatusColor(appointment.status, appointment.date);
      const statusText = getStatusText(appointment.status, appointment.date);

      return (
        <div key={appointment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Doctor Image */}
            <div className="flex-shrink-0">
              <img
                src={doctorInfo.image || defaultDoctorImage}
                alt={doctorInfo.name || 'Doctor'}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                onError={(e) => {
                  e.target.src = defaultDoctorImage;
                }}
              />
            </div>

            {/* Appointment Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Dr. {doctorInfo.name || 'Unknown Doctor'}
                  </h3>
                  <div className="flex items-center text-blue-600 font-medium mb-2">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    {doctorInfo.specialty || 'General Practice'}
                  </div>
                </div>
              </div>

              {/* Date and Queue Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <Hash className="w-5 h-5 mr-3 text-purple-500" />
                  <div>
                    <p className="font-medium">Queue #{appointment.queueNumber}</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                  <Clock className="w-5 h-5 mr-3 text-green-500" />
                  <div>
                    <p className="font-medium">Est. {appointment.estimatedTime}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
                  {statusText}
                </span>
              </div>

              {/* Additional Info (if available) */}
              {doctorInfo.phone && (
                <div className="flex items-center text-gray-600 mb-2">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{doctorInfo.phone}</span>
                </div>
              )}

              {doctorInfo.location && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{doctorInfo.location}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                {appointment.status === 'cancelled' ? (
                  <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-medium">This appointment was cancelled</p>
                  </div>
                ) : appointment.status === 'completed' ? (
                  <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-600 font-medium">This appointment has been completed</p>
                  </div>
                ) : (
                  <>
                   

                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="flex-1 px-4 py-2.5 flex items-center justify-center bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors font-medium"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
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

      setAppointments(appointments.filter(app => app._id !== appointmentId));
      alert('Appointment cancelled successfully');
    } catch (err) {
      console.error('Cancel error:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleReschedule = (doctorId) => {
    navigate(`/appointments/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage your upcoming and past medical appointments</p>
            </div>
            <button
              onClick={() => navigate('/doctors')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              + Book New Appointment
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-white rounded-xl shadow-sm">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No appointments scheduled</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                You don't have any appointments yet. Book your first appointment with one of our qualified doctors.
              </p>
              <button
                onClick={() => navigate('/doctors')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Browse Doctors
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  You have <span className="font-semibold text-blue-600">{appointments.length}</span> appointment{appointments.length !== 1 ? 's' : ''}
                </p>
              </div>
              {renderAppointments()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointment;