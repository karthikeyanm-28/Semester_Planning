import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Roadmap, Milestone } from "../types/roadmap";

const COLLECTION_NAME = "roadmaps";

// Get user's roadmap
export const getUserRoadmaps = async (userId: string): Promise<Roadmap[]> => {
  if (!db) throw new Error("Firestore not initialized");

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Roadmap[];
};

// Create a generic roadmap or from template
export const createRoadmap = async (
  userId: string,
  roadmapData: Partial<Roadmap>
): Promise<string> => {
  if (!db) throw new Error("Firestore not initialized");

  const newDoc = {
    ...roadmapData,
    userId,
    progress: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);
  return docRef.id;
};

// Update an entire roadmap Document
export const updateRoadmap = async (
  roadmapId: string,
  data: Partial<Roadmap>
): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  
  const docRef = doc(db, COLLECTION_NAME, roadmapId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Toggle a specific milestone
export const toggleMilestone = async (
  roadmapId: string,
  milestones: Milestone[],
  milestoneId: string,
  isCompleted: boolean
): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");

  const updatedMilestones = milestones.map((m) =>
    m.id === milestoneId ? { ...m, isCompleted } : m
  );

  const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
  const progress = updatedMilestones.length > 0 
    ? Math.round((completedCount / updatedMilestones.length) * 100) 
    : 0;

  const docRef = doc(db, COLLECTION_NAME, roadmapId);
  await updateDoc(docRef, {
    milestones: updatedMilestones,
    progress,
    updatedAt: serverTimestamp(),
  });
};

// Pre-set templates
export const TEMPLATE_SOFTWARE_ENGINEERING: Partial<Roadmap> = {
  title: "Software Engineering Placement",
  description: "A complete 8-semester guide to land a top tech job.",
  milestones: [
    { id: "m1", semester: 1, title: "Learn C/C++ Basics", description: "Variables, Loops, Functions", isCompleted: false },
    { id: "m2", semester: 2, title: "Object Oriented Programming", description: "Classes, Inheritance, Polymorphism", isCompleted: false },
    { id: "m3", semester: 3, title: "Learn DSA", description: "Arrays, Linked Lists, Trees, Graphs", isCompleted: false },
    { id: "m4", semester: 4, title: "Web/App Development", description: "Build 2 major projects", isCompleted: false },
    { id: "m5", semester: 5, title: "Competitive Programming", description: "Solve 100+ Leetcode Mediums", isCompleted: false },
    { id: "m6", semester: 6, title: "Internship Search", description: "Apply to companies for Summer Internships", isCompleted: false },
    { id: "m7", semester: 7, title: "Advanced Topics & System Design", description: "Prep for full-time roles", isCompleted: false },
    { id: "m8", semester: 8, title: "Final Placement Preparation", description: "Mock Interviews & Resume Polishing", isCompleted: false },
  ],
};
