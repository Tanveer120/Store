// AdminChat.jsx
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { backendUrl } from "../App";

const SOCKET_SERVER_URL = "http://localhost:4000";

const AdminChat = () => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  // unreadCounts: key = chatRoomId, value = number of unread messages
  const [unreadCounts, setUnreadCounts] = useState({});

  // Establish a persistent socket connection on mount
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Admin connected with socket ID:", newSocket.id);
    });

    // Global listener for incoming messages
    newSocket.on("chatMessage", (message) => {
      console.log("Admin received message:", message);
      // If the message belongs to the currently selected chat, update messages state
      if (selectedChat && message.chatRoomId === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      } else {
        // Increment unread count for that chat room
        setUnreadCounts((prev) => ({
          ...prev,
          [message.chatRoomId]: (prev[message.chatRoomId] || 0) + 1,
        }));
      }
    });

    // Optional: Listen for a confirmation of joinChat event
    newSocket.on("joinedChat", (chatRoomId) => {
      console.log("Admin joined chat room:", chatRoomId);
    });

    return () => newSocket.close();
  }, [selectedChat]);

  // Fetch all chats for admin
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/chat/all`);
        if (response.data.success) {
          setChats(response.data.chats);
        }
      } catch (error) {
        console.error("Error fetching chats:", error.message);
      }
    };
    fetchChats();
  }, []);

  // When a chat is selected, join that chat room and reset its unread count
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit("joinChat", selectedChat._id);
      console.log("Admin joined chat:", selectedChat._id);
      setMessages(selectedChat.messages || []);
      // Reset unread count for the selected chat
      setUnreadCounts((prev) => ({ ...prev, [selectedChat._id]: 0 }));
    }
  }, [socket, selectedChat]);

  const selectChat = (chat) => {
    setSelectedChat(chat);
  };

  const sendMessage = () => {
    if (input.trim() && socket && selectedChat) {
      const messageData = {
        chatRoomId: selectedChat._id,
        sender: "admin",
        text: input,
      };
      socket.emit("chatMessage", messageData);
      // Do not update local state immediately, let the server broadcast
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
    <div style={{ padding: "20px" }}>
      <h1>Admin Chat Panel</h1>
      <div style={{ display: "flex" }}>
        {/* Chat list section */}
        <div style={{ flex: 1, marginRight: "20px" }}>
          <h3>Chats</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {chats.map((chat) => (
              <li
                key={chat._id}
                onClick={() => selectChat(chat)}
                style={{
                  cursor: "pointer",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                  padding: "5px",
                  position: "relative",
                }}
              >
                {chat.user} - Assigned: {chat.employee} (Messages:{" "}
                {chat.messages.length})
                {unreadCounts[chat._id] > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "12px",
                    }}
                  >
                    {unreadCounts[chat._id]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Chat details section */}
        <div style={{ flex: 2 }}>
          {selectedChat ? (
            <div>
              <h3>Chat with {selectedChat.user}</h3>
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  height: "300px",
                  overflowY: "scroll",
                }}
              >
                {messages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "8px" }}>
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "10px", display: "flex" }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
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
          ) : (
            <p>Select a chat to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
