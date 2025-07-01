import Progress from '../models/progress.js';
import Workout from '../models/workout.js';

// Workout rotation: Pull -> Push -> Legs -> Rest -> Pull...
const WORKOUT_ROTATION = ['Pull', 'Push', 'Legs', 'Rest'];

// Helper function to normalize day case
const normalizeDay = (day) => {
  return day.toLowerCase();
};

// Helper function to get user's highest stage exercises for a specific day
const getUserExercisesForDay = async (userId, day) => {
  const pipeline = [
    { $match: { userId, day } },
    {
      $group: {
        _id: "$skillname",
        latestRecord: {
          $top: {
            sortBy: { stage: -1 },
            output: "$$ROOT"
          }
        }
      }
    },
    {
      $replaceRoot: { newRoot: "$latestRecord" }
    }
  ];
  
  const results = await Progress.aggregate(pipeline);
  return results;
};

// Helper function to determine current workout day based on user's workout history
const getCurrentWorkoutDay = async (userId) => {
  const lastWorkout = await Workout.findOne({ userId })
    .sort({ dayStarted: -1 })
    .limit(1);
  
  if (!lastWorkout) {
    return 'Pull'; // Start with pull day for new users
  }
  
  const today = new Date();
  const lastWorkoutDate = new Date(lastWorkout.dayStarted);
  
  // If last workout was today, return the same day
  if (isSameDay(today, lastWorkoutDate)) {
    return lastWorkout.currentDay; // ✅ Fixed: using currentDay instead of day
  }
  
  // If last workout was not completed (isCompleted = false), repeat the same day
  if (!lastWorkout.isCompleted) {
    return lastWorkout.currentDay; // ✅ Fixed: using currentDay instead of day
  }
  
  // Get next day in rotation only if last workout was completed
  const currentIndex = WORKOUT_ROTATION.indexOf(lastWorkout.currentDay); // ✅ Fixed: using currentDay
  const nextIndex = (currentIndex + 1) % WORKOUT_ROTATION.length;
  return WORKOUT_ROTATION[nextIndex];
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Generate workout for the day
export const getOrCreateTodayWorkout = async (req, res) => {
  try {
    // Support both POST body and GET params
    const userId = req.body.userId || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Check if workout already exists for today
    const existingWorkout = await Workout.findOne({
      userId,
      dayStarted: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (existingWorkout) {
      return res.status(200).json({
        success: true,
        message: 'Workout already exists for today',
        data: existingWorkout
      });
    }

    // Determine current workout day (will repeat if last workout was incomplete)
    const currentDay = await getCurrentWorkoutDay(userId);
    
    // Check if we're repeating an incomplete workout
    const lastWorkout = await Workout.findOne({ userId })
      .sort({ dayStarted: -1 })
      .limit(1);
    
    const isRepeatingWorkout = lastWorkout && 
                              !lastWorkout.isCompleted && 
                              !isSameDay(new Date(lastWorkout.dayStarted), today);
    
    // If it's a rest day, create minimal workout
    if (currentDay.toLowerCase() === 'rest') { // ✅ Added toLowerCase() for consistency
      const restWorkout = new Workout({
        userId,
        date: today,
        exercises: [],
        currentDay: currentDay, // ✅ Fixed: using currentDay instead of day
        dayStarted: startOfDay,
        isCompleted: true,
      });
      
      const savedWorkout = await restWorkout.save();
      return res.status(201).json({
        success: true,
        message: 'Rest day workout created',
        data: savedWorkout
      });
    }

    // Get user's exercises for current day (highest stage for each skill)
    const userExercises = await getUserExercisesForDay(userId, currentDay);
    
    // If no exercises found for this day, return empty workout
    if (userExercises.length === 0) {
      const emptyWorkout = new Workout({
        userId,
        date: today,
        currentDay: currentDay, // ✅ Fixed: using currentDay instead of day
        exercises: [],
        dayStarted: startOfDay,
        isCompleted: false
      });
      
      const savedWorkout = await emptyWorkout.save();
      return res.status(201).json({
        success: true,
        message: `No exercises found for ${currentDay} day. Empty workout created.`,
        data: savedWorkout
      });
    }

    // Create workout structure from database exercises
    const exercises = userExercises.map(exercise => ({
      day: currentDay.toLowerCase(), // ✅ Fixed: using lowercase to match exerciseSchema enum
      status: 0, // incomplete
      skillName: exercise.skillname,
      stagename: exercise.stagename || `Stage ${exercise.stage}`, // Use stagename if available, otherwise generic name
      type: exercise.type || 0, // Default to type 0 if not specified
      progress: [
        { count: 0, completed: false },
        { count: 0, completed: false },
        { count: 0, completed: false }
      ]
    }));

    // Create new workout
    const newWorkout = new Workout({
      userId,
      date: today,
      exercises,
      dayStarted: startOfDay,
      currentDay: currentDay, // ✅ Fixed: using currentDay instead of day
      isCompleted: false
    });

    const savedWorkout = await newWorkout.save();

    res.status(201).json({
      success: true,
      message: isRepeatingWorkout 
        ? `Repeating incomplete ${currentDay} workout from previous day`
        : `${currentDay.charAt(0).toUpperCase() + currentDay.slice(1)} day workout created successfully`,
      data: savedWorkout,
      isRepeated: isRepeatingWorkout
    });

  } catch (error) {
    console.error('Error generating daily workout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to save workout progress to Progress table
const saveWorkoutToProgress = async (workout) => {
  try {
    const { userId, currentDay, exercises } = workout;
    
    for (const exercise of exercises) {
      // Extract progress counts from the exercise (filter out zeros)
      const progressCounts = exercise.progress
        .map(p => p.count)
        .filter(count => count > 0);
      
      if (progressCounts.length === 0) continue; // Skip if no progress made
      
      // Extract stage number from stagename (assuming format like "Stage 1" or just use a number)
      const stageMatch = exercise.stagename.match(/\d+/);
      const stage = stageMatch ? parseInt(stageMatch[0]) : 1;
      
      // Check if progress record already exists
      const existingProgress = await Progress.findOne({
        userId,
        skillname: exercise.skillName,
        stage,
        day: currentDay
      });
      
      if (existingProgress) {
        // Add new progress to existing array
        existingProgress.progress.push(...progressCounts);
        await existingProgress.save();
      } else {
        // Create new progress record
        const newProgress = new Progress({
          userId,
          skillname: exercise.skillName,
          stage,
          progress: progressCounts,
          day: currentDay
        });
        await newProgress.save();
      }
    }
  } catch (error) {
    console.error('Error saving workout to progress:', error);
    throw error;
  }
};

// Function to update workout completion status
// export const updateWorkoutStatus = async (req, res) => {
//   try {
//     const { workoutId, exerciseIndex, status } = req.body;
    
//     if (!workoutId || exerciseIndex === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'workoutId and exerciseIndex are required'
//       });
//     }

//     const workout = await Workout.findById(workoutId);
//     if (!workout) {
//       return res.status(404).json({
//         success: false,
//         message: 'Workout not found'
//       });
//     }

//     // Update specific exercise status
//     if (status !== undefined && workout.exercises[exerciseIndex]) {
//       workout.exercises[exerciseIndex].status = status;
//     }

//     // Check if all exercises are completed (status = 1)
//     const allCompleted = workout.exercises.every(exercise => exercise.status === 1);
//     const wasNotCompleted = !workout.isCompleted;
//     workout.isCompleted = allCompleted;

//     const updatedWorkout = await workout.save();

//     // If workout just got completed, save progress to Progress table
//     if (allCompleted && wasNotCompleted) {
//       try {
//         await saveWorkoutToProgress(updatedWorkout);
//       } catch (progressError) {
//         console.error('Failed to save workout progress:', progressError);
//         // Don't fail the main request, just log the error
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: allCompleted ? 'Workout completed and progress saved!' : 'Exercise status updated',
//       data: updatedWorkout,
//       workoutCompleted: allCompleted
//     });

//   } catch (error) {
//     console.error('Error updating workout status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

export const updateWorkoutStatus = async (req, res) => {
  try {
    const { workoutId, exercises } = req.body;

    if (!workoutId || !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        message: 'workoutId and exercises array are required'
      });
    }

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Replace the entire exercises array
    workout.exercises = exercises;

    // Check if all exercises are completed (status = 1)
    const allCompleted = exercises.every(ex => ex.status === 1);
    const wasNotCompleted = !workout.isCompleted;
    workout.isCompleted = allCompleted;

    const updatedWorkout = await workout.save();

    // If workout just got completed, save progress to Progress table
    if (allCompleted && wasNotCompleted) {
      try {
        await saveWorkoutToProgress(updatedWorkout);
      } catch (progressError) {
        console.error('Failed to save workout progress:', progressError);
      }
    }

    res.status(200).json({
      success: true,
      message: allCompleted ? 'Workout completed and progress saved!' : 'Workout updated',
      data: updatedWorkout,
      workoutCompleted: allCompleted
    });

  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Function to manually mark entire workout as complete
export const completeWorkout = async (req, res) => {
  try {
    const { workoutId } = req.body;
    
    if (!workoutId) {
      return res.status(400).json({
        success: false,
        message: 'workoutId is required'
      });
    }

    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const wasNotCompleted = !workout.isCompleted;

    // Mark all exercises as completed
    workout.exercises.forEach(exercise => {
      exercise.status = 1;
    });
    
    workout.isCompleted = true;
    const updatedWorkout = await workout.save();

    // Save progress to Progress table if workout just got completed
    if (wasNotCompleted) {
      try {
        await saveWorkoutToProgress(updatedWorkout);
      } catch (progressError) {
        console.error('Failed to save workout progress:', progressError);
        // Don't fail the main request, just log the error
      }
    }

    res.status(200).json({
      success: true,
      message: 'Workout marked as completed and progress saved!',
      data: updatedWorkout
    });

  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};