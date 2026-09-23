import { useEffect, useState, useMemo } from "react";
import { api } from "@/services/api";
import type { Statistics } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { CheckCircle2, XCircle, Percent, FileQuestion, Users, UserX } from "lucide-react";

export function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getStatistics()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // useMemo — these are derived calculations from the raw stats data.
  // We memoize because the computations (mapping, finding max, calculating
  // percentages) depend only on `stats`, which changes only after a refetch.
  // On every re-render that does NOT change stats (e.g. parent re-render),
  // we skip the recalculation. This is the correct use of useMemo:
  // a non-trivial computation with a stable input that shouldn't re-run
  // on every render.
  const derivedStats = useMemo(() => {
    if (!stats) return null;

    const totalAnswered = stats.correct_answers + stats.incorrect_answers;
    const correctRate = totalAnswered > 0 ? Math.round((stats.correct_answers / totalAnswered) * 100) : 0;

    const bestCategory = stats.by_category.reduce(
      (best, cat) => {
        const total = cat.correct_count + cat.incorrect_count;
        const rate = total > 0 ? (cat.correct_count / total) * 100 : 0;
        return rate > best.rate ? { name: cat.category, rate } : best;
      },
      { name: "—", rate: 0 }
    );

    const hardestDifficulty = stats.by_difficulty.reduce(
      (hardest, d) => {
        const total = d.correct_count + d.incorrect_count;
        const rate = total > 0 ? (d.correct_count / total) * 100 : 100;
        return rate < hardest.rate ? { name: d.difficulty, rate } : hardest;
      },
      { name: "—", rate: 100 }
    );

    return { totalAnswered, correctRate, bestCategory, hardestDifficulty };
  }, [stats]);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;
  if (!stats || !derivedStats) return null;

  const statCards = [
    { label: "Total Questions", value: stats.total_questions, icon: FileQuestion, color: "sky" },
    { label: "Total Interviews", value: stats.total_interviews, icon: Users, color: "indigo" },
    { label: "Correct Answers", value: stats.correct_answers, icon: CheckCircle2, color: "emerald" },
    { label: "Incorrect Answers", value: stats.incorrect_answers, icon: XCircle, color: "rose" },
    { label: "Success Rate", value: `${stats.success_rate}%`, icon: Percent, color: "amber" },
    { label: "Users w/o Interviews", value: stats.users_without_interviews.length, icon: UserX, color: "slate" },
  ];

  const colorMap: Record<string, string> = {
    sky: "bg-sky-50 text-sky-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  const maxCategoryCount = Math.max(...stats.by_category.map((c) => c.question_count), 1);

  return (
    <div>
      <PageHeader
        title="Statistics"
        subtitle="Real statistics from the PostgreSQL database (GROUP BY, HAVING, WHERE, JOINs)"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorMap[card.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Derived insights */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Best Category</p>
          <p className="text-lg font-semibold text-slate-800">{derivedStats.bestCategory.name}</p>
          <p className="text-sm text-emerald-600">{Math.round(derivedStats.bestCategory.rate)}% correct</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Hardest Difficulty</p>
          <p className="text-lg font-semibold text-slate-800 capitalize">{derivedStats.hardestDifficulty.name}</p>
          <p className="text-sm text-rose-600">{Math.round(derivedStats.hardestDifficulty.rate)}% correct</p>
        </div>
      </div>

      {/* Category stats — powered by GROUP BY + HAVING */}
      <h2 className="font-semibold text-slate-800 mb-3">By Category</h2>
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8">
        <div className="space-y-3">
          {stats.by_category.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                <span className="text-xs text-slate-400">
                  {cat.question_count} questions · {cat.correct_count} correct · {cat.incorrect_count} incorrect
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${(cat.question_count / maxCategoryCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 italic">
          SQL: GROUP BY c.name HAVING COUNT(q.id) &gt;= 1 — only categories with at least 1 question appear.
        </p>
      </div>

      {/* Difficulty stats — powered by GROUP BY */}
      <h2 className="font-semibold text-slate-800 mb-3">By Difficulty</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.by_difficulty.map((d) => {
          const total = d.correct_count + d.incorrect_count;
          const rate = total > 0 ? Math.round((d.correct_count / total) * 100) : 0;
          return (
            <div key={d.difficulty} className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-slate-800 capitalize mb-1">{d.difficulty}</p>
              <p className="text-2xl font-bold text-slate-800">{d.question_count}</p>
              <p className="text-xs text-slate-400">questions</p>
              {total > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-sm font-medium text-emerald-600">{rate}% correct</p>
                  <p className="text-xs text-slate-400">{d.correct_count}/{total} answered</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LEFT JOIN demo — users without interviews */}
      <h2 className="font-semibold text-slate-800 mb-3">Users Without Interviews</h2>
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        {stats.users_without_interviews.length === 0 ? (
          <p className="text-sm text-slate-400">All users have at least one interview.</p>
        ) : (
          <div className="space-y-2">
            {stats.users_without_interviews.map((u) => (
              <div key={u.id} className="flex items-center gap-2 text-sm">
                <UserX className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">{u.name}</span>
                <span className="text-slate-400">{u.email}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4 italic">
          SQL: LEFT JOIN interviews ON ... WHERE i.id IS NULL — only possible with LEFT JOIN, not INNER JOIN.
        </p>
      </div>
    </div>
  );
}
