// backend/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import chatRouter from './routes/chatRoute.js';
import employeeRouter from './routes/employeeRoute.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chatModel.js';
import Employee from './models/employeeModel.js';

const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary; // Ensure this is invoked if needed

app.use(express.json());
app.use(cors());

// Mount routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/review', reviewRouter);
app.use('/api/chat', chatRouter);
app.use('/api/employee', employeeRouter);

app.get('/', (req, res) => {
  res.send("API working");
});

// Socket.IO setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Updated startChat event: dynamically assign an employee based on current load
io.on('connection', (socket) => {
  console.log('Socket connected: ' + socket.id);

  socket.on('employeeLogin', (employeeId) => {
    console.log(`Employee ${employeeId} logged in.`);
  });

  socket.on('joinChat', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Socket ${socket.id} joined room ${chatRoomId}`);
  });

  socket.on('startChat', async (user, callback) => {
    try {
      if (!user) return callback({ error: 'User information is required.' });
      
      // Retrieve all employees from the database
      const employees = await Employee.find({});
      if (!employees || employees.length === 0) {
        return callback({ error: 'No employees available.' });
      }
      
      // Count the number of chats assigned to each employee
      const chatCounts = await Promise.all(
        employees.map(async (emp) => {
          const count = await Chat.countDocuments({ employee: emp.email });
          return { email: emp.email, count };
        })
      );
      console.log("Chat counts:", chatCounts);
      
      // Determine the minimum chat count among employees
      const minCount = Math.min(...chatCounts.map(emp => emp.count));
      // Filter employees with the minimum count
      const eligibleEmployees = chatCounts.filter(emp => emp.count === minCount);
      console.log("Eligible employees:", eligibleEmployees);
      
      // Randomly select one among the eligible employees
      const assignedEmployee = eligibleEmployees[Math.floor(Math.random() * eligibleEmployees.length)].email;
      
      // Create a new chat record with the selected employee
      const chat = new Chat({
        user,
        employee: assignedEmployee,
        messages: []
      });
      const savedChat = await chat.save();
      const chatRoomId = savedChat._id.toString();
      socket.join(chatRoomId);
      callback({ chatRoomId, employee: assignedEmployee });
    } catch (error) {
      console.error("Error starting chat:", error);
      callback({ error: error.message });
    }
  });

  socket.on('chatMessage', async ({ chatRoomId, sender, text }) => {
    try {
      const chat = await Chat.findById(chatRoomId);
      if (chat) {
        const message = { sender, text, timestamp: new Date(), chatRoomId };
        chat.messages.push(message);
        await chat.save();
        io.to(chatRoomId).emit('chatMessage', message);
      } else {
        console.error('Chat not found for id:', chatRoomId);
      }
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected: ' + socket.id);
  });
});

httpServer.listen(port, () => console.log('Server started on PORT: ' + port));
