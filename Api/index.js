import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import vendorRoutes from './routes/vendor.route.js';
import productRoutes from './routes/product.route.js';
import orderRoutes from './routes/order.route.js';
import retailerRoutes from './routes/retailer.route.js';
import cookieParser from 'cookie-parser';
import cartroutes from './routes/cart.route.js';
import paymentRoutes from './routes/payment.route.js';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import chatroutes from "./routes/chat.route.js";

dotenv.config();
const app = express();
mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDB connected successfully');
  }).catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

global.onlineUsers = new Map();
global.io = io; 

const emitOnlineUsers = () => {
  const onlineUserIds = Array.from(global.onlineUsers.keys());
  io.emit('getOnlineUsers', onlineUserIds);
  console.log('Emitting online users:', onlineUserIds);
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  

  const userId = socket.handshake.query.userId;
  const userType = socket.handshake.query.userType;

  if (userId) {
    global.onlineUsers.set(userId, socket.id);
    emitOnlineUsers();
    console.log(`${userType} connected: ${userId}, Socket ID: ${socket.id}`);
  }

  socket.on('sendMessage', (messageData) => {
    console.log('Received sendMessage:', messageData);
    if (messageData.chatId) {
      io.to(messageData.chatId).emit('newMessage', messageData);
      console.log(`Message emitted to chat room ${messageData.chatId}`);
    } else {
      console.warn('Received sendMessage without chatId:', messageData);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('userTyping', data);
  });

  socket.on('stopTyping', (data) => {
    socket.to(data.chatId).emit('userStoppedTyping', data);
  });

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
  });

  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat room: ${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    let disconnectedUserId = null;
    for (const [id, sId] of global.onlineUsers.entries()) {
      if (sId === socket.id) {
        disconnectedUserId = id;
        global.onlineUsers.delete(id);
        break;
      }
    }
    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} went offline.`);
      emitOnlineUsers(); // Emit updated list of online users
    }
  });
});

app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/Api/auth', authRoutes);
app.use('/Api/vendor', vendorRoutes);
app.use('/Api/retailer', retailerRoutes);
app.use('/Api/product', productRoutes);
app.use('/Api/cart', cartroutes);
app.use('/Api/order', orderRoutes);
app.use('/Api/payment', paymentRoutes);
app.use('/Api/Chat', chatroutes);

app.use((err, req, res, next) => {
  const statuscode = err.statuscode || 500;
  const message = err.message || 'Internal server error';
  res.status(statuscode).json({
    success: false,
    statuscode,
    message,
  });
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
