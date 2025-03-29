import React from 'react';
import { useNavigate } from 'react-router-dom';
import { specialityData } from '../assets/assets';

const Speciality = () => {
  const navigate = useNavigate();

  const handleSpecialityClick = (speciality) => {
    navigate(`/doctors?speciality=${encodeURIComponent(speciality)}`);
  };

  return (
    <div id="speciality" className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">Find by Speciality</h1>
        <p className="text-gray-600 text-lg mb-10">
          Discover experts across various specialities tailored to your needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {specialityData.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSpecialityClick(item.speciality)}
              className="group bg-white shadow-lg rounded-xl hover:shadow-2xl transform hover:scale-110 transition duration-300 p-6"
            >
              <div className="flex justify-center items-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl transition duration-300">
                  <img
                    src={item.image}
                    alt={item.speciality}
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xl font-semibold text-gray-800 group-hover:text-blue-500">
                  {item.speciality}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Speciality;
