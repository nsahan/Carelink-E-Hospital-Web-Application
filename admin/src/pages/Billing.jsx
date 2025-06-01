import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Filter, Search, CreditCard, Truck, AlertTriangle, Check, Package } from 'lucide-react';
import { Select, MenuItem, FormControl } from '@mui/material';
import { toast } from 'react-toastify';

const PaymentMethodsTable = ({ orders }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Payment Methods Overview</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order._id.slice(-6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customerDetails?.fullName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${order.paymentMethod === 'card' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'}`}
                  >
                    {order.paymentMethod === 'card' ? 'Card Payment' : 'Cash on Delivery'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rs.{order.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${order.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'tracking_required'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState(null);

  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'tracking_required': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'tracking_required': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'tracking_required': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9000/v1/api/orders/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('atoken')}`,
          'Content-Type': 'application/json',
        },
      });
      const transformedOrders = response.data.map(order => ({
        ...order,
        customerDetails: order.customerDetails || {
          fullName: 'N/A',
          email: 'N/A',
          phone: 'N/A',
        },
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        paymentMethod: order.paymentMethod || 'N/A',
        paymentStatus: order.paymentStatus || 'pending',
        shippingAddress: order.shippingAddress || 'N/A',
        createdAt: order.createdAt || new Date(),
        status: order.status || 'pending',
      }));
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
      toast.error('Failed to fetch orders', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:9000/v1/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('atoken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success('Order status updated successfully', {
          position: 'top-right',
          autoClose: 3000,
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  const handleTrackOrder = async (orderId) => {
    try {
      const response = await axios.get(
        `http://localhost:9000/v1/api/orders/${orderId}/tracking`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('atoken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setOrders(orders.map(order =>
        order._id === orderId
          ? { ...order, tracking: response.data.tracking }
          : order
      ));
      toast.info('Tracking information updated', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      toast.error('Failed to fetch tracking info', {
        position: 'top-right',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const StatusUpdateModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-12">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
        <div className="space-y-3">
          {['pending', 'processing', 'shipped', 'completed', 'cancelled', 'tracking_required'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(order._id, status)}
              className={`w-full p-3 rounded-lg flex items-center justify-between capitalize ${
                order.status === status ? getStatusColor(status) : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {getStatusIcon(status)}
                <span className="ml-2">{status}</span>
              </div>
              {order.status === status && <Check size={16} />}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
            <p className="text-sm">Order ID: #{order._id?.slice(-6)}</p>
            <p className="text-sm">Date: {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-sm">Total Amount: Rs.{order.totalAmount}</p>
            <div className="mt-2">
              <span className={getStatusBadgeClass(order.status)}>
                {order.status}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Customer Details</h3>
            <p className="text-sm">{order.customerDetails?.fullName}</p>
            <p className="text-sm">{order.customerDetails?.email}</p>
            <p className="text-sm">{order.customerDetails?.phone}</p>
            <p className="text-sm">{order.shippingAddress}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-4">Ordered Medicines</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.medicineId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.medicineId?.category || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Rs.{item.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">Rs.{item.quantity * item.price}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-4 text-sm font-medium text-right">Subtotal:</td>
                  <td className="px-6 py-4 text-sm">Rs.{order.totalAmount - 5}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-4 text-sm font-medium text-right">Delivery Fee:</td>
                  <td className="px-6 py-4 text-sm">Rs.5</td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-4 text-sm font-medium text-right">Total Amount:</td>
                  <td className="px-6 py-4 text-sm font-bold">Rs.{order.totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {order.status === 'tracking_required' && (
          <div className="mt-4">
            <button
              onClick={() => handleTrackOrder(order._id)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
            >
              <Truck className="w-4 h-4 mr-1" />
              Track Order
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            onClick={() => window.print()}
          >
            <Download className="inline-block w-4 h-4 mr-2" />
            Download Invoice
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const response = await axios.put(
        `http://localhost:9000/api/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('atoken')}` }
        }
      );

      if (response.data.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
        toast.success('Order status updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <select
            className="border rounded-lg px-4 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="tracking_required">Tracking Required</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            Error loading orders: {error}
          </p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Package size={40} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">Orders will appear here once customers place them</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicines</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerDetails?.fullName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customerDetails?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.map(item => item.medicineId?.name).join(', ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items.length} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rs.{order.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                    {order.status === 'tracking_required' && (
                      <button
                        onClick={() => handleTrackOrder(order._id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Track
                      </button>
                    )}
                    <FormControl size="small">
                      <Select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        size="small"
                        sx={{
                          minWidth: 120,
                          '& .MuiSelect-select': {
                            padding: '4px 8px',
                            fontSize: '0.875rem',
                          },
                        }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="tracking_required">Tracking Required</MenuItem>
                      </Select>
                    </FormControl>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showStatusModal && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      <PaymentMethodsTable orders={orders} />
    </div>
  );
};

export default Billing;