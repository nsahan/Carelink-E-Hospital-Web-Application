import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Upload, ShoppingCart, Calendar, Clock, ArrowRight, PlusCircle, MapPin, Pill, FileText, Star, BarChart2, User, Phone, CreditCard, Bell, X, Check, Heart, AlertCircle, Home, Mail, ChevronDown, RefreshCw, Package, Truck, Shield, Award, Filter, SortAsc, Grid, List, Eye, Minus, Plus } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RTPjZQuyh1tLYvj4fHLAZfzpgW7XQKqmFK09RHd2FnLtB1yTMQBU5QagGZO17y9vPkd3JnVcIM7H9gOdED5BsJw00UBfavDQe');

const CheckoutForm = ({ orderData, onSubmit, onCancel }) => {
  const userStr = localStorage.getItem('user');
  const userData = userStr ? JSON.parse(userStr) : null;

  const [formData, setFormData] = useState({
    fullName: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cod',
  });
  const [showStripe, setShowStripe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.zipCode) {
      onSubmit({ error: 'Please fill in all required fields' });
      setIsSubmitting(false);
      return;
    }

    if (formData.paymentMethod === 'card') {
      if (!stripe || !elements) {
        onSubmit({ error: 'Stripe is not loaded' });
        setIsSubmitting(false);
        return;
      }
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
      if (error) {
        onSubmit({ error: error.message });
        setIsSubmitting(false);
        return;
      }
      onSubmit({ ...formData, paymentMethodId: paymentMethod.id });
    } else {
      onSubmit(formData);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
              <p className="text-sm text-gray-600">Complete your order securely</p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <User className="text-blue-600 mr-3" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <MapPin className="text-green-600 mr-3" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="text-purple-600 mr-3" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-white transition-all group">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => handlePaymentMethodChange('cod')}
                  className="w-5 h-5 text-purple-600 mr-4"
                />
                <div className="flex items-center flex-1">
                  <Package className="text-purple-600 mr-3" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </div>
                <div className="ml-auto">
                  <Shield className="text-green-500" size={16} />
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-white transition-all group">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => handlePaymentMethodChange('card')}
                  className="w-5 h-5 text-purple-600 mr-4"
                />
                <div className="flex items-center flex-1">
                  <CreditCard className="text-purple-600 mr-3" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                  </div>
                </div>
                <div className="ml-auto">
                  <Shield className="text-green-500" size={16} />
                </div>
              </label>
            </div>
            {showStripe && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
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
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="text-gray-600 mr-3" size={20} />
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rs.{orderData.subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <Truck size={16} className="mr-1" />
                  Delivery Fee
                </span>
                <span className="font-semibold">Rs.5.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">Rs.{orderData.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel Order
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="mr-2" size={18} />
                  Place Secure Order
                </>
              )}
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
  const [prescriptionResponse, setPrescriptionResponse] = useState(null);
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [user, setUser] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [cartQuantities, setCartQuantities] = useState({});
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showMedicineDetails, setShowMedicineDetails] = useState(false);
  const [medicineQuantity, setMedicineQuantity] = useState(1);
  const navigate = useNavigate();

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

      if (!file) throw new Error("Please select a file");
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type))
        throw new Error("Please upload a valid image (JPG, PNG) or PDF file");
      if (file.size > 5 * 1024 * 1024)
        throw new Error("File size should be less than 5MB");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to upload prescriptions");

      const formData = new FormData();
      formData.append("prescription", file);

      const response = await axios.post(
        "http://localhost:9000/v1/api/prescriptions/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
          timeout: 10000, // 10 seconds
        }
      );

      if (response.data.success) {
        const { identifiedMedicines, matchedMedicines, unmatchedMedicines } =
          response.data.data;
        setPrescriptionResponse(response.data.data);
        setSuggestedMedicines(matchedMedicines || []);
        showNotificationMessage(
          matchedMedicines.length > 0
            ? `Found ${matchedMedicines.length} matching medicine(s)`
            : "No matching medicines found in our database"
        );
        if (unmatchedMedicines.length > 0) {
          console.log("Unmatched medicines:", unmatchedMedicines);
        }
      } else {
        throw new Error(response.data.message || "Failed to process prescription");
      }
    } catch (error) {
      console.error("Error processing prescription:", error);
      let errorMsg = "Failed to process prescription. Please try again.";
      if (
        error.code === "ECONNREFUSED" ||
        error.code === "ERR_SOCKET_NOT_CONNECTED"
      ) {
        errorMsg = "Server is unavailable. Please check if the backend is running.";
      } else if (error.response) {
        errorMsg = error.response.data.message || error.message;
      }
      setPrescriptionError(errorMsg);
      setSuggestedMedicines([]);
      showNotificationMessage(errorMsg);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setPrescriptionFile(null);
    }
  };

  const handleCheckout = async (formData) => {
    try {
      if (formData.error) {
        showNotificationMessage(formData.error);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to place order');
      }
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      const outOfStockItems = cart.filter(item => {
        const medicine = medicines.find(m => m._id === item._id);
        return medicine?.stock === 0;
      });

      if (outOfStockItems.length > 0) {
        showNotificationMessage(`Some items are out of stock: ${outOfStockItems.map(item => item.name).join(', ')}`);
        return;
      }

      const orderData = {
        userId,
        items: cart.map(item => ({
          medicineId: item._id,
          name: item.name,
          quantity: cartQuantities[item._id] || 1,
          price: Number(item.price),
        })),
        totalAmount: Number(getTotalPrice() + 5),
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`.trim(),
        customerDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        ...(formData.paymentMethod === 'card' && { paymentMethodId: formData.paymentMethodId }),
      };

      const response = await axios.post('http://localhost:9000/v1/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setOrderDetails({
        orderId: response.data.data._id,
        items: cart,
        totalAmount: orderData.totalAmount,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        orderDate: new Date().toLocaleString(),
        customerDetails: orderData.customerDetails,
        shippingAddress: orderData.shippingAddress,
      });

      setShowCheckoutForm(false);
      setOrderSuccess(true);
      setCart([]);
      setCartQuantities({});
      fetchMedicines();
    } catch (error) {
      console.error('Order error:', error);
      showNotificationMessage(error.response?.data?.message || 'Failed to place order');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const quantity = cartQuantities[item._id] || 1;
      return total + (item.price * quantity);
    }, 0);
  };

  const updateQuantity = (itemId, change) => {
    const currentQuantity = cartQuantities[itemId] || 1;
    const newQuantity = Math.max(1, currentQuantity + change);
    setCartQuantities({ ...cartQuantities, [itemId]: newQuantity });
  };

  const categories = [...new Set(medicines.map(med => med.category))];

  const filteredMedicines = medicines
    .filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const addToCart = (medicine, quantity = 1) => {
    if (medicine.stock === 0) {
      showNotificationMessage('Sorry, this medicine is currently out of stock');
      return;
    }
    const existingItem = cart.find(item => item._id === medicine._id);
    if (existingItem) {
      showNotificationMessage(`${medicine.name} is already in your cart`);
      return;
    }
    setCart([...cart, medicine]);
    setCartQuantities({ ...cartQuantities, [medicine._id]: quantity });
    showNotificationMessage(`${medicine.name} added to cart (${quantity} ${quantity === 1 ? 'unit' : 'units'})`);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    const removedItem = newCart[index];
    newCart.splice(index, 1);
    setCart(newCart);
    const newQuantities = { ...cartQuantities };
    delete newQuantities[removedItem._id];
    setCartQuantities(newQuantities);
    showNotificationMessage(`${removedItem.name} removed from cart`);
  };

  const openMedicineDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setMedicineQuantity(1);
    setShowMedicineDetails(true);
  };

  const handleAddToCartFromModal = (medicine, quantity) => {
    addToCart(medicine, quantity);
  };

  const showNotificationMessage = (message) => {
    setNotificationMsg(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const renderUploadPrescription = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
          <Upload className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Prescription</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload a clear photo or PDF of your prescription to scan and find the medicines you need.
        </p>
      </div>

      <div className={`relative bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-2xl p-12 text-center transition-all duration-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-100 hover:via-blue-100 hover:to-purple-100 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploadProgress > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-2xl">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <RefreshCw className="animate-spin mb-3 mx-auto text-indigo-600" size={32} />
              <p className="text-lg font-medium">Scanning Prescription...</p>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{uploadProgress}% complete</p>
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

        <label htmlFor="prescription-upload" className={`cursor-pointer block ${loading ? 'pointer-events-none' : ''}`}>
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
              <Upload size={40} className="text-indigo-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Drop your prescription here</h3>
          <p className="text-gray-600 mb-2">or click to browse from your device</p>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center text-sm text-gray-500">
              <FileText size={16} className="mr-2" />
              PDF Files
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Eye size={16} className="mr-2" />
              JPG, PNG Images
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Maximum file size: 5MB</p>
        </label>

        {prescriptionError && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-200">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <span className="font-medium">{prescriptionError}</span>
          </div>
        )}
      </div>

      {suggestedMedicines.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Check className="text-green-600" size={18} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Medicines Found in Prescription</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedMedicines.map(medicine => (
              <div key={medicine._id} className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-indigo-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4
                      className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => openMedicineDetails(medicine)}
                    >
                      {medicine.name}
                    </h4>
                    <p className="text-sm text-gray-500">{medicine.category}</p>
                  </div>
                  {renderStockStatus(medicine)}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{medicine.description}</p>
                <div className="flex items-center mb-4">
                  <Pill className="text-indigo-500 mr-2" size={16} />
                  <span className="text-sm text-gray-600">{medicine.dosage || 'As prescribed'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-indigo-600">Rs.{medicine.price}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openMedicineDetails(medicine)}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
                    >
                      <Eye size={14} className="mr-1" />
                      Details
                    </button>
                    {medicine.stock > 0 ? (
                      <button
                        onClick={() => addToCart(medicine)}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        Add to Cart
                      </button>
                    ) : (
                      <span className="text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prescriptionResponse?.unmatchedMedicines?.length > 0 && (
        <div className="bg-yellow-50 rounded-2xl p-8 mt-6 border border-yellow-200">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-yellow-600 mr-3" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Medicines Not Found in Database</h3>
          </div>
          <p className="text-gray-600 mb-4">
            The following medicines were identified in your prescription but are not available in our inventory. Please contact support for assistance.
          </p>
          <ul className="list-disc list-inside text-gray-600">
            {prescriptionResponse.unmatchedMedicines.map((name, index) => (
              <li key={index} className="text-sm">{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const OrderSuccessModal = ({ orderDetails, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden">
        {/* Success Animation Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-green-400 to-emerald-500"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
          <X size={24} className="text-white" />
        </button>

        <div className="relative z-10 p-8 pt-16">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Check className="text-green-500" size={40} />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600">Thank you for your order. We'll process it shortly.</p>
          </div>

          {/* Order Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold text-gray-900">#{orderDetails.orderId.slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-green-600">Rs.{orderDetails.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">{orderDetails.estimatedDelivery}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MedicineDetailsModal = ({ medicine, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (change) => {
      const newQuantity = Math.max(1, Math.min(medicine.stock, quantity + change));
      setQuantity(newQuantity);
    };

    const handleAddToCart = () => {
      onAddToCart(medicine, quantity);
      onClose();
    };

    if (!medicine) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Medicine Details</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Medicine Image and Basic Info */}
              <div className="space-y-6">
                {/* Medicine Image */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 flex items-center justify-center">
                  <div className="w-48 h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                    <Pill size={80} className="text-indigo-500" />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">{medicine.name}</h3>
                    {renderStockStatus(medicine)}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Pill className="mr-2" size={16} />
                      <span className="capitalize">{medicine.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="text-yellow-400 mr-1" size={16} />
                      <span>4.5 (120 reviews)</span>
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-indigo-600">
                    Rs.{medicine.price}
                  </div>
                </div>
              </div>

              {/* Right Column - Details and Actions */}
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{medicine.description}</p>
                </div>

                {/* Key Features */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>Authentic and Genuine Product</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>Fast Delivery (2-3 business days)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>Secure Payment Options</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Check className="text-green-500 mr-2" size={16} />
                      <span>Professional Medical Consultation Available</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-6 py-3 border-x border-gray-300 min-w-[80px] text-center text-lg font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= medicine.stock}
                        className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {medicine.stock} available
                    </span>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Price per unit:</span>
                    <span className="font-semibold">Rs.{medicine.price}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-indigo-600">Rs.{(medicine.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {medicine.stock > 0 ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                    >
                      <ShoppingCart className="mr-2" size={20} />
                      Add to Cart - Rs.{(medicine.price * quantity).toFixed(2)}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center"
                    >
                      <AlertCircle className="mr-2" size={20} />
                      Out of Stock
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Additional Info */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-start">
                    <AlertCircle className="text-yellow-600 mr-3 mt-1" size={16} />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important Notice</p>
                      <p>This medicine requires a valid prescription. Please ensure you have consulted with a healthcare professional before purchasing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStockStatus = (medicine) => {
    if (medicine.stock === 0) {
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">Out of Stock</span>;
    } else if (medicine.stock < 10) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Low Stock</span>;
    } else {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">In Stock</span>;
    }
  };

  const renderMedicineCard = (medicine) => (
    <div key={medicine._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-indigo-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3
              className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors cursor-pointer"
              onClick={() => openMedicineDetails(medicine)}
            >
              {medicine.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{medicine.category}</p>
          </div>
          {renderStockStatus(medicine)}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{medicine.description}</p>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Pill className="text-indigo-500 mr-2" size={16} />
            <span className="text-sm text-gray-600">{medicine.dosage || 'As prescribed'}</span>
          </div>
          <div className="flex items-center">
            <Star className="text-yellow-400 mr-1" size={14} />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-indigo-600">Rs.{medicine.price}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => openMedicineDetails(medicine)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
            >
              <Eye size={14} className="mr-1" />
              Details
            </button>
            {medicine.stock > 0 ? (
              <button
                onClick={() => addToCart(medicine)}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center transform hover:scale-105"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center"
              >
                <AlertCircle size={16} className="mr-2" />
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicineList = (medicine) => (
    <div key={medicine._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border hover:border-indigo-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3
              className="text-lg font-semibold text-gray-900 mr-3 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => openMedicineDetails(medicine)}
            >
              {medicine.name}
            </h3>
            {renderStockStatus(medicine)}
          </div>
          <p className="text-gray-600 text-sm mb-2">{medicine.description}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Pill className="mr-1" size={14} />
            <span className="mr-4">{medicine.category}</span>
            <Star className="text-yellow-400 mr-1" size={14} />
            <span>4.5</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-indigo-600">Rs.{medicine.price}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => openMedicineDetails(medicine)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
            >
              <Eye size={14} className="mr-1" />
              Details
            </button>
            {medicine.stock > 0 ? (
              <button
                onClick={() => addToCart(medicine)}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed flex items-center"
              >
                <AlertCircle size={16} className="mr-2" />
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearchMedicines = () => (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Medicines</h2>
        <p className="text-gray-600">Search from our extensive collection of quality medicines</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search medicines by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* Sort Options */}
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white min-w-[150px]"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 flex items-center transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 flex items-center transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>{filteredMedicines.length} medicines found</span>
          {searchQuery && (
            <span>Results for "{searchQuery}"</span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="animate-spin mr-3 text-indigo-600" size={24} />
          <span className="text-gray-600">Loading medicines...</span>
        </div>
      )}

      {/* Medicines Grid/List */}
      {!loading && (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredMedicines.map(medicine =>
            viewMode === 'grid' ? renderMedicineCard(medicine) : renderMedicineList(medicine)
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h2>
        <p className="text-gray-600">Review your selected medicines before checkout</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Add some medicines to get started</p>
          <button
            onClick={() => setActiveTab('search')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
          >
            <Search className="mr-2" size={18} />
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Pill className="mr-1" size={14} />
                      <span>{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 min-w-[50px] text-center">
                        {cartQuantities[item._id] || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        Rs.{(item.price * (cartQuantities[item._id] || 1)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Rs.{item.price} each</p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg border p-6 h-fit sticky top-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="mr-3 text-indigo-600" size={20} />
              Order Summary
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                <span className="font-semibold">Rs.{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <Truck size={16} className="mr-1" />
                  Delivery Fee
                </span>
                <span className="font-semibold">Rs.5.00</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-indigo-600">Rs.{(getTotalPrice() + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCheckoutForm(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
            >
              <ShoppingCart className="mr-2" size={20} />
              Proceed to Checkout
            </button>

            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <Shield className="mr-2" size={16} />
              Secure & Safe Payment
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-lg border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                  <Pill className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Carelink</h1>
                  <p className="text-sm text-gray-600">Your trusted pharmacy</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="text-indigo-600" size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Welcome, {user.name}</span>
                  </div>
                )}
                <div className="relative">
                  <button
                    onClick={() => setActiveTab('cart')}
                    className="p-2 bg-indigo-100 rounded-xl hover:bg-indigo-200 transition-colors relative"
                  >
                    <ShoppingCart className="text-indigo-600" size={20} />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'search', label: 'Search Medicines', icon: Search },
                { id: 'upload', label: 'Upload Prescription', icon: Upload },
                { id: 'cart', label: `Cart (${cart.length})`, icon: ShoppingCart },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon className="mr-2" size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'search' && renderSearchMedicines()}
          {activeTab === 'upload' && renderUploadPrescription()}
          {activeTab === 'cart' && renderCart()}
        </main>

        {/* Modals */}
        {showCheckoutForm && (
          <CheckoutForm
            orderData={{
              subtotal: getTotalPrice().toFixed(2),
              total: (getTotalPrice() + 5).toFixed(2),
            }}
            onSubmit={handleCheckout}
            onCancel={() => setShowCheckoutForm(false)}
          />
        )}

        {orderSuccess && orderDetails && (
          <OrderSuccessModal
            orderDetails={orderDetails}
            onClose={() => setOrderSuccess(false)}
          />
        )}

        {showMedicineDetails && selectedMedicine && (
          <MedicineDetailsModal
            medicine={selectedMedicine}
            onClose={() => {
              setShowMedicineDetails(false);
              setSelectedMedicine(null);
            }}
            onAddToCart={handleAddToCartFromModal}
          />
        )}

        {/* Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 transform transition-all duration-300 animate-slide-in-right">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Check className="text-green-600" size={16} />
                </div>
                <p className="text-sm font-medium text-gray-900 flex-1">{notificationMsg}</p>
                <button
                  onClick={() => setShowNotification(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Elements>
  );
};

export default Pharmacy; 