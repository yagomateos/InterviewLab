import { memo } from "react";
import type { Question } from "@/types";
import { CheckCircle2, XCircle, Circle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  isCorrect?: boolean | null;
  onMarkCorrect?: (questionId: number) => void;
  onMarkIncorrect?: (questionId: number) => void;
  onRemove?: (questionId: number) => void;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard: "bg-rose-100 text-rose-700 border-rose-200",
};

/**
 * QuestionCard — wrapped in React.memo so it only re-renders when its
 * own props change. This matters in lists of 20+ items: when one item
 * is marked correct/incorrect, the others don't need to re-render.
 *
 * React.memo does a shallow comparison of props. For this to work,
 * the callbacks passed down MUST have stable references (useCallback).
 */
function QuestionCardBase({
  question,
  isCorrect = null,
  onMarkCorrect,
  onMarkIncorrect,
  onRemove,
}: QuestionCardProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${difficultyColors[question.difficulty] || ""}`}>
              {question.difficulty}
            </span>
            {question.category_name && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {question.category_name}
              </span>
            )}
            {isCorrect === true && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            {isCorrect === false && (
              <XCircle className="w-4 h-4 text-rose-500" />
            )}
            {isCorrect === null && onMarkCorrect && (
              <Circle className="w-4 h-4 text-slate-300" />
            )}
          </div>
          <h3 className="font-medium text-slate-800 text-sm leading-snug">
            {question.title}
          </h3>
          {question.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {question.description}
            </p>
          )}
        </div>
      </div>

      {(onMarkCorrect || onMarkIncorrect || onRemove) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          {onMarkCorrect && (
            <button
              onClick={() => onMarkCorrect(question.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                isCorrect === true
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              Correct
            </button>
          )}
          {onMarkIncorrect && (
            <button
              onClick={() => onMarkIncorrect(question.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                isCorrect === false
                  ? "bg-rose-500 text-white"
                  : "bg-rose-50 text-rose-600 hover:bg-rose-100"
              }`}
            >
              Incorrect
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(question.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors ml-auto"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// React.memo — shallow-compares props; prevents re-render unless props change.
export const QuestionCard = memo(QuestionCardBase);
