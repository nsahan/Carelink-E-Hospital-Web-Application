import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import Forum from '../components/Forum'; // Add this import

const socket = io('http://localhost:9000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  auth: {
    token: localStorage.getItem('token')
  }
});

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  // Handle socket connection
  useEffect(() => {
    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);

  // Update API endpoints in fetchMessages
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9000/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data);
      // Join the conversation room
      socket.emit('join', conversationId);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (content) => {
    if (!activeChat || !content.trim()) {
      toast.error('Please select a conversation and enter a message');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:9000/api/messages', {
        conversationId: activeChat._id,
        content: content.trim(),
        sender: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Update messages locally
      setMessages(prev => [...prev, response.data]);
      
      // Emit message through socket
      if (socketConnected) {
        socket.emit('sendMessage', {
          ...response.data,
          conversationId: activeChat._id
        });
      } else {
        toast.error('Connection issues - Message sent but real-time updates disabled');
      }

    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming messages
  useEffect(() => {
    socket.on('message', (newMessage) => {
      if (newMessage.conversationId === activeChat?._id) {
        setMessages(prev => [...prev, newMessage]);
      }
    });

    return () => socket.off('message');
  }, [activeChat]);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:9000/api/conversations', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setConversations(response.data);
      } catch (error) {
        toast.error('Failed to load conversations');
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <Forum 
          posts={messages}
          onNewPost={sendMessage}
          conversations={conversations}
          userId={user?._id}
        />
      </div>
    </div>
  );
};

export default ChatPage;
