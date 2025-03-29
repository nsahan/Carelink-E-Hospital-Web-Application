import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doctors } from '../assets/assets.js';

const Doctors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const selectedSpeciality = queryParams.get('speciality') || '';
  
  const [selectedSpecialities, setSelectedSpecialities] = useState(
    selectedSpeciality ? [selectedSpeciality] : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [sortOption, setSortOption] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  const specialities = [...new Set(doctors.map((doctor) => doctor.speciality))];

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      let filtered = [...doctors];
      
      // Apply specialty filter
      if (selectedSpecialities.length > 0) {
        filtered = filtered.filter((doctor) => 
          selectedSpecialities.includes(doctor.speciality)
        );
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((doctor) => 
          doctor.name.toLowerCase().includes(query) || 
          doctor.speciality.toLowerCase().includes(query) ||
          doctor.degree?.toLowerCase().includes(query)
        );
      }
      
      // Apply sorting
      switch(sortOption) {
        case 'fees-low':
          filtered.sort((a, b) => a.fees - b.fees);
          break;
        case 'fees-high':
          filtered.sort((a, b) => b.fees - a.fees);
          break;
        case 'experience':
          filtered.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          // Default sorting by name
          filtered.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      setFilteredDoctors(filtered);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedSpecialities, searchQuery, sortOption]);

  const handleFilterChange = (speciality) => {
    setSelectedSpecialities((prev) =>
      prev.includes(speciality)
        ? prev.filter((s) => s !== speciality)
        : [...prev, speciality]
    );
  };

  const handleDoctorClick = (docId) => {
    navigate(`/appointments/${docId}`);
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const clearFilters = () => {
    setSelectedSpecialities([]);
    setSearchQuery('');
    setSortOption('default');
  };
  
  // Generate rating stars
  const renderRatingStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfStar" x1="0" x2="100%" y1="0" y2="0">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    
    return (
      <div className="flex items-center">
        <div className="flex items-center">{stars}</div>
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header with search and filters toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          <span className="text-blue-600">Find</span> Your Healthcare Specialist
        </h1>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative w-full md:w-72 transition-all duration-200 focus-within:w-80">
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button 
            onClick={toggleFilters}
            className="bg-white border border-gray-300 rounded-lg p-2.5 hover:bg-gray-50 transition-colors duration-200 shadow-sm md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`md:w-1/4 ${isFilterOpen ? 'block' : 'hidden'} md:block bg-white rounded-xl shadow-sm p-6 h-fit transition-all duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button 
              onClick={clearFilters} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Sort By</h3>
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="default">Relevance</option>
              <option value="fees-low">Fees: Low to High</option>
              <option value="fees-high">Fees: High to Low</option>
              <option value="experience">Experience</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Specialities</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {specialities.map((spec, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedSpecialities.includes(spec)}
                      onChange={() => handleFilterChange(spec)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border rounded transition-colors duration-200 ${
                      selectedSpecialities.includes(spec) ? 
                      'bg-blue-600 border-blue-600' : 
                      'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {selectedSpecialities.includes(spec) && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700 hover:text-gray-900 transition-colors duration-200">{spec}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
              {selectedSpecialities.length > 0 && ' in selected specialties'}
            </p>
            
            {filteredDoctors.length > 0 && (
              <div className="text-sm text-gray-500">
                {selectedSpecialities.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span>Filtered by:</span>
                    {selectedSpecialities.map(spec => (
                      <span 
                        key={spec} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center text-xs cursor-pointer hover:bg-blue-200 transition-colors duration-200"
                        onClick={() => handleFilterChange(spec)}
                      >
                        {spec}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="h-10 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleDoctorClick(doctor._id)}
                >
                  <div className="relative">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white py-1 px-3 rounded-full text-sm font-medium shadow-md">
                      ${doctor.fees}
                    </div>
                    {doctor.available && (
                      <div className="absolute top-4 left-4 bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-medium flex items-center">
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></span>
                        Available Today
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200">{doctor.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {doctor.speciality}
                      </span>
                    </div>
                    
                    <div className="mb-3 flex items-center">
                      {renderRatingStars(doctor.rating || 4.5)}
                      <span className="ml-2 text-sm text-gray-500">({doctor.reviewCount || Math.floor(Math.random() * 100) + 20})</span>
                    </div>
                    
                    <div className="flex items-center mb-3 text-gray-600 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {doctor.experience} years experience
                    </div>
                    
                    <div className="flex items-center mb-4 text-gray-600 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Next available: {doctor.nextAvailable || 'Today'}
                    </div>
                    
                    <button
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition duration-300 flex items-center justify-center group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoctorClick(doctor._id);
                      }}
                    >
                      Book Appointment
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No doctors found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any doctors matching your criteria. Try adjusting your filters or search query.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-lg font-medium transition duration-300 flex items-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
