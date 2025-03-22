// chatRoute.js
import express from 'express';
import { startChat, sendMessage, getAllChats, getChatByUser } from '../controllers/chatController.js';

const chatRouter = express.Router();

chatRouter.post('/start', startChat);
chatRouter.post('/message', sendMessage);
chatRouter.get('/all', getAllChats);
chatRouter.get('/get', getChatByUser);

export default chatRouter;
