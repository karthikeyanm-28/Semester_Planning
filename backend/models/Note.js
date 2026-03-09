import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
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
  subjectId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['Note', 'Strategy', 'Reflection'],
    default: 'Note',
  },
  timestamp: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

noteSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export default mongoose.model('Note', noteSchema);
