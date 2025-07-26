import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { reorderService } from '../services/reorderService';

const AddMedicine = ({ sidebar }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genericName: '',
    expiryDate: '',
    price: '',
    category: '',
    stock: '',
    reorderLevel: '',
    reorderQuantity: '',
    autoReorder: false
  });
  const [categories, setCategories] = useState([
    'tablets',
    'capsules',
    'syrups',
    'injections',
    'others'
  ]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [showAlertAnimation, setShowAlertAnimation] = useState(false);
  const [reorderRequests, setReorderRequests] = useState([]);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    if (e.target.value === '__add_new__') {
      setShowNewCategoryInput(true);
    } else {
      setFormData({ ...formData, category: e.target.value });
      setShowNewCategoryInput(false);
      setNewCategory('');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:9000/v1/api/medicines/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddNewCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      setFormData({ ...formData, category: trimmed });
      setShowNewCategoryInput(false);
      setNewCategory('');
      return;
    }
    // Add new category to backend by creating a dummy medicine (workaround)
    try {
      await axios.post('http://localhost:9000/v1/api/medicines', {
        name: `__dummy__${Date.now()}`,
        description: 'Temporary dummy for category creation',
        genericName: '',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 1,
        category: trimmed,
        stock: 1,
      });
      await fetchCategories();
      setCategories((prev) => [...prev, trimmed]);
      setFormData({ ...formData, category: trimmed });
    } catch (error) {
      // fallback: just add locally
      setCategories((prev) => [...prev, trimmed]);
      setFormData({ ...formData, category: trimmed });
    }
    setShowNewCategoryInput(false);
    setNewCategory('');
  };

  const handleUpdate = async (medicine) => {
    setFormData({
      name: medicine.name,
      description: medicine.description,
      genericName: medicine.genericName,
      expiryDate: medicine.expiryDate.split('T')[0],
      price: medicine.price,
      category: medicine.category,
      stock: medicine.stock,
      reorderLevel: medicine.reorderLevel,
      reorderQuantity: medicine.reorderQuantity,
      autoReorder: medicine.autoReorder
    });
    setEditMode(true);
    setEditId(medicine._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await axios.delete(`http://localhost:9000/v1/api/medicines/${id}`);
        fetchMedicines();
        alert('Medicine deleted successfully!');
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Failed to delete medicine');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const response = await axios.put(
          `http://localhost:9000/v1/api/medicines/${editId}`,
          formData
        );
        if (response.status === 200) {
          setEditMode(false);
          setEditId(null);
          alert('Medicine updated successfully!');
        }
      } else {
        const response = await axios.post('http://localhost:9000/v1/api/medicines', formData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 201) {
          fetchMedicines();
          setFormData({
            name: '',
            description: '',
            genericName: '',
            expiryDate: '',
            price: '',
            category: '',
            stock: '',
            reorderLevel: '',
            reorderQuantity: '',
            autoReorder: false
          });
          alert('Medicine added successfully!');
          await fetchCategories();
        }
      }
      fetchMedicines();
      setFormData({
        name: '',
        description: '',
        genericName: '',
        expiryDate: '',
        price: '',
        category: '',
        stock: '',
        reorderLevel: '',
        reorderQuantity: '',
        autoReorder: false
      });
    } catch (error) {
      console.error(editMode ? 'Error updating medicine:' : 'Error adding medicine:', error);
      alert(`Failed to ${editMode ? 'update' : 'add'} medicine`);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('http://localhost:9000/v1/api/medicines/all', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setMedicines(response.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      alert(`Failed to fetch medicines: ${error.response?.data?.message || 'Server error'}`);
    }
  };

  const checkExpiryDates = () => {
    const today = new Date();
    const alertThresholdDays = 5;

    const expiringMedicines = medicines.filter(medicine => {
      const expiryDate = new Date(medicine.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= alertThresholdDays && daysUntilExpiry > 0;
    });

    setExpiryAlerts(expiringMedicines);
  };

  const playAlertSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play();
  };

  useEffect(() => {
    fetchMedicines();
    const interval = setInterval(fetchMedicines, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkExpiryDates();
  }, [medicines]);

  useEffect(() => {
    if (expiryAlerts.length > 0) {
      setShowAlertAnimation(true);
      playAlertSound();
      const timer = setTimeout(() => setShowAlertAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [expiryAlerts]);

  useEffect(() => {
    const checkReorderStatus = async () => {
      try {
        setReorderLoading(true);
        const [reorderData, stockData] = await Promise.all([
          reorderService.getReorderRequests(),
          reorderService.checkStock()
        ]);

        setReorderRequests(reorderData || []);

        if (stockData?.reorderNeeded) {
          setNotificationMsg(`${stockData.lowStockItems.length} items need reordering`);
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Error checking reorder status:', error);
      } finally {
        setReorderLoading(false);
      }
    };

    checkReorderStatus();
    const interval = setInterval(checkReorderStatus, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleApproveReorder = async (requestId) => {
    try {
      await reorderService.approveReorder(requestId);
      showNotificationMessage('Reorder approved successfully');
      fetchMedicines();
    } catch (error) {
      console.error('Error approving reorder:', error);
      showNotificationMessage('Failed to approve reorder');
    }
  };

  const renderReorderSettings = (medicine) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-2 gap-4">


      </div>
      <div className="mt-4">

      </div>
    </div>
  );

  const renderReorderAlerts = () => (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Stock Reorder Alerts</h2>
        <button onClick={() => setReorderLoading(true)} className="text-gray-600 hover:text-gray-900">
          <RefreshCw className={`h-5 w-5 ${reorderLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {reorderRequests.length > 0 ? (
        <div className="space-y-4">
          {reorderRequests.map((request) => (
            <div key={request._id}
              className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-4">
                <AlertCircle className="text-yellow-500 h-5 w-5" />
                <div>
                  <p className="font-medium">{request.medicineId.name}</p>
                  <p className="text-sm text-gray-600">
                    Current Stock: {request.medicineId.stock} |
                    Reorder Quantity: {request.quantity}
                  </p>
                </div>
              </div>

              {request.status === 'pending' && (
                <button
                  onClick={() => handleApproveReorder(request._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Reorder
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No pending reorder requests</p>
      )}
    </div>
  );

  // Delete a category (removes from UI, does not affect backend medicines)
  const handleDeleteCategory = (cat) => {
    // Prevent deleting if category is in use by any medicine
    const inUse = medicines.some(med => med.category === cat);
    if (inUse) {
      alert(`Cannot delete category "${cat}" because it is used by some medicines.`);
      return;
    }
    setCategories(categories.filter(c => c !== cat));
    // If the deleted category was selected, clear selection
    if (formData.category === cat) {
      setFormData({ ...formData, category: '' });
    }
  };

  return (
    <div className={`p-6 ${sidebar ? 'ml-64' : 'ml-20'} transition-all duration-300 mt-12`}>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px #ff0000; }
            50% { box-shadow: 0 0 20px #ff0000; }
          }
          .alert-badge {
            animation: pulse 2s infinite;
          }
          .alert-container {
            animation: ${showAlertAnimation ? 'shake 0.5s' : 'none'};
          }
          .alert-item:hover {
            transform: translateY(-2px);
            transition: all 0.3s ease;
          }
        `}
      </style>

      {expiryAlerts.length > 0 && (
        <div className="fixed top-4 right-4 left-4 z-50 alert-container">
          <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 p-1 rounded-lg shadow-lg">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-red-600 text-3xl mr-2">⚠️</span>
                  <h2 className="text-xl font-bold text-red-600">Critical Alert: Medicines Expiring Soon!</h2>
                </div>
                <span className="alert-badge bg-red-600 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                  {expiryAlerts.length} {expiryAlerts.length === 1 ? 'Medicine' : 'Medicines'}
                </span>
              </div>

              <div className="space-y-3">
                {expiryAlerts.map(medicine => (
                  <div
                    key={medicine._id}
                    className="alert-item bg-gradient-to-r from-yellow-50 to-red-50 p-4 rounded-lg border border-red-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{medicine.name}</h3>
                        <div className="mt-1 text-red-600 font-medium">
                          ⏰ Expires in {Math.ceil((new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                          <span className="text-gray-600 ml-2">
                            ({new Date(medicine.expiryDate).toLocaleDateString()})
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(medicine._id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transform hover:scale-105 transition-transform duration-200"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleUpdate(medicine)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transform hover:scale-105 transition-transform duration-200"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-semibold mb-9 mt-14">
        {editMode ? 'Update Medicine' : 'Add Medicine'}
      </h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSubmit}>
          {['name', 'genericName', 'price', 'stock'].map(field => (
            <div className="mb-4" key={field}>
              <label htmlFor={field} className="block text-gray-700 text-sm font-bold mb-2">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                id={field}
                required
                value={formData[field]}
                onChange={handleChange}
                placeholder={`Enter ${field}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          ))}

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              required
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-bold mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              id="expiryDate"
              required
              value={formData.expiryDate}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {categories.map((cat, idx) => (
                <span
                  key={`cat-chip-${cat}-${idx}`}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300 mr-2 mb-2`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                    title="Delete category"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <select
              id="category"
              required
              value={formData.category}
              onChange={handleCategoryChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select category</option>
              {/* Ensure unique keys for each category */}
              {categories.map((cat, idx) => (
                <option key={`${cat}-${idx}`} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
              <option value="__add_new__">Add new category...</option>
            </select>
            {showNewCategoryInput && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Enter new category"
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  autoFocus
                  required
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleAddNewCategory(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewCategoryInput(false); setNewCategory(''); }}
                  className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            {renderReorderSettings()}
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {editMode ? 'Update Medicine' : 'Add Medicine'}
          </button>

          {editMode && (
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setEditId(null);
                setFormData({
                  name: '',
                  description: '',
                  genericName: '',
                  expiryDate: '',
                  price: '',
                  category: '',
                  stock: '',
                  reorderLevel: '',
                  reorderQuantity: '',
                  autoReorder: false
                });
              }}
              className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Medicine List</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Stock</th>
              <th className="py-2 px-4 border-b">Expiry</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med._id}>
                <td className="py-2 px-4 border-b">{med.name}</td>
                <td className="py-2 px-4 border-b">{med.description}</td>
                <td className="py-2 px-4 border-b">{med.price}</td>
                <td className="py-2 px-4 border-b">
                  {med.stock > 10 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      In Stock ({med.stock})
                    </span>
                  ) : med.stock > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <svg className="mr-1.5 h-2 w-2 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Low Stock ({med.stock})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <svg className="mr-1.5 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Out of Stock
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">{new Date(med.expiryDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleUpdate(med)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(med._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddMedicine;
