import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Appo = ({ sidebar }) => {
  const { docId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const [error, setError] = useState('');
  const [queueInfo, setQueueInfo] = useState({
    availableSlots: 0,
    totalBooked: 0,
    nextQueueNumber: 1,
    isAvailable: false,
    bookedAppointments: []
  });

  useEffect(() => {
    console.log('useEffect triggered with docId:', docId);

    const source = axios.CancelToken.source();
    const fetchDoctorInfo = async () => {
      if (!docId) {
        setError('Invalid doctor ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching doctor info for ID:', docId);
        const response = await axios.get(`http://localhost:9000/api/doctor/${docId}`, {
          cancelToken: source.token,
        });

        console.log('Doctor API response:', response.data);
        if (response.data) {
          setDoctor(response.data);

          const doctorSpecialty = response.data.specialty || response.data.specialization;

          if (doctorSpecialty && doctorSpecialty !== response.data.name) {
            try {
              console.log('Fetching related doctors for specialty:', doctorSpecialty);
              const relatedResponse = await axios.get(
                `http://localhost:9000/api/doctor/related/${encodeURIComponent(doctorSpecialty)}`,
                { cancelToken: source.token }
              );
              console.log('Related doctors response:', relatedResponse.data);
              if (relatedResponse.data && Array.isArray(relatedResponse.data)) {
                const filteredRelated = relatedResponse.data.filter(doc => doc._id !== docId);
                setRelatedDoctors(filteredRelated.slice(0, 3));
              }
            } catch (relatedError) {
              if (!axios.isCancel(relatedError)) {
                console.error('Error fetching related doctors:', relatedError);
                setRelatedDoctors([]);
              }
            }
          } else {
            console.log('No valid specialty found or specialty matches doctor name, skipping related doctors');
            setRelatedDoctors([]);
          }
        } else {
          setError('No doctor data received');
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching doctor:', error?.response?.data || error.message);
          setError(error.response?.data?.message || 'Error fetching doctor details');
          setDoctor(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorInfo();

    return () => {
      console.log('Cleaning up API calls');
      source.cancel('Component unmounted');
    };
  }, [docId]);

  // Fetch queue information when a date is selected
  useEffect(() => {
    if (!selectedDate || !docId) return;

    const source = axios.CancelToken.source();
    const fetchQueueInfo = async () => {
      try {
        console.log('Fetching queue info for date:', selectedDate);
        const response = await axios.get(
          `http://localhost:9000/api/appointments/queue/${docId}/${selectedDate}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            cancelToken: source.token,
          }
        );

        console.log('Queue info response:', response.data);
        if (response.data.success) {
          setQueueInfo(response.data);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching queue info:', error?.response?.data || error.message);
          setError('Error fetching queue information');
        }
      }
    };

    fetchQueueInfo();

    return () => {
      source.cancel('Date changed or component unmounted');
    };
  }, [selectedDate, docId]);

  // Calculate next estimated time based on queue number
  const calculateNextEstimatedTime = (queueNumber) => {
    if (!doctor || !selectedDate) return 'N/A';

    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = doctor.availability?.find(day => day.day === dayOfWeek);

    if (!dayAvailability || !dayAvailability.timeSlots?.length) return 'N/A';

    // Use the first time slot's start time as the base time
    const baseStartTime = dayAvailability.timeSlots[0].startTime;
    const consultationDuration = 30; // 30 minutes per consultation

    // Calculate estimated time
    const [hours, minutes] = baseStartTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (queueNumber - 1) * consultationDuration;
    const estimatedHours = Math.floor(totalMinutes / 60);
    const estimatedMinutes = totalMinutes % 60;

    return `${estimatedHours.toString().padStart(2, '0')}:${estimatedMinutes.toString().padStart(2, '0')}`;
  };

  // Generate available dates for the next 7 days
  const generateAvailableDates = () => {
    if (!doctor || !doctor.availability) return [];
    console.log('Generating available dates for doctor:', doctor.name);
    const dates = [];
    const today = new Date();

    for (let daysToAdd = 0; daysToAdd < 7; daysToAdd++) {
      const date = new Date();
      date.setDate(today.getDate() + daysToAdd);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = date.toISOString().split('T')[0];

      const isAvailable = doctor.availability.some(
        day => day.day === dayName && day.isAvailable && day.timeSlots?.length > 0
      );

      if (isAvailable && (!doctor.offDays || !doctor.offDays.includes(formattedDate))) {
        dates.push(formattedDate);
      }
    }

    console.log('Available dates:', dates);
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleBooking = async () => {
    if (!selectedDate) {
      setError('Please select a date to book your appointment');
      return;
    }

    if (queueInfo.availableSlots <= 0) {
      setError('No appointments available for this date');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to book an appointment');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      console.log('Booking appointment:', { doctorId: docId, date: selectedDate });
      const response = await axios.post(
        'http://localhost:9000/api/appointments',
        {
          doctorId: docId,
          date: selectedDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Booking response:', response.data);
      if (response.data) {
        setBookingSuccess(true);
        // Update queue info locally
        setQueueInfo(prev => ({
          ...prev,
          availableSlots: prev.availableSlots - 1,
          totalBooked: prev.totalBooked + 1,
          nextQueueNumber: prev.nextQueueNumber + 1,
        }));
      }
    } catch (error) {
      console.error('Booking error:', error?.response?.data || error.message);
      setError(error.response?.data?.message || 'Error booking appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDateSelection = () => (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">Select Date</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {availableDates.map((date, index) => {
          const dateObj = new Date(date);
          const isToday = dateObj.toDateString() === new Date().toDateString();
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

          return (
            <div
              key={index}
              onClick={() => {
                setSelectedDate(date);
                setError('');
              }}
              className={`cursor-pointer border rounded-lg p-3 text-center transition duration-200 hover:border-blue-500 
                ${selectedDate === date ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}
                ${isToday ? 'bg-green-50 border-green-500' : ''}`}
            >
              <div className="text-xs font-medium text-gray-500">
                {isToday ? 'Today' : dayName}
              </div>
              <div className="text-lg font-bold">{dayNum}</div>
              <div className="text-xs">{month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderQueueInfo = () => (
    <div className="mb-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Queue Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{queueInfo.availableSlots}</div>
            <div className="text-sm text-blue-700">Available Slots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{queueInfo.nextQueueNumber}</div>
            <div className="text-sm text-purple-700">Your Queue Number</div>
          </div>
        </div>

        {/* Next Estimated Time Section */}
        {queueInfo.nextQueueNumber > 1 && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Next Estimated Time</h4>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {calculateNextEstimatedTime(queueInfo.nextQueueNumber)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
              </div>
            </div>
          </div>
        )}
      </div>

      {queueInfo.bookedAppointments.length > 0 && (
        <div className="space-y-2">
          {queueInfo.bookedAppointments.slice(0, 5).map((apt, index) => (
            <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border">
              <div className="flex items-center">
              </div>
            </div>

          ))}
          {queueInfo.bookedAppointments.length > 5 && (
            <div className="text-center text-sm text-gray-500">
              ... and {queueInfo.bookedAppointments.length - 5} more
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen flex justify-center items-center p-6 ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300 mt-14`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50 ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300 mt-14`}>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'We couldn\'t find the doctor you\'re looking for. They may no longer be available.'}</p>
          <button
            onClick={() => navigate('/doctors')}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Browse All Doctors
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50 ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300 mt-14`}>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-2">Your appointment with Dr. {doctor.name} has been scheduled for:</p>
          <p className="text-lg font-semibold text-blue-600 mb-2">{selectedDate}</p>
          <p className="text-lg font-semibold text-purple-600 mb-2">Queue Number: {queueInfo.nextQueueNumber - 1}</p>
          <p className="text-lg font-semibold text-green-600 mb-2">Estimated Time: {calculateNextEstimatedTime(queueInfo.nextQueueNumber - 1)}</p>
          <p className="text-sm text-gray-500 mb-6">A confirmation has been sent to your email address. Please check your appointments page for updates.</p>
          <button
            onClick={() => navigate('/doctors')}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Browse More Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 min-h-screen ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300 mt-14`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-gray-500 text-sm">
          <button onClick={() => navigate('/doctors')} className="hover:text-blue-600">Doctors</button>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">Appointment Booking</span>
        </nav>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative">
                <img src={doctor.image} alt={doctor.name} className="w-full h-56 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">Dr. {doctor.name}</h2>
                  <div className="flex items-center mt-1">
                    <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                      {doctor.specialty || doctor.specialization || 'General Medicine'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-500">Education</div>
                      <div className="font-medium">{doctor.degree || 'Medical Degree'}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="font-medium">{doctor.experience || '5+'} years</div>
                    </div>
                  </div>
                </div>

                {doctor.fees > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <span className="font-semibold text-yellow-800">Notice:</span>
                    <span className="ml-2 text-yellow-700">Consultation Fee for this specialty: <span className="font-bold">Rs.{doctor.fees}</span> (set by hospital)</span>
                  </div>
                )}

                <div className="mb-6">
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Queue-based appointment system</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Estimated time shown before booking</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Book Your Appointment</h3>

              {renderDateSelection()}
              {selectedDate && renderQueueInfo()}

              <button
                onClick={handleBooking}
                disabled={queueInfo.availableSlots <= 0 || isLoading}
                className={`w-full border rounded-md shadow-sm py-3 px-4 text-white font-medium
                  ${queueInfo.availableSlots > 0 && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking Appointment
                  </span>
                ) : queueInfo.availableSlots <= 0 ? (
                  'No Appointments Available'
                ) : selectedDate && queueInfo.nextQueueNumber > 0 ? (
                  `Book Appointment (Queue #${queueInfo.nextQueueNumber} - Est. ${calculateNextEstimatedTime(queueInfo.nextQueueNumber)})`
                ) : selectedDate ? (
                  `Book Appointment (Queue #${queueInfo.nextQueueNumber})`
                ) : (
                  'Select Date'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Related Doctors */}
        {relatedDoctors.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Related Doctors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedDoctors.map((doc) => (
                <div key={doc._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <img src={doc.image} alt={doc.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800"> {doc.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{doc.specialty || doc.specialization}</p>
                    <button
                      onClick={() => navigate(`/appointments/${doc._id}`)}
                      className="w-full bg-blue-600 text-white font-medium rounded-lg py-2 hover:bg-blue-700 transition duration-300"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appo;

