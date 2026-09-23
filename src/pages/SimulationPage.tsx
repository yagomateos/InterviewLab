import { useState, useCallback, useEffect } from "react";
import { api } from "@/services/api";
import type { Question, Category } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

export function SimulationPage() {
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
    setFinished(false);
  };

  const resetSimulation = () => {
    setStarted(false);
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setAnswered(new Set());
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

  const markCorrect = useCallback(() => {
    const questionId = simQuestions[currentIndex]?.id;
    if (questionId === undefined || answered.has(questionId)) return;

    // setScore(prev => prev + 1) — the new score depends on the previous score.
    // Using the functional updater guarantees we always add 1 to the LATEST
    // value, even if multiple state updates are batched in the same tick.
    // If we wrote setScore(score + 1), the `score` variable would be the
    // value from the current render — if markCorrect is called twice quickly
    // (e.g. via keyboard), both calls would use the same stale `score` and
    // the increment would only happen once instead of twice.
    setScore((prev) => prev + 1);
    setAnswered((prev) => new Set(prev).add(questionId));
  }, [simQuestions, currentIndex, answered]);

  const markIncorrect = useCallback(() => {
    const questionId = simQuestions[currentIndex]?.id;
    if (questionId === undefined || answered.has(questionId)) return;

    setWrongCount((prev) => prev + 1);
    setAnswered((prev) => new Set(prev).add(questionId));
  }, [simQuestions, currentIndex, answered]);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;

  // --- Setup screen ---
  if (!started) {
    return (
      <div>
        <PageHeader title="Interview Simulation" subtitle="Practice with a timed mock interview" />
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 mt-8">
          <h2 className="font-semibold text-slate-800 mb-4">Configure your simulation</h2>

          <label className="block text-sm font-medium text-slate-600 mb-1">Category (optional)</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <label className="block text-sm font-medium text-slate-600 mb-1">Difficulty (optional)</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <p className="text-sm text-slate-500 mb-4">
            {simQuestions.length} questions will be included in this simulation.
          </p>

          <button
            onClick={startSimulation}
            disabled={simQuestions.length === 0}
            className="w-full text-sm font-medium px-4 py-2.5 rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors"
          >
            Start Simulation
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
        <PageHeader title="Simulation Results" />
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-8 mt-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{rate}%</h2>
          <p className="text-sm text-slate-500 mb-6">Success Rate</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-2xl font-bold text-slate-800">{total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{score}</p>
              <p className="text-xs text-slate-400">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600">{wrongCount}</p>
              <p className="text-xs text-slate-400">Incorrect</p>
            </div>
          </div>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 mx-auto text-sm font-medium px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            New Simulation
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
        <PageHeader title="Interview Simulation" />
        <ErrorBanner message="No questions match your filters." />
        <button onClick={resetSimulation} className="mt-4 text-sm font-medium px-4 py-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Interview Simulation"
        subtitle={`Question ${currentIndex + 1} of ${simQuestions.length}`}
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
          <span className="text-slate-400">correct</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <XCircle className="w-4 h-4 text-rose-500" />
          <span className="font-medium text-slate-700">{wrongCount}</span>
          <span className="text-slate-400">incorrect</span>
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
            {currentQuestion.difficulty}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{currentQuestion.title}</h2>
        {currentQuestion.description && (
          <p className="text-sm text-slate-600 leading-relaxed">{currentQuestion.description}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          <button
            onClick={markCorrect}
            disabled={isAnswered}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
              isAnswered
                ? "bg-slate-100 text-slate-400"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            I got it right
          </button>
          <button
            onClick={markIncorrect}
            disabled={isAnswered}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
              isAnswered
                ? "bg-slate-100 text-slate-400"
                : "bg-rose-500 text-white hover:bg-rose-600"
            }`}
          >
            <XCircle className="w-4 h-4" />
            I got it wrong
          </button>
        </div>

        <button
          onClick={nextQuestion}
          className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        >
          {currentIndex === simQuestions.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
