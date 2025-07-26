import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddDoctor = ({ sidebar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    degree: '',
    experience: '',
    about: '',
    address: '',
    workingHours: { start: '09:00', end: '17:00' },
    availability: [
      { day: 'Monday', isAvailable: true, timeSlots: [] },
      { day: 'Tuesday', isAvailable: true, timeSlots: [] },
      { day: 'Wednesday', isAvailable: true, timeSlots: [] },
      { day: 'Thursday', isAvailable: true, timeSlots: [] },
      { day: 'Friday', isAvailable: true, timeSlots: [] },
      { day: 'Saturday', isAvailable: false, timeSlots: [] },
      { day: 'Sunday', isAvailable: false, timeSlots: [] },
    ],
    maxAppointmentsPerDay: 20,
    offDays: [],
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('atoken');
    if (!token) {
      setError('You are not logged in. Please log in to continue.');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        e.target.value = '';
        return;
      }
      if (file.size === 0) {
        setError('Selected image is empty');
        e.target.value = '';
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        e.target.value = '';
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
      e.target.value = '';
    }
  };

  const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
    const newAvailability = [...formData.availability];
    if (!newAvailability[dayIndex].timeSlots[slotIndex]) {
      newAvailability[dayIndex].timeSlots[slotIndex] = {};
    }
    newAvailability[dayIndex].timeSlots[slotIndex][field] = value;
    setFormData({ ...formData, availability: newAvailability });
  };

  const handleDayAvailability = (dayIndex, isAvailable) => {
    const newAvailability = [...formData.availability];
    newAvailability[dayIndex].isAvailable = isAvailable;
    if (!isAvailable) {
      newAvailability[dayIndex].timeSlots = [];
    }
    setFormData({ ...formData, availability: newAvailability });
  };

  const addTimeSlot = (dayIndex) => {
    const newAvailability = [...formData.availability];
    newAvailability[dayIndex].timeSlots.push({
      startTime: '',
      endTime: '',
      maxPatients: 4,
    });
    setFormData({ ...formData, availability: newAvailability });
  };

  const validateForm = () => {
    const fieldsToValidate =
      step === 1
        ? ['name', 'email']
        : step === 2
          ? ['specialty', 'degree', 'experience', 'about']
          : ['address'];

    for (const key of fieldsToValidate) {
      if (!formData[key] || formData[key].trim() === '') {
        setError(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
        return false;
      }
    }

    if (step === 1) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Invalid email format');
        return false;
      }
    } else if (step === 2) {
      if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
        setError('Experience must be a valid positive number');
        return false;
      }
      if (formData.about.length < 10) {
        setError('About section must be at least 10 characters');
        return false;
      }
      if (formData.specialty.trim().toLowerCase() === formData.name.trim().toLowerCase()) {
        setError('Specialty cannot be the same as the doctor\'s name');
        return false;
      }
    } else if (step === 3) {
      if (!image) {
        setError('Profile image is required');
        return false;
      }
      const hasAvailableDay = formData.availability.some(
        (day) => day.isAvailable && day.timeSlots.length > 0 && day.timeSlots.every((slot) => slot.startTime && slot.endTime && slot.maxPatients > 0)
      );
      if (!hasAvailableDay) {
        setError('At least one available day with valid time slots (start time, end time, and max patients) is required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('atoken');
    if (!token) {
      setError('You are not logged in. Please log in to continue.');
      setLoading(false);
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();

      const fields = [
        'name',
        'email',
        'specialty',
        'degree',
        'experience',
        'about',
        'address',
        'maxAppointmentsPerDay',
      ];
      fields.forEach((field) => {
        if (formData[field] !== undefined && formData[field] !== '') {
          submitData.append(field, formData[field]);
        }
      });

      submitData.append('workingHours', JSON.stringify(formData.workingHours));
      submitData.append('availability', JSON.stringify(formData.availability));
      submitData.append('offDays', JSON.stringify(formData.offDays));

      if (image) {
        submitData.append('image', image);
      }

      console.log('Sending FormData:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      if (!submitData.entries().next().done) {
        const response = await axios.post(
          'http://localhost:9000/api/admin/add-doctor',
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );

        if (response.data.success) {
          setSuccess('Doctor added successfully!');
          setFormData({
            name: '',
            email: '',
            specialty: '',
            degree: '',
            experience: '',
            about: '',
            address: '',
            workingHours: { start: '09:00', end: '17:00' },
            availability: [
              { day: 'Monday', isAvailable: true, timeSlots: [] },
              { day: 'Tuesday', isAvailable: true, timeSlots: [] },
              { day: 'Wednesday', isAvailable: true, timeSlots: [] },
              { day: 'Thursday', isAvailable: true, timeSlots: [] },
              { day: 'Friday', isAvailable: true, timeSlots: [] },
              { day: 'Saturday', isAvailable: false, timeSlots: [] },
              { day: 'Sunday', isAvailable: false, timeSlots: [] },
            ],
            maxAppointmentsPerDay: 20,
            offDays: [],
          });
          setImage(null);
          setImagePreview(null);
          setStep(1);
          document.querySelector('input[type="file"]').value = '';
          navigate('/doctors'); // Redirect to doctors list
        }
      } else {
        throw new Error('FormData is empty');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Error adding doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
      setError('');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const renderFormFields = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dr. John Smith"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="doctor@example.com"
                required
              />
            </div>
          </div>
        </div>
      );
    } else if (step === 2) {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-800">Professional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="specialty">
                Specialty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cardiology, Neurology, etc."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="degree">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="MBBS, MD, MS, etc."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="experience">
                Experience (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5"
                min="0"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="about">
                About <span className="text-red-500">*</span>
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Professional background, specializations, achievements, etc."
                required
              />
            </div>
          </div>
        </div>
      );
    } else {
      return renderPracticeDetails();
    }
  };

  const renderPracticeDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-800">Practice Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
            Clinic Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="123 Medical Center St, City, State, ZIP"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
            Profile Image <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            {imagePreview && (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4">Consultation Schedule</h3>
        {formData.availability.map((day, dayIndex) => (
          <div key={day.day} className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={day.isAvailable}
                  onChange={(e) => handleDayAvailability(dayIndex, e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">{day.day}</span>
              </div>
              {day.isAvailable && (
                <button
                  type="button"
                  onClick={() => addTimeSlot(dayIndex)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
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
                {day.timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="grid grid-cols-3 gap-4 items-center bg-white p-3 rounded-lg">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
          Basic Info
        </div>
        <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
          Professional
        </div>
        <div className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
          Practice
        </div>
      </div>
      <div className="overflow-hidden h-2 rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className={`p-6 ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300 mt-14`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-6 px-8">
            <h1 className="text-2xl font-bold text-white">Add New Doctor</h1>
            <p className="text-blue-100 mt-1">Complete the form below to add a new doctor to the system</p>
          </div>
          <div className="p-8">
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
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>{success}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {renderProgressBar()}
              {renderFormFields()}
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none ${step === 1 ? 'invisible' : ''}`}
                >
                  Previous
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Doctor
                      </span>
                    ) : (
                      'Add Doctor'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;