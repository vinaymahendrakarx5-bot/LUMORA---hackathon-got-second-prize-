import fs from 'fs';
import path from 'path';
import type { Board, Concept, Grade, QuizAttempt, StudyMessage, UserProfile } from '../lib/types';
import { wouldCreateCycle } from '../lib/graph';
import { createInitialDatabaseState, type DatabaseState } from './seedData';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'pathlearn-db.json');

let memoryCache: DatabaseState | null = null;

function ensureLoaded(): DatabaseState {
  if (memoryCache) return memoryCache;

  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as DatabaseState;
      if (
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.courses) &&
        Array.isArray(parsed.concepts)
      ) {
        memoryCache = parsed;
        return memoryCache;
      }
    }
  } catch {
    // Re-seed if JSON file is missing or corrupted
  }

  memoryCache = createInitialDatabaseState();
  persist(memoryCache);
  return memoryCache;
}

function persist(state: DatabaseState): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tempPath, DB_PATH);
}

export function getHealthSummary() {
  const db = ensureLoaded();
  return {
    ok: true,
    storage: 'local-json' as const,
    coursesCount: db.courses.length,
    conceptsCount: db.concepts.length,
    usersCount: db.users.length,
  };
}

export function getBootstrap(requestedUserId?: string) {
  const db = ensureLoaded();
  const activeUser =
    db.users.find((u) => u.id === requestedUserId) ?? db.users[0];
  const masteredIds = db.progressByUser[activeUser.id] ?? [];
  const quizAttempts = db.quizAttempts.filter(
    (a) => a.userId === activeUser.id,
  );

  const studyHistory = (db.studyHistory ?? []).filter(
    (m) => m.userId === activeUser.id,
  );

  return {
    storage: 'local-json' as const,
    users: db.users,
    activeUser,
    courses: db.courses,
    concepts: db.concepts,
    masteredIds,
    quizAttempts,
    studyHistory,
  };
}

export function createUserProfile(input: {
  name: string;
  grade: Grade;
  board: Board;
  role?: 'student' | 'teacher';
}): UserProfile {
  const db = ensureLoaded();
  const cleanName = input.name.trim();
  if (!cleanName) {
    throw new Error('Name is required.');
  }

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const id = `${input.role ?? 'student'}-${slug || 'learner'}-${Date.now().toString(36)}`;

  const profile: UserProfile = {
    id,
    name: cleanName,
    role: input.role ?? 'student',
    grade: input.grade,
    board: input.board,
  };

  db.users.push(profile);
  db.progressByUser[profile.id] = [];
  persist(db);
  return profile;
}

export function toggleConceptMastery(
  userId: string,
  conceptId: string,
  mastered?: boolean,
): string[] {
  const db = ensureLoaded();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found.');

  const conceptExists = db.concepts.some((c) => c.id === conceptId);
  if (!conceptExists) throw new Error('Concept not found.');

  const current = new Set(db.progressByUser[userId] ?? []);
  const shouldMaster = mastered ?? !current.has(conceptId);

  if (shouldMaster) {
    current.add(conceptId);
  } else {
    current.delete(conceptId);
  }

  const updated = Array.from(current);
  db.progressByUser[userId] = updated;
  persist(db);
  return updated;
}

export function submitConceptQuiz(input: {
  userId: string;
  conceptId: string;
  answers: number[];
}): {
  attempt: QuizAttempt;
  masteredIds: string[];
  results: { questionId: string; correct: boolean; correctIndex: number; explanation: string }[];
} {
  const db = ensureLoaded();
  const user = db.users.find((u) => u.id === input.userId);
  if (!user) throw new Error('User not found.');

  const concept = db.concepts.find((c) => c.id === input.conceptId);
  if (!concept) throw new Error('Concept not found.');

  const results = concept.quiz.map((q, idx) => {
    const chosen = input.answers[idx];
    const correct = chosen === q.correctIndex;
    return {
      questionId: q.id,
      correct,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    };
  });

  const score = results.filter((r) => r.correct).length;
  const total = concept.quiz.length;
  const passed = total === 0 ? true : score / total >= 0.5;

  const attempt: QuizAttempt = {
    id: `attempt-${Date.now().toString(36)}`,
    userId: input.userId,
    conceptId: input.conceptId,
    score,
    total,
    passed,
    submittedAt: new Date().toISOString(),
  };

  db.quizAttempts.unshift(attempt);

  const currentMastered = new Set(db.progressByUser[input.userId] ?? []);
  if (passed) {
    currentMastered.add(input.conceptId);
  }
  const masteredIds = Array.from(currentMastered);
  db.progressByUser[input.userId] = masteredIds;

  persist(db);
  return { attempt, masteredIds, results };
}

export function createConcept(input: {
  courseId: string;
  title: string;
  chapter: string;
  summary: string;
  formula?: string;
  estimatedMinutes: number;
  prerequisites: string[];
}): Concept {
  const db = ensureLoaded();
  const courseExists = db.courses.some((c) => c.id === input.courseId);
  if (!courseExists) throw new Error('Course not found.');

  const cleanTitle = input.title.trim();
  if (!cleanTitle) throw new Error('Concept title is required.');

  const id = `${input.courseId}-custom-${Date.now().toString(36)}`;
  const validPrereqs = input.prerequisites.filter((pid) =>
    db.concepts.some((c) => c.id === pid && c.courseId === input.courseId),
  );

  const newConcept: Concept = {
    id,
    courseId: input.courseId,
    title: cleanTitle,
    chapter: input.chapter.trim() || 'Custom Unit',
    summary: input.summary.trim() || 'Curriculum concept added in Teacher Studio.',
    formula: input.formula?.trim() || undefined,
    estimatedMinutes: Math.max(5, Number(input.estimatedMinutes) || 20),
    prerequisites: validPrereqs,
    quiz: [
      {
        id: `${id}-q1`,
        prompt: `Which statement best summarizes "${cleanTitle}"?`,
        options: [
          input.summary.trim() || `Core principle of ${cleanTitle}`,
          'Unrelated historical topic',
          'None of the curriculum standards',
          'Skip prerequisite checks',
        ],
        correctIndex: 0,
        explanation: `Mastery of ${cleanTitle} confirms understanding of its core principle.`,
      },
    ],
  };

  db.concepts.push(newConcept);
  persist(db);
  return newConcept;
}

export function updateConcept(
  conceptId: string,
  updates: {
    title?: string;
    chapter?: string;
    summary?: string;
    formula?: string;
    estimatedMinutes?: number;
    prerequisites?: string[];
  },
): Concept {
  const db = ensureLoaded();
  const idx = db.concepts.findIndex((c) => c.id === conceptId);
  if (idx === -1) throw new Error('Concept not found.');

  const existing = db.concepts[idx];

  if (updates.prerequisites) {
    const courseConcepts = db.concepts.filter(
      (c) => c.courseId === existing.courseId,
    );
    for (const pid of updates.prerequisites) {
      if (wouldCreateCycle(courseConcepts, pid, conceptId)) {
        throw new Error(
          'Adding that prerequisite would create a circular dependency.',
        );
      }
    }
  }

  const nextConcept: Concept = {
    ...existing,
    title: updates.title?.trim() || existing.title,
    chapter: updates.chapter?.trim() || existing.chapter,
    summary: updates.summary?.trim() || existing.summary,
    formula:
      updates.formula !== undefined
        ? updates.formula.trim() || undefined
        : existing.formula,
    estimatedMinutes:
      updates.estimatedMinutes !== undefined
        ? Math.max(5, Number(updates.estimatedMinutes) || existing.estimatedMinutes)
        : existing.estimatedMinutes,
    prerequisites: updates.prerequisites ?? existing.prerequisites,
  };

  db.concepts[idx] = nextConcept;
  persist(db);
  return nextConcept;
}

export function getStudyContext(userId: string, conceptId: string) {
  const db = ensureLoaded();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found.');
  const concept = db.concepts.find((c) => c.id === conceptId);
  if (!concept) throw new Error('Concept not found.');
  const course = db.courses.find((c) => c.id === concept.courseId);
  if (!course) throw new Error('Course not found.');

  const prerequisiteTitles = concept.prerequisites
    .map((pid) => db.concepts.find((c) => c.id === pid)?.title)
    .filter((t): t is string => Boolean(t));

  return { user, concept, course, prerequisiteTitles };
}

export function appendStudyExchange(input: {
  userId: string;
  conceptId: string;
  userPrompt: string;
  assistantReply: string;
}): StudyMessage[] {
  const db = ensureLoaded();
  if (!Array.isArray(db.studyHistory)) {
    db.studyHistory = [];
  }
  const now = new Date().toISOString();
  const base = Date.now().toString(36);
  const userMsg: StudyMessage = {
    id: `msg-${base}-u`,
    userId: input.userId,
    conceptId: input.conceptId,
    role: 'user',
    content: input.userPrompt,
    createdAt: now,
  };
  const aiMsg: StudyMessage = {
    id: `msg-${base}-a`,
    userId: input.userId,
    conceptId: input.conceptId,
    role: 'assistant',
    content: input.assistantReply,
    createdAt: now,
  };
  db.studyHistory.push(userMsg, aiMsg);
  persist(db);
  return [userMsg, aiMsg];
}

