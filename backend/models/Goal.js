import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Short-term', 'Mid-sem', 'Exam'],
    required: true,
  },
  targetDate: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

goalSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export default mongoose.model('Goal', goalSchema);
