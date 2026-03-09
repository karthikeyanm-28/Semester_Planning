import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUser } from '@/context/UserContext';
import { academicApi } from '@/services/api';
import type { AcademicData, Semester, Subject, Task, WeeklyPlan, Goal, Note } from '@/types/academic';
import { defaultAcademicData } from '@/types/academic';

interface AcademicContextType {
  data: AcademicData;
  isDataLoading: boolean;
  updateSemester: (semester: Semester) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addWeeklyPlan: (plan: WeeklyPlan) => void;
  updateWeeklyPlan: (plan: WeeklyPlan) => void;
  deleteWeeklyPlan: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  clearAllData: () => Promise<void>;
}

const AcademicContext = createContext<AcademicContextType | null>(null);

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [localData, setLocalData] = useLocalStorage<AcademicData>('academic-data', defaultAcademicData);
  const [data, setData] = useState<AcademicData>(localData);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const { user } = useUser();

  // Load data from MongoDB when user logs in
  useEffect(() => {
    if (!user?.id) {
      setData(defaultAcademicData);
      return;
    }

    const loadFromBackend = async () => {
      setIsDataLoading(true);
      try {
        const backendData = await academicApi.getAll(user.id);
        console.log('✓ Academic data loaded from MongoDB');
        setData(backendData);
        setLocalData(backendData); // Also cache locally
      } catch (error) {
        console.warn('⚠ Could not load from backend, using local data:', error);
        setData(localData);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadFromBackend();
  }, [user?.id]);

  // Helper: update local state immediately, then sync to backend
  const updateLocalAndSync = useCallback((
    updater: (prev: AcademicData) => AcademicData,
    syncFn?: () => Promise<void>
  ) => {
    setData(prev => {
      const newData = updater(prev);
      setLocalData(newData);
      return newData;
    });

    // Fire-and-forget sync to backend
    if (syncFn) {
      syncFn().catch(err => console.warn('⚠ Backend sync failed:', err));
    }
  }, [setLocalData]);

  // ============================================
  // SEMESTER
  // ============================================
  const updateSemester = useCallback((semester: Semester) => {
    updateLocalAndSync(
      prev => ({ ...prev, semester }),
      user?.id ? () => academicApi.updateSemester(user.id, semester).then(() => {
        console.log('✓ Semester synced to MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  // ============================================
  // SUBJECTS
  // ============================================
  const addSubject = useCallback((subject: Subject) => {
    updateLocalAndSync(
      prev => ({ ...prev, subjects: [...prev.subjects, subject] }),
      user?.id ? () => academicApi.addSubject(user.id, subject).then(() => {
        console.log('✓ Subject added to MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const updateSubject = useCallback((subject: Subject) => {
    updateLocalAndSync(
      prev => ({ ...prev, subjects: prev.subjects.map(s => s.id === subject.id ? subject : s) }),
      user?.id ? () => academicApi.updateSubject(user.id, subject).then(() => {
        console.log('✓ Subject updated in MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const deleteSubject = useCallback((id: string) => {
    updateLocalAndSync(
      prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== id) }),
      user?.id ? () => academicApi.deleteSubject(user.id, id).then(() => {
        console.log('✓ Subject deleted from MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  // ============================================
  // TASKS
  // ============================================
  const addTask = useCallback((task: Task) => {
    updateLocalAndSync(
      prev => ({ ...prev, tasks: [...prev.tasks, task] }),
      user?.id ? () => academicApi.addTask(user.id, task).then(() => {
        console.log('✓ Task added to MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const updateTask = useCallback((task: Task) => {
    updateLocalAndSync(
      prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === task.id ? task : t) }),
      user?.id ? () => academicApi.updateTask(user.id, task).then(() => {
        console.log('✓ Task updated in MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const deleteTask = useCallback((id: string) => {
    updateLocalAndSync(
      prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }),
      user?.id ? () => academicApi.deleteTask(user.id, id).then(() => {
        console.log('✓ Task deleted from MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  // ============================================
  // WEEKLY PLANS
  // ============================================
  const addWeeklyPlan = useCallback((plan: WeeklyPlan) => {
    updateLocalAndSync(
      prev => ({ ...prev, weeklyPlans: [...prev.weeklyPlans, plan] }),
      user?.id ? () => academicApi.addWeeklyPlan(user.id, plan).then(() => {
        console.log('✓ Weekly plan added to MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const updateWeeklyPlan = useCallback((plan: WeeklyPlan) => {
    updateLocalAndSync(
      prev => ({ ...prev, weeklyPlans: prev.weeklyPlans.map(p => p.id === plan.id ? plan : p) }),
      user?.id ? () => academicApi.updateWeeklyPlan(user.id, plan).then(() => {
        console.log('✓ Weekly plan updated in MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const deleteWeeklyPlan = useCallback((id: string) => {
    updateLocalAndSync(
      prev => ({ ...prev, weeklyPlans: prev.weeklyPlans.filter(p => p.id !== id) }),
      user?.id ? () => academicApi.deleteWeeklyPlan(user.id, id).then(() => {
        console.log('✓ Weekly plan deleted from MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  // ============================================
  // GOALS
  // ============================================
  const addGoal = useCallback((goal: Goal) => {
    updateLocalAndSync(
      prev => ({ ...prev, goals: [...prev.goals, goal] }),
      user?.id ? () => academicApi.addGoal(user.id, goal).then(() => {
        console.log('✓ Goal added to MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const updateGoal = useCallback((goal: Goal) => {
    updateLocalAndSync(
      prev => ({ ...prev, goals: prev.goals.map(g => g.id === goal.id ? goal : g) }),
      user?.id ? () => academicApi.updateGoal(user.id, goal).then(() => {
        console.log('✓ Goal updated in MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const deleteGoal = useCallback((id: string) => {
    updateLocalAndSync(
      prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }),
      user?.id ? () => academicApi.deleteGoal(user.id, id).then(() => {
        console.log('✓ Goal deleted from MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  // ============================================
  // NOTES
  // ============================================
  const addNote = useCallback((note: Note) => {
    updateLocalAndSync(
      prev => ({ ...prev, notes: [...prev.notes, note] }),
      user?.id ? () => academicApi.addNote(user.id, note).then(() => {
        console.log('✓ Note added to MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const updateNote = useCallback((note: Note) => {
    updateLocalAndSync(
      prev => ({ ...prev, notes: prev.notes.map(n => n.id === note.id ? note : n) }),
      user?.id ? () => academicApi.updateNote(user.id, note).then(() => {
        console.log('✓ Note updated in MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  const deleteNote = useCallback((id: string) => {
    updateLocalAndSync(
      prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }),
      user?.id ? () => academicApi.deleteNote(user.id, id).then(() => {
        console.log('✓ Note deleted from MongoDB');
      }) : undefined
    );
  }, [updateLocalAndSync, user?.id]);

  // ============================================
  // CLEAR ALL DATA
  // ============================================
  const clearAllData = useCallback(async () => {
    setData(defaultAcademicData);
    setLocalData(defaultAcademicData);
    localStorage.removeItem('academic-data');

    if (user?.id) {
      try {
        await academicApi.clearAll(user.id);
        console.log('✓ All data cleared from MongoDB');
      } catch (error) {
        console.warn('⚠ Could not clear data from backend:', error);
      }
    }
  }, [setLocalData, user?.id]);

  return (
    <AcademicContext.Provider value={{
      data, isDataLoading, updateSemester,
      addSubject, updateSubject, deleteSubject,
      addTask, updateTask, deleteTask,
      addWeeklyPlan, updateWeeklyPlan, deleteWeeklyPlan,
      addGoal, updateGoal, deleteGoal,
      addNote, updateNote, deleteNote,
      clearAllData,
    }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const ctx = useContext(AcademicContext);
  if (!ctx) throw new Error('useAcademic must be used within AcademicProvider');
  return ctx;
}
