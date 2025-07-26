import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { FaBell, FaUserCircle, FaChevronDown, FaExclamationTriangle, FaClock, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000';

const Navbar = () => {
  const { atoken, setAtoken } = useContext(AdminContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (atoken) {
      fetchNotifications();
      // Fetch notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [atoken]);

  const fetchNotifications = async () => {
    if (!atoken) return;

    try {
      setLoading(true);

      // Fetch multiple types of notifications
      const [medicinesResponse, emergenciesResponse, ordersResponse] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/v1/api/medicines/notifications`, {
          headers: { Authorization: `Bearer ${atoken}` }
        }),
        axios.get(`${API_BASE_URL}/v1/api/emergency/all`, {
          headers: { Authorization: `Bearer ${atoken}` }
        }),
        axios.get(`${API_BASE_URL}/v1/api/orders/pending`, {
          headers: { Authorization: `Bearer ${atoken}` }
        })
      ]);

      const allNotifications = [];

      // Process medicine notifications (low stock, expiry)
      if (medicinesResponse.status === 'fulfilled' && medicinesResponse.value.data) {
        const medicineData = medicinesResponse.value.data;

        // Low stock notifications
        if (medicineData.lowStock && medicineData.lowStock.length > 0) {
          medicineData.lowStock.forEach(medicine => {
            allNotifications.push({
              id: `low-${medicine._id}`,
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `${medicine.name} is running low (${medicine.stock} remaining)`,
              severity: medicine.stock <= 3 ? 'critical' : 'warning',
              timestamp: new Date().toISOString(),
              icon: '📦',
              action: 'Restock required'
            });
          });
        }

        // Expiring medicines notifications
        if (medicineData.expiring && medicineData.expiring.length > 0) {
          medicineData.expiring.forEach(medicine => {
            const daysUntilExpiry = Math.ceil(
              (new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            allNotifications.push({
              id: `exp-${medicine._id}`,
              type: 'expiry',
              title: 'Medicine Expiring Soon',
              message: `${medicine.name} expires in ${daysUntilExpiry} days`,
              severity: daysUntilExpiry <= 7 ? 'critical' : 'warning',
              timestamp: new Date().toISOString(),
              icon: '⏰',
              action: 'Return to supplier'
            });
          });
        }
      }

      // Process emergency notifications
      if (emergenciesResponse.status === 'fulfilled' && emergenciesResponse.value.data) {
        const emergencies = emergenciesResponse.value.data.emergencies || [];
        emergencies.forEach(emergency => {
          if (emergency.status === 'CRITICAL' || emergency.status === 'NEW') {
            allNotifications.push({
              id: `emergency-${emergency._id}`,
              type: 'emergency',
              title: 'Emergency Alert',
              message: `${emergency.patientName || 'Unknown'} - ${emergency.message || 'Emergency situation'}`,
              severity: 'critical',
              timestamp: emergency.timestamp || new Date().toISOString(),
              icon: '🚨',
              action: 'Immediate response required'
            });
          }
        });
      }

      // Process order notifications
      if (ordersResponse.status === 'fulfilled' && ordersResponse.value.data) {
        const pendingOrders = ordersResponse.value.data;
        if (pendingOrders.length > 0) {
          allNotifications.push({
            id: 'pending-orders',
            type: 'orders',
            title: 'Pending Orders',
            message: `${pendingOrders.length} orders awaiting processing`,
            severity: pendingOrders.length > 5 ? 'warning' : 'info',
            timestamp: new Date().toISOString(),
            icon: '📋',
            action: 'Process orders'
          });
        }
      }

      // Sort notifications by severity and timestamp
      const sortedNotifications = allNotifications.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setNotifications(sortedNotifications);

      // Update document title if there are critical notifications
      const criticalCount = sortedNotifications.filter(n => n.severity === 'critical').length;
      if (criticalCount > 0) {
        document.title = `(${criticalCount}) Critical Alerts - Dashboard`;
      } else {
        document.title = 'CareLink Dashboard';
      }

      // Play alert sound for critical notifications
      const hasCritical = sortedNotifications.some(n => n.severity === 'critical');
      if (hasCritical) {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'expiry':
        return <FaClock className="text-red-500" />;
      case 'emergency':
        return <FaShieldAlt className="text-red-600" />;
      case 'orders':
        return <FaInfoCircle className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 text-red-800';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 text-blue-800';
      default:
        return 'border-l-gray-500 bg-gray-50 text-gray-800';
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

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
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
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaBell className="text-xl" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
                {loading && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">Notifications</h3>
                      <span className="text-sm text-gray-500">
                        {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getSeverityColor(notification.severity)}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-medium">
                                    {notification.title}
                                  </p>
                                  <span className={`px-2 py-1 text-xs rounded-full ${notification.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                    notification.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                    {notification.severity}
                                  </span>
                                </div>
                                <p className="text-sm mb-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 font-medium">
                                  Action: {notification.action}
                                </p>
                              </div>
                            </div>
                            <button
                              className="text-gray-400 hover:text-gray-600 ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <FaBell className="text-4xl text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No notifications</p>
                        <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => setNotifications([])}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
              >
                <FaUserCircle className="text-2xl text-gray-600" />
                <span className="hidden md:block text-gray-700 font-medium">
                  {atoken ? 'Admin' : 'Doctor'}
                </span>
                <FaChevronDown className="text-gray-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">Admin User</p>
                    <p className="text-gray-500">admin@carelink.com</p>
                  </div>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
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