import express from 'express';
import { db, auth } from '../config/firebase.js';

const router = express.Router();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * POST /api/analytics/track-view
 * Log a profile view (Investor views Entrepreneur)
 */
router.post('/track-view', verifyToken, async (req, res) => {
  try {
    const { targetUid } = req.body;
    if (!targetUid) return res.status(400).json({ error: 'targetUid is required' });

    const userRef = db.collection('users').doc(targetUid);
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) throw new Error('User not found');
      const currentViews = doc.data().viewCount || 0;
      t.update(userRef, { viewCount: currentViews + 1 });
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/analytics/interest
 * Toggle investor interest in a startup
 */
router.post('/interest', verifyToken, async (req, res) => {
  try {
    const { targetUid } = req.body;
    const investorUid = req.user.uid;

    const userRef = db.collection('users').doc(targetUid);
    let isInterested = false;

    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) throw new Error('User not found');
      let interested = doc.data().interestedInvestors || [];
      
      if (interested.includes(investorUid)) {
        interested = interested.filter(uid => uid !== investorUid);
        isInterested = false;
      } else {
        interested.push(investorUid);
        isInterested = true;
      }
      t.update(userRef, { interestedInvestors: interested });
    });

    res.json({ success: true, isInterested });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/entrepreneur
 * Fetch real-time analytics for the entrepreneur dashboard
 */
router.get('/entrepreneur', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() || {};

    const viewCount = userData.viewCount || 0;
    const interestCount = (userData.interestedInvestors || []).length;
    
    // Count meetings
    const meetingsSnapshot = await db.collection('meetings')
      .where('hostId', '==', uid)
      .get();
    const meetingCount = meetingsSnapshot.size;

    // Count applications (simplified: messages from freelancers)
    // In a full app, you'd have an 'applications' collection
    const appsSnapshot = await db.collection('messages')
      .where('receiverId', '==', uid)
      .get();
    const applicationCount = appsSnapshot.size;

    res.json({
      success: true,
      data: {
        pitchViews: viewCount,
        investorInterest: interestCount,
        meetingsScheduled: meetingCount,
        freelancerApplications: applicationCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/investor
 * Recommended and Trending startups
 */
router.get('/investor', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const myInterests = userDoc.data()?.interests || [];

    // Recommended: Match industry with my interests
    let recommended = [];
    if (myInterests.length > 0) {
      const recSnapshot = await db.collection('users')
        .where('role', '==', 'entrepreneur')
        .where('industry', 'in', myInterests)
        .limit(5)
        .get();
      recommended = recSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Trending: High view count + interest
    const trendingSnapshot = await db.collection('users')
      .where('role', '==', 'entrepreneur')
      .orderBy('viewCount', 'desc')
      .limit(5)
      .get();
    const trending = trendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, recommended, trending });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/freelancer
 * Skill demand based on post descriptions
 */
router.get('/freelancer', verifyToken, async (req, res) => {
  try {
    const postsSnapshot = await db.collection('posts').get();
    const skillMap = {};

    postsSnapshot.forEach(doc => {
      const desc = (doc.data().description || '').toLowerCase();
      // Simple skill extraction (can be improved with AI or predefined list)
      ['react', 'node', 'python', 'ai', 'marketing', 'design', 'firebase', 'aws'].forEach(skill => {
        if (desc.includes(skill)) {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        }
      });
    });

    const skillDemand = Object.entries(skillMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ success: true, skillDemand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
