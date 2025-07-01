import { mongoose } from '../config/db.js';

const progressSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true,
    default: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['pull', 'push', 'legs', 'rest'],
    required: true
  },
  status: {
    type: Number,
    enum: [0, 1], // 0 for incomplete, 1 for completed
    required: true,
    default: 0
  },
  skillName: {
    type: String,
    required: true
  },
  stagename: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    required: true,
    default: 0
  },
  progress: [progressSchema]
}, { _id: false });

const workoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'UserData',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  exercises: [exerciseSchema],
  dayStarted: {
    type: Date,
    required: true,
    default: Date.now
  },
  currentDay: {
    type: String,
    enum: ['Pull', 'Push', 'Legs', 'Rest'],
    required: true,
    default: 'Pull'
  },
  isCompleted: {
    type: Boolean,
    required: true,
    default: false
  }
}, { 
  timestamps: true,
  indexes: [
    { userId: 1, date: 1 },
    { userId: 1, dayStarted: 1 }
  ]
});

// Static method to get the next day in the cycle
workoutSchema.statics.getNextDay = function(currentDay) {
  const dayOrder = ['Pull', 'Push', 'Legs', 'Rest'];
  const currentIndex = dayOrder.indexOf(currentDay);
  const nextIndex = (currentIndex + 1) % dayOrder.length;
  return dayOrder[nextIndex];
};

// Static method to initialize a workout for a specific day
workoutSchema.statics.initializeWorkout = function(userId, day, exercises) {
  const initializedExercises = exercises.map(exercise => ({
    day: day,
    status: 0,
    skillName: exercise.skillName || exercise.name,
    stagename: exercise.stagename || exercise.name,
    type: exercise.type || 0,
    progress: exercise.progress || [
      { count: 0, completed: false },
      { count: 0, completed: false },
      { count: 0, completed: false }
    ]
  }));

  return new this({
    userId: userId,
    date: new Date(),
    exercises: initializedExercises,
    dayStarted: new Date(),
    currentDay: day,
    isCompleted: false
  });
};

// Instance method to update exercise progress
workoutSchema.methods.updateExerciseProgress = function(skillName, stagename, progressIndex, count, completed) {
  const exercise = this.exercises.find(ex => 
    ex.skillName === skillName && ex.stagename === stagename
  );
  
  if (exercise && exercise.progress[progressIndex]) {
    exercise.progress[progressIndex].count = count;
    exercise.progress[progressIndex].completed = completed;
    
    // Check if all progress items are completed
    const allCompleted = exercise.progress.every(p => p.completed);
    exercise.status = allCompleted ? 1 : 0;
    
    // Check if all exercises are completed
    this.isCompleted = this.exercises.every(ex => ex.status === 1);
  }
  
  return this;
};

// Instance method to mark exercise as completed
workoutSchema.methods.completeExercise = function(skillName, stagename) {
  const exercise = this.exercises.find(ex => 
    ex.skillName === skillName && ex.stagename === stagename
  );
  
  if (exercise) {
    exercise.status = 1;
    exercise.progress.forEach(p => {
      p.completed = true;
    });
    
    // Check if all exercises are completed
    this.isCompleted = this.exercises.every(ex => ex.status === 1);
  }
  
  return this;
};

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout; 