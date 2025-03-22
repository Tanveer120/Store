// ChatWidget.jsx
import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const backendUrl = 'http://localhost:4000';
const SOCKET_SERVER_URL = 'http://localhost:4000'; // Adjust if needed

const ChatWidget = () => {
  const { token } = useContext(ShopContext);
  const [socket, setSocket] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile using token
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile/getUpdateProfile`, {
          headers: { token },
        });
        if (response.data.success) {
          setUserProfile(response.data.user);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Create socket connection and retrieve (or create) a chat session when userProfile is loaded
  useEffect(() => {
    if (!loading && userProfile) {
      const newSocket = io(SOCKET_SERVER_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to chat server with socket ID:', newSocket.id);
        // Try to get an existing chat session for the user
        axios
          .get(`${backendUrl}/api/chat/get?user=${userProfile.email}`, {
            headers: { token },
          })
          .then((res) => {
            if (res.data.success && res.data.chat) {
              // Existing chat found; load details
              const existingChat = res.data.chat;
              setChatRoomId(existingChat._id);
              setAssignedEmployee(existingChat.employee);
              setMessages(existingChat.messages || []);
              // Have the socket join the existing chat room
              newSocket.emit('joinChat', existingChat._id);
              console.log('Joined existing chat:', existingChat._id);
            } else {
              // No existing chat; start a new chat session
              newSocket.emit('startChat', userProfile.email, (response) => {
                if (response.error) {
                  console.error('Error starting chat:', response.error);
                } else {
                  console.log('New chat started:', response);
                  setChatRoomId(response.chatRoomId);
                  setAssignedEmployee(response.employee);
                }
              });
            }
          })
          .catch((err) => {
            console.error('Error retrieving existing chat:', err.message);
            // Fallback: start a new chat session
            newSocket.emit('startChat', userProfile.email, (response) => {
              if (response.error) {
                console.error('Error starting chat:', response.error);
              } else {
                console.log('New chat started:', response);
                setChatRoomId(response.chatRoomId);
                setAssignedEmployee(response.employee);
              }
            });
          });
      });

      // Listen for incoming messages from server
      newSocket.on('chatMessage', (message) => {
        console.log('Received message:', message);
        setMessages((prev) => [...prev, message]);
      });

      return () => newSocket.close();
    }
  }, [loading, userProfile, token]);

  const sendMessage = () => {
    if (input.trim() && socket && chatRoomId && userProfile) {
      const messageData = { chatRoomId, sender: userProfile.email, text: input };
      // Emit the message; rely on server broadcast to update messages state
      socket.emit('chatMessage', messageData);
      setInput('');
    } else {
      console.error("Socket not ready or chatRoomId not set");
    }
  };

  if (loading) return <p className="text-center text-gray-700">Loading chat...</p>;
  if (!userProfile) return <p className="text-center text-gray-700">User profile not found.</p>;

  return (
    <div className="mt-10 py-10 px-20 border rounded shadow mx-auto bg-white">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Chat with Support</h3>
      {assignedEmployee && (
        <p className="text-center text-gray-600 mb-4">Chat assigned to: {assignedEmployee}</p>
      )}
      <div className="border border-gray-300 rounded p-4 h-64 overflow-y-scroll bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
