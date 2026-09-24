import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DashboardPage } from "@/pages/DashboardPage";
import { QuestionsPage } from "@/pages/QuestionsPage";
import { InterviewsPage } from "@/pages/InterviewsPage";
import { InterviewDetailPage } from "@/pages/InterviewDetailPage";
import { StatisticsPage } from "@/pages/StatisticsPage";
import { SimulationPage } from "@/pages/SimulationPage";
import { LoginPage } from "@/pages/LoginPage";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route
                  path="/interviews"
                  element={
                    <ProtectedRoute>
                      <InterviewsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/statistics"
                  element={
                    <ProtectedRoute>
                      <StatisticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/simulation" element={<SimulationPage />} />
                <Route path="/login" element={<LoginPage />} />
                {/* Land anonymous visitors on the public question bank
                    instead of a page that immediately bounces them to
                    /login — Dashboard/Statistics only make sense once
                    there's "you" to show data for. */}
                <Route path="/" element={<Navigate to="/questions" replace />} />
                <Route path="*" element={<Navigate to="/questions" replace />} />
              </Routes>
            </main>
            <footer className="border-t border-slate-200 py-4 mt-8">
              <div className="max-w-6xl mx-auto px-4 text-xs text-slate-400">
                <span>InterviewLab</span>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
