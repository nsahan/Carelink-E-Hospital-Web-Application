import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';
import { Edit2, Save, Camera } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'Sahan Jayarathna',
    image: assets.profile,
    email: 'nisurasahan@gmail.com',
    phone: '+94769034458',
    address: 'Kurunegala, Sri lanka',
    gender: 'Male',
    dob: '1998-05-22',
    bloodGroup: 'A+',
    weight: '55',
    height: '5.6',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    setUserData(prevData => ({
      ...prevData,
      name: user.name,
      email: user.email,
      image: user.image || assets.profile,
    }));
  }, [navigate]);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = React.useRef();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const validateImage = (file) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Please upload a JPG or PNG image');
    }
    if (file.size > MAX_SIZE) {
      throw new Error('Image size should be less than 5MB');
    }
  };

  const handleImageUpload = async (file, retryCount = 0) => {
    const MAX_RETRIES = 3;
    setImageLoading(true);
    setImageError(null);

    try {
      validateImage(file);
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:9000/api/users/update-image',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 15000, // 15 second timeout
        }
      );

      if (response.data.success) {
        setUserData(prev => ({ ...prev, image: response.data.data.image }));
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...user, image: response.data.data.image }));
        setMessage({ type: 'success', text: 'Profile image updated successfully!' });
      }
    } catch (error) {
      if (error.response?.status === 500) {
        const errorMessage = 'Server error. Please try again later.';
        if (retryCount < MAX_RETRIES) {
          // Wait longer between retries on server errors
          setTimeout(() => handleImageUpload(file, retryCount + 1), 2000 * (retryCount + 1));
          return;
        }
        setImageError(errorMessage);
        setMessage({ type: 'error', text: errorMessage });
      } else if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => handleImageUpload(file, retryCount + 1), 1000);
          return;
        }
        setImageError('Connection failed. Please check your internet connection.');
        setMessage({ type: 'error', text: 'Failed to upload image. Please check your connection.' });
      } else if (error.response?.status === 413) {
        setImageError('Image size too large');
        setMessage({ type: 'error', text: 'Image size exceeds server limit' });
      } else if (error.message.includes('validateImage')) {
        setImageError(error.message);
        setMessage({ type: 'error', text: error.message });
      } else {
        setImageError('Failed to upload image');
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload image' });
      }
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleImageUpload(file);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:9000/api/users/update',
        {
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          gender: userData.gender,
          dob: userData.dob,
          bloodGroup: userData.bloodGroup,
          weight: userData.weight,
          height: userData.height,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...user, ...response.data.data }));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
      setEditMode(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const FormField = ({ label, value, editField, type = 'text' }) => (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {editMode ? (
        editField
      ) : (
        <p className="text-base font-medium text-gray-800">{value}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md max-w-2xl mx-auto p-6">
      {message.text && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
        <div className="relative group">
          <img 
            src={userData.image} 
            alt="Profile" 
            className={`w-32 h-32 rounded-full object-cover border-4 ${
              imageLoading ? 'opacity-50' : ''
            } border-gray-100 shadow cursor-pointer`}
            onClick={handleImageClick}
          />
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleImageClick}
          >
            {imageLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <Camera className="text-white" size={24} />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            disabled={imageLoading}
          />
          {imageError && (
            <div className="absolute -bottom-8 left-0 right-0 text-center text-red-500 text-sm">
              {imageError}
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          {editMode ? (
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none w-full"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
          )}
          <p className="text-gray-500">{userData.email}</p>
        </div>
        <button
          onClick={editMode ? handleSave : () => setEditMode(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            editMode
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors duration-300`}
        >
          {editMode ? (
            <>
              <Save size={16} />
              <span>Save</span>
            </>
          ) : (
            <>
              <Edit2 size={16} />
              <span>Edit</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Contact Information
          </h2>
          
          <FormField 
            label="Email" 
            value={userData.email} 
            editField={
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            }
          />
          
          <FormField 
            label="Phone" 
            value={userData.phone} 
            editField={
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            }
          />
          
          <FormField 
            label="Address" 
            value={userData.address} 
            editField={
              <input
                type="text"
                value={userData.address}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            }
          />
        </div>

        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Basic Information
          </h2>
          
          <FormField 
            label="Gender" 
            value={userData.gender} 
            editField={
              <select
                value={userData.gender}
                onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            }
          />
          
          <FormField 
            label="Birthday" 
            value={userData.dob} 
            editField={
              <input
                type="date"
                value={userData.dob}
                onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            }
          />
          
          <FormField 
            label="Blood Group" 
            value={userData.bloodGroup} 
            editField={
              <select
                value={userData.bloodGroup}
                onChange={(e) => setUserData({ ...userData, bloodGroup: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
                <option value="O-">O-</option>
              </select>
            }
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField 
              label="Weight (kg)" 
              value={`${userData.weight} kg`} 
              editField={
                <input
                  type="number"
                  value={userData.weight}
                  onChange={(e) => setUserData({ ...userData, weight: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              }
            />
            
            <FormField 
              label="Height (ft)" 
              value={`${userData.height} ft`} 
              editField={
                <input
                  type="number"
                  step="0.1"
                  value={userData.height}
                  onChange={(e) => setUserData({ ...userData, height: e.target.value })}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;