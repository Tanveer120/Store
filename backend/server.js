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
import { createServer } from 'http';
import { Server } from 'socket.io';
import Chat from './models/chatModel.js';

// App config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary; // Ensure this is invoked if needed

// Middlewares
app.use(express.json());
app.use(cors());

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/review', reviewRouter);
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
  res.send("API working");
});

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Chat feature variables and round-robin employee assignment
const employees = ['employee1', 'employee2', 'employee3'];
let nextEmployeeIndex = 0;

io.on('connection', (socket) => {
  console.log('Socket connected: ' + socket.id);

  // Optional: Employee login event
  socket.on('employeeLogin', (employeeId) => {
    console.log(`Employee ${employeeId} logged in.`);
    // Optionally store employee socket info if required.
  });

  // Listen for joinChat event so that clients can join a specific chat room
  socket.on('joinChat', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Socket ${socket.id} joined room ${chatRoomId}`);
  });

  // When a user initiates a chat, validate user and assign an employee
  socket.on('startChat', async (user, callback) => {
    try {
      if (!user) {
        return callback({ error: 'User information is required.' });
      }
      // Round-robin assignment
      const assignedEmployee = employees[nextEmployeeIndex];
      nextEmployeeIndex = (nextEmployeeIndex + 1) % employees.length;
      
      // Create a new Chat document in MongoDB (Chat schema requires a 'user' field)
      const chat = new Chat({
        user,
        employee: assignedEmployee,
        messages: []
      });
      const savedChat = await chat.save();
      
      // Use the MongoDB-generated ObjectId as the chatRoomId
      const chatRoomId = savedChat._id.toString();
      
      // Make the socket join the chat room
      socket.join(chatRoomId);
      
      // Return chat details to the client
      callback({ chatRoomId, employee: assignedEmployee });
    } catch (error) {
      console.error("Error starting chat:", error);
      callback({ error: error.message });
    }
  });

  // Handle incoming chat messages: Save to DB and broadcast to the room
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
