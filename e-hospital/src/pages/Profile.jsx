import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Edit2, Save } from 'lucide-react';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: 'Nisura Sahan',
    image: assets.profile_pic,
    email: 'example@gmail.com',
    phone: '+94769034458',
    address: 'Kurunegala, Sri lanka',
    gender: 'Male',
    dob: '1998-05-22',
    bloodGroup: 'A+',
    weight: '55',
    height: '5.6',
  });

  const [editMode, setEditMode] = useState(false);

  const handleSave = () => {
    // Here you would typically save the data to a backend
    setEditMode(false);
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
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
        <div className="relative">
          <img 
            src={userData.image} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow"
          />
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