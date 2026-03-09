import mongoose from 'mongoose';

const weeklyBlockSchema = new mongoose.Schema({
  day: { type: String, required: true },
  period: { 
    type: String, 
    enum: ['Morning', 'Afternoon', 'Evening'],
    required: true,
  },
  subjectId: { type: String, required: true },
  actual: { type: Boolean, default: false },
}, { _id: false });

const weeklyPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  weekStart: {
    type: String,
    required: true,
  },
  blocks: [weeklyBlockSchema],
}, {
  timestamps: true,
});

weeklyPlanSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export default mongoose.model('WeeklyPlan', weeklyPlanSchema);
