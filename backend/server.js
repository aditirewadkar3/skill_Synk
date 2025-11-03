import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import { auth, db } from './config/firebase.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin && origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.IO for real-time chat
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    socket.userId = decodedToken.uid;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Join user's room
  socket.join(socket.userId);

  // Handle sending message
  socket.on('message', async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.userId;

      if (!receiverId || !content) {
        socket.emit('error', { message: 'Receiver ID and content are required' });
        return;
      }

      // Create message in Firestore
      const messageRef = db.collection('messages').doc();
      const messageData = {
        senderId,
        receiverId,
        content: content.trim(),
        timestamp: new Date(),
        read: false,
      };

      await messageRef.set(messageData);

      // Update chat list for both users
      const chatId1 = [senderId, receiverId].sort().join('_');
      
      // Update sender's chat list
      await db.collection('chats').doc(chatId1).set({
        participant1: senderId,
        participant2: receiverId,
        lastMessage: content,
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      // Update receiver's chat list
      await db.collection('chats').doc(chatId1).set({
        participant1: receiverId,
        participant2: senderId,
        lastMessage: content,
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      // Send message to receiver if online
      const message = {
        id: messageRef.id,
        ...messageData,
      };

      io.to(receiverId).emit('message', message);
      socket.emit('message-sent', message);

      // Mark message as read if receiver is online
      const receiverSocket = await io.in(receiverId).fetchSockets();
      if (receiverSocket.length > 0) {
        await messageRef.update({ read: true });
      }
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    if (receiverId) {
      socket.to(receiverId).emit('typing', {
        userId: socket.userId,
        isTyping,
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.IO server ready`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

