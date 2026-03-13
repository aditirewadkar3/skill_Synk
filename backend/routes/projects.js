import express from 'express';
import { db, auth } from '../config/firebase.js';

const router = express.Router();

// Middleware to verify Firebase token
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

// GET /api/projects
// ?owned=true returns only projects created by the user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { owned } = req.query;
    const userId = req.user.uid;
    
    let query = db.collection('projects');
    
    if (owned === 'true') {
      query = query.where('ownerId', '==', userId);
    }
    
    // Note: If you face index errors when querying orderBy on top of where,
    // you may need to create a Firestore composite index.
    // We'll fetch all matching and sort in memory if needed or rely on no-sort for now
    const snap = await query.get();
    let projects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort descending by createdAt
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.json({ success: true, projects });
  } catch (err) {
    console.error('Fetch projects error:', err);
    return res.status(500).json({ error: 'Failed to fetch projects', message: err.message });
  }
});

// POST /api/projects
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, details } = req.body;
    const ownerId = req.user.uid;

    if (!name || !details) {
      return res.status(400).json({ error: 'name and details are required' });
    }

    const projectDoc = {
      ownerId,
      name,
      details,
      applicants: [],
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('projects').add(projectDoc);
    return res.json({ success: true, project: { id: docRef.id, ...projectDoc } });
  } catch (err) {
    console.error('Create project error:', err);
    return res.status(500).json({ error: 'Failed to create project', message: err.message });
  }
});

// POST /api/projects/:id/apply
router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerName, freelancerEmail } = req.body;
    const applicantId = req.user.uid;


    if (!freelancerName || !freelancerEmail) {
      return res.status(400).json({ error: 'freelancerName and freelancerEmail are required' });
    }

    const projectRef = db.collection('projects').doc(id);
    const project = await projectRef.get();

    if (!project.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const application = {
      applicantId,
      freelancerName,
      freelancerEmail,
      appliedAt: new Date().toISOString(),
    };

    const projectData = project.data();
    const applicants = projectData.applicants || [];
    
    // Check if already applied
    if (applicants.some(a => a.applicantId === applicantId)) {
      return res.status(400).json({ error: 'You have already applied to this project' });
    }

    await projectRef.update({
      applicants: [...applicants, application]
    });

    return res.json({ success: true, message: 'Application submitted', application });
  } catch (err) {
    console.error('Apply to project error:', err);
    return res.status(500).json({ error: 'Failed to apply to project', message: err.message });
  }
});

export default router;
