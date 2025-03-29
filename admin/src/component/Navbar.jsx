import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { FaBell, FaUserCircle, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const { atoken, setAtoken } = useContext(AdminContext);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleLogout = () => {
    // Clear tokens from context
    setAtoken(null);
    
    // Clear tokens from localStorage
    localStorage.removeItem('atoken');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={assets.carelink} alt="Logo" className="h-10 w-auto" />
          <div className="flex items-center">
            <p className="text-gray-800 font-semibold text-lg">
              {atoken ? 'Admin' : 'Doctor'} Dashboard
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="relative p-2 hover:bg-gray-100 rounded-full">
            <FaBell className="text-gray-600 text-xl" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2"
            >
              <FaUserCircle className="text-2xl text-gray-600" />
              <span className="hidden md:block text-gray-700 font-medium">
                {atoken ? 'Admin' : 'Doctor'}
              </span>
              <FaChevronDown className="text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button>
                <hr className="my-1" />
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;