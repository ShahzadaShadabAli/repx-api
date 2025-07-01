import { mongoose } from '../config/db.js';


const userDataSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  activity: {
    type: Number,
    required: true
  },
  goal: {
    type: String,
    enum: ['cut', 'bulk', 'maintain'],
    required: true
  },
  caloriesRequired: {
    type: Number,
    required: true
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    default: []
  }],
  stages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    default: []
  }]
}, { timestamps: true });


const UserData = mongoose.model('UserData', userDataSchema);
export default UserData; 