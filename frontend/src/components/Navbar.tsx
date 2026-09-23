import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileQuestion, Users, BarChart3, Play, Zap, LogIn, LogOut } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/auth/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems = [
    { to: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/questions", label: t.nav.questions, icon: FileQuestion },
    { to: "/interviews", label: t.nav.interviews, icon: Users },
    { to: "/statistics", label: t.nav.statistics, icon: BarChart3 },
    { to: "/simulation", label: t.nav.simulation, icon: Play },
    { to: "/async-demo", label: t.nav.async, icon: Zap },
  ];

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center text-sm font-bold">
            IL
          </span>
          <span className="hidden sm:inline">{t.nav.brand}</span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-sky-50 text-sky-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {/* Language switcher — toggles between English and Spanish UI
              text, persisted to localStorage so the choice survives a reload. */}
          <button
            onClick={toggleLanguage}
            title={language === "en" ? "Cambiar a Español" : "Switch to English"}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <span className={language === "en" ? "text-sky-600" : "text-slate-300"}>EN</span>
            <span className="text-slate-300">/</span>
            <span className={language === "es" ? "text-sky-600" : "text-slate-300"}>ES</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-sm text-slate-600 truncate max-w-[140px]" title={user.name}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                title={t.auth.logout}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{t.auth.logout}</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">{t.auth.login}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
