export type Board = 'CBSE' | 'SSC';
export type Grade = 5 | 6 | 7 | 8 | 9 | 10;
export type Subject = 'Mathematics' | 'Science';
export type UserRole = 'student' | 'teacher';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  grade: Grade;
  board: Board;
  subject: Subject;
  description: string;
}

export interface Concept {
  id: string;
  courseId: string;
  title: string;
  chapter: string;
  summary: string;
  formula?: string;
  estimatedMinutes: number;
  prerequisites: string[];
  quiz: QuizQuestion[];
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  grade: Grade;
  board: Board;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  conceptId: string;
  score: number;
  total: number;
  passed: boolean;
  submittedAt: string;
}

export interface StudyMessage {
  id: string;
  userId: string;
  conceptId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface BootstrapResponse {
  storage: 'local-json';
  users: UserProfile[];
  activeUser: UserProfile;
  courses: Course[];
  concepts: Concept[];
  masteredIds: string[];
  quizAttempts: QuizAttempt[];
  studyHistory: StudyMessage[];
}

export type ConceptStatus = 'mastered' | 'ready' | 'locked';

export interface PositionedConceptNode {
  concept: Concept;
  layer: number;
  row: number;
  x: number;
  y: number;
  status: ConceptStatus;
  onShortestPath: boolean;
  pathStepIndex: number | null;
}
