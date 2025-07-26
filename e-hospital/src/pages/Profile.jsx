import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';
import { Edit2, Save, Camera, User, Phone, Mail, MapPin, Calendar, Droplets, Weight, Ruler, CheckCircle, XCircle } from 'lucide-react';

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

  const FormField = ({ label, value, editField, icon: Icon, type = 'text' }) => (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-blue-500" />}
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      </div>
      {editMode ? (
        <div className="relative">
          {editField}
        </div>
      ) : (
        <div className="bg-white p-3 rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors">
          <p className="text-gray-800 font-medium">{value}</p>
        </div>
      )}
    </div>
  );

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-7 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
          <div className="relative px-7 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Profile Image */}
              <div className="relative -mt-16 group">
                <div className="relative">
                  <img 
                    src={userData.image} 
                    alt="Profile" 
                    className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer transition-all duration-300 ${
                      imageLoading ? 'opacity-50' : 'group-hover:shadow-xl'
                    }`}
                    onClick={handleImageClick}
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handleImageClick}
                  >
                    {imageLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <Camera className="text-white" size={24} />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
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
                  <div className="absolute -bottom-8 left-0 right-0 text-center text-red-500 text-sm font-medium">
                    {imageError}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                {editMode ? (
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="text-3xl font-bold border-b-2 border-blue-500 focus:outline-none bg-transparent pb-1 w-full"
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{userData.name}</h2>
                )}
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                  </span>
                  <span className="flex items-center gap-1">
                  </span>
                </div>
              </div>

              {/* Edit Button */}
             
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="space-y-6">
              <FormField 
                label="Email Address" 
                value={userData.email} 
                icon={Mail}
                editField={
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                }
              />
              
              <FormField 
                label="Phone Number" 
                value={userData.phone} 
                icon={Phone}
                editField={
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                }
              />
              
              <FormField 
                label="Address" 
                value={userData.address} 
                icon={MapPin}
                editField={
                  <textarea
                    value={userData.address}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                }
              />
            </div>
          </div>


       
            
          </div>
        </div>

        </div>
      
          
      
  );
};

export default Profile;