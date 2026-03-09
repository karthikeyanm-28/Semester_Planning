import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    default: '',
  },
  academicYear: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    default: '',
  },
  institution: {
    type: String,
    default: '',
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  examStartDate: {
    type: String,
    default: '',
  },
  examEndDate: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Semester', semesterSchema);
