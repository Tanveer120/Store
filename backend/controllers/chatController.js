// chatController.js
import Chat from '../models/chatModel.js';

// List of available employees (this could be dynamic in a real app)
const employees = ['employee1', 'employee2', 'employee3'];
let nextEmployeeIndex = 0;

/**
 * Starts a new chat by assigning an employee using round-robin.
 * Expects req.body to have { user }.
 * Returns { chatRoomId, employee }.
 */
export const startChat = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ success: false, message: "User information is required" });
    }
    // Round-robin assignment
    const assignedEmployee = employees[nextEmployeeIndex];
    nextEmployeeIndex = (nextEmployeeIndex + 1) % employees.length;
    
    // Create a new chat record
    const chat = new Chat({
      user,
      employee: assignedEmployee,
      messages: []
    });
    const savedChat = await chat.save();
    
    res.status(200).json({
      success: true,
      chatRoomId: savedChat._id,
      employee: assignedEmployee
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Appends a new message to an existing chat.
 * Expects req.body to have { chatRoomId, sender, text }.
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatRoomId, sender, text } = req.body;
    if (!chatRoomId || !sender || !text) {
      return res.status(400).json({ success: false, message: "Chat room ID, sender, and text are required" });
    }
    const chat = await Chat.findById(chatRoomId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    chat.messages.push({ sender, text, timestamp: new Date() });
    await chat.save();
    res.status(200).json({ success: true, message: "Message sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves all chat records.
 * Can be used by the admin to view all chats.
 */
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find();
    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves an existing chat for a user.
 * Expects a query parameter "user" (e.g., /api/chat/get?user=user@example.com)
 */
export const getChatByUser = async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) {
      return res.status(400).json({ success: false, message: "User parameter is required" });
    }
    // Retrieve the latest chat for the user (assuming chats have timestamps)
    const chat = await Chat.findOne({ user }).sort({ createdAt: -1 });
    if (chat) {
      res.status(200).json({ success: true, chat });
    } else {
      res.status(404).json({ success: false, message: "No chat found for this user" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
