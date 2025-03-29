import React, { useState } from 'react';
import Header from '../components/Header';
import Specilality from '../components/Specilality';
import Search from '../components/search';
import Pharmacy from '../components/Epharmacy';
import { AiOutlineMessage } from 'react-icons/ai';
import { MdEmergency } from 'react-icons/md';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChatBox = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Main Components */}
      <Header />
      <Specilality />
      <Search />
      <Pharmacy />

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center space-y-4 z-50">
        {/* Chat Icon */}
        <button
          onClick={toggleChatBox}
          className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="AI Chat"
        >
          <AiOutlineMessage size={28} />
        </button>

       {/* Emergency Button */}
<button
  className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full shadow-lg flex items-center justify-center space-x-2 hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
  aria-label="Emergency"
>
  <MdEmergency size={28} />
  <span className="text-sm font-semibold">Emergency</span>
</button>

{/* AI Chat Box */}
{isChatOpen && (
  <div className="fixed bottom-20 right-6 w-96 h-[28rem] bg-white shadow-lg rounded-lg border border-gray-300 flex flex-col overflow-hidden z-50">
    {/* Chat Header */}
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-center">
      <span className="font-semibold text-lg">CareLink AI Assistant</span>
      <button
        onClick={toggleChatBox}
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        ✕
      </button>
    </div>
    
    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="text-gray-600 text-sm">
        <p>Hi! How can I assist you today?</p>
      </div>
    </div>
    
    {/* Chat Input */}
    <div className="p-4 bg-gray-100 flex items-center space-x-2 border-t border-gray-300">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-rose-400 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Send
      </button>
    </div>
  </div>
)}
      </div>
</div>  
);
};

export default Home;
