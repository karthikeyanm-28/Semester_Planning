export interface Semester {
  name: string;
  academicYear: string;
  department: string;
  institution: string;
  startDate: string;
  endDate: string;
  examStartDate: string;
  examEndDate: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  faculty: string;
  weeklyHours: number;
  difficulty: 'Low' | 'Medium' | 'High';
  targetGrade: string;
}

export interface Task {
  id: string;
  title: string;
  type: 'Assignment' | 'Exam' | 'Quiz' | 'Lab';
  subjectId: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  estimatedEffort: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
}

export interface WeeklyBlock {
  day: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  subjectId: string;
  actual: boolean;
}

export interface WeeklyPlan {
  id: string;
  weekStart: string;
  blocks: WeeklyBlock[];
}

export interface Goal {
  id: string;
  title: string;
  category: 'Short-term' | 'Mid-sem' | 'Exam';
  targetDate: string;
  progress: number;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  type: 'Note' | 'Strategy' | 'Reflection';
  timestamp: string;
}

export interface AcademicData {
  semester: Semester;
  subjects: Subject[];
  tasks: Task[];
  weeklyPlans: WeeklyPlan[];
  goals: Goal[];
  notes: Note[];
}

export const defaultSemester: Semester = {
  name: '',
  academicYear: '',
  department: '',
  institution: '',
  startDate: '',
  endDate: '',
  examStartDate: '',
  examEndDate: '',
};

export const defaultAcademicData: AcademicData = {
  semester: defaultSemester,
  subjects: [],
  tasks: [],
  weeklyPlans: [],
  goals: [],
  notes: [],
};
