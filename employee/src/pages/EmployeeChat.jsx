// src/pages/EmployeeChat.jsx
import React, { useEffect, useState } from "react";
import socket from "../socket";
import api from "../api";
import { toast } from "react-toastify";

const EmployeeChat = () => {
  const token = localStorage.getItem("employeeToken");
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [employeeChats, setEmployeeChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  // src/pages/EmployeeChat.jsx (snippet)
useEffect(() => {
  const fetchEmployeeProfile = async () => {
    try {
      const res = await api.get("/api/employee/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("employeeToken")}` },
      });
      if (res.data.success) {
        setEmployeeProfile(res.data.employee);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  fetchEmployeeProfile();
}, []);


  // Fetch chats assigned to the employee
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/api/chat/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("employeeToken")}` },
        });
        if (res.data.success && employeeProfile) {
          const filteredChats = res.data.chats.filter(
            (chat) => chat.employee === employeeProfile.email
          );
          setEmployeeChats(filteredChats);
        }
      } catch (error) {
        console.error("Error fetching chats:", error.message);
      }
    };
    if (employeeProfile) {
      fetchChats();
    }
  }, [employeeProfile]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("chatMessage", (message) => {
      if (selectedChat && message.chatRoomId === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.chatRoomId]: (prev[message.chatRoomId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [selectedChat]);

  // Join a chat room when selected
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit("joinChat", selectedChat._id);
      setMessages(selectedChat.messages || []);
      setUnreadCounts((prev) => ({ ...prev, [selectedChat._id]: 0 }));
    }
  }, [socket, selectedChat]);

  const selectChat = (chat) => {
    setSelectedChat(chat);
  };

  const sendMessage = () => {
    if (input.trim() && selectedChat && employeeProfile) {
      const messageData = {
        chatRoomId: selectedChat._id,
        sender: employeeProfile.email,
        text: input,
      };
      socket.emit("chatMessage", messageData);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Employee Chat Section</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Chat List */}
        <div className="md:w-1/3 border rounded p-4 text-gray-700">
          <h2 className="text-xl font-semibold mb-4">Assigned Chats</h2>
          <ul className="space-y-3">
            {employeeChats.map((chat) => (
              <li
                key={chat._id}
                onClick={() => selectChat(chat)}
                className="p-3 border rounded cursor-pointer hover:bg-gray-100 relative"
              >
                <p className="font-semibold">{chat.user}</p>
                <p className="text-sm text-gray-600">Messages: {chat.messages.length}</p>
                {unreadCounts[chat._id] > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 text-xs">
                    {unreadCounts[chat._id]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Chat Details */}
        <div className="md:w-2/3 border rounded p-4 text-gray-700">
          {selectedChat ? (
            <>
              <h2 className="text-2xl font-semibold mb-4">Chat with {selectedChat.user}</h2>
              <div className="border rounded p-4 h-80 overflow-y-scroll bg-gray-50 mb-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-2">
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-r hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">Select a chat to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeChat;
