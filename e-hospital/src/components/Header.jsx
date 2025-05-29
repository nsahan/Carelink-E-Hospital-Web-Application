import React from 'react';
import { assets } from '../assets/assets';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-300 rounded-lg min-h-[80vh] flex items-center py-8 md:py-3 overflow-hidden relative">
      {/* Decorative background circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full"></div>
      <div className="absolute top-40 -left-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
      
      <div className="container mx-auto flex flex-col md:flex-row items-center w-full px-6 md:px-8 lg:px-12">
        {/* Left Section */}
        <div className="md:w-1/2 flex flex-col items-start justify-center text-white gap-4 z-10">
          <div className="mb-2">
              <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                Healthcare Reimagined
              </span>
          </div>
             
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Welcome to CareLink
          </h1>
           
          <h2 className="text-xl md:text-2xl font-light text-blue-100 mt-1">
            Helping You, Always
          </h2>
          
          <p className="text-sm md:text-base text-blue-50 font-light mt-4 max-w-lg">
            CareLink is your trusted partner in providing personalized care and support. We
            strive to make every day brighter for you and your loved ones with our comprehensive
            healthcare solutions.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href="/login"
              className="flex items-center gap-2 bg-white text-blue-600 font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Get Started
              <img className="w-4 h-4" src={assets.arrow_icon} alt="" />
            </a>
            
           
          </div>
          
          <div className="flex items-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((index) => (
                <div key={index} className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-white">{index}</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-blue-100">Trusted by 100+ patients</span>
          </div>
        </div>
                
        {/* Right Section */}
        <div className="md:w-1/2 relative mt-8 md:mt-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-2xl backdrop-blur-sm"></div>
            <img
              className="w-full h-full object-cover rounded-2xl shadow-xl relative"
              src={assets.head}
              alt="Healthcare professionals with patient"
            />
            
           
            
            {/* Floating doctor card */}
            <div className="hidden md:block absolute -top-5 -right-5 md:top-8 md:right-8 bg-white rounded-lg shadow-xl p-4 w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">24/7 Support</p>
                  <p className="text-sm font-semibold text-gray-800">Always Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;