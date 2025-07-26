import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import Header from '../components/Header';
import Specilality from '../components/Specilality';
import Search from '../components/search';
import Pharmacy from '../components/Epharmacy';
import { AiOutlineMessage } from 'react-icons/ai';
import { MdEmergency } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const GEMINI_API_KEY = 'AIzaSyA1AT_43Vfydy2zqJFalwV_pbf_Dezsxf0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_BASE_URL = 'http://localhost:9000'; // Your backend URL

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [emergencySubmitted, setEmergencySubmitted] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Medora, your medical assistant. How can I help you?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const navigate = useNavigate();

  const toggleChatBox = () => {
    setIsChatOpen(!isChatOpen);
  };

  const submitEmergencyToBackend = async (emergencyData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/api/emergency/create`, emergencyData);
      return response.data;
    } catch (error) {
      console.error('Error submitting emergency to backend:', error);
      throw error;
    }
  };

  const handleEmergency = async () => {
    if (emergencyLoading) return; // Prevent multiple submissions

    setEmergencyLoading(true);

    try {
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem('user')) || {};

      // Prepare emergency data
      const emergencyData = {
        patientName: user.name || user.username || 'Unknown Patient',
        location: 'Location being determined...',
        message: 'Emergency assistance required!',
        contactNumber: user.phone || user.contactNumber || 'Not provided',
        status: 'CRITICAL'
      };

      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            emergencyData.location = `${latitude},${longitude}`;

            try {
              await submitEmergencyToBackend(emergencyData);
              setEmergencySubmitted(true);

              // Show success message
              alert('Emergency alert sent successfully! Help is on the way.');

              setTimeout(() => {
                setEmergencySubmitted(false);
                setEmergencyLoading(false);
              }, 3000);
            } catch (error) {
              alert('Failed to send emergency alert. Please try again or call emergency services directly.');
              setEmergencyLoading(false);
            }
          },
          async (error) => {
            console.log('Location error:', error);
            // Submit without precise location
            emergencyData.location = 'Location unavailable';

            try {
              await submitEmergencyToBackend(emergencyData);
              setEmergencySubmitted(true);

              alert('Emergency alert sent successfully! Help is on the way.');

              setTimeout(() => {
                setEmergencySubmitted(false);
                setEmergencyLoading(false);
              }, 3000);
            } catch (error) {
              alert('Failed to send emergency alert. Please try again or call emergency services directly.');
              setEmergencyLoading(false);
            }
          },
          {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 60000
          }
        );
      } else {
        // No geolocation support
        emergencyData.location = 'Geolocation not supported';

        try {
          await submitEmergencyToBackend(emergencyData);
          setEmergencySubmitted(true);

          alert('Emergency alert sent successfully! Help is on the way.');

          setTimeout(() => {
            setEmergencySubmitted(false);
            setEmergencyLoading(false);
          }, 3000);
        } catch (error) {
          alert('Failed to send emergency alert. Please try again or call emergency services directly.');
          setEmergencyLoading(false);
        }
      }
    } catch (error) {
      console.error('Error in handleEmergency:', error);
      alert('Failed to send emergency alert. Please try again or call emergency services directly.');
      setEmergencyLoading(false);
    }
  };

  const sendMessage = async (userMessage) => {
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      // Fetch all necessary data
      const [doctorsResponse, medicinesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/doctor/all`),
        axios.get(`${API_BASE_URL}/v1/api/medicines/all`)
      ]);

      const doctors = doctorsResponse.data;
      const medicines = medicinesResponse.data;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `You are Medora, CareLink Hospital's AI assistant. Here's what you know about our website and services:

WEBSITE SECTIONS:
1. Home Page - Main dashboard with quick access to all services
2. Speciality Section - Browse doctors by medical specialties
3. Search Section - Search for doctors, medicines, and services
4. E-Pharmacy - Online medicine ordering system
5. Emergency Services - Quick access to emergency help

MAIN FEATURES:
- Doctor Appointments: Users can book appointments with specialists
- E-Pharmacy: Order medicines online with home delivery
- Emergency Button: Quick access to emergency services
- Search Functionality: Find doctors, medicines, and services
- Online Consultations: Virtual doctor consultations

AVAILABLE DATA:
Doctors List:
${doctors.map(d => `- ${d.name} (${d.specialty}) - ${d.experience} years experience, Fees: Rs.${d.fees}`).join('\n')}

Medicines Inventory:
${medicines.map(m => `- ${m.name} - Rs.${m.price} (Stock: ${m.stock})`).join('\n')}

NAVIGATION HELP:
- For appointments: Guide users to the Speciality section or Search
- For medicines: Direct to E-Pharmacy section
- For emergencies: Suggest the emergency button or provide emergency contact

Remember to:
- Provide specific navigation instructions ("Click on the Speciality section" etc.)
- Include actual prices and availability from our database
- Mention home delivery option for medicines
- Suggest relevant doctors based on user queries
- Maintain a helpful and professional tone

User message: ${userMessage}`
            }]
          }]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const botResponse = response.data.candidates[0].content.parts[0].text;
      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      const errorMessage =
        error.response?.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : "I'm having trouble responding right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { text: errorMessage, isBot: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce to limit requests to 1 every 3 seconds
  const debouncedSendMessage = debounce((message) => {
    sendMessage(message);
  }, 1000);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    debouncedSendMessage(userMessage);
  };

  // Fetch maintenance mode on mount
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings/maintenance`);
        const data = await res.json();
        setMaintenanceMode(data.maintenanceMode);
      } catch (err) {
        setMaintenanceMode(false);
      }
    };
    fetchMaintenance();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Maintenance Overlay */}
      {maintenanceMode ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <span className="text-5xl mb-4">🛠️</span>
            <h2 className="text-2xl font-bold mb-2 text-yellow-700">Maintenance Mode</h2>
            <p className="text-gray-700 mb-4 text-center">
              The system is currently under maintenance.<br />
              Please check back later.
            </p>
          </div>
        </div>
      ) : (
        <>
          <Header />
          <Specilality />
          <Search />
          <Pharmacy />
          <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-4 z-50">
            <button
              onClick={toggleChatBox}
              className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="AI Chat"
            >
              <AiOutlineMessage size={28} />
            </button>
            <button
              onClick={handleEmergency}
              disabled={emergencyLoading}
              className={`p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full shadow-lg flex items-center justify-center space-x-2 hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 ${emergencySubmitted ? 'animate-pulse bg-green-500' : ''
                } ${emergencyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Emergency"
            >
              <MdEmergency size={28} />
              <span className="text-sm font-semibold">
                {emergencyLoading ? 'Sending...' : emergencySubmitted ? 'Sent!' : 'Emergency'}
              </span>
            </button>
            {isChatOpen && (
              <div className="fixed bottom-20 right-6 w-96 h-[28rem] bg-white shadow-2xl rounded-lg flex flex-col overflow-hidden z-50">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <span className="text-blue-600 font-bold">M</span>
                    </div>
                    <span className="font-semibold">Medora AI Assistant</span>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${msg.isBot ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
                          }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;