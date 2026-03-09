import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    trim: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  faculty: {
    type: String,
    default: '',
    trim: true,
  },
  weeklyHours: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  targetGrade: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

subjectSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);
