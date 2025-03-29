import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const doctorInfo = localStorage.getItem('doctorInfo');
    const dtoken = localStorage.getItem('dtoken');
    
    if (!doctorInfo || !dtoken) {
      navigate('/login');
      return;
    }
    
    setDoctor(JSON.parse(doctorInfo));
  }, [navigate]);

  if (!doctor) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome Dr. {doctor.name}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Information</h2>
            <p><strong>Email:</strong> {doctor.email}</p>
            <p><strong>Specialty:</strong> {doctor.specialty}</p>
            <p><strong>Degree:</strong> {doctor.degree}</p>
          </div>
          <div>
            {doctor.image && (
              <img 
                src={doctor.image} 
                alt="Doctor profile" 
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
