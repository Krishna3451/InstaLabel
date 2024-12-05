import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  analysis: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Scan', scanSchema); 