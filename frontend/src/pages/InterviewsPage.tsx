import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import type { Interview } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { Plus, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateError } from "@/i18n/translations";

export function InterviewsPage() {
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.getInterviews()
      .then(setInterviews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const created = await api.createInterview({ title });
      const full = await api.getInterview(created.id);
      setInterviews((prev) => [full, ...prev]);
      setTitle("");
      setShowForm(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={translateError(error, t)} />;

  const statusColors: Record<string, string> = {
    scheduled: "bg-sky-100 text-sky-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div>
      <PageHeader
        title={t.interviews.title}
        subtitle={t.interviews.subtitleCount(interviews.length)}
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.interviews.newInterview}
          </button>
        }
      />

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-1">{t.interviews.formTitle}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder={t.interviews.titlePlaceholder}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="text-sm font-medium px-4 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors"
            >
              {creating ? t.common.creating : t.common.create}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm font-medium px-4 py-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {interviews.map((interview) => (
          <Link
            key={interview.id}
            to={`/interviews/${interview.id}`}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-slate-800 text-sm truncate">{interview.title}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[interview.status]}`}>
                  {t.interviews.status[interview.status]}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {interview.user_name} · {t.interviews.questionsCount(interview.question_count ?? 0)}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
