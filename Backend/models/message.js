import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timestamp: { type: String, default: new Date().toLocaleString() },
  role: String
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
