import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Truck,
    Package,
    CheckCircle,
    Clock,
    MapPin,
    User,
    Phone,
    Mail,
    LogOut,
    RefreshCw,
    Eye,
    Navigation,
    TrendingUp,
    Calendar,
    AlertCircle,
    Star,
    Car,
    Bike,
    Lock,
    Settings,
} from 'lucide-react';

const Dashboard = ({ deliveryPersonnel, setIsAuthenticated, setDeliveryPersonnel }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const navigate = useNavigate();

    // Configure axios with auth token
    useEffect(() => {
        const token = localStorage.getItem('deliveryToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:9000/api/delivery/dashboard');

            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401) {
                handleLogout();
            } else {
                toast.error('Failed to fetch dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Automatically go online when dashboard loads
        const goOnlineOnLoad = async () => {
            try {
                await axios.put('http://localhost:9000/api/delivery/online');
                console.log('✅ Automatically went online');
            } catch (error) {
                console.error('Error going online:', error);
            }
        };

        goOnlineOnLoad();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:9000/api/delivery/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('deliveryToken');
            localStorage.removeItem('deliveryPersonnel');
            setIsAuthenticated(false);
            setDeliveryPersonnel(null);
            navigate('/login');
            toast.success('Logged out successfully');
        }
    };

    const handleMarkAsDelivered = async (orderId) => {
        try {
            console.log('🚚 Marking order as delivered:', orderId);
            console.log('Token:', localStorage.getItem('deliveryToken') ? 'Present' : 'Missing');
            console.log('Headers:', axios.defaults.headers.common);

            const response = await axios.put(`http://localhost:9000/api/delivery/orders/${orderId}/delivered`);

            if (response.data.success) {
                toast.success('Order marked as delivered successfully!');
                fetchDashboardData(); // Refresh data
                setShowOrderDetails(false);
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Error marking order as delivered:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            const errorMessage = error.response?.data?.message || 'Failed to mark order as delivered';

            // If the error is about being offline, show a helpful message
            if (errorMessage.includes('online')) {
                toast.error('You must be online to mark orders as delivered. Please go online first.');
            } else {
                toast.error(errorMessage);
            }
        }
    };

    const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:9000/v1/api/orders/${orderId}/delivery-status`, {
                deliveryStatus: newStatus
            });

            if (response.data.success) {
                toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
            toast.error(error.response?.data?.message || 'Failed to update delivery status');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
        toast.success('Dashboard refreshed');
    };

    const handleGoOnline = async () => {
        try {
            const response = await axios.put('http://localhost:9000/api/delivery/online');
            if (response.data.success) {
                toast.success('You are now online!');
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error going online:', error);
            toast.error(error.response?.data?.message || 'Failed to go online');
        }
    };

    const handleGoOffline = async () => {
        try {
            const response = await axios.put('http://localhost:9000/api/delivery/offline');
            if (response.data.success) {
                toast.success('You are now offline!');
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error going offline:', error);
            toast.error(error.response?.data?.message || 'Failed to go offline');
        }
    };

    const handleAssignOrderToSelf = async (orderId) => {
        try {
            console.log('📦 Assigning order to self:', orderId);

            const response = await axios.put(`http://localhost:9000/api/delivery/orders/${orderId}/assign-to-self`);

            if (response.data.success) {
                toast.success('Order assigned to you successfully!');
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error assigning order to self:', error);
            toast.error(error.response?.data?.message || 'Failed to assign order to self');
        }
    };

    const handleChangePassword = async () => {
        try {
            console.log("🔐 handleChangePassword function called");
            setChangingPassword(true);

            console.log("🔐 Frontend Change Password Debug:");
            console.log("Password data:", {
                currentPassword: passwordData.currentPassword ? "***" : "empty",
                newPassword: passwordData.newPassword ? "***" : "empty",
                confirmPassword: passwordData.confirmPassword ? "***" : "empty"
            });

            // Validate passwords
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                toast.error('New passwords do not match');
                return;
            }

            if (passwordData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters long');
                return;
            }

            console.log("Sending request to:", 'http://localhost:9000/api/delivery/change-password');
            console.log("Request payload:", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            console.log("Axios headers:", axios.defaults.headers.common);
            console.log("Token present:", !!localStorage.getItem('deliveryToken'));

            const requestData = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            };

            console.log("About to make axios request...");

            const response = await axios.put('http://localhost:9000/api/delivery/change-password', requestData);

            console.log("Response received:", response.data);

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setShowChangePassword(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.message);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType) {
            case 'car':
                return <Car className="w-5 h-5" />;
            case 'bike':
                return <Bike className="w-5 h-5" />;
            case 'van':
                return <Truck className="w-5 h-5" />;
            default:
                return <Truck className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'assigned':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'picked_up':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'in_transit':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 text-center mt-4">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {deliveryPersonnel?.name}
                            </h1>
                            <p className="text-gray-600 mt-1">Delivery Service Dashboard</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Online/Offline Toggle */}
                            {dashboardData?.deliveryPersonnel?.isOnline ? (
                                <button
                                    onClick={handleGoOffline}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    Go Offline
                                </button>
                            ) : (
                                <button
                                    onClick={handleGoOnline}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    Go Online
                                </button>
                            )}

                            {/* Test button to assign order */}


                            <button
                                onClick={() => {
                                    console.log("🔧 Settings button clicked");
                                    setShowChangePassword(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <Settings size={20} />
                                Settings
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {dashboardData && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Assigned Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.assignedOrders}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Today's Deliveries</p>
                                        <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.todayDeliveries}</p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                                        <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalDeliveries}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-2xl font-bold text-gray-900">{dashboardData.deliveryPersonnel.rating}</p>
                                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                        </div>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-lg">
                                        <Star className="w-6 h-6 text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personnel Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Employee ID</p>
                                        <p className="font-medium">{dashboardData.deliveryPersonnel.employeeId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getVehicleIcon(dashboardData.deliveryPersonnel.vehicleType)}
                                    <div>
                                        <p className="text-sm text-gray-600">Vehicle</p>
                                        <p className="font-medium">{dashboardData.deliveryPersonnel.vehicleNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Assigned Area</p>
                                        <p className="font-medium">{dashboardData.deliveryPersonnel.assignedArea}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${dashboardData.deliveryPersonnel.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium">{dashboardData.deliveryPersonnel.isOnline ? 'Online' : 'Offline'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assigned Orders */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Assigned Orders</h2>

                            {dashboardData.assignedOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders assigned</h3>
                                    <p className="text-gray-600 mb-4">You don't have any orders to deliver at the moment.</p>

                                    {!dashboardData.deliveryPersonnel.isOnline && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                                <span className="font-medium text-yellow-800">You're currently offline</span>
                                            </div>
                                            <p className="text-sm text-yellow-700">
                                                Go online to receive new order assignments and mark orders as delivered.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData.assignedOrders.map((order) => (
                                        <div
                                            key={order._id}
                                            className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            Order #{order._id.slice(-8)}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.deliveryStatus)}`}>
                                                            {order.deliveryStatus?.replace('_', ' ').toUpperCase() || 'ASSIGNED'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-gray-500" />
                                                            <span>{order.userId?.name || 'Unknown Customer'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-gray-500" />
                                                            <span>{order.userId?.email || 'No email'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-gray-500" />
                                                            <span>{order.userId?.phone || 'No phone'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3">
                                                        <p className="text-sm text-gray-600">
                                                            <strong>Items:</strong> {order.items?.length || 0} items
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>Total:</strong> Rs.{order.totalAmount?.toFixed(2) || '0.00'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>Address:</strong> {order.shippingAddress || 'No address'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowOrderDetails(true);
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                        View Details
                                                    </button>

                                                    {/* Status Update Buttons */}
                                                    {order.deliveryStatus === 'assigned' && (
                                                        <button
                                                            onClick={() => handleUpdateDeliveryStatus(order._id, 'picked_up')}
                                                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                                        >
                                                            <Package size={16} />
                                                            Pick Up
                                                        </button>
                                                    )}

                                                    {order.deliveryStatus === 'picked_up' && (
                                                        <button
                                                            onClick={() => handleUpdateDeliveryStatus(order._id, 'in_transit')}
                                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            <Truck size={16} />
                                                            Start Delivery
                                                        </button>
                                                    )}

                                                    {(order.deliveryStatus === 'assigned' || order.deliveryStatus === 'picked_up' || order.deliveryStatus === 'in_transit') && (
                                                        <button
                                                            onClick={() => handleMarkAsDelivered(order._id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Mark Delivered
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Order Details</h2>
                                    <p className="text-blue-100 mt-1">#{selectedOrder._id}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowOrderDetails(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                                    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-500" />
                                            <span>{selectedOrder.userId?.name || 'Unknown Customer'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                            <span>{selectedOrder.userId?.email || 'No email'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-500" />
                                            <span>{selectedOrder.userId?.phone || 'No phone'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Information</h3>
                                    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-gray-500" />
                                            <span>{selectedOrder.shippingAddress || 'No address'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-gray-500" />
                                            <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-gray-500" />
                                            <span>{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.medicineId?.name || 'Unknown Medicine'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        Rs.{(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Rs.{item.price?.toFixed(2)} each
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            Rs.{selectedOrder.totalAmount?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    {(selectedOrder.tracking?.status === 'shipped' || selectedOrder.tracking?.status === 'out_for_delivery') && (
                                        <button
                                            onClick={() => {
                                                handleMarkAsDelivered(selectedOrder._id);
                                                setShowOrderDetails(false);
                                                setSelectedOrder(null);
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                        >
                                            <CheckCircle size={20} />
                                            Mark as Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Change Password</h2>
                                    <p className="text-blue-100 mt-1">Update your account password</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                console.log("🔐 Form submitted");
                                handleChangePassword();
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChangePassword(false);
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {changingPassword ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Changing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={16} />
                                                Change Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 