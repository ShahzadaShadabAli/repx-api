import mongoose from "mongoose"

const stageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: false
  },
  skills: {
    push: {
      type: [String],
      default: []
    },
    pull: {
      type: [String],
      default: []
    },
    legs: {
      type: [String],
      default: []
    }
  }
}, { timestamps: true });

const Stage = mongoose.model('Stage', stageSchema);
export default Stage;
