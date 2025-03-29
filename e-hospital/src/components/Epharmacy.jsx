import React from 'react';
import { useNavigate } from 'react-router-dom';
import img from '../assets/pp.jpg';
import delivery from '../assets/fast-delivery.svg';
import medi from '../assets/ds.jpg';
import { ChevronRight, Package, Clock, Shield, Star } from 'lucide-react';

const Pharmacy = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/pharmacy');
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-100 rounded-full opacity-70"></div>
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-green-100 rounded-full opacity-70"></div>
              <div className="absolute left-1/3 bottom-0 w-56 h-56 bg-purple-100 rounded-full opacity-50"></div>
              <svg className="absolute right-0 bottom-0 opacity-10" width="400" height="400" viewBox="0 0 200 200">
                <path fill="#4299E1" d="M37.7,-62.8C49.3,-55.6,59.6,-45.8,67.4,-33.5C75.3,-21.3,80.6,-6.5,80.3,8.5C80.1,23.5,74.3,38.7,64.5,50.2C54.6,61.7,40.5,69.6,25.9,73.1C11.2,76.6,-4.1,75.8,-18.9,71.6C-33.8,67.3,-48.2,59.5,-58.3,47.7C-68.5,35.8,-74.3,20,-75.3,3.9C-76.4,-12.1,-72.6,-28.5,-64.2,-42.3C-55.8,-56,-42.9,-67.1,-28.8,-72.7C-14.8,-78.2,0.4,-78.3,13.6,-75C26.8,-71.6,40.9,-64.9,50.9,-54.9C60.9,-45,65.8,-32,67.4,-19.1C69,-6.3,67.3,6.5,65.6,19.2" />
              </svg>
            </div>

            {/* Main Content */}
            <div className="relative z-10 px-6 py-16 sm:px-16 md:py-24 lg:px-24">
              {/* Header Section */}
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                  Healthcare Solutions
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500 bg-clip-text text-transparent">
                  Your Online Pharmacy Solution
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-10">
                  Access quality healthcare products and prescription medicines from trusted brands,
                  with expert pharmacist support and convenient doorstep delivery.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                  <button
                    onClick={handleNavigate}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <span>Browse All Medicines</span>
                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                  
                  <button 
                    onClick={() => navigate('/consultation')}
                    className="flex items-center px-8 py-4 bg-white text-blue-600 border border-blue-200 font-medium rounded-full shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-300"
                  >
                    Speak to a Pharmacist
                  </button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    icon: <Package className="w-6 h-6" />,
                    title: "Quality Medicines",
                    description: "Certified and authentic medicines from trusted pharmaceutical brands",
                    image: medi,
                    bgColor: "from-blue-400 to-teal-400"
                  },
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Healthcare Products",
                    description: "Wide range of wellness and personal care products for your needs",
                    image: img,
                    bgColor: "from-purple-400 to-pink-400"
                  },
                  {
                    icon: <Clock className="w-6 h-6" />,
                    title: "Express Delivery",
                    description: "Fast and reliable delivery service right to your doorstep",
                    image: delivery,
                    bgColor: "from-pink-400 to-red-400"
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-tr ${feature.bgColor} shadow-lg p-0.5`}>
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

             

              {/* CTA Section */}
              <div className="mt-24 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-8 text-white text-center max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Ready to experience better healthcare?</h2>
                <p className="mb-6">Sign up now to get 15% off your first order</p>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-white text-blue-600 font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create an Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;