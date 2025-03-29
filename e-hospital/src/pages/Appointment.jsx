import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Calendar, Clock, X, RefreshCw } from 'lucide-react';

const Appointment = () => {
  const { doctors } = useContext(AppContext);

  if (!doctors || doctors.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
        <p className="text-lg font-medium">No appointments available</p>
      </div>
    );
  }

  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h2>
      
      <div className="space-y-4">
        {doctors.slice(0, 3).map((item, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="p-4 flex items-center">
              <div className="mr-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100" 
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                <p className="text-blue-600 font-medium">{item.specialty}</p>
                
                <div className="mt-2 flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-4">{item.date}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{item.time}</span>
                </div>
              </div>
              
              <div className="ml-4 flex flex-col sm:flex-row gap-2">
                <button 
                  className="px-4 py-2 flex items-center justify-center bg-white border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  <span>Cancel</span>
                </button>
                
                <button 
                  className="px-4 py-2 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  <span>Reschedule</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointment;