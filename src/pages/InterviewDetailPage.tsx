import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/services/api";
import type { Interview, Question, Category } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { QuestionList } from "@/components/QuestionList";
import { ArrowLeft, Plus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateError, translateDifficulty } from "@/i18n/translations";
import { localizeQuestionTitle } from "@/i18n/localize";

export function InterviewDetailPage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const interviewId = Number(id);

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addQuestionId, setAddQuestionId] = useState("");

  // Build a map of question_id → is_correct for quick lookup
  const answerMap = new Map<number, boolean | null>();
  interview?.questions?.forEach((iq) => {
    answerMap.set(iq.question_id, iq.is_correct ?? null);
  });

  useEffect(() => {
    Promise.all([
      api.getInterview(interviewId),
      api.getQuestions(),
      api.getCategories(),
    ])
      .then(([int, allQs, cats]) => {
        setInterview(int);
        setQuestions(allQs);
        setAllQuestions(allQs);
        setCategories(cats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [interviewId]);

  // useCallback — these handlers are passed to QuestionCard (React.memo).
  // Stable references prevent unnecessary re-renders of every card when
  // one card's answer changes.
  const handleMarkCorrect = useCallback(
    async (questionId: number) => {
      try {
        await api.setAnswer(interviewId, questionId, true);
        // Update the interview's questions state with the new answer
        setInterview((prev) => {
          if (!prev?.questions) return prev;
          return {
            ...prev,
            questions: prev.questions.map((iq) =>
              iq.question_id === questionId ? { ...iq, is_correct: true } : iq
            ),
          };
        });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [interviewId]
  );

  const handleMarkIncorrect = useCallback(
    async (questionId: number) => {
      try {
        await api.setAnswer(interviewId, questionId, false);
        setInterview((prev) => {
          if (!prev?.questions) return prev;
          return {
            ...prev,
            questions: prev.questions.map((iq) =>
              iq.question_id === questionId ? { ...iq, is_correct: false } : iq
            ),
          };
        });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [interviewId]
  );

  const handleRemoveQuestion = useCallback(
    async (questionId: number) => {
      try {
        await api.removeQuestionFromInterview(interviewId, questionId);
        setInterview((prev) => {
          if (!prev?.questions) return prev;
          return {
            ...prev,
            questions: prev.questions.filter((iq) => iq.question_id !== questionId),
          };
        });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [interviewId]
  );

  const handleAddQuestion = async () => {
    if (!addQuestionId) return;
    try {
      await api.addQuestionToInterview(interviewId, Number(addQuestionId));
      const updated = await api.getInterview(interviewId);
      setInterview(updated);
      setAddQuestionId("");
      setShowAdd(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={translateError(error, t)} />;
  if (!interview) return <ErrorBanner message={t.interviewDetail.interviewNotFound} />;

  // Map interview questions to the Question shape for QuestionList
  const interviewQuestions: Question[] = (interview.questions ?? []).map((iq) => {
    const full = allQuestions.find((q) => q.id === iq.question_id);
    return {
      id: iq.question_id,
      category_id: full?.category_id ?? 0,
      category_name: iq.category_name ?? full?.category_name,
      title: iq.title ?? full?.title ?? "",
      title_es: iq.title_es ?? full?.title_es ?? null,
      description: full?.description ?? null,
      description_es: full?.description_es ?? null,
      difficulty: iq.difficulty ?? full?.difficulty ?? "medium",
      created_at: full?.created_at ?? "",
    };
  });

  // Questions not yet in this interview
  const availableQuestions = questions.filter(
    (q) => !interview.questions?.some((iq) => iq.question_id === q.id)
  );

  return (
    <div>
      <Link to="/interviews" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t.interviewDetail.backToInterviews}
      </Link>

      <PageHeader
        title={interview.title}
        subtitle={`${interview.user_name} · ${t.interviews.questionsCount(interview.questions?.length ?? 0)}`}
        action={
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.interviewDetail.addQuestion}
          </button>
        }
      />

      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-slate-700 mb-3">{t.interviewDetail.addQuestionToInterview}</h3>
          <div className="flex gap-2">
            <select
              value={addQuestionId}
              onChange={(e) => setAddQuestionId(e.target.value)}
              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">{t.interviewDetail.selectQuestion}</option>
              {availableQuestions.map((q) => (
                <option key={q.id} value={q.id}>
                  {localizeQuestionTitle(q, language)} ({q.category_name} · {translateDifficulty(q.difficulty, t)})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddQuestion}
              disabled={!addQuestionId}
              className="text-sm font-medium px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors"
            >
              {t.common.add}
            </button>
          </div>
          {availableQuestions.length === 0 && (
            <p className="text-sm text-slate-400 mt-2">{t.interviewDetail.allAlreadyAdded}</p>
          )}
        </div>
      )}

      <QuestionList
        questions={interviewQuestions}
        answerMap={answerMap}
        onMarkCorrect={handleMarkCorrect}
        onMarkIncorrect={handleMarkIncorrect}
        onRemove={handleRemoveQuestion}
      />
    </div>
  );
}
