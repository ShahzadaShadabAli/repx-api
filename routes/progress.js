import express from 'express';
import { addProgress, getProgressSummary, getExerciseDetailSummary } from '../controllers/progressController.js';

const router = express.Router();

// Add or update progress
router.post('/', addProgress);
router.get('/summary/:userId', getProgressSummary);
router.get('/progress/exercise/:userId/:skillname', getExerciseDetailSummary);

export default router; 