// chatModel.js
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    employee: { type: String, required: true },
    messages: [
      {
        sender: { type: String },
        text: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
export default Chat;
