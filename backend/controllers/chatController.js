// backend/controllers/chatController.js
import Chat from '../models/chatModel.js';
import Employee from '../models/employeeModel.js';

/**
 * Starts a new chat by assigning an employee from the Employee collection based on the fewest assigned chats.
 * Expects req.body to have { user }.
 * Returns { chatRoomId, employee }.
 */
export const startChat = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ success: false, message: "User information is required" });
    }
    
    // Retrieve all employees
    const employees = await Employee.find({});
    console.log("Employees fetched:", employees);  // Log employees

    if (!employees || employees.length === 0) {
      return res.status(400).json({ success: false, message: "No employees available" });
    }
    
    // For each employee, count how many chats are currently assigned to them
    const chatCounts = await Promise.all(
      employees.map(async (emp) => {
        const count = await Chat.countDocuments({ employee: emp.email });
        return { email: emp.email, count };
      })
    );
    console.log("Chat counts:", chatCounts);  // Log chat counts

    // Determine the minimum chat count among employees
    const minCount = Math.min(...chatCounts.map(emp => emp.count));
    // Filter employees who have the minimum count
    const eligibleEmployees = chatCounts.filter(emp => emp.count === minCount);
    console.log("Eligible employees:", eligibleEmployees);  // Log eligible employees

    // Randomly select one among the eligible employees
    const assignedEmployeeEmail = eligibleEmployees[Math.floor(Math.random() * eligibleEmployees.length)].email;
    
    // Create a new chat record with the selected employee's email
    const chat = new Chat({
      user,
      employee: assignedEmployeeEmail,
      messages: []
    });
    const savedChat = await chat.save();
    
    res.status(200).json({
      success: true,
      chatRoomId: savedChat._id,
      employee: assignedEmployeeEmail
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
    console.log(chat);
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
