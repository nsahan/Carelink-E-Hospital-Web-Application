import { Navigate } from 'react-router-dom';

const DoctorRoute = ({ children }) => {
  const dtoken = localStorage.getItem('dtoken');
  
  if (!dtoken) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default DoctorRoute;
