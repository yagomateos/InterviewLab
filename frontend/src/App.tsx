import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DashboardPage } from "@/pages/DashboardPage";
import { QuestionsPage } from "@/pages/QuestionsPage";
import { InterviewsPage } from "@/pages/InterviewsPage";
import { InterviewDetailPage } from "@/pages/InterviewDetailPage";
import { StatisticsPage } from "@/pages/StatisticsPage";
import { SimulationPage } from "@/pages/SimulationPage";
import { AsyncDemoPage } from "@/pages/AsyncDemoPage";
import { api } from "@/services/api";
import { Database, Info } from "lucide-react";

function App() {
  const [usingMock, setUsingMock] = useState(false);

  // After a short delay, check if we fell back to mock data
  useEffect(() => {
    const timer = setTimeout(() => {
      setUsingMock(api.isUsingMockData());
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        {usingMock && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-amber-700">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Running in demo mode with sample data. Start the backend with{" "}
                <code className="text-xs bg-amber-100 px-1 rounded">docker compose up -d</code>{" "}
                to use the real PostgreSQL database.
              </span>
            </div>
          </div>
        )}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/interviews/:id" element={<InterviewDetailPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/async-demo" element={<AsyncDemoPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200 py-4 mt-8">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-slate-400">
            <span>InterviewLab</span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              {usingMock ? "Demo mode (no backend)" : "Connected to backend"}
            </span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
