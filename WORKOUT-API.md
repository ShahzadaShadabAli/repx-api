# Workout API Documentation

## Endpoints

### GET /api/workout/today/:userId
Get or create today's workout

### GET /api/workout/status/:userId  
Get current workout status

### GET /api/workout/history/:userId
Get workout history with pagination

### PUT /api/workout/:workoutId/progress
Update exercise progress

### PUT /api/workout/:workoutId/exercise/complete
Complete an exercise

### PUT /api/workout/:workoutId/complete
Complete entire workout

## Day Cycle
pull → push → legs → rest → pull...

## Key Features
- Automatic day cycling
- Workout repetition if not completed
- Progress tracking per exercise
- Streak calculation 