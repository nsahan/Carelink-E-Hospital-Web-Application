import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:9000/v1/api/orders/user-orders', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Package className="text-yellow-500" />;
      case 'processing': return <Truck className="text-blue-500" />;
      case 'delivered': return <CheckCircle className="text-green-500" />;
      case 'cancelled': return <XCircle className="text-red-500" />;
      default: return <Package className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order #{order._id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center py-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.medicineId.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">Rs.{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
                    </p>
                    <p className="font-medium">Total Amount: Rs.{order.totalAmount}</p>
                  </div>
                  
                  {order.status === 'delivered' && (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => window.location.href = '/pharmacy'}
                    >
                      Order Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
