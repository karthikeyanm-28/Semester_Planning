import { Router } from 'express';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Task from '../models/Task.js';
import WeeklyPlan from '../models/WeeklyPlan.js';
import Goal from '../models/Goal.js';
import Note from '../models/Note.js';

const router = Router();

// ============================================
// GET ALL DATA for a user (single endpoint)
// ============================================
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [semester, subjects, tasks, weeklyPlans, goals, notes] = await Promise.all([
      Semester.findOne({ userId }),
      Subject.find({ userId }),
      Task.find({ userId }),
      WeeklyPlan.find({ userId }),
      Goal.find({ userId }),
      Note.find({ userId }),
    ]);

    // Map MongoDB docs back to frontend format
    const data = {
      semester: semester ? {
        name: semester.name,
        academicYear: semester.academicYear,
        department: semester.department,
        institution: semester.institution,
        startDate: semester.startDate,
        endDate: semester.endDate,
        examStartDate: semester.examStartDate,
        examEndDate: semester.examEndDate,
      } : {
        name: '', academicYear: '', department: '', institution: '',
        startDate: '', endDate: '', examStartDate: '', examEndDate: '',
      },
      subjects: subjects.map(s => ({
        id: s.clientId, name: s.name, code: s.code, credits: s.credits,
        faculty: s.faculty, weeklyHours: s.weeklyHours, difficulty: s.difficulty,
        targetGrade: s.targetGrade,
      })),
      tasks: tasks.map(t => ({
        id: t.clientId, title: t.title, type: t.type, subjectId: t.subjectId,
        dueDate: t.dueDate, priority: t.priority, estimatedEffort: t.estimatedEffort,
        status: t.status,
      })),
      weeklyPlans: weeklyPlans.map(p => ({
        id: p.clientId, weekStart: p.weekStart,
        blocks: p.blocks.map(b => ({
          day: b.day, period: b.period, subjectId: b.subjectId, actual: b.actual,
        })),
      })),
      goals: goals.map(g => ({
        id: g.clientId, title: g.title, category: g.category,
        targetDate: g.targetDate, progress: g.progress, completed: g.completed,
      })),
      notes: notes.map(n => ({
        id: n.clientId, title: n.title, subjectId: n.subjectId,
        content: n.content, type: n.type, timestamp: n.timestamp,
      })),
    };

    res.json(data);
  } catch (error) {
    console.error('Get academic data error:', error);
    res.status(500).json({ error: 'Failed to get academic data' });
  }
});

// ============================================
// SEMESTER
// ============================================
router.put('/:userId/semester', async (req, res) => {
  try {
    const { userId } = req.params;
    const semesterData = req.body;

    const semester = await Semester.findOneAndUpdate(
      { userId },
      { userId, ...semesterData },
      { upsert: true, new: true }
    );

    res.json({
      name: semester.name, academicYear: semester.academicYear,
      department: semester.department, institution: semester.institution,
      startDate: semester.startDate, endDate: semester.endDate,
      examStartDate: semester.examStartDate, examEndDate: semester.examEndDate,
    });
  } catch (error) {
    console.error('Update semester error:', error);
    res.status(500).json({ error: 'Failed to update semester' });
  }
});

// ============================================
// SUBJECTS
// ============================================
router.post('/:userId/subjects', async (req, res) => {
  try {
    const { userId } = req.params;
    const { id, ...subjectData } = req.body;

    const subject = await Subject.create({ userId, clientId: id, ...subjectData });
    res.status(201).json({
      id: subject.clientId, name: subject.name, code: subject.code,
      credits: subject.credits, faculty: subject.faculty,
      weeklyHours: subject.weeklyHours, difficulty: subject.difficulty,
      targetGrade: subject.targetGrade,
    });
  } catch (error) {
    console.error('Add subject error:', error);
    res.status(500).json({ error: 'Failed to add subject' });
  }
});

router.put('/:userId/subjects/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const { id, ...subjectData } = req.body;

    const subject = await Subject.findOneAndUpdate(
      { userId, clientId },
      subjectData,
      { new: true }
    );

    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    res.json({
      id: subject.clientId, name: subject.name, code: subject.code,
      credits: subject.credits, faculty: subject.faculty,
      weeklyHours: subject.weeklyHours, difficulty: subject.difficulty,
      targetGrade: subject.targetGrade,
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

router.delete('/:userId/subjects/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    await Subject.findOneAndDelete({ userId, clientId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// ============================================
// TASKS
// ============================================
router.post('/:userId/tasks', async (req, res) => {
  try {
    const { userId } = req.params;
    const { id, ...taskData } = req.body;

    const task = await Task.create({ userId, clientId: id, ...taskData });
    res.status(201).json({
      id: task.clientId, title: task.title, type: task.type,
      subjectId: task.subjectId, dueDate: task.dueDate, priority: task.priority,
      estimatedEffort: task.estimatedEffort, status: task.status,
    });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

router.put('/:userId/tasks/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const { id, ...taskData } = req.body;

    const task = await Task.findOneAndUpdate(
      { userId, clientId },
      taskData,
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({
      id: task.clientId, title: task.title, type: task.type,
      subjectId: task.subjectId, dueDate: task.dueDate, priority: task.priority,
      estimatedEffort: task.estimatedEffort, status: task.status,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:userId/tasks/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    await Task.findOneAndDelete({ userId, clientId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============================================
// WEEKLY PLANS
// ============================================
router.post('/:userId/weekly-plans', async (req, res) => {
  try {
    const { userId } = req.params;
    const { id, ...planData } = req.body;

    const plan = await WeeklyPlan.create({ userId, clientId: id, ...planData });
    res.status(201).json({
      id: plan.clientId, weekStart: plan.weekStart,
      blocks: plan.blocks.map(b => ({ day: b.day, period: b.period, subjectId: b.subjectId, actual: b.actual })),
    });
  } catch (error) {
    console.error('Add weekly plan error:', error);
    res.status(500).json({ error: 'Failed to add weekly plan' });
  }
});

router.put('/:userId/weekly-plans/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const { id, ...planData } = req.body;

    const plan = await WeeklyPlan.findOneAndUpdate(
      { userId, clientId },
      planData,
      { new: true }
    );

    if (!plan) return res.status(404).json({ error: 'Weekly plan not found' });

    res.json({
      id: plan.clientId, weekStart: plan.weekStart,
      blocks: plan.blocks.map(b => ({ day: b.day, period: b.period, subjectId: b.subjectId, actual: b.actual })),
    });
  } catch (error) {
    console.error('Update weekly plan error:', error);
    res.status(500).json({ error: 'Failed to update weekly plan' });
  }
});

router.delete('/:userId/weekly-plans/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    await WeeklyPlan.findOneAndDelete({ userId, clientId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete weekly plan error:', error);
    res.status(500).json({ error: 'Failed to delete weekly plan' });
  }
});

// ============================================
// GOALS
// ============================================
router.post('/:userId/goals', async (req, res) => {
  try {
    const { userId } = req.params;
    const { id, ...goalData } = req.body;

    const goal = await Goal.create({ userId, clientId: id, ...goalData });
    res.status(201).json({
      id: goal.clientId, title: goal.title, category: goal.category,
      targetDate: goal.targetDate, progress: goal.progress, completed: goal.completed,
    });
  } catch (error) {
    console.error('Add goal error:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

router.put('/:userId/goals/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const { id, ...goalData } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { userId, clientId },
      goalData,
      { new: true }
    );

    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    res.json({
      id: goal.clientId, title: goal.title, category: goal.category,
      targetDate: goal.targetDate, progress: goal.progress, completed: goal.completed,
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

router.delete('/:userId/goals/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    await Goal.findOneAndDelete({ userId, clientId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// ============================================
// NOTES
// ============================================
router.post('/:userId/notes', async (req, res) => {
  try {
    const { userId } = req.params;
    const { id, ...noteData } = req.body;

    const note = await Note.create({ userId, clientId: id, ...noteData });
    res.status(201).json({
      id: note.clientId, title: note.title, subjectId: note.subjectId,
      content: note.content, type: note.type, timestamp: note.timestamp,
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

router.put('/:userId/notes/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const { id, ...noteData } = req.body;

    const note = await Note.findOneAndUpdate(
      { userId, clientId },
      noteData,
      { new: true }
    );

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({
      id: note.clientId, title: note.title, subjectId: note.subjectId,
      content: note.content, type: note.type, timestamp: note.timestamp,
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:userId/notes/:clientId', async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    await Note.findOneAndDelete({ userId, clientId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ============================================
// CLEAR ALL DATA for a user
// ============================================
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    await Promise.all([
      Semester.deleteMany({ userId }),
      Subject.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      WeeklyPlan.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Note.deleteMany({ userId }),
    ]);

    res.json({ success: true, message: 'All academic data cleared' });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

export default router;
