import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Appo = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors = [] } = useContext(AppContext) || {};

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchInfo = async () => {
    setIsLoading(true);
    
    if (!doctors || !Array.isArray(doctors) || doctors.length === 0) {
      console.log('Doctors data is not available yet');
      setIsLoading(false);
      return;
    }

    const foundDoctor = doctors.find((doc) => doc._id === docId);
    if (foundDoctor) {
      setDoctor(foundDoctor);
    } else {
      console.log('Doctor not found');
    }

    // Reset selections when doctor changes
    setSelectedDate('');
    setSelectedTime('');
    setBookingSuccess(false);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInfo();
  }, [docId, doctors]);
 
  // Generate next 10 available dates (excluding weekends)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    let daysToAdd = 1;
    while (dates.length < 10) {
      const date = new Date();
      date.setDate(today.getDate() + daysToAdd);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
      }
      
      daysToAdd++;
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();
  
  // Time slots - morning and afternoon
  const morningSlots = ['09:00 AM', '10:00 AM', '11:00 AM'];
  const afternoonSlots = ['01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  // Filter related doctors based on the same speciality
  const relatedDoctors = doctor ? doctors.filter(
    (doc) => doc.speciality === doctor.speciality && docId !== doc._id
  ).slice(0, 3) : [];

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time to book your appointment');
      return;
    }

    // Simulate booking process
    setIsLoading(true);
    
    setTimeout(() => {
      setBookingSuccess(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If doctor not found
  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the doctor you're looking for. They may no longer be available.</p>
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
      <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-2">Your appointment with Dr. {doctor.name} has been scheduled for:</p>
          <p className="text-lg font-semibold text-blue-600 mb-6">{selectedDate} at {selectedTime}</p>
          <p className="text-sm text-gray-500 mb-6">A confirmation has been sent to your email address. Please arrive 15 minutes before your scheduled time.</p>
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-gray-500 text-sm">
          <button onClick={() => navigate('/doctors')} className="hover:text-blue-600">Doctors</button>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">Appointment Booking</span>
        </nav>
        
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
                      {doctor.speciality}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-500">Education</div>
                      <div className="font-medium">{doctor.degree}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="font-medium">{doctor.experience}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-1">Consultation Fee</div>
                  <div className="text-2xl font-bold text-blue-600">${doctor.fees}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Online prescription available</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Follow-up consultation included</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Available for emergency consultation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Book Your Appointment</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Select Date</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {availableDates.map((date, index) => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`cursor-pointer border rounded-lg p-3 text-center transition duration-200 hover:border-blue-500 ${
                          selectedDate === date 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-500">{dayName}</div>
                        <div className="text-lg font-bold">{dayNum}</div>
                        <div className="text-xs">{month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-8">
                  <label className="block text-gray-700 font-medium mb-2">Select Time</label>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">Morning</div>
                    <div className="flex flex-wrap gap-3">
                      {morningSlots.map((time, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedTime(time)}
                          className={`cursor-pointer border rounded-lg py-2 px-4 text-center transition duration-200 hover:border-blue-500 ${
                            selectedTime === time 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200'
                          }`}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Afternoon</div>
                    <div className="flex flex-wrap gap-3">
                      {afternoonSlots.map((time, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedTime(time)}
                          className={`cursor-pointer border rounded-lg py-2 px-4 text-center transition duration-200 hover:border-blue-500 ${
                            selectedTime === time 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200'
                          }`}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Button */}  
              <button
                onClick={handleBooking}
                className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {selectedDate && selectedTime ? 'Confirm Booking' : 'Select Date & Time'}
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
                    <h3 className="text-lg font-semibold text-gray-800">Dr. {doc.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{doc.speciality}</p>
                    <button
                      onClick={() => navigate(`/appoinments/${doc._id}`)}
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