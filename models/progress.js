import { mongoose } from '../config/db.js';

const progressSchema = new mongoose.Schema({
  skillname: {
    type: String,
    required: true
  },
  stage: {
    type: Number,
    required: true
  },
  day: {
    type: String,
    enum: ["Push", "Pull", "Legs"],
    required: true
  },
  progress: {
    type: [Number],
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress; 