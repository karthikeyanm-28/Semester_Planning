import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['Assignment', 'Exam', 'Quiz', 'Lab', 'Project'],
    required: true,
  },
  subjectId: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  estimatedEffort: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

taskSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export default mongoose.model('Task', taskSchema);
