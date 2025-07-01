import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userDataRouter from './routes/userData.js';
import bodyImageRouter from './routes/bodyimage.js';
import workoutRouter from './routes/workout.js';
import progressRouter from './routes/progress.js';
import badgeRoutes from './routes/badges.js';
import stageRoutes from './routes/stages.js';
// Import your routes here
// import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
connectDB();

// Routes
// app.use('/api/users', userRoutes);
app.use('/api/userdata', userDataRouter);
app.use('/api/bodyimage', bodyImageRouter);
app.use('/api/workout', workoutRouter);
app.use('/api/progress', progressRouter);
app.use('/api/badges', badgeRoutes);
app.use('/api/stages', stageRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Backend of repx in progess...');
});

// Error handling middleware (optional, for best practices)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
