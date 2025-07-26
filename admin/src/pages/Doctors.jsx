import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    experience: '',
  });

  // Schedule management state
  const [scheduleData, setScheduleData] = useState({
    availability: [
      { day: 'Monday', isAvailable: true, timeSlots: [] },
      { day: 'Tuesday', isAvailable: true, timeSlots: [] },
      { day: 'Wednesday', isAvailable: true, timeSlots: [] },
      { day: 'Thursday', isAvailable: true, timeSlots: [] },
      { day: 'Friday', isAvailable: true, timeSlots: [] },
      { day: 'Saturday', isAvailable: false, timeSlots: [] },
      { day: 'Sunday', isAvailable: false, timeSlots: [] },
    ],
    workingHours: { start: '09:00', end: '17:00' },
    maxAppointmentsPerDay: 20,
    offDays: []
  });

  // Add new state for tracking image errors
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (doctorId) => {
    setImageErrors(prev => ({
      ...prev,
      [doctorId]: true
    }));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/doctor/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('atoken')}`,
        },
      });
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to fetch doctors. Please check your connection and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`http://localhost:9000/api/doctor/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('atoken')}`,
          },
        });
        setDoctors(doctors.filter(doctor => doctor._id !== id));
        setError(''); // Clear any existing errors
      } catch (err) {
        const errorMessage = err.response?.data?.message ||
          err.message ||
          'Failed to delete doctor. Please try again.';
        setError(errorMessage);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:9000/api/doctor/${selectedDoctor._id}`,
        updateFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('atoken')}`,
          },
        }
      );

      setDoctors(doctors.map(doc =>
        doc._id === selectedDoctor._id ? { ...doc, ...updateFormData } : doc
      ));
      setIsUpdateModalOpen(false);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to update doctor. Please try again.';
      setError(errorMessage);
    }
  };

  const handleScheduleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:9000/api/doctor/${selectedDoctor._id}/schedule`,
        {
          availability: scheduleData.availability,
          workingHours: scheduleData.workingHours,
          maxAppointmentsPerDay: scheduleData.maxAppointmentsPerDay,
          offDays: scheduleData.offDays
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('atoken')}`,
          },
        }
      );

      // Update the doctor in the list with new schedule data
      setDoctors(doctors.map(doc =>
        doc._id === selectedDoctor._id ? { ...doc, ...scheduleData } : doc
      ));
      setIsScheduleModalOpen(false);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Failed to update doctor schedule. Please try again.';
      setError(errorMessage);
    }
  };

  const openUpdateModal = (doctor) => {
    setSelectedDoctor(doctor);
    setUpdateFormData({
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      experience: doctor.experience,
    });
    setIsUpdateModalOpen(true);
  };

  const openScheduleModal = (doctor) => {
    setSelectedDoctor(doctor);
    setScheduleData({
      availability: doctor.availability || [
        { day: 'Monday', isAvailable: true, timeSlots: [] },
        { day: 'Tuesday', isAvailable: true, timeSlots: [] },
        { day: 'Wednesday', isAvailable: true, timeSlots: [] },
        { day: 'Thursday', isAvailable: true, timeSlots: [] },
        { day: 'Friday', isAvailable: true, timeSlots: [] },
        { day: 'Saturday', isAvailable: false, timeSlots: [] },
        { day: 'Sunday', isAvailable: false, timeSlots: [] },
      ],
      workingHours: doctor.workingHours || { start: '09:00', end: '17:00' },
      maxAppointmentsPerDay: doctor.maxAppointmentsPerDay || 20,
      offDays: doctor.offDays || []
    });
    setIsScheduleModalOpen(true);
  };

  const handleDayAvailability = (dayIndex, isAvailable) => {
    const newAvailability = [...scheduleData.availability];
    newAvailability[dayIndex].isAvailable = isAvailable;
    if (!isAvailable) {
      newAvailability[dayIndex].timeSlots = [];
    }
    setScheduleData({ ...scheduleData, availability: newAvailability });
  };

  const addTimeSlot = (dayIndex) => {
    const newAvailability = [...scheduleData.availability];
    newAvailability[dayIndex].timeSlots.push({
      startTime: '',
      endTime: '',
      maxPatients: 4,
    });
    setScheduleData({ ...scheduleData, availability: newAvailability });
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const newAvailability = [...scheduleData.availability];
    newAvailability[dayIndex].timeSlots.splice(slotIndex, 1);
    setScheduleData({ ...scheduleData, availability: newAvailability });
  };

  const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
    const newAvailability = [...scheduleData.availability];
    if (!newAvailability[dayIndex].timeSlots[slotIndex]) {
      newAvailability[dayIndex].timeSlots[slotIndex] = {};
    }
    newAvailability[dayIndex].timeSlots[slotIndex][field] = value;
    setScheduleData({ ...scheduleData, availability: newAvailability });
  };

  const handleWorkingHoursChange = (field, value) => {
    setScheduleData({
      ...scheduleData,
      workingHours: { ...scheduleData.workingHours, [field]: value }
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Doctors List</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={imageErrors[doctor._id] ? 'https://via.placeholder.com/40' : doctor.image}
                    alt={doctor.name}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={() => handleImageError(doctor._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                  <div className="text-sm text-gray-500">{doctor.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {doctor.specialty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doctor.experience} years
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openUpdateModal(doctor)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition duration-200 mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => openScheduleModal(doctor)}
                    className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full transition duration-200 mr-2"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No doctors found
          </div>
        )}
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Update Doctor</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={updateFormData.name}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={updateFormData.email}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialty</label>
                  <input
                    type="text"
                    value={updateFormData.specialty}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, specialty: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                  <input
                    type="number"
                    value={updateFormData.experience}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, experience: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Management Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Manage Schedule - {selectedDoctor?.name}
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleScheduleUpdate}>
              {/* Working Hours */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">General Working Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={scheduleData.workingHours.start}
                      onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={scheduleData.workingHours.end}
                      onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Appointments/Day</label>
                    <input
                      type="number"
                      value={scheduleData.maxAppointmentsPerDay}
                      onChange={(e) => setScheduleData({ ...scheduleData, maxAppointmentsPerDay: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Schedule</h3>
                {scheduleData.availability.map((day, dayIndex) => (
                  <div key={day.day} className="mb-6 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={(e) => handleDayAvailability(dayIndex, e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700 text-lg">{day.day}</span>
                        {day.isAvailable && (
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Available</span>
                        )}
                      </div>
                      {day.isAvailable && (
                        <button
                          type="button"
                          onClick={() => addTimeSlot(dayIndex)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition duration-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Time Slot
                        </button>
                      )}
                    </div>
                    {day.isAvailable && (
                      <div className="space-y-3">
                        {day.timeSlots.length === 0 && (
                          <p className="text-gray-500 text-sm italic">No time slots configured. Click "Add Time Slot" to add scheduling.</p>
                        )}
                        {day.timeSlots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="grid grid-cols-4 gap-4 items-center bg-white p-3 rounded-lg border">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={slot.startTime || ''}
                                onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">End Time</label>
                              <input
                                type="time"
                                value={slot.endTime || ''}
                                onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Max Patients</label>
                              <input
                                type="number"
                                value={slot.maxPatients || 4}
                                onChange={(e) => handleTimeSlotChange(dayIndex, slotIndex, 'maxPatients', e.target.value)}
                                min="1"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 p-2 rounded transition duration-200"
                                title="Remove time slot"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
                >
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;