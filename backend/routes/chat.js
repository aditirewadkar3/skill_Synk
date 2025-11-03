import express from 'express';
import { db } from '../config/firebase.js';
import { auth } from '../config/firebase.js';

const router = express.Router();

/**
 * Middleware to verify Firebase token
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', message: error.message });
  }
};

/**
 * POST /api/chat/messages
 * Send a message
 */
router.post('/messages', verifyToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.uid;

    if (!receiverId || !content) {
      return res.status(400).json({ 
        error: 'Receiver ID and content are required' 
      });
    }

    // Create message document
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
    const chatId2 = [receiverId, senderId].sort().join('_');

    // Update sender's chat list
    await db.collection('chats').doc(chatId1).set({
      participant1: senderId,
      participant2: receiverId,
      lastMessage: content,
      lastMessageTime: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    // Update receiver's chat list
    await db.collection('chats').doc(chatId2).set({
      participant1: receiverId,
      participant2: senderId,
      lastMessage: content,
      lastMessageTime: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    res.json({
      success: true,
      message: {
        id: messageRef.id,
        ...messageData,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message', 
      message: error.message 
    });
  }
});

/**
 * GET /api/chat/messages/:userId
 * Get chat messages with a specific user
 */
router.get('/messages/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.uid;

    // Get messages where current user is sender or receiver
    const messagesRef = db.collection('messages');
    
    const sentMessages = await messagesRef
      .where('senderId', '==', currentUserId)
      .where('receiverId', '==', userId)
      .orderBy('timestamp', 'asc')
      .get();

    const receivedMessages = await messagesRef
      .where('senderId', '==', userId)
      .where('receiverId', '==', currentUserId)
      .orderBy('timestamp', 'asc')
      .get();

    // Combine and sort messages
    const allMessages = [];
    
    sentMessages.forEach(doc => {
      allMessages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    receivedMessages.forEach(doc => {
      allMessages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by timestamp
    allMessages.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || new Date(a.timestamp).getTime();
      const timeB = b.timestamp?.toMillis?.() || new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    // Mark messages as read
    const unreadMessages = receivedMessages.docs.filter(doc => !doc.data().read);
    if (unreadMessages.length > 0) {
      const batch = db.batch();
      unreadMessages.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    }

    res.json({
      success: true,
      messages: allMessages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      error: 'Failed to get messages', 
      message: error.message 
    });
  }
});

/**
 * GET /api/chat/conversations
 * Get all conversations for current user
 */
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.uid;

    // Get all chats where user is a participant
    const chatsRef = db.collection('chats');
    
    const chatsQuery1 = await chatsRef
      .where('participant1', '==', currentUserId)
      .orderBy('lastMessageTime', 'desc')
      .get();

    const chatsQuery2 = await chatsRef
      .where('participant2', '==', currentUserId)
      .orderBy('lastMessageTime', 'desc')
      .get();

    const conversations = [];

    // Process participant1 chats
    chatsQuery1.forEach(doc => {
      const chatData = doc.data();
      conversations.push({
        chatId: doc.id,
        otherUserId: chatData.participant2,
        lastMessage: chatData.lastMessage,
        lastMessageTime: chatData.lastMessageTime,
      });
    });

    // Process participant2 chats
    chatsQuery2.forEach(doc => {
      const chatData = doc.data();
      conversations.push({
        chatId: doc.id,
        otherUserId: chatData.participant1,
        lastMessage: chatData.lastMessage,
        lastMessageTime: chatData.lastMessageTime,
      });
    });

    // Get unread counts and user info for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get unread count
        const unreadQuery = await db.collection('messages')
          .where('senderId', '==', conv.otherUserId)
          .where('receiverId', '==', currentUserId)
          .where('read', '==', false)
          .get();

        // Get other user info
        let otherUser = null;
        try {
          const userDoc = await db.collection('users').doc(conv.otherUserId).get();
          if (userDoc.exists) {
            otherUser = {
              id: userDoc.id,
              ...userDoc.data(),
            };
          }
        } catch (error) {
          console.error('Error getting user:', error);
        }

        return {
          ...conv,
          unreadCount: unreadQuery.size,
          otherUser,
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithDetails,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      error: 'Failed to get conversations', 
      message: error.message 
    });
  }
});

/**
 * GET /api/chat/users
 * Get all users (for chat list)
 */
router.get('/users', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    
    const users = [];
    usersSnapshot.forEach(doc => {
      if (doc.id !== currentUserId) {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      }
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users', 
      message: error.message 
    });
  }
});

export default router;

