import React, { useState, useContext } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setAtoken, backendUrl } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (state === 'Admin') {
        const response = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        });
        
        if (response.data.token) {
          setAtoken(response.data.token);
          localStorage.setItem('atoken', response.data.token);
          toast.success('Admin login successful!');
          navigate('/admin/dashboard');
        } else {
          toast.error(response.data.message || 'Login failed');
        }
      } else if (state === 'Doctor') {
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
          email,
          password,
        });
        
        if (data.token) {
          localStorage.setItem('dtoken', data.token);
          localStorage.setItem('doctorInfo', JSON.stringify(data.doctor));
          toast.success('Doctor login successful!');
          setTimeout(() => {
            navigate('/doctor/dashboard', { replace: true });
          }, 1000); // Add small delay to allow toast to show
        } else {
          toast.error(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check if the server is running.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserType = () => {
    setState(state === 'Admin' ? 'Doctor' : 'Admin');
    setEmail(''); // Clear form when switching user types
    setPassword('');
  };

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{state} Login</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${state.toLowerCase()} email`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="text-center text-sm">
              {state === 'Admin' ? (
                <p className="text-gray-600">
                  Doctor Login? {" "}
                  <span 
                    className="text-blue-600 cursor-pointer hover:underline font-medium"
                    onClick={toggleUserType}
                  >
                    Click here
                  </span>
                </p>
              ) : (
                <p className="text-gray-600">
                  Admin Login? {" "}
                  <span 
                    className="text-blue-600 cursor-pointer hover:underline font-medium"
                    onClick={toggleUserType}
                  >
                    Click here
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;