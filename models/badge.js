import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
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
  criteria: {
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
}, { _id: false, timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
