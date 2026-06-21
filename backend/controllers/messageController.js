import User from '../models/User.js';
import Message from '../models/Message.js';
import { getReceiverSocketId, io } from '../socket/socket.js';

// Get all users for sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // Find all users except the logged-in one
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } });
    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.error(`Error in getUsersForSidebar controller: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get chat history with a specific user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Retrieve all messages between current user and target user
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages sent by the other user to me as read
    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    // Notify the other user via Socket.io that their messages to me are read
    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messagesRead', { senderId: userToChatId, receiverId: myId });
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error(`Error in getMessages controller: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Send a new message (text and/or media file)
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let mediaUrl = '';
    let mediaType = 'none';

    // If file is uploaded via Multer middleware
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      if (req.file.mimetype.startsWith('image/')) {
        mediaType = 'image';
      } else {
        mediaType = 'file';
      }
    }

    if (!text && !mediaUrl) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || '',
      mediaUrl,
      mediaType,
    });

    await newMessage.save();

    // Trigger real-time message event via Socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(`Error in sendMessage controller: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
