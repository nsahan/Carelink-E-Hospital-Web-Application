import React, { useState } from 'react';
import { Search, Upload, ShoppingCart, Calendar, Clock, ArrowRight, PlusCircle, MapPin, Pill, FileText, Star, BarChart2, User, Phone, CreditCard, Bell, X, Check, Heart, AlertCircle, Home, Mail, ChevronDown, RefreshCw } from 'lucide-react';

const Pharmacy = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Sample medicine data
  const medicines = [
    { id: 1, name: "Paracetamol", price: 5.99, category: "Pain Relief", stock: 120, prescription: false, img: "/api/placeholder/80/80" },
    { id: 2, name: "Amoxicillin", price: 12.50, category: "Antibiotics", stock: 85, prescription: true, img: "/api/placeholder/80/80" },
    { id: 3, name: "Lisinopril", price: 8.75, category: "Blood Pressure", stock: 65, prescription: true, img: "/api/placeholder/80/80" },
    { id: 4, name: "Cetirizine", price: 6.25, category: "Antihistamine", stock: 100, prescription: false, img: "/api/placeholder/80/80" },
    { id: 5, name: "Metformin", price: 7.50, category: "Diabetes", stock: 90, prescription: true, img: "/api/placeholder/80/80" },
    { id: 6, name: "Vitamin D", price: 10.25, category: "Supplements", stock: 150, prescription: false, img: "/api/placeholder/80/80" },
    { id: 7, name: "Simvastatin", price: 9.99, category: "Cholesterol", stock: 75, prescription: true, img: "/api/placeholder/80/80" },
    { id: 8, name: "Ibuprofen", price: 4.99, category: "Pain Relief", stock: 110, prescription: false, img: "/api/placeholder/80/80" },
  ];

  // Sample prescription orders
  const prescriptionOrders = [
    { id: 101, status: "Processing", date: "March 10, 2025", items: ["Lisinopril 10mg", "Atorvastatin 20mg"], total: 21.25 },
    { id: 102, status: "Delivered", date: "February 25, 2025", items: ["Metformin 500mg"], total: 15.50 },
  ];

  // Sample pharmacy locations
  const pharmacyLocations = [
    { id: 1, name: "Downtown Pharmacy", address: "123 Main St, Downtown", phone: "555-1234", hours: "8am - 10pm", distance: "0.5 miles" },
    { id: 2, name: "Westside Health Center", address: "456 West Ave, Westside", phone: "555-5678", hours: "24 hours", distance: "1.2 miles" },
    { id: 3, name: "Northpoint Pharmacy", address: "789 North Blvd, Northside", phone: "555-9012", hours: "9am - 9pm", distance: "2.3 miles" },
  ];

  // Sample health articles
  const healthArticles = [
    { id: 1, title: "Understanding Antibiotic Resistance", summary: "Learn about the growing concern of antibiotic resistance and how to use antibiotics responsibly.", img: "/api/placeholder/120/80" },
    { id: 2, title: "Managing High Blood Pressure at Home", summary: "Tips and lifestyle changes to help control hypertension between doctor visits.", img: "/api/placeholder/120/80" },
    { id: 3, title: "Seasonal Allergies: Prevention and Treatment", summary: "How to minimize exposure to allergens and find relief during allergy season.", img: "/api/placeholder/120/80" },
  ];

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine) => {
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50">
          <Check size={16} className="mr-2" />
          {notificationMsg}
          <button onClick={() => setShowNotification(false)} className="ml-4">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-800 mb-2"> Carelink ePharmacy</h1>
            <p className="text-gray-600">Your one-stop solution for all medication needs</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-indigo-100 text-indigo-700 p-2 rounded-full">
              <Bell size={20} />
            </button>
            <button className="bg-indigo-100 text-indigo-700 p-2 rounded-full">
              <User size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'search' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Search size={18} />
            <span>Search Medicines</span>
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Upload size={18} />
            <span>Upload Prescription</span>
          </button>
          <button 
            onClick={() => setActiveTab('cart')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'cart' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'} relative`}
          >
            <ShoppingCart size={18} />
            <span>Cart ({cart.length})</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('refills')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'refills' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Calendar size={18} />
            <span>Prescription Refills</span>
          </button>
          <button 
            onClick={() => setActiveTab('locations')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'locations' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <MapPin size={18} />
            <span>Pharmacy Locations</span>
          </button>
          <button 
            onClick={() => setActiveTab('health')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${activeTab === 'health' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <Heart size={18} />
            <span>Health Articles</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {activeTab === 'search' && (
          <div>
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search for medicines, categories, or symptoms..." 
                className="w-full py-3 px-4 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-3">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                {["Pain Relief", "Antibiotics", "Supplements", "Blood Pressure", "Diabetes", "Antihistamine"].map(category => (
                  <button 
                    key={category} 
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm hover:bg-indigo-100"
                    onClick={() => setSearchQuery(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedicines.map(medicine => (
                <div key={medicine.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <img src={medicine.img} alt={medicine.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">{medicine.name}</h3>
                      <p className="text-gray-600">{medicine.category}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-xl font-bold text-indigo-700">${medicine.price}</span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${medicine.stock > 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {medicine.stock} in stock
                      </span>
                    </div>
                    <button 
                      onClick={() => addToCart(medicine)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg flex items-center"
                    >
                      <PlusCircle size={16} className="mr-1" />
                      Add
                    </button>
                  </div>
                  {medicine.prescription && (
                    <div className="mt-2 text-xs text-orange-600 flex items-center">
                      <FileText size={12} className="mr-1" />
                      Prescription required
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredMedicines.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No medicines found. Try a different search term.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Your Prescription</h2>
            
            <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-indigo-500 mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop your prescription here or click to browse</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Upload Prescription</button>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium mb-2">How it works:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white shadow-sm rounded-lg p-4">
                  <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} className="text-indigo-600" />
                  </div>
                  <h4 className="font-medium">Upload Prescription</h4>
                  <p className="text-sm text-gray-600">Upload your doctor's prescription securely</p>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-4">
                  <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock size={24} className="text-indigo-600" />
                  </div>
                  <h4 className="font-medium">Verification</h4>
                  <p className="text-sm text-gray-600">Our pharmacist will verify your prescription</p>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-4">
                  <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={24} className="text-indigo-600" />
                  </div><h4 className="font-medium">Delivery</h4>
                  <p className="text-sm text-gray-600">Get your medicines delivered to your doorstep</p>
                </div>
              </div>
            </div>

            <div className="mt-8 border rounded-lg p-4">
              <h3 className="font-medium mb-4">Recent Prescription Orders</h3>
              {prescriptionOrders.map(order => (
                <div key={order.id} className="border-b pb-4 mb-4 last:mb-0 last:border-b-0">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">Order #{order.id}</h4>
                      <p className="text-sm text-gray-600">Placed on {order.date}</p>
                      <ul className="text-sm text-gray-600 mt-1">
                        {order.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                      <p className="font-medium mt-2">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
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
                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                      <div className="flex items-center">
                        <img src={item.img} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                        <div className="ml-4">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.price}</p>
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
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${cart.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">$5.00</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-indigo-700">${(cart.reduce((total, item) => total + item.price, 0) + 5).toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <div className="flex space-x-3 mb-4">
                    <button className="border rounded-md p-2 flex items-center justify-center flex-1 bg-indigo-50 border-indigo-600">
                      <CreditCard size={18} className="mr-2 text-indigo-600" />
                      <span>Credit Card</span>
                    </button>
                    <button className="border rounded-md p-2 flex items-center justify-center flex-1">
                      <img src="/api/placeholder/20/20" alt="PayPal" className="mr-2" />
                      <span>PayPal</span>
                    </button>
                    <button className="border rounded-md p-2 flex items-center justify-center flex-1">
                      <img src="/api/placeholder/20/20" alt="Apple Pay" className="mr-2" />
                      <span>Apple Pay</span>
                    </button>
                  </div>
                </div>
                
                <button className="w-full py-3 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                  Proceed to Checkout
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'refills' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Prescription Refills</h2>
            
            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium mb-2">Automatic Refill Program</h3>
              <p className="text-gray-600 mb-4">Never run out of your important medications with our automatic refill program.</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Enroll Now</button>
            </div>
            
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">Upcoming Refills</h3>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Lisinopril 10mg</h4>
                    <p className="text-sm text-gray-600">Scheduled for: March 20, 2025</p>
                  </div>
                  <button className="text-indigo-600 text-sm">Refill Now</button>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Atorvastatin 20mg</h4>
                    <p className="text-sm text-gray-600">Scheduled for: April 5, 2025</p>
                  </div>
                  <button className="text-indigo-600 text-sm">Refill Now</button>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Refill History</h3>
              <div className="border-b pb-3 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Lisinopril 10mg</h4>
                    <p className="text-sm text-gray-600">Refilled on: February 20, 2025</p>
                  </div>
                  <button className="text-indigo-600 text-sm">Reorder</button>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Atorvastatin 20mg</h4>
                    <p className="text-sm text-gray-600">Refilled on: February 5, 2025</p>
                  </div>
                  <button className="text-indigo-600 text-sm">Reorder</button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-3">Refill Reminders</h3>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <Bell size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Set Up Refill Reminders</h4>
                    <p className="text-sm text-gray-600 mb-3">Get notifications when it's time to refill your prescriptions.</p>
                    <div className="flex space-x-3">
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">Email</button>
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">SMS</button>
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">App Notification</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pharmacy Locations</h2>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Enter your zip code or city..." 
                className="w-full py-3 px-4 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <button className="absolute right-2 top-2 bg-indigo-600 text-white px-4 py-1 rounded-lg">Find</button>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Nearby Pharmacies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pharmacyLocations.map(location => (
                  <div key={location.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium">{location.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Phone: {location.phone}</span>
                      <span className="text-sm text-indigo-600">{location.distance}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">Hours: {location.hours}</div>
                    <div className="flex space-x-2">
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm flex-1 flex items-center justify-center">
                        <Phone size={16} className="mr-1" />
                        Call
                      </button>
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm flex-1 flex items-center justify-center">
                        <MapPin size={16} className="mr-1" />
                        Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Services Available</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <Pill size={24} className="mx-auto text-indigo-600 mb-2" />
                  <span className="text-sm font-medium">Prescription Filling</span>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <User size={24} className="mx-auto text-indigo-600 mb-2" />
                  <span className="text-sm font-medium">Consultation</span>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <Clock size={24} className="mx-auto text-indigo-600 mb-2" />
                  <span className="text-sm font-medium">24-Hour Service</span>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <Calendar size={24} className="mx-auto text-indigo-600 mb-2" />
                  <span className="text-sm font-medium">Vaccination</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Health Articles</h2>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Health Tips Newsletter</h3>
              <p className="text-gray-600 mb-3">Subscribe to our weekly newsletter for health tips, medication updates, and special offers.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 py-2 px-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg">Subscribe</button>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Featured Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {healthArticles.map(article => (
                  <div key={article.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                   <img src={article.img} alt={article.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h4 className="font-medium mb-2">{article.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{article.summary}</p>
                      <button className="text-indigo-600 text-sm flex items-center">
                        Read More
                        <ArrowRight size={14} className="ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Health Topics</h3>
              <div className="flex flex-wrap gap-2">
                {["Diabetes", "Hypertension", "Mental Health", "Nutrition", "Exercise", "Sleep", "Stress Management", "Heart Health"].map(topic => (
                  <button key={topic} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm hover:bg-indigo-100">
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 border-t pt-6">
              <h3 className="font-medium mb-3">Ask a Pharmacist</h3>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-3">Have a question about medications or health concerns? Our licensed pharmacists are here to help.</p>
                <textarea 
                  placeholder="Type your question here..." 
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                  rows={3}
                ></textarea>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Submit Question</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-bold text-lg text-indigo-800 mb-3">ePharmacy</h3>
            <p className="text-gray-600 text-sm mb-3">Your trusted online pharmacy since 2020. We provide quality medications with the convenience of home delivery.</p>
            <div className="flex space-x-3">
              <a href="#" className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                <svg width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </a>
              <a href="#" className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                <svg width="16" height="16" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
              </a>
              <a href="#" className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                <svg width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                </svg>
              </a>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default Pharmacy;