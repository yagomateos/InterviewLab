import { useState, useMemo, useCallback } from "react";
import { api } from "@/services/api";
import type { Question, Category } from "@/types";
import { sortBy } from "@/utils/sortBy";
import { QuestionList } from "@/components/QuestionList";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { Plus, Search } from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateError } from "@/i18n/translations";

export function QuestionsPage() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [sortByKey, setSortByKey] = useState<keyof Question>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    category_id: "",
    difficulty: "medium" as string,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([api.getQuestions(), api.getCategories()])
      .then(([qs, cats]) => {
        setQuestions(qs);
        setCategories(cats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // useMemo — the filtered+sorted list is a derived value.
  // We memoize it because the calculation (filter + sort) runs over all
  // questions on every render, but the inputs (questions, filters, sort)
  // change infrequently. Without useMemo, every keystroke in the search
  // box would re-sort the full list even when only the search term changed.
  // However, we do NOT memoize the simple `categories` array — it's just
  // passed through and doesn't benefit from memoization.
  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(lower) ||
          (q.description?.toLowerCase().includes(lower) ?? false)
      );
    }
    if (categoryFilter) {
      result = result.filter((q) => q.category_name === categoryFilter);
    }
    if (difficultyFilter) {
      result = result.filter((q) => q.difficulty === difficultyFilter);
    }

    // sortBy<Question> — the second arg is constrained by `keyof Question`,
    // so only valid property names compile.
    return sortBy(result, sortByKey, sortDir);
  }, [questions, search, categoryFilter, difficultyFilter, sortByKey, sortDir]);

  // useCallback — these handlers are passed to QuestionList → QuestionCard.
  // QuestionCard is wrapped in React.memo, so it only re-renders when its
  // props change. If we created a new function on every render, React.memo's
  // shallow comparison would see a new reference and re-render every card
  // unnecessarily. useCallback keeps the reference stable.
  const handleDelete = useCallback(
    async (questionId: number) => {
      try {
        await api.deleteQuestion(questionId);
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      } catch (e) {
        setError((e as Error).message);
      }
    },
    []
  );

  const handleCreate = useCallback(async () => {
    if (!newQuestion.title.trim() || !newQuestion.category_id) return;
    setCreating(true);
    try {
      const created = await api.createQuestion({
        category_id: Number(newQuestion.category_id),
        title: newQuestion.title,
        description: newQuestion.description || undefined,
        difficulty: newQuestion.difficulty,
      });
      // Fetch the full question with category_name
      const full = await api.getQuestion(created.id);
      setQuestions((prev) => [full, ...prev]);
      setNewQuestion({ title: "", description: "", category_id: "", difficulty: "medium" });
      setShowForm(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }, [newQuestion]);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={translateError(error, t)} />;

  return (
    <div>
      <PageHeader
        title={t.questions.title}
        subtitle={t.questions.subtitleTotal(questions.length)}
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.questions.newQuestion}
          </button>
        }
      />

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">{t.questions.createQuestion}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.questions.formTitle}</label>
              <input
                type="text"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion((p) => ({ ...p, title: e.target.value }))}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder={t.questions.titlePlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.questions.formCategory}</label>
              <select
                value={newQuestion.category_id}
                onChange={(e) => setNewQuestion((p) => ({ ...p, category_id: e.target.value }))}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">{t.questions.selectPlaceholder}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.questions.formDifficulty}</label>
              <select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion((p) => ({ ...p, difficulty: e.target.value }))}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="easy">{t.common.easy}</option>
                <option value="medium">{t.common.medium}</option>
                <option value="hard">{t.common.hard}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.questions.formDescription}</label>
              <textarea
                value={newQuestion.description}
                onChange={(e) => setNewQuestion((p) => ({ ...p, description: e.target.value }))}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                rows={2}
              />
            </div>
          </div>
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.questions.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="">{t.questions.allCategories}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="">{t.questions.allDifficulties}</option>
          <option value="easy">{t.common.easy}</option>
          <option value="medium">{t.common.medium}</option>
          <option value="hard">{t.common.hard}</option>
        </select>
        <select
          value={sortByKey}
          onChange={(e) => setSortByKey(e.target.value as keyof Question)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="title">{t.questions.sortTitle}</option>
          <option value="difficulty">{t.questions.sortDifficulty}</option>
          <option value="category_name">{t.questions.sortCategory}</option>
          <option value="created_at">{t.questions.sortDate}</option>
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="text-sm font-medium px-3 py-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          {sortDir === "asc" ? t.questions.asc : t.questions.desc}
        </button>
      </div>

      <QuestionList
        questions={filteredQuestions}
        onRemove={handleDelete}
      />
    </div>
  );
}
