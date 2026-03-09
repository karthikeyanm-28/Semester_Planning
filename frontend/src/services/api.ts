import type { AcademicData, Semester, Subject, Task, WeeklyPlan, Goal, Note } from '@/types/academic';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================
// Helper function for API calls
// ============================================
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// User API
// ============================================
export const userApi = {
  sync: (data: { firebaseUid: string; name: string; email: string; institution?: string }) =>
    apiCall<{ id: string; name: string; email: string; institution: string }>('/users/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (firebaseUid: string, data: { name: string; email: string; institution: string }) =>
    apiCall<{ id: string; name: string; email: string; institution: string }>(`/users/${firebaseUid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============================================
// Academic Data API
// ============================================
export const academicApi = {
  // Get all data for a user
  getAll: (userId: string) =>
    apiCall<AcademicData>(`/academic/${userId}`),

  // Semester
  updateSemester: (userId: string, semester: Semester) =>
    apiCall<Semester>(`/academic/${userId}/semester`, {
      method: 'PUT',
      body: JSON.stringify(semester),
    }),

  // Subjects
  addSubject: (userId: string, subject: Subject) =>
    apiCall<Subject>(`/academic/${userId}/subjects`, {
      method: 'POST',
      body: JSON.stringify(subject),
    }),

  updateSubject: (userId: string, subject: Subject) =>
    apiCall<Subject>(`/academic/${userId}/subjects/${subject.id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    }),

  deleteSubject: (userId: string, subjectId: string) =>
    apiCall<{ success: boolean }>(`/academic/${userId}/subjects/${subjectId}`, {
      method: 'DELETE',
    }),

  // Tasks
  addTask: (userId: string, task: Task) =>
    apiCall<Task>(`/academic/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateTask: (userId: string, task: Task) =>
    apiCall<Task>(`/academic/${userId}/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),

  deleteTask: (userId: string, taskId: string) =>
    apiCall<{ success: boolean }>(`/academic/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  // Weekly Plans
  addWeeklyPlan: (userId: string, plan: WeeklyPlan) =>
    apiCall<WeeklyPlan>(`/academic/${userId}/weekly-plans`, {
      method: 'POST',
      body: JSON.stringify(plan),
    }),

  updateWeeklyPlan: (userId: string, plan: WeeklyPlan) =>
    apiCall<WeeklyPlan>(`/academic/${userId}/weekly-plans/${plan.id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    }),

  deleteWeeklyPlan: (userId: string, planId: string) =>
    apiCall<{ success: boolean }>(`/academic/${userId}/weekly-plans/${planId}`, {
      method: 'DELETE',
    }),

  // Goals
  addGoal: (userId: string, goal: Goal) =>
    apiCall<Goal>(`/academic/${userId}/goals`, {
      method: 'POST',
      body: JSON.stringify(goal),
    }),

  updateGoal: (userId: string, goal: Goal) =>
    apiCall<Goal>(`/academic/${userId}/goals/${goal.id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    }),

  deleteGoal: (userId: string, goalId: string) =>
    apiCall<{ success: boolean }>(`/academic/${userId}/goals/${goalId}`, {
      method: 'DELETE',
    }),

  // Notes
  addNote: (userId: string, note: Note) =>
    apiCall<Note>(`/academic/${userId}/notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    }),

  updateNote: (userId: string, note: Note) =>
    apiCall<Note>(`/academic/${userId}/notes/${note.id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    }),

  deleteNote: (userId: string, noteId: string) =>
    apiCall<{ success: boolean }>(`/academic/${userId}/notes/${noteId}`, {
      method: 'DELETE',
    }),

  // Clear all data
  clearAll: (userId: string) =>
    apiCall<{ success: boolean }>(`/academic/${userId}`, {
      method: 'DELETE',
    }),
};

// Health check
export const healthCheck = () =>
  apiCall<{ status: string; mongodb: string; timestamp: string }>('/health');
