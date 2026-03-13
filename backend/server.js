import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import postsRoutes from './routes/posts.js';
import meetingsRoutes from './routes/meetings.js';
import newsRoutes from './routes/news.js';
import { auth, db } from './config/firebase.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes(allowed))) {
        callback(null, true);
      } else if (origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes(allowed))) {
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
app.use('/api/posts', postsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/news', newsRoutes);

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

      // Update chat list for both users (unified doc)
      const chatId = [senderId, receiverId].sort().join('_');
      const [p1, p2] = [senderId, receiverId].sort();
      
      await db.collection('chats').doc(chatId).set({
        participant1: p1,
        participant2: p2,
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
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

