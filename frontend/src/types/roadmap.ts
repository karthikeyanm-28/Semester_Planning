export interface Milestone {
  id: string;
  semester: number;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  description?: string;
  milestones: Milestone[];
  progress: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}
