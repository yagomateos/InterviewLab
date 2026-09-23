import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileQuestion, Users, BarChart3, Play, Zap } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/questions", label: "Questions", icon: FileQuestion },
  { to: "/interviews", label: "Interviews", icon: Users },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
  { to: "/simulation", label: "Simulation", icon: Play },
  { to: "/async-demo", label: "Async", icon: Zap },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800">
          <span className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center text-sm font-bold">
            IL
          </span>
          <span className="hidden sm:inline">InterviewLab</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
      </div>
    </header>
  );
}
