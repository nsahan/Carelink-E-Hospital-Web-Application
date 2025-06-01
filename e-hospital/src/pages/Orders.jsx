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
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button, Chip } from '@mui/material';
import { LocalShipping, CheckCircleOutline } from '@mui/icons-material'; // Changed import

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState({});
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

  const markAsReceived = async (orderId) => {
    try {
      const response = await axios.put(
        `http://localhost:9000/api/orders/${orderId}/received`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setOrders(
          orders.map((order) =>
            order._id === orderId
              ? { ...order, status: 'completed', deliveredAt: new Date() }
              : order
          )
        );
        toast.success('Order marked as received');
      }
    } catch (error) {
      console.error('Error marking order as received:', error);
      toast.error(error.response?.data?.message || 'Failed to mark order as received');
    }
  };

  const handleOrderReceived = async (orderId) => {
    try {
      const response = await axios.put(
        `http://localhost:9000/api/orders/${orderId}/status`,
        { status: 'completed' },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.data.success) {
        // Update local state
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: 'completed' } : order
          )
        );
        toast.success('Order marked as received');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleOrderNotReceived = async (orderId) => {
    try {
      const response = await axios.put(
        `http://localhost:9000/api/orders/${orderId}/not-received`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        toast.info('Order marked as not received. Admin will track your order.');
        setOrders(
          orders.map((order) =>
            order._id === orderId
              ? { ...order, status: 'tracking_required' }
              : order
          )
        );
      }
    } catch (error) {
      toast.error('Failed to report order status');
    }
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: CheckCircle,
          text: 'Delivered',
        };
      case 'pending':
        return {
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: Clock,
          text: 'Processing',
        };
      case 'shipped':
      case 'dispatched':
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: Truck,
          text: 'In Transit',
        };
      case 'cancelled':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: AlertCircle,
          text: 'Cancelled',
        };
      case 'confirmed':
        return {
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: CheckCircle,
          text: 'Confirmed',
        };
      default:
        return {
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: Package,
          text: 'Unknown',
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
    const daysLeft = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));

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

  // Add type checking before mapping, inspired by Appointment.jsx
  const renderOrders = () => {
    if (!Array.isArray(orders)) {
      return (
        <div className="text-center text-gray-500 py-4">
          No orders found
        </div>
      );
    }

    return orders.map((order) => {
      const statusInfo = getStatusInfo(order.status);
      const StatusIcon = statusInfo.icon;

      return (
        <div
          key={order._id}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="mb-2 sm:mb-0">
                <p className="text-sm text-gray-600">
                  Order ID: #{order._id}
                </p>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>{order.customerDetails?.email || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}
                >
                  <StatusIcon className="inline w-4 h-4 mr-1" />
                  {statusInfo.text}
                </span>
                <button
                  onClick={() => viewOrderDetails(order)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="View Details"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center">
                    <img
                      src={item.medicineId?.image || '/placeholder-medicine.png'}
                      alt={item.medicineId?.name || 'Medicine'}
                      className="w-10 h-10 object-cover rounded mr-3"
                      onError={(e) => {
                        e.target.src = '/placeholder-medicine.png';
                        e.target.onerror = null;
                      }}
                    />
                    <div>
                      <p className="font-medium">
                        {item.medicineId?.name || 'Unknown Medicine'}
                      </p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <span className="font-medium mb-2 sm:mb-0">Total Amount:</span>
              <span className="font-bold text-lg">
                Rs.{order.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>

            {order.status === 'shipped' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => markAsReceived(order._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark as Received
                </button>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const getRemainingDays = (orderDate) => {
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const today = new Date();
    const remaining = Math.ceil(
      (deliveryDate - today) / (1000 * 60 * 60 * 24)
    );
    return remaining > 0 ? remaining : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 bg-gray-50 rounded-lg">
        <AlertCircle className="mx-auto mb-4" size={48} />
        <p>{error}</p>
        <button
          onClick={() => navigate('/pharmacy')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Pharmacy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          {user ? `${user.name}'s Orders` : 'My Orders'}
        </h2>
        <button
          onClick={() => navigate('/pharmacy')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          Continue Shopping
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-4">No orders found</p>
            <button
              onClick={() => navigate('/pharmacy')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          renderOrders()
        )}
      </div>

      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button
                onClick={handleCloseOrderDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium mb-2">Order Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>
                    <strong>Order ID:</strong> #{selectedOrder._id}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {getStatusInfo(selectedOrder.status).text}
                  </p>
                  <p>
                    <strong>Total:</strong> Rs.
                    {selectedOrder.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {selectedOrder.customerDetails?.email || 'N/A'}
                  </p>
                  <p>
                    <strong>Name:</strong>{' '}
                    {selectedOrder.customerDetails?.fullName || 'N/A'}
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    {selectedOrder.customerDetails?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Delivery Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{selectedOrder.shippingAddress || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            item.medicineId?.image || '/placeholder-medicine.png'
                          }
                          alt={item.medicineId?.name || 'Medicine'}
                          className="w-12 h-12 object-cover rounded mr-3"
                          onError={(e) => {
                            e.target.src = '/placeholder-medicine.png';
                            e.target.onerror = null;
                          }}
                        />
                        <div>
                          <p className="font-medium">
                            {item.medicineId?.name || 'Unknown Medicine'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        Rs.{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;