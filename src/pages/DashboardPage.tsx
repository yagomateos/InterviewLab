import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { DashboardData } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { FileQuestion, Users, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateError, translateDifficulty } from "@/i18n/translations";

// The backend always returns recent-activity descriptions in the fixed
// English form "New question: <title>" (see statisticsRepository.ts). Only
// the prefix is translated here; the title itself is data and stays as-is.
const ACTIVITY_PREFIX = "New question: ";
function formatActivity(description: string, newQuestionPrefix: string): string {
  return description.startsWith(ACTIVITY_PREFIX)
    ? `${newQuestionPrefix} ${description.slice(ACTIVITY_PREFIX.length)}`
    : description;
}

export function DashboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={translateError(error, t)} />;
  if (!data) return null;

  const { stats, recentQuestions, categories, recentActivity } = data;

  const statCards = [
    { label: t.dashboard.statQuestions, value: stats.total_questions, icon: FileQuestion, color: "sky" },
    { label: t.dashboard.statInterviews, value: stats.total_interviews, icon: Users, color: "indigo" },
    { label: t.dashboard.statCorrect, value: stats.correct_answers, icon: CheckCircle2, color: "emerald" },
    { label: t.dashboard.statSuccessRate, value: `${stats.success_rate}%`, icon: TrendingUp, color: "amber" },
  ];

  const colorMap: Record<string, string> = {
    sky: "bg-sky-50 text-sky-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div>
      <PageHeader
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-3">{t.dashboard.recentQuestions}</h2>
          <div className="space-y-2">
            {recentQuestions.map((q) => (
              <div key={q.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{q.title}</p>
                  <p className="text-xs text-slate-400">{q.category_name} · {translateDifficulty(q.difficulty, t)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-slate-800 mb-3">{t.dashboard.categories}</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((c) => (
              <span key={c.id} className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                {c.name}
              </span>
            ))}
          </div>

          <h2 className="font-semibold text-slate-800 mb-3">{t.dashboard.recentActivity}</h2>
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span className="truncate">{formatActivity(a.description, t.dashboard.newQuestionPrefix)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
