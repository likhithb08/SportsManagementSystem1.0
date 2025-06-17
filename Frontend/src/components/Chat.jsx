import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Fetch current user from backend
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/player/me', {
          credentials: 'include', // Assumes token is in HttpOnly cookie
        });
        const user = await res.json();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chat');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const newMsg = {
      sender: currentUser.username,
      content: newMessage,
      role: currentUser.role,
    };

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newMsg),
      });

      const savedMessage = await response.json();
      setMessages([...messages, savedMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'player':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Team Chat</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          {/* Messages Container */}
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex flex-col ${
                  message.sender === currentUser?.username ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.sender}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(message.role)}`}>
                    {message.role}
                  </span>
                </div>
                <div
                  className={`max-w-sm rounded-lg p-3 ${
                    message.sender === currentUser?.username
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
