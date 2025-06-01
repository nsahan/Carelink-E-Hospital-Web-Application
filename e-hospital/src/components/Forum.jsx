import React, { useState, useRef, useEffect } from 'react';

const Forum = ({ posts, onNewPost, conversations, userId }) => {
  const [message, setMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onNewPost(message);
      setMessage('');
    }
  };

  return (
    <div className="flex h-[80vh] gap-4">
      {/* Conversations List */}
      <div className="w-1/4 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        <div className="overflow-y-auto h-full">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                selectedConversation?._id === conv._id
                  ? 'bg-blue-50 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">
                {conv.participants.find(p => p._id !== userId)?.name || 'Unknown User'}
              </div>
              <div className="text-sm text-gray-500">
                {conv.lastMessage || 'No messages yet'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4">
              {posts.map((post, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    post.sender === userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      post.sender === userId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{post.content}</p>
                    <span className="text-xs opacity-75">
                      {new Date(post.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
