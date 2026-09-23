// ============================================================
// Frontend Domain Types — mirror the backend types
// ============================================================

export interface Category {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

// `typeof` — derive a type from the runtime constant above.
// We don't re-declare the union; we extract it from the constant.
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Question {
  id: number;
  category_id: number;
  category_name?: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  created_at: string;
  options?: QuestionOption[];
}

// A multiple-choice option for a question. Exactly one option per question
// is marked as correct.
export interface QuestionOption {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
}

export interface Interview {
  id: number;
  user_id: number;
  user_name?: string;
  title: string;
  status: "scheduled" | "in_progress" | "completed";
  created_at: string;
  question_count?: number;
  questions?: InterviewQuestion[];
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

export interface Statistics {
  total_questions: number;
  total_interviews: number;
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  success_rate: number;
  by_category: CategoryStat[];
  by_difficulty: DifficultyStat[];
  users_without_interviews: { id: number; name: string; email: string }[];
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

export interface DashboardData {
  stats: Statistics;
  recentQuestions: Question[];
  categories: Category[];
  recentActivity: { type: string; description: string; created_at: string }[];
}

export interface AsyncDemoResult {
  totalElapsedMs: number;
  operations: { name: string; delay: number; result: string; elapsedMs: number }[];
  explanation: string;
}

export interface ExternalDashboardData {
  services: {
    name: string;
    status: "fulfilled" | "rejected";
    data: unknown;
    error: string | null;
  }[];
}
