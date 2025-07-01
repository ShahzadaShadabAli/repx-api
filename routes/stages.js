import express from 'express';
import Stage from '../models/stage.js';

const router = express.Router();

// GET /api/stages
router.get('/', async (req, res) => {
  try {
    const stages = await Stage.find({});
    res.json(stages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stages', error: err.message });
  }
});

export default router;
