import express from 'express';
import {
  getOrCreateTodayWorkout,
  updateWorkoutStatus
} from '../controllers/workoutController.js';

const router = express.Router();

// Get or create today's workout
router.get('/today/:userId', getOrCreateTodayWorkout);

// Update the entire workout
router.put('/update-full', updateWorkoutStatus);

export default router; 