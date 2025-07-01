import { mongoose } from '../config/db.js';

const bodyImageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  }
}, { timestamps: true });

const BodyImage = mongoose.model('BodyImage', bodyImageSchema);
export default BodyImage; 