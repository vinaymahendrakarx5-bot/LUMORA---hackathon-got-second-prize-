import type { Board, BootstrapResponse, Concept, Grade, QuizAttempt, StudyMessage, UserProfile } from '../lib/types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data as T;
}

export const api = {
  bootstrap(userId?: string): Promise<BootstrapResponse> {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<BootstrapResponse>(`/api/bootstrap${qs}`);
  },

  createUser(payload: {
    name: string;
    grade: Grade;
    board: Board;
    role?: 'student' | 'teacher';
  }): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  toggleMastery(payload: {
    userId: string;
    conceptId: string;
    mastered?: boolean;
  }): Promise<{ masteredIds: string[] }> {
    return request<{ masteredIds: string[] }>('/api/progress/toggle', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  submitQuiz(payload: {
    userId: string;
    conceptId: string;
    answers: number[];
  }): Promise<{
    attempt: QuizAttempt;
    masteredIds: string[];
    results: {
      questionId: string;
      correct: boolean;
      correctIndex: number;
      explanation: string;
    }[];
  }> {
    return request('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createConcept(payload: {
    courseId: string;
    title: string;
    chapter: string;
    summary: string;
    formula?: string;
    estimatedMinutes: number;
    prerequisites: string[];
  }): Promise<{ concept: Concept }> {
    return request<{ concept: Concept }>('/api/concepts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateConcept(
    conceptId: string,
    payload: {
      title?: string;
      chapter?: string;
      summary?: string;
      formula?: string;
      estimatedMinutes?: number;
      prerequisites?: string[];
    },
  ): Promise<{ concept: Concept }> {
    return request<{ concept: Concept }>(
      `/api/concepts/${encodeURIComponent(conceptId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    );
  },

  askAiStudy(payload: {
    userId: string;
    conceptId: string;
    prompt: string;
  }): Promise<{ messages: StudyMessage[] }> {
    return request<{ messages: StudyMessage[] }>('/api/ai/study', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
