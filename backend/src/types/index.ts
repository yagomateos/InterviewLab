// ============================================================
// Domain Types — shared across the backend
// ============================================================

export interface Category {
  id: number;
  name: string;
}

export interface Question {
  id: number;
  category_id: number;
  category_name?: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
}

// `typeof` usage: derive a union type from a runtime constant.
// The DIFFICULTIES constant exists at runtime; `typeof` extracts its
// shape so the compiler knows the valid string values without us
// re-declaring them as a separate type.
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Interview {
  id: number;
  user_id: number;
  user_name?: string;
  title: string;
  status: "scheduled" | "in_progress" | "completed";
  created_at: string;
  question_count?: number;
}

export interface InterviewQuestion {
  id: number;
  interview_id: number;
  question_id: number;
  order: number;
  title?: string;
  category_name?: string;
  difficulty?: Difficulty;
  is_correct?: boolean | null;
}

export interface Answer {
  id: number;
  interview_question_id: number;
  is_correct: boolean;
  notes: string | null;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// Statistics types
export interface Statistics {
  total_questions: number;
  total_interviews: number;
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  success_rate: number;
}

export interface CategoryStat {
  category: string;
  question_count: number;
  correct_count: number;
  incorrect_count: number;
}

export interface DifficultyStat {
  difficulty: string;
  question_count: number;
  correct_count: number;
  incorrect_count: number;
}

// API helper types
export interface ApiError {
  error: string;
  message: string;
}
