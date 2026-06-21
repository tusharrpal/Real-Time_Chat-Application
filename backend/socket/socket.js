import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Map to track active user socket connections: { userId: socketId }
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Retrieve userId passed from the frontend socket client query params
  const userId = socket.handshake.query.userId;
  if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
  }

  // Broadcast list of online users (keys of userSocketMap) to all clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // Listen for typing notifications and forward them to the recipient
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { senderId });
    }
  });

  socket.on('stopTyping', ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping', { senderId });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (userId) {
      delete userSocketMap[userId];
    }
    // Broadcast the updated online users list
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { app, io, server };
