import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { db } from '../config/firebase.js';

// Promisified upload_stream helper (do not mutate SDK object)
const uploadBufferToCloudinary = (fileBuffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) return reject(error);
    resolve(result);
  });
  stream.end(fileBuffer);
});

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function extractYouTubeId(url) {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Create a post
// Accepts multipart/form-data for image uploads
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { authorId, authorName, role, title, description, mediaType, youtubeUrl } = req.body;

    if (!authorId || !authorName || !role || !title || !description) {
      return res.status(400).json({ error: 'authorId, authorName, role, title, description are required' });
    }

    let mediaUrl = null;
    let normalizedMediaType = null;

    if (mediaType === 'image') {
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required when mediaType is image' });
      }
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, { folder: 'skillsync_posts' });
      mediaUrl = uploadResult.secure_url;
      normalizedMediaType = 'image';
    } else if (mediaType === 'youtube') {
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ error: 'Valid YouTube URL is required for mediaType youtube' });
      }
      mediaUrl = `https://www.youtube.com/watch?v=${videoId}`;
      normalizedMediaType = 'youtube';
    } else if (mediaType) {
      return res.status(400).json({ error: 'Invalid mediaType. Use image or youtube.' });
    }

    let summary = null;
    try {
      if (description && description.length > 50) {
        const { default: openai } = await import('../config/openai.js');
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Using a cost-effective model
          messages: [
            {
              role: "system",
              content: "You are a professional assistant that summarizes pitch decks and project descriptions. Provide a concise, engaging summary (max 2 sentences) of the following content."
            },
            {
              role: "user",
              content: description
            }
          ],
          max_tokens: 100,
        });
        summary = response.choices[0].message.content.trim();
      }
    } catch (aiErr) {
      console.error('AI Summarization error:', aiErr);
      // Fallback: don't fail the whole post creation if AI fails
    }

    const postDoc = {
      authorId,
      authorName,
      role,
      title,
      description,
      summary, // Added summary field
      mediaType: normalizedMediaType,
      mediaUrl,
      createdAt: new Date(),
    };

    const docRef = await db.collection('posts').add(postDoc);
    return res.json({ success: true, id: docRef.id, post: { id: docRef.id, ...postDoc } });
  } catch (err) {
    console.error('Create post error:', err);
    return res.status(500).json({ error: 'Failed to create post', message: err.message });
  }
});

// List posts (newest first)
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('posts').orderBy('createdAt', 'desc').limit(100).get();
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, posts });
  } catch (err) {
    console.error('List posts error:', err);
    return res.status(500).json({ error: 'Failed to fetch posts', message: err.message });
  }
});

export default router;


