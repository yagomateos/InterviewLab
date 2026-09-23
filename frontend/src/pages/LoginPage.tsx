import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateError } from "@/i18n/translations";
import { PageHeader, ErrorBanner } from "@/components/ui";
import { LogIn, UserPlus } from "lucide-react";

export function LoginPage() {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Return to whatever protected page sent the user here, defaulting to
  // the interviews list (the only thing behind a login in this app).
  const from = (location.state as { from?: string } | null)?.from ?? "/interviews";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}
        subtitle={mode === "login" ? t.auth.loginSubtitle : t.auth.registerSubtitle}
      />

      <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded-xl p-6 mt-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.auth.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder={t.auth.namePlaceholder}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.auth.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="alice@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.auth.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="••••••••"
            />
          </div>

          {error && <ErrorBanner message={translateError(error, t)} />}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors"
          >
            {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {submitting
              ? t.common.creating
              : mode === "login"
              ? t.auth.loginButton
              : t.auth.registerButton}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              setMode((m) => (m === "login" ? "register" : "login"));
              setError(null);
            }}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            {mode === "login" ? t.auth.switchToRegister : t.auth.switchToLogin}
          </button>
        </div>

        {mode === "login" && (
          <p className="text-xs text-slate-400 text-center mt-4">{t.auth.demoHint}</p>
        )}
      </div>
    </div>
  );
}
