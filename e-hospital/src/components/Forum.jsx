import React, { useState } from 'react';

const Forum = ({ posts, onNewPost }) => {
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onNewPost({
      id: Date.now(),
      content: message.trim(),
      timestamp: new Date(),
      sender: 'You', // Replace with actual user
      avatar: 'https://via.placeholder.com/40',
    });
    
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
        {/* Sidebar */}
        <div className="w-1/4 border-r">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Health Chat</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {/* Active Users/Discussions */}
            {['General', 'Mental Health', 'Fitness', 'Nutrition'].map(room => (
              <div 
                key={room}
                onClick={() => setActiveChat(room)}
                className={`p-4 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer ${
                  activeChat === room ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {room[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-medium">{room}</p>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-bold">{activeChat || 'Select a chat'}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {posts.map(post => (
              <div key={post.id} className={`flex ${post.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-end space-x-2">
                  {post.sender !== 'You' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
                      <img src={post.avatar} alt={post.sender} className="w-8 h-8 rounded-full" />
                    </div>
                  )}
                  <div className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    post.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}>
                    <p>{post.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(post.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Forum;
