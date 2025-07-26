import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  Package,
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Truck,
  Clock,
  RefreshCw,
  Eye,
  ShoppingCart,
  MapPin,
  CreditCard,
  X,
  Search,
  Filter,
  ArrowRight,
  Star,
  Download,
  Share2,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button, Chip } from '@mui/material';
import { LocalShipping, CheckCircleOutline } from '@mui/icons-material';

const TrackingModal = ({ order, onClose }) => {
  const getStatusStep = (status) => {
    const steps = [
      'pending',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
    ];
    return steps.indexOf(status);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Order Tracking</h2>
              <p className="text-blue-100 mt-1">Track your order in real-time</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map(
                (step, index) => {
                  const currentStep = getStatusStep(order.tracking?.status);
                  const isActive = index <= currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className="relative flex items-center w-full">
                        {index > 0 && (
                          <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                            ${isActive
                              ? isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-500 text-white animate-pulse'
                              : 'bg-gray-200 text-gray-400'
                            }`}
                        >
                          {isCompleted ? <CheckCircle size={20} /> : index + 1}
                        </div>
                        {index < 4 && (
                          <div className={`flex-1 h-0.5 ${index < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className={`text-center text-xs mt-3 font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Tracking Updates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tracking History</h3>
            {order.tracking?.updates?.length > 0 ? (
              order.tracking.updates.map((update, index) => (
                <div key={index} className="relative pl-8 pb-6 last:pb-0">
                  <div className="absolute left-0 top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                  {index < order.tracking.updates.length - 1 && (
                    <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gray-200"></div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">{update.status}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(update.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-gray-600 mb-1">{update.message}</div>
                    {update.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={14} className="mr-1" />
                        {update.location}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tracking updates available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const response = await axios.get(
          `http://localhost:9000/api/orders/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleTrackOrder = async (order) => {
    try {
      const response = await axios.get(
        `http://localhost:9000/api/orders/tracking/${order._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      const updatedOrder = response.data.data;

      // FIX: Do NOT update the status in the orders list to tracking.status unless you want to.
      // Only update the tracking field, not the main status, so the order does not disappear from filteredOrders.
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o._id === order._id
            ? {
              ...o,
              tracking: updatedOrder.tracking
              // Do NOT overwrite o.status here!
            }
            : o
        )
      );

      // Update selected order if it's currently open
      if (selectedOrder && selectedOrder._id === order._id) {
        setSelectedOrder(prevOrder => ({
          ...prevOrder,
          tracking: updatedOrder.tracking
        }));
      }

      setSelectedOrder(updatedOrder);
      setShowTracking(true);

      if (updatedOrder.tracking?.status === 'shipped') {
        toast.info('Order is now shipped', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error('Error fetching tracking information:', error);
      toast.error('Failed to fetch tracking information', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };



  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(
        `http://localhost:9000/v1/api/orders/cancel/${orderId}`,
        { reason: 'User requested cancellation' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Update the order in the list
        setOrders(orders.map(order =>
          order._id === orderId
            ? { ...order, status: 'cancelled' }
            : order
        ));

        toast.success('Order cancelled successfully', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(
        error.response?.data?.message || 'Failed to cancel order',
        {
          position: 'top-right',
          autoClose: 3000,
          theme: 'colored',
        }
      );
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return {
          color: 'text-green-700',
          bg: 'bg-green-100',
          border: 'border-green-300',
          icon: CheckCircle,
          text: 'Delivered',
          gradient: 'from-green-50 to-green-100'
        };
      case 'pending':
        return {
          color: 'text-amber-700',
          bg: 'bg-amber-100',
          border: 'border-amber-300',
          icon: Clock,
          text: 'Processing',
          gradient: 'from-amber-50 to-amber-100'
        };
      case 'shipped':
      case 'dispatched':
        return {
          color: 'text-blue-700',
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          icon: Truck,
          text: 'In Transit',
          gradient: 'from-blue-50 to-blue-100'
        };
      case 'cancelled':
        return {
          color: 'text-red-700',
          bg: 'bg-red-100',
          border: 'border-red-300',
          icon: AlertCircle,
          text: 'Cancelled',
          gradient: 'from-red-50 to-red-100'
        };
      case 'confirmed':
        return {
          color: 'text-purple-700',
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          icon: CheckCircle,
          text: 'Confirmed',
          gradient: 'from-purple-50 to-purple-100'
        };
      default:
        return {
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          icon: Package,
          text: 'Unknown',
          gradient: 'from-gray-50 to-gray-100'
        };
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  const getDeliveryStatus = (order) => {
    const deliveryDate = new Date(order.deliveryDate);
    const today = new Date();
    const daysLeft = Math.ceil(
      (deliveryDate - today) / (1000 * 60 * 60 * 24)
    );

    if (order.status === 'completed') {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Delivered"
          color="success"
          variant="outlined"
        />
      );
    }

    return (
      <Chip
        icon={<LocalShipping />}
        label={`${daysLeft} days until delivery`}
        color={daysLeft > 0 ? 'primary' : 'error'}
        variant="outlined"
      />
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderOrders = () => {
    if (!Array.isArray(filteredOrders)) {
      return (
        <div className="text-center text-gray-500 py-8">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>No orders found</p>
        </div>
      );
    }

    return filteredOrders.map((order) => {
      const statusInfo = getStatusInfo(order.status);
      const StatusIcon = statusInfo.icon;

      // Determine if Track button should be shown (status is shipped, out_for_delivery, or delivered)
      const canTrack =
        order.status === 'shipped' ||
        order.status === 'out_for_delivery' ||
        order.status === 'delivered';

      return (
        <div
          key={order._id}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
        >
          {/* Order Header */}
          <div className={`bg-gradient-to-r ${statusInfo.gradient} p-6 border-b border-gray-100`}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Order #{order._id?.slice(-8)}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}
                  >
                    <StatusIcon className="inline w-4 h-4 mr-1" />
                    {statusInfo.text}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail size={16} />
                    <span className="truncate max-w-48">{order.customerDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard size={16} />
                    <span className="font-semibold text-gray-800">Rs.{order.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => viewOrderDetails(order)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">View Details</span>
                </button>

              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <div className="space-y-3 mb-4">
              {order.items?.slice(0, 2).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.medicineId?.name || 'Unknown Medicine'}
                    </p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      Rs.{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rs.{item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}

              {order.items?.length > 2 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  +{order.items.length - 2} more items
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {/* Note: Mark as Received functionality moved to delivery service dashboard */}
            {/* Only delivery personnel can mark orders as received */}
            {(order.status === 'pending' || order.status === 'processing') && (
              <button
                onClick={() => handleCancelOrder(order._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <X size={18} />
                Cancel Order
              </button>
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-center">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/pharmacy')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Pharmacy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user ? `${user.name}'s Orders` : 'My Orders'}
              </h1>
              <p className="text-gray-600 mt-1">Track and manage your medicine orders</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/pharmacy')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <ShoppingCart size={20} />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders by ID or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Processing</option>
                <option value="shipped">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <button
                onClick={() => navigate('/pharmacy')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <ShoppingCart size={20} />
                Start Shopping
              </button>
            </div>
          ) : (
            renderOrders()
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-blue-100 mt-1">#{selectedOrder._id}</p>
                </div>
                <button
                  onClick={handleCloseOrderDetails}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">#{selectedOrder._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).bg} ${getStatusInfo(selectedOrder.status).color}`}>
                          {getStatusInfo(selectedOrder.status).text}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold text-lg">Rs.{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-gray-500" />
                        <span>{selectedOrder.customerDetails?.fullName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-gray-500" />
                        <span>{selectedOrder.customerDetails?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-gray-500" />
                        <span>{selectedOrder.customerDetails?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-500 mt-1" />
                        <span>{selectedOrder.shippingAddress || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Items Ordered</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {item.medicineId?.name || 'Unknown Medicine'}
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Quantity: {item.quantity}</p>
                              <p>Unit Price: Rs.{item.price?.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-800">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>Rs.{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between text-lg font-bold text-gray-800">
                          <span>Total:</span>
                          <span>Rs.{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                {/* Note: Mark as Received functionality moved to delivery service dashboard */}
                {/* Only delivery personnel can mark orders as received */}
                {(selectedOrder.status === 'shipped' ||
                  selectedOrder.status === 'out_for_delivery' ||
                  selectedOrder.status === 'delivered') && (
                    <button
                      onClick={() => {
                        handleCloseOrderDetails();
                        handleTrackOrder(selectedOrder);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Truck size={20} />
                      Track Order
                    </button>
                  )}
                <button
                  onClick={handleCloseOrderDetails}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTracking && selectedOrder && (
        <TrackingModal
          order={selectedOrder}
          onClose={() => {
            setShowTracking(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
