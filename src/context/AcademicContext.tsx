import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AcademicData, Semester, Subject, Task, WeeklyPlan, Goal, Note } from '@/types/academic';
import { defaultAcademicData } from '@/types/academic';

interface AcademicContextType {
  data: AcademicData;
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
}

const AcademicContext = createContext<AcademicContextType | null>(null);

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useLocalStorage<AcademicData>('academic-data', defaultAcademicData);

  const updateSemester = useCallback((semester: Semester) => {
    setData(prev => ({ ...prev, semester }));
  }, [setData]);

  const addSubject = useCallback((subject: Subject) => {
    setData(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
  }, [setData]);
  const updateSubject = useCallback((subject: Subject) => {
    setData(prev => ({ ...prev, subjects: prev.subjects.map(s => s.id === subject.id ? subject : s) }));
  }, [setData]);
  const deleteSubject = useCallback((id: string) => {
    setData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== id) }));
  }, [setData]);

  const addTask = useCallback((task: Task) => {
    setData(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  }, [setData]);
  const updateTask = useCallback((task: Task) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === task.id ? task : t) }));
  }, [setData]);
  const deleteTask = useCallback((id: string) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  }, [setData]);

  const addWeeklyPlan = useCallback((plan: WeeklyPlan) => {
    setData(prev => ({ ...prev, weeklyPlans: [...prev.weeklyPlans, plan] }));
  }, [setData]);
  const updateWeeklyPlan = useCallback((plan: WeeklyPlan) => {
    setData(prev => ({ ...prev, weeklyPlans: prev.weeklyPlans.map(p => p.id === plan.id ? plan : p) }));
  }, [setData]);
  const deleteWeeklyPlan = useCallback((id: string) => {
    setData(prev => ({ ...prev, weeklyPlans: prev.weeklyPlans.filter(p => p.id !== id) }));
  }, [setData]);

  const addGoal = useCallback((goal: Goal) => {
    setData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
  }, [setData]);
  const updateGoal = useCallback((goal: Goal) => {
    setData(prev => ({ ...prev, goals: prev.goals.map(g => g.id === goal.id ? goal : g) }));
  }, [setData]);
  const deleteGoal = useCallback((id: string) => {
    setData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  }, [setData]);

  const addNote = useCallback((note: Note) => {
    setData(prev => ({ ...prev, notes: [...prev.notes, note] }));
  }, [setData]);
  const updateNote = useCallback((note: Note) => {
    setData(prev => ({ ...prev, notes: prev.notes.map(n => n.id === note.id ? note : n) }));
  }, [setData]);
  const deleteNote = useCallback((id: string) => {
    setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
  }, [setData]);

  return (
    <AcademicContext.Provider value={{
      data, updateSemester,
      addSubject, updateSubject, deleteSubject,
      addTask, updateTask, deleteTask,
      addWeeklyPlan, updateWeeklyPlan, deleteWeeklyPlan,
      addGoal, updateGoal, deleteGoal,
      addNote, updateNote, deleteNote,
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
