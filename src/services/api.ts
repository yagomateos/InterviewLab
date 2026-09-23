import type {
  Question,
  Category,
  Interview,
  Statistics,
  DashboardData,
  AsyncDemoResult,
  ExternalDashboardData,
} from "@/types";
import {
  mockStore,
  mockCategories,
  mockInterviews,
  mockStatistics,
  mockDashboard,
  mockAsyncDemo,
  mockExternalDashboard,
} from "./mockData";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Track whether the backend is reachable. Once we know it's down,
// we skip network attempts and use mock data directly.
let backendAvailable: boolean | null = null;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Try the real backend; if it fails for any reason (network error, CORS,
// mixed content, connection refused), mark it unavailable and fall back
// to mock data so the UI still works in preview/deployed mode without Docker.
async function withFallback<T>(apiCall: () => Promise<T>, mockFn: () => T | Promise<T>): Promise<T> {
  if (backendAvailable === false) {
    return mockFn();
  }
  try {
    const result = await apiCall();
    backendAvailable = true;
    return result;
  } catch (err) {
    // Any fetch failure (network unreachable, CORS, mixed content, etc.)
    // means the backend isn't available — use mock data instead.
    backendAvailable = false;
    return mockFn();
  }
}

function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const api = {
  // Questions
  getQuestions: (filters?: { category?: string; difficulty?: string; search?: string }) =>
    withFallback(
      () => {
        const params = new URLSearchParams();
        if (filters?.category) params.set("category", filters.category);
        if (filters?.difficulty) params.set("difficulty", filters.difficulty);
        if (filters?.search) params.set("search", filters.search);
        const qs = params.toString() ? `?${params.toString()}` : "";
        return request<Question[]>(`/questions${qs}`);
      },
      async () => {
        await delay(150);
        let result = [...mockStore.questions];
        if (filters?.search) {
          const lower = filters.search.toLowerCase();
          result = result.filter(
            (q) =>
              q.title.toLowerCase().includes(lower) ||
              (q.description?.toLowerCase().includes(lower) ?? false)
          );
        }
        if (filters?.category) {
          result = result.filter((q) => q.category_name === filters.category);
        }
        if (filters?.difficulty) {
          result = result.filter((q) => q.difficulty === filters.difficulty);
        }
        return result;
      }
    ),

  getQuestion: (id: number) =>
    withFallback(
      () => request<Question>(`/questions/${id}`),
      async () => {
        await delay(100);
        const q = mockStore.questions.find((q) => q.id === id);
        if (!q) throw new Error("Question not found");
        return q;
      }
    ),

  createQuestion: (data: {
    category_id: number;
    title: string;
    description?: string;
    difficulty: string;
  }) =>
    withFallback(
      () => request<Question>("/questions", { method: "POST", body: JSON.stringify(data) }),
      async () => {
        await delay(200);
        const cat = mockStore.categories.find((c) => c.id === data.category_id);
        const newQ: Question = {
          id: mockStore.nextQuestionId(),
          category_id: data.category_id,
          category_name: cat?.name,
          title: data.title,
          description: data.description ?? null,
          difficulty: data.difficulty as Question["difficulty"],
          created_at: new Date().toISOString(),
        };
        mockStore.questions.unshift(newQ);
        return newQ;
      }
    ),

  updateQuestion: (id: number, data: Partial<{
    category_id: number;
    title: string;
    description: string;
    difficulty: string;
  }>) =>
    withFallback(
      () => request<Question>(`/questions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      async () => {
        await delay(200);
        const q = mockStore.questions.find((q) => q.id === id);
        if (!q) throw new Error("Question not found");
        if (data.title !== undefined) q.title = data.title;
        if (data.description !== undefined) q.description = data.description;
        if (data.difficulty !== undefined) q.difficulty = data.difficulty as Question["difficulty"];
        if (data.category_id !== undefined) {
          q.category_id = data.category_id;
          const cat = mockStore.categories.find((c) => c.id === data.category_id);
          q.category_name = cat?.name;
        }
        return q;
      }
    ),

  deleteQuestion: (id: number) =>
    withFallback(
      () => request<void>(`/questions/${id}`, { method: "DELETE" }),
      async () => {
        await delay(150);
        const idx = mockStore.questions.findIndex((q) => q.id === id);
        if (idx === -1) throw new Error("Question not found");
        mockStore.questions.splice(idx, 1);
        return undefined;
      }
    ),

  // Categories
  getCategories: () =>
    withFallback(
      () => request<Category[]>("/categories"),
      async () => {
        await delay(100);
        return [...mockStore.categories];
      }
    ),

  // Interviews
  getInterviews: () =>
    withFallback(
      () => request<Interview[]>("/interviews"),
      async () => {
        await delay(150);
        return [...mockStore.interviews];
      }
    ),

  getInterview: (id: number) =>
    withFallback(
      () => request<Interview>(`/interviews/${id}`),
      async () => {
        await delay(150);
        const interview = mockStore.interviews.find((i) => i.id === id);
        if (!interview) throw new Error("Interview not found");
        return interview;
      }
    ),

  createInterview: (data: { user_id: number; title: string }) =>
    withFallback(
      () => request<Interview>("/interviews", { method: "POST", body: JSON.stringify(data) }),
      async () => {
        await delay(200);
        const userName = data.user_id === 1 ? "Alice Johnson" : data.user_id === 2 ? "Bob Smith" : "Carol Davis";
        const newInterview: Interview = {
          id: mockStore.nextInterviewId(),
          user_id: data.user_id,
          user_name: userName,
          title: data.title,
          status: "scheduled",
          created_at: new Date().toISOString(),
          question_count: 0,
          questions: [],
        };
        mockStore.interviews.unshift(newInterview);
        return newInterview;
      }
    ),

  addQuestionToInterview: (interviewId: number, questionId: number) =>
    withFallback(
      () =>
        request<{ id: number }>(`/interviews/${interviewId}/questions`, {
          method: "POST",
          body: JSON.stringify({ question_id: questionId }),
        }),
      async () => {
        await delay(150);
        const interview = mockStore.interviews.find((i) => i.id === interviewId);
        const question = mockStore.questions.find((q) => q.id === questionId);
        if (!interview || !question) throw new Error("Interview or question not found");
        if (interview.questions?.some((iq) => iq.question_id === questionId)) {
          throw new Error("Question already in interview");
        }
        const newIQ = {
          id: Date.now(),
          interview_id: interviewId,
          question_id: questionId,
          order: (interview.questions?.length ?? 0) + 1,
          title: question.title,
          category_name: question.category_name,
          difficulty: question.difficulty,
          is_correct: null,
        };
        interview.questions = [...(interview.questions ?? []), newIQ];
        interview.question_count = interview.questions.length;
        return { id: newIQ.id };
      }
    ),

  removeQuestionFromInterview: (interviewId: number, questionId: number) =>
    withFallback(
      () => request<void>(`/interviews/${interviewId}/questions/${questionId}`, { method: "DELETE" }),
      async () => {
        await delay(150);
        const interview = mockStore.interviews.find((i) => i.id === interviewId);
        if (!interview) throw new Error("Interview not found");
        interview.questions = interview.questions?.filter((iq) => iq.question_id !== questionId) ?? [];
        interview.question_count = interview.questions.length;
        return undefined;
      }
    ),

  setAnswer: (interviewId: number, questionId: number, isCorrect: boolean, _notes?: string) =>
    withFallback(
      () =>
        request<{ is_correct: boolean }>(`/interviews/${interviewId}/questions/${questionId}/answer`, {
          method: "PUT",
          body: JSON.stringify({ is_correct: isCorrect, notes: _notes }),
        }),
      async () => {
        await delay(150);
        const interview = mockStore.interviews.find((i) => i.id === interviewId);
        if (!interview) throw new Error("Interview not found");
        const iq = interview.questions?.find((q) => q.question_id === questionId);
        if (!iq) throw new Error("Question not in interview");
        iq.is_correct = isCorrect;
        return { is_correct: isCorrect };
      }
    ),

  // Statistics
  getStatistics: () =>
    withFallback(
      () => request<Statistics>("/statistics"),
      async () => {
        await delay(200);
        return mockStatistics;
      }
    ),

  // Dashboard
  getDashboard: () =>
    withFallback(
      () => request<DashboardData>("/dashboard"),
      async () => {
        await delay(200);
        return mockDashboard;
      }
    ),

  getExternalDashboard: () =>
    withFallback(
      () => request<ExternalDashboardData>("/dashboard/external"),
      async () => {
        await delay(300);
        return mockExternalDashboard;
      }
    ),

  // System
  getAsyncDemo: () =>
    withFallback(
      () => request<AsyncDemoResult>("/system/async-demo"),
      async () => {
        await delay(300);
        return mockAsyncDemo;
      }
    ),

  // Check if using mock data (for UI indicator)
  isUsingMockData: () => backendAvailable === false,
};
