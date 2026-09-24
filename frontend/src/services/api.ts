import type {
  Question,
  Category,
  Interview,
  Statistics,
  DashboardData,
  User,
} from "@/types";
import {
  mockStore,
  mockCategories,
  mockInterviews,
  computeMockStatistics,
  computeMockDashboard,
} from "./mockData";
import { getToken, setToken } from "./authToken";

export { getToken, setToken };

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Track whether the backend is reachable. Once we know it's down,
// we skip network attempts and use mock data directly.
let backendAvailable: boolean | null = null;

// Thrown for a real response from the backend (4xx/5xx) — as opposed to a
// network failure, which withFallback treats as "backend unreachable" and
// silently degrades to mock data instead. A 401, for instance, means the
// backend IS there and is telling us the session is invalid; that should
// surface to the UI (so it can log the user out), never be masked by mock
// data quietly standing in.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Called whenever the backend rejects a request as unauthorized. AuthContext
// registers a handler here on mount so an expired/invalid token clears
// itself out of storage and the UI drops back to a logged-out state,
// without every call site having to check for 401 individually.
let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    if (res.status === 401) unauthorizedHandler?.();
    throw new ApiError(res.status, body.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Try the real backend; if it fails for any reason (network error, CORS,
// mixed content, connection refused), mark it unavailable and fall back
// to mock data so the UI still works in preview/deployed mode without Docker.
// A real ApiError (the backend responded, just with an error) is NOT a
// reachability problem — it's re-thrown as-is instead of being masked.
async function withFallback<T>(apiCall: () => Promise<T>, mockFn: () => T | Promise<T>): Promise<T> {
  if (backendAvailable === false) {
    return mockFn();
  }
  try {
    const result = await apiCall();
    backendAvailable = true;
    return result;
  } catch (err) {
    if (err instanceof ApiError) {
      backendAvailable = true;
      throw err;
    }
    backendAvailable = false;
    return mockFn();
  }
}

function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const api = {
  // Auth
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      withFallback(
        () => request<{ user: User; token: string }>("/auth/register", {
          method: "POST",
          body: JSON.stringify(data),
        }),
        async () => {
          await delay(200);
          return mockStore.registerUser(data);
        }
      ),

    login: (data: { email: string; password: string }) =>
      withFallback(
        () => request<{ user: User; token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        }),
        async () => {
          await delay(200);
          return mockStore.loginUser(data);
        }
      ),

    me: () =>
      withFallback(
        () => request<User>("/auth/me"),
        async () => {
          await delay(100);
          return mockStore.currentMockUser();
        }
      ),
  },

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

  // Interviews — every endpoint requires an authenticated user and is
  // scoped to their own interviews, both against the real backend and in
  // the local mock fallback (see mockStore.requireMockUser below).
  getInterviews: () =>
    withFallback(
      () => request<Interview[]>("/interviews"),
      async () => {
        await delay(150);
        const userId = mockStore.requireMockUser().id;
        return mockStore.interviews.filter((i) => i.user_id === userId);
      }
    ),

  getInterview: (id: number) =>
    withFallback(
      () => request<Interview>(`/interviews/${id}`),
      async () => {
        await delay(150);
        const userId = mockStore.requireMockUser().id;
        const interview = mockStore.interviews.find((i) => i.id === id && i.user_id === userId);
        if (!interview) throw new Error("Interview not found");
        return interview;
      }
    ),

  createInterview: (data: { title: string }) =>
    withFallback(
      () => request<Interview>("/interviews", { method: "POST", body: JSON.stringify(data) }),
      async () => {
        await delay(200);
        const user = mockStore.requireMockUser();
        const newInterview: Interview = {
          id: mockStore.nextInterviewId(),
          user_id: user.id,
          user_name: user.name,
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
        const userId = mockStore.requireMockUser().id;
        const interview = mockStore.interviews.find((i) => i.id === interviewId && i.user_id === userId);
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
        const userId = mockStore.requireMockUser().id;
        const interview = mockStore.interviews.find((i) => i.id === interviewId && i.user_id === userId);
        if (!interview) throw new Error("Interview not found");
        interview.questions = interview.questions?.filter((iq) => iq.question_id !== questionId) ?? [];
        interview.question_count = interview.questions.length;
        return undefined;
      }
    ),

  setAnswer: (interviewId: number, questionId: number, isCorrect: boolean, notes?: string) =>
    withFallback(
      () =>
        request<{ is_correct: boolean }>(`/interviews/${interviewId}/questions/${questionId}/answer`, {
          method: "PUT",
          body: JSON.stringify({ is_correct: isCorrect, notes }),
        }),
      async () => {
        await delay(150);
        const userId = mockStore.requireMockUser().id;
        const interview = mockStore.interviews.find((i) => i.id === interviewId && i.user_id === userId);
        if (!interview) throw new Error("Interview not found");
        const iq = interview.questions?.find((q) => q.question_id === questionId);
        if (!iq) throw new Error("Question not in interview");
        iq.is_correct = isCorrect;
        iq.notes = notes ?? null;
        return { is_correct: isCorrect };
      }
    ),

  updateInterviewStatus: (interviewId: number, status: Interview["status"]) =>
    withFallback(
      () =>
        request<Interview>(`/interviews/${interviewId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        }),
      async () => {
        await delay(150);
        const userId = mockStore.requireMockUser().id;
        const interview = mockStore.interviews.find((i) => i.id === interviewId && i.user_id === userId);
        if (!interview) throw new Error("Interview not found");
        interview.status = status;
        return interview;
      }
    ),

  // Statistics — personal progress, scoped to the logged-in user (both
  // against the real backend and in the mock fallback).
  getStatistics: () =>
    withFallback(
      () => request<Statistics>("/statistics"),
      async () => {
        await delay(200);
        return computeMockStatistics(mockStore.requireMockUser().id);
      }
    ),

  // Dashboard — same scoping as statistics for the "stats" portion.
  getDashboard: () =>
    withFallback(
      () => request<DashboardData>("/dashboard"),
      async () => {
        await delay(200);
        return computeMockDashboard(mockStore.requireMockUser().id);
      }
    ),

};
