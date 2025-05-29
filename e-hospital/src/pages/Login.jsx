import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const GOOGLE_CLIENT_ID = "1089001572296-97lfnmbd34u21pjokqjpe231cfk19l59.apps.googleusercontent.com"; // Replace with your actual Google Client ID	

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9000/api/users/login', {
        email,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/profile'; // This will force a page reload
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await axios.post('http://localhost:9000/api/users/google', {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/profile';
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Google authentication failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex h-screen bg-gray-100">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex-col justify-between">
          <div>
            <div className="flex items-center">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h1 className="ml-2 text-3xl font-bold text-white">CareLink</h1>
            </div>
            
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-white">Welcome to our Patient Portal</h2>
              <p className="mt-4 text-xl text-blue-100">Access your healthcare information securely anytime, anywhere.</p>
            </div>
          </div>
        
          <div className="text-blue-100">
            <p className="mb-4 text-sm">Your health is our priority. Connect with your healthcare providers, access medical records, and manage appointments all in one place.</p>
            <div className="flex space-x-4">
              <span>•  Secure</span>
              <span>•  Modern</span>
              <span>•  Accessible</span>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Login/Register Forms */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="md:hidden flex justify-center mb-10">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h1 className="ml-2 text-2xl font-bold text-blue-600">CareLink</h1>
              </div>
            </div>
            
            {!showRegister ? (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Sign In</h2>
                <p className="text-gray-600 text-center mb-8">Please enter your credentials to access your account</p>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Forgot password?</a>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                  </div>

                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Sign In Failed')}
                        shape="rectangular"
                        theme="outline"
                        size="large"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                  >
                    Sign In
                  </button>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setShowRegister(true)}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <RegisterForm onBackToLogin={() => setShowRegister(false)} />
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

const RegisterForm = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phoneNumber: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:9000/api/users/register', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Store user data immediately after registration
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        // Force a storage event for the navbar to detect
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/profile'; // This will force a page reload
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Create Account</h2>
      <p className="text-gray-600 text-center mb-8">Register for a CareLink patient account</p>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Doe"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="name@example.com"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
            I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          Create Account
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={onBackToLogin}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
};

export default Login;