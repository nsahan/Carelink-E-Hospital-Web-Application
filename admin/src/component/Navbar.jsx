import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { FaBell, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000';

const Navbar = () => {
  const { atoken, setAtoken } = useContext(AdminContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState({
    items: [],
    lastChecked: null
  });
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Fetch notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/api/medicines/notifications`, {
        headers: { Authorization: `Bearer ${atoken}` }
      });

      if (response.data) {
        // Sort notifications by severity and timestamp
        const sortedNotifications = response.data.notifications.sort((a, b) => {
          if (a.severity === 'critical' && b.severity !== 'critical') return -1;
          if (b.severity === 'critical' && a.severity !== 'critical') return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

        setNotifications({
          items: sortedNotifications,
          lastChecked: new Date()
        });

        // Play alert sound for critical notifications
        const hasCritical = sortedNotifications.some(n => n.severity === 'critical');
        if (hasCritical) {
          const sound = new Audio('/alert.mp3'); // Add this sound file to your public folder
          sound.play().catch(err => console.log('Could not play sound:', err));
        }

        // Update document title if there are unread notifications
        const unreadCount = sortedNotifications.length;
        if (unreadCount > 0) {
          document.title = `(${unreadCount}) New Alerts - Dashboard`;
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    // Clear tokens from context
    setAtoken(null);
    
    // Clear tokens from localStorage
    localStorage.removeItem('atoken');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <img src={assets.carelink} alt="Logo" className="h-8 w-auto" />
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              >
                <FaBell className="text-xl" />
                {notifications.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.items.length > 9 ? '9+' : notifications.items.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.items.length > 0 ? (
                      notifications.items.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                            notification.severity === 'critical' 
                              ? 'border-l-4 border-l-red-500 bg-red-50' 
                              : 'border-l-4 border-l-yellow-500 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm ${
                                notification.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-600">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
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
      </div>
    </nav>
  );
};

export default Navbar;