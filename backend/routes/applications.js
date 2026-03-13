import express from 'express';
import { db, auth } from '../config/firebase.js';

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
 * POST /api/applications/apply/:projectId
 * Apply to a project project
 */
router.post('/apply/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const freelancerUid = req.user.uid;

    // Fetch freelancer profile to check if complete
    const userDoc = await db.collection('users').doc(freelancerUid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    // Simple completion check: bio and skills (can be expanded)
    if (!userData.bio || !userData.skills || userData.skills.length === 0) {
      return res.status(400).json({ 
        error: 'Profile incomplete', 
        message: 'Please complete your profile (bio and skills) before applying.' 
      });
    }

    // Check if project exists
    const projectRef = db.collection('posts').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists || !projectDoc.data().isProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = projectDoc.data();

    // Check if already applied
    const existingApp = await db.collection('applications')
      .where('projectId', '==', projectId)
      .where('freelancerUid', '==', freelancerUid)
      .get();

    if (!existingApp.empty) {
      return res.status(400).json({ error: 'Already applied to this project' });
    }

    // Create application
    const applicationData = {
      projectId,
      projectTitle: projectData.title,
      entrepreneurUid: projectData.authorId,
      freelancerUid,
      freelancerName: userData.name || 'Freelancer',
      freelancerEmail: userData.email,
      freelancerProfile: userData, // Store snapshot of profile
      status: 'pending',
      createdAt: new Date()
    };

    const docRef = await db.collection('applications').add(applicationData);

    // Notify entrepreneur
    await db.collection('notifications').add({
      uid: projectData.authorId,
      type: 'project_application',
      title: 'New Project Application',
      message: `${userData.name || 'A freelancer'} applied to your project: ${projectData.title}`,
      relatedId: projectId,
      applicationId: docRef.id,
      senderUid: freelancerUid,
      read: false,
      createdAt: new Date()
    });

    // Emit socket notification if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(projectData.authorId).emit('notification', {
        type: 'project_application',
        message: `${userData.name || 'A freelancer'} applied to ${projectData.title}`,
        applicationId: docRef.id,
        projectId
      });
    }

    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Apply to project error:', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

/**
 * GET /api/applications/:projectId
 * Get applications for a project
 */
router.get('/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const uid = req.user.uid;

    // Verify project ownership
    const projectDoc = await db.collection('posts').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data().authorId !== uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const snap = await db.collection('applications')
      .where('projectId', '==', projectId)
      .orderBy('createdAt', 'desc')
      .get();

    const applications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * POST /api/applications/respond
 * Accept or reject application
 */
router.post('/respond', verifyToken, async (req, res) => {
  try {
    const { applicationId, action } = req.body; // action: 'accept' or 'reject'
    const uid = req.user.uid;

    const appRef = db.collection('applications').doc(applicationId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) return res.status(404).json({ error: 'Application not found' });
    
    const appData = appDoc.data();
    if (appData.entrepreneurUid !== uid) return res.status(403).json({ error: 'Unauthorized' });

    if (action === 'reject') {
      await appRef.update({ status: 'rejected' });
      return res.json({ success: true, message: 'Application rejected' });
    }

    if (action === 'accept') {
      const batch = db.batch();
      
      // Update application status
      batch.update(appRef, { status: 'accepted' });

      // Add freelancer to project's list
      const projectRef = db.collection('posts').doc(appData.projectId);
      const projectDoc = await projectRef.get();
      const currentFreelancers = projectDoc.data().freelancers || [];
      
      if (!currentFreelancers.includes(appData.freelancerUid)) {
        batch.update(projectRef, {
          freelancers: [...currentFreelancers, appData.freelancerUid]
        });
      }

      // Create a community chat for this specific project and freelancer
      const chatId = `community_${db.collection('chats').doc().id}`;
      const chatRef = db.collection('chats').doc(chatId);
      
      batch.set(chatRef, {
        id: chatId,
        members: [uid, appData.freelancerUid],
        name: `Project: ${appData.projectTitle}`,
        isCommunity: true,
        projectId: appData.projectId,
        lastMessage: 'Project community created!',
        lastMessageTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerUid: uid,
        onlyEntrepreneurEdit: true
      });

      // Notify freelancer
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        uid: appData.freelancerUid,
        type: 'application_accepted',
        title: 'Application Accepted',
        message: `Your application for ${appData.projectTitle} was accepted!`,
        relatedId: appData.projectId,
        read: false,
        createdAt: new Date()
      });

      await batch.commit();

      // Socket notification to freelancer
      const io = req.app.get('io');
      if (io) {
        io.to(appData.freelancerUid).emit('notification', {
          type: 'application_accepted',
          message: `Your application for ${appData.projectTitle} was accepted!`,
          projectId: appData.projectId
        });
      }

      return res.json({ success: true, message: 'Application accepted and community created' });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Respond to application error:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
