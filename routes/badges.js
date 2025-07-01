import express from 'express';
import Badge from '../models/badge.js';

const router = express.Router();

// GET /api/badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find({});
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch badges', error: err.message });
  }
});

export default router;
