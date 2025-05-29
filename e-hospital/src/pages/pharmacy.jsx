import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Upload, ShoppingCart, Calendar, Clock, ArrowRight, PlusCircle, MapPin, Pill, FileText, Star, BarChart2, User, Phone, CreditCard, Bell, X, Check, Heart, AlertCircle, Home, Mail, ChevronDown, RefreshCw } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RTPjZQuyh1tLYvj4fHLAZfzpgW7XQKqmFK09RHd2FnLtB1yTMQBU5QagGZO17y9vPkd3JnVcIM7H9gOdED5BsJw00UBfavDQe');

const CheckoutForm = ({ orderData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cod' // Default to Cash on Delivery
  });
  const [showStripe, setShowStripe] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setFormData({ ...formData, paymentMethod: method });
    setShowStripe(method === 'card');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.zipCode) {
      onSubmit({ error: 'Please fill in all required fields' });
      return;
    }

    if (formData.paymentMethod === 'card') {
      if (!stripe || !elements) {
        onSubmit({ error: 'Stripe is not loaded' });
        return;
      }
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
      if (error) {
        onSubmit({ error: error.message });
        return;
      }
      onSubmit({ ...formData, paymentMethodId: paymentMethod.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-medium mb-4">Delivery Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-medium mb-4">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => handlePaymentMethodChange('cod')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive your order</p>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => handlePaymentMethodChange('card')}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-gray-500">Pay securely with your card</p>
                </div>
              </label>
            </div>
            {showStripe && (
              <div className="mt-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': { color: '#aab7c4' },
                      },
                      invalid: { color: '#9e2146' },
                    },
                  }}
                />
              </div>
            )}
          </div>
          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs.{orderData.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs.5.00</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>Rs.{orderData.total}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Pharmacy = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [user, setUser] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        if (parsedUser && parsedUser._id) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9000/v1/api/medicines/all');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      showNotificationMessage('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionUpload = async (file) => {
    try {
      setPrescriptionError(null);
      setLoading(true);
      setUploadProgress(0);

      if (!file) throw new Error('Please select a file');
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) throw new Error('Please upload a valid image (JPG, PNG) or PDF file');
      if (file.size > 5 * 1024 * 1024) throw new Error('File size should be less than 5MB');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to upload prescriptions');

      const formData = new FormData();
      formData.append('prescription', file);

      const response = await axios.post(
        'http://localhost:9000/v1/api/prescriptions/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (response.data.success) {
        setSuggestedMedicines(response.data.medicines || []);
        showNotificationMessage('Prescription processed successfully');
      } else {
        throw new Error(response.data.message || 'Failed to process prescription');
      }
    } catch (error) {
      console.error('Error processing prescription:', error);
      setPrescriptionError(error.message || 'Failed to process prescription');
      setSuggestedMedicines([]);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCheckout = async (formData) => {
    try {
      if (formData.error) {
        showNotificationMessage(formData.error);
        return;
      }

      const outOfStockItems = cart.filter(item => {
        const medicine = medicines.find(m => m._id === item._id);
        return medicine?.stock === 0;
      });

      if (outOfStockItems.length > 0) {
        showNotificationMessage(`Some items are out of stock: ${outOfStockItems.map(item => item.name).join(', ')}`);
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          medicineId: item._id,
          quantity: 1,
          price: Number(item.price)
        })),
        totalAmount: Number(cart.reduce((total, item) => total + item.price, 0) + 5),
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`.trim(),
        customerDetails: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim()
        },
        paymentMethod: formData.paymentMethod,
        ...(formData.paymentMethod === 'card' && { paymentMethodId: formData.paymentMethodId })
      };

      const response = await axios.post('http://localhost:9000/v1/api/orders', orderData);
      setOrderDetails({
        orderId: response.data._id,
        items: cart,
        totalAmount: orderData.totalAmount,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        orderDate: new Date().toLocaleString(),
        customerDetails: orderData.customerDetails,
        shippingAddress: orderData.shippingAddress
      });
      setShowCheckoutForm(false);
      setOrderSuccess(true);
      setCart([]);
      fetchMedicines();
    } catch (error) {
      console.error('Order error:', error);
      showNotificationMessage(error.response?.data?.message || 'Failed to place order');
    }
  };

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine) => {
    if (medicine.stock === 0) {
      showNotificationMessage("Sorry, this medicine is currently out of stock");
      return;
    }
    setCart([...cart, medicine]);
    showNotificationMessage(`${medicine.name} added to cart`);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    const removedItem = newCart[index];
    newCart.splice(index, 1);
    setCart(newCart);
    showNotificationMessage(`${removedItem.name} removed from cart`);
  };

  const showNotificationMessage = (message) => {
    setNotificationMsg(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const renderUploadPrescription = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload Your Prescription</h2>
      <div className={`bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center relative ${loading ? 'opacity-50' : ''}`}>
        {uploadProgress > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <RefreshCw className="animate-spin mb-2 mx-auto text-indigo-600" size={24} />
              <p className="text-sm">Processing... {uploadProgress}%</p>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files[0];
            setPrescriptionFile(file);
            handlePrescriptionUpload(file);
          }}
          className="hidden"
          id="prescription-upload"
          disabled={loading}
        />
        <label htmlFor="prescription-upload" className={`cursor-pointer ${loading ? 'pointer-events-none' : ''}`}>
          <Upload size={48} className="mx-auto text-indigo-500 mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop your prescription here or click to browse</p>
          <p className="text-sm text-gray-500">Supported formats: JPG, PNG, PDF (max 5MB)</p>
        </label>
        {prescriptionError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
            <AlertCircle size={16} className="mr-2" />
            {prescriptionError}
          </div>
        )}
      </div>
      {suggestedMedicines.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Suggested Medicines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedMedicines.map(medicine => (
              <div key={medicine._id} className="border rounded-lg p-4">
                <h4 className="font-medium">{medicine.name}</h4>
                <p className="text-sm text-gray-600">{medicine.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold">Rs.{medicine.price}</span>
                  {medicine.stock > 0 ? (
                    <button
                      onClick={() => addToCart(medicine)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const OrderSuccessModal = ({ orderDetails, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 relative animate-slideIn">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-green-500 rounded-full p-3">
            <Check size={40} className="text-white" />
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully! 🎉</h2>
          <p className="text-gray-600 mb-6">Thank you for trusting our pharmacy services!</p>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">Order ID</p>
              <p className="text-lg font-mono">{orderDetails.orderId}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="space-y-2">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>Rs.{item.price}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>Rs. {orderDetails.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-left">
              <div className="flex items-center mb-2">
                <Calendar className="text-indigo-600 mr-2" size={20} />
                <span className="font-medium">Estimated Delivery</span>
              </div>
              <p className="text-indigo-800">{orderDetails.estimatedDelivery}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-indigo-100 text-indigo-600 py-2 rounded-lg flex items-center justify-center"
            >
              <FileText size={18} className="mr-2" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center"
            >
              <ShoppingCart size={18} className="mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCart = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Your cart is empty</p>
          <button
            onClick={() => setActiveTab('search')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Browse Medicines
          </button>
        </div>
      ) : (
        <div>
          <div className="border-b pb-4 mb-4">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3">
                <div className="flex items-center">
                  <img
                    src={item.image || 'https://via.placeholder.com/48'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="ml-4">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Rs.{item.price}</p>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">Rs.{cart.reduce((total, item) => total + item.price, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-semibold">Rs.5.00</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>Rs.{cart.reduce((total, item) => total + item.price, 0) + 5}</span>
            </div>
            <button
              onClick={() => setShowCheckoutForm(true)}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStockStatus = (medicine) => {
    if (medicine.stock > 10) {
      return (
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          In Stock
        </span>
      );
    } else if (medicine.stock > 0) {
      return (
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
          Out of Stock
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">Pharmacy</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${activeTab === 'search' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Search size={18} />
            <span>Search Medicines</span>
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${activeTab === 'cart' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <ShoppingCart size={18} />
            <span>View Cart</span>
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${activeTab === 'prescription' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Upload size={18} />
            <span>Upload Prescription</span>
          </button>
        </div>
      </div>
      {showNotification && (
        <div className="mb-4 p-4 bg-indigo-100 text-indigo-700 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m4 4h-1v-4h1m-9 8h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">{notificationMsg}</span>
        </div>
      )}
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for medicines, categories..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {loading ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="animate-spin h-8 w-8 mx-auto text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4.293 12.293a1 1 0 011.414 0L12 18.586l6.293-6.293a1 1 0 011.414 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414z" />
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedicines.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No medicines found</p>
                </div>
              ) : (
                filteredMedicines.map(medicine => (
                  <div key={medicine._id} className="border rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{medicine.name}</h3>
                      <p className="text-sm text-gray-600">{medicine.category}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xl font-bold">Rs.{medicine.price}</span>
                        {renderStockStatus(medicine)}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(medicine)}
                      className="mt-4 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
      {activeTab === 'cart' && renderCart()}
      {activeTab === 'prescription' && renderUploadPrescription()}
      {orderSuccess && orderDetails && (
        <OrderSuccessModal
          orderDetails={orderDetails}
          onClose={() => setOrderSuccess(false)}
        />
      )}
      {showCheckoutForm && (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            orderData={{
              subtotal: cart.reduce((total, item) => total + item.price, 0),
              total: cart.reduce((total, item) => total + item.price, 0) + 5
            }}
            onSubmit={handleCheckout}
            onCancel={() => setShowCheckoutForm(false)}
          />
        </Elements>
      )}
    </div>
  );
};

export default Pharmacy;
