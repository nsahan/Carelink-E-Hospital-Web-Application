import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    experience: '',
    fees: ''
  });

  // Add new state for tracking image errors
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (doctorId) => {
    setImageErrors(prev => ({
      ...prev,
      [doctorId]: true
    }));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/doctor/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('atoken')}`,
        },
      });
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to fetch doctors. Please check your connection and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`http://localhost:9000/api/doctor/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('atoken')}`,
          },
        });
        setDoctors(doctors.filter(doctor => doctor._id !== id));
        setError(''); // Clear any existing errors
      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            'Failed to delete doctor. Please try again.';
        setError(errorMessage);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:9000/api/doctor/${selectedDoctor._id}`,
        updateFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('atoken')}`,
          },
        }
      );
      
      setDoctors(doctors.map(doc => 
        doc._id === selectedDoctor._id ? {...doc, ...updateFormData} : doc
      ));
      setIsUpdateModalOpen(false);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to update doctor. Please try again.';
      setError(errorMessage);
    }
  };

  const openUpdateModal = (doctor) => {
    setSelectedDoctor(doctor);
    setUpdateFormData({
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      experience: doctor.experience,
      fees: doctor.fees,
      available: doctor.available,
    });
    setIsUpdateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Doctors List</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={imageErrors[doctor._id] ? 'https://via.placeholder.com/40' : doctor.image} 
                    alt={doctor.name} 
                    className="h-10 w-10 rounded-full object-cover"
                    onError={() => handleImageError(doctor._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                  <div className="text-sm text-gray-500">{doctor.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {doctor.specialty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doctor.experience} years
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rs.{doctor.fees}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doctor.available}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openUpdateModal(doctor)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition duration-200 mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No doctors found
          </div>
        )}
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Doctor</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={updateFormData.name}
                    onChange={(e) => setUpdateFormData({...updateFormData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={updateFormData.email}
                    onChange={(e) => setUpdateFormData({...updateFormData, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialty</label>
                  <input
                    type="text"
                    value={updateFormData.specialty}
                    onChange={(e) => setUpdateFormData({...updateFormData, specialty: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                  <input
                    type="number"
                    value={updateFormData.experience}
                    onChange={(e) => setUpdateFormData({...updateFormData, experience: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fees</label>
                  <input
                    type="number"
                    value={updateFormData.fees}
                    onChange={(e) => setUpdateFormData({...updateFormData, fees: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available</label>
                  <input
                    type="number"
                    value={updateFormData.available}
                    onChange={(e) => setUpdateFormData({...updateFormData, available: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
