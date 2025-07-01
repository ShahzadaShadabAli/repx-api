// Simple test file to verify workout system
import { connectDB } from './config/db.js';
import Workout from './models/workout.js';
import { getExercisesForDay } from './data/exercises.js';
import { getNextDay, calculateWorkoutProgress } from './utils/workoutUtils.js';

async function testWorkoutSystem() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Test day cycling
    console.log('Testing day cycling:');
    console.log('pull ->', getNextDay('pull'));
    console.log('push ->', getNextDay('push'));
    console.log('legs ->', getNextDay('legs'));
    console.log('rest ->', getNextDay('rest'));

    // Test exercise data
    console.log('\nTesting exercise data:');
    const pullExercises = getExercisesForDay('pull');
    console.log('Pull exercises:', pullExercises.length);

    // Test workout initialization
    console.log('\nTesting workout initialization:');
    const testUserId = '507f1f77bcf86cd799439011'; // Test ObjectId
    const workout = Workout.initializeWorkout(testUserId, 'pull', pullExercises);
    console.log('Workout initialized:', workout.exercises.length, 'exercises');

    // Test progress calculation
    console.log('\nTesting progress calculation:');
    const progress = calculateWorkoutProgress(workout.exercises);
    console.log('Initial progress:', progress);

    // Test exercise completion
    console.log('\nTesting exercise completion:');
    workout.completeExercise('First Pull Ups', 'Dead Hang');
    const updatedProgress = calculateWorkoutProgress(workout.exercises);
    console.log('After completion:', updatedProgress);

    console.log('\nAll tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testWorkoutSystem(); 