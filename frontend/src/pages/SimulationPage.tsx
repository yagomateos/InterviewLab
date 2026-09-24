import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import type { Question, Category } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw, Trophy, Circle, Save, LogIn } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateError } from "@/i18n/translations";
import { localizeQuestionTitle, localizeQuestionDescription, localizeOptionText } from "@/i18n/localize";
import { useAuth } from "@/auth/AuthContext";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SimulationPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation state
  const [started, setStarted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  // setState(prev => ...) — used for all state updates that depend on the
  // previous value. This is critical for correctness when multiple updates
  // may be batched (React 18 automatic batching).
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  // Which option the user picked for each answered question, keyed by
  // question id — used to grade the checklist and highlight the choice.
  const [selections, setSelections] = useState<Record<number, number>>({});
  // Whether each answered question was correct — kept alongside selections
  // so the finished simulation can be saved as a real interview.
  const [correctness, setCorrectness] = useState<Record<number, boolean>>({});

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  // Guards against saving twice (e.g. a re-render while the save is
  // in flight) — a ref because it must be readable synchronously,
  // before the state update from setSaveStatus("saving") has committed.
  const savingRef = useRef(false);

  useEffect(() => {
    Promise.all([api.getQuestions(), api.getCategories()])
      .then(([qs, cats]) => {
        setQuestions(qs);
        setCategories(cats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtered questions for the simulation
  const simQuestions =
    categoryFilter || difficultyFilter
      ? questions.filter(
          (q) =>
            (!categoryFilter || q.category_name === categoryFilter) &&
            (!difficultyFilter || q.difficulty === difficultyFilter)
        )
      : questions;

  const startSimulation = () => {
    setStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setAnswered(new Set());
    setSelections({});
    setCorrectness({});
    setSaveStatus("idle");
    savingRef.current = false;
    setFinished(false);
  };

  const resetSimulation = () => {
    setStarted(false);
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setAnswered(new Set());
    setSelections({});
    setCorrectness({});
    setSaveStatus("idle");
    savingRef.current = false;
    setFinished(false);
  };

  // useCallback — these handlers are stable across re-renders, so child
  // components that depend on them don't re-render unnecessarily.
  const nextQuestion = useCallback(() => {
    // setState(prev => ...) — we MUST use the functional form here because
    // the next index depends on the current index. If we used the value
    // captured in the render (currentIndex + 1), rapid clicks could use a
    // stale value, since React batches state updates and the variable
    // `currentIndex` in this closure is from the render when the handler
    // was created, not the latest value.
    setCurrentIndex((prev) => {
      if (prev >= simQuestions.length - 1) {
        setFinished(true);
        return prev;
      }
      return prev + 1;
    });
  }, [simQuestions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // selectOption — the checklist replaces the old manual "I got it right /
  // wrong" buttons: picking one of the 3 options grades itself against
  // option.is_correct, so score/wrongCount always derive from a real answer.
  const selectOption = useCallback(
    (optionId: number, isCorrect: boolean) => {
      const questionId = simQuestions[currentIndex]?.id;
      if (questionId === undefined || answered.has(questionId)) return;

      // setState(prev => ...) — see nextQuestion above for why the functional
      // form is required here too.
      if (isCorrect) {
        setScore((prev) => prev + 1);
      } else {
        setWrongCount((prev) => prev + 1);
      }
      setSelections((prev) => ({ ...prev, [questionId]: optionId }));
      setCorrectness((prev) => ({ ...prev, [questionId]: isCorrect }));
      setAnswered((prev) => new Set(prev).add(questionId));
    },
    [simQuestions, currentIndex, answered]
  );

  // Once the simulation finishes, save it as a real interview (so it shows
  // up under "Interviews" and counts toward Statistics) — only when logged
  // in, and only once per run.
  useEffect(() => {
    if (!finished || !user || savingRef.current) return;
    savingRef.current = true;
    setSaveStatus("saving");

    const title = t.simulation.savedTitle(new Date().toLocaleDateString(language === "es" ? "es-ES" : "en-US"));
    const answeredQuestions = simQuestions.filter((q) => answered.has(q.id));

    api
      .createInterview({ title })
      .then((interview) =>
        Promise.all(
          answeredQuestions.map((q) => {
            const selectedOption = q.options?.find((o) => o.id === selections[q.id]);
            const selectedText = selectedOption ? localizeOptionText(selectedOption, language) : undefined;
            return api
              .addQuestionToInterview(interview.id, q.id)
              .then(() => api.setAnswer(interview.id, q.id, correctness[q.id] ?? false, selectedText));
          })
        ).then(() => api.updateInterviewStatus(interview.id, "completed"))
      )
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("error"));
    // Only re-run when a NEW simulation finishes — the deps below matter
    // for closure freshness, but savingRef is what actually prevents repeats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, user]);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={translateError(error, t)} />;

  // --- Setup screen ---
  if (!started) {
    return (
      <div>
        <PageHeader title={t.simulation.title} subtitle={t.simulation.subtitle} />
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 mt-8">
          <h2 className="font-semibold text-slate-800 mb-4">{t.simulation.configureTitle}</h2>

          <label className="block text-sm font-medium text-slate-600 mb-1">{t.simulation.categoryOptional}</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">{t.simulation.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <label className="block text-sm font-medium text-slate-600 mb-1">{t.simulation.difficultyOptional}</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">{t.simulation.allDifficulties}</option>
            <option value="easy">{t.common.easy}</option>
            <option value="medium">{t.common.medium}</option>
            <option value="hard">{t.common.hard}</option>
          </select>

          <p className="text-sm text-slate-500 mb-4">
            {t.simulation.questionsIncluded(simQuestions.length)}
          </p>

          <button
            onClick={startSimulation}
            disabled={simQuestions.length === 0}
            className="w-full text-sm font-medium px-4 py-2.5 rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors"
          >
            {t.simulation.start}
          </button>
        </div>
      </div>
    );
  }

  // --- Results screen ---
  if (finished) {
    const total = score + wrongCount;
    const rate = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div>
        <PageHeader title={t.simulation.resultsTitle} />
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-8 mt-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{rate}%</h2>
          <p className="text-sm text-slate-500 mb-6">{t.simulation.successRate}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-2xl font-bold text-slate-800">{total}</p>
              <p className="text-xs text-slate-400">{t.simulation.total}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{score}</p>
              <p className="text-xs text-slate-400">{t.simulation.correct}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600">{wrongCount}</p>
              <p className="text-xs text-slate-400">{t.simulation.incorrect}</p>
            </div>
          </div>

          {user ? (
            <div className="mb-6 flex items-center justify-center gap-2 text-sm">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Save className="w-4 h-4 animate-pulse" />
                  {t.simulation.saving}
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {t.simulation.savedToInterviews}
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1.5 text-rose-600">
                  <XCircle className="w-4 h-4" />
                  {t.simulation.saveError}
                </span>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="mb-6 flex items-center justify-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              <LogIn className="w-4 h-4" />
              {t.simulation.loginToSave}
            </Link>
          )}

          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 mx-auto text-sm font-medium px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t.simulation.newSimulation}
          </button>
        </div>
      </div>
    );
  }

  // --- Active simulation ---
  const currentQuestion = simQuestions[currentIndex];
  const isAnswered = currentQuestion ? answered.has(currentQuestion.id) : false;

  if (!currentQuestion) {
    return (
      <div>
        <PageHeader title={t.simulation.title} />
        <ErrorBanner message={t.simulation.noMatch} />
        <button onClick={resetSimulation} className="mt-4 text-sm font-medium px-4 py-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">
          {t.simulation.back}
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t.simulation.title}
        subtitle={t.simulation.questionOf(currentIndex + 1, simQuestions.length)}
      />

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / simQuestions.length) * 100}%` }}
        />
      </div>

      {/* Score display */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-medium text-slate-700">{score}</span>
          <span className="text-slate-400">{t.simulation.correctWord}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <XCircle className="w-4 h-4 text-rose-500" />
          <span className="font-medium text-slate-700">{wrongCount}</span>
          <span className="text-slate-400">{t.simulation.incorrectWord}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          {currentQuestion.category_name && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {currentQuestion.category_name}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            currentQuestion.difficulty === "easy"
              ? "bg-emerald-100 text-emerald-700"
              : currentQuestion.difficulty === "medium"
              ? "bg-amber-100 text-amber-700"
              : "bg-rose-100 text-rose-700"
          }`}>
            {t.common[currentQuestion.difficulty]}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{localizeQuestionTitle(currentQuestion, language)}</h2>
        {currentQuestion.description && (
          <p className="text-sm text-slate-600 leading-relaxed mb-5">{localizeQuestionDescription(currentQuestion, language)}</p>
        )}

        {/* Multiple-choice checklist — pick the correct answer out of the
            options for this question. Selecting one grades itself: no
            separate "I got it right / wrong" step needed. */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selections[currentQuestion.id] === option.id;
              const showFeedback = isAnswered;

              let stateClasses = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
              if (showFeedback && option.is_correct) {
                stateClasses = "border-emerald-300 bg-emerald-50";
              } else if (showFeedback && isSelected && !option.is_correct) {
                stateClasses = "border-rose-300 bg-rose-50";
              } else if (showFeedback) {
                stateClasses = "border-slate-200 opacity-60";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => selectOption(option.id, option.is_correct)}
                  disabled={isAnswered}
                  className={`w-full flex items-start gap-3 text-left text-sm px-4 py-3 rounded-lg border transition-colors disabled:cursor-default ${stateClasses}`}
                >
                  {showFeedback ? (
                    option.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                    ) : isSelected ? (
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
                    )
                  ) : (
                    <Circle className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" />
                  )}
                  <span
                    className={
                      showFeedback && option.is_correct
                        ? "text-emerald-800"
                        : showFeedback && isSelected
                        ? "text-rose-800"
                        : "text-slate-700"
                    }
                  >
                    {localizeOptionText(option, language)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.simulation.previous}
        </button>

        <button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-40 transition-colors"
        >
          {currentIndex === simQuestions.length - 1 ? t.simulation.finish : t.simulation.next}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
