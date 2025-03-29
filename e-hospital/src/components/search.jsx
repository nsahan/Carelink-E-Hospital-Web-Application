import React from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/find');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      {/* Decorative Shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-blue-200 rounded-full opacity-30"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-indigo-200 rounded-full opacity-30"></div>
      <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-teal-200 rounded-full opacity-20"></div>

      {/* Content */}
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 relative z-10">
        <div className="text-center mb-8">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Health Advisor
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8 text-lg">
            Discover AI-powered health insights and personalized tips. Search for health conditions and take the first step towards better well-being.
          </p>

          {/* Button */}
          <button
            onClick={handleNavigate}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-300 ease-in-out flex items-center justify-center mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search Here
          </button>
        </div>

        {/* Optional Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-8">
          <div className="p-4">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Reliable Insights</h3>
          </div>
          <div className="p-4">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Personalized Tips</h3>
          </div>
          <div className="p-4">
            <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Expert Guidance</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;