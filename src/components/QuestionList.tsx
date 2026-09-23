import { useCallback } from "react";
import type { Question } from "@/types";
import { QuestionCard } from "./QuestionCard";

interface QuestionListProps {
  questions: Question[];
  // The parent passes callbacks; we wrap them with useCallback in the parent
  // so QuestionCard (React.memo) doesn't re-render unnecessarily.
  onMarkCorrect?: (questionId: number) => void;
  onMarkIncorrect?: (questionId: number) => void;
  onRemove?: (questionId: number) => void;
  answerMap?: Map<number, boolean | null>;
}

export function QuestionList({
  questions,
  onMarkCorrect,
  onMarkIncorrect,
  onRemove,
  answerMap,
}: QuestionListProps) {
  // useCallback is NOT used here for these callbacks because they are already
  // stabilized by the parent component. This demonstrates that useCallback should
  // be used at the appropriate level — not blindly everywhere. The parent owns
  // these handlers and stabilizes them; this component just passes them through.
  const handleCorrect = useCallback(
    (id: number) => onMarkCorrect?.(id),
    [onMarkCorrect]
  );
  const handleIncorrect = useCallback(
    (id: number) => onMarkIncorrect?.(id),
    [onMarkIncorrect]
  );
  const handleRemove = useCallback(
    (id: number) => onRemove?.(id),
    [onRemove]
  );

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm">No questions found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          isCorrect={answerMap?.get(q.id) ?? null}
          onMarkCorrect={onMarkCorrect ? handleCorrect : undefined}
          onMarkIncorrect={onMarkIncorrect ? handleIncorrect : undefined}
          onRemove={onRemove ? handleRemove : undefined}
        />
      ))}
    </div>
  );
}
