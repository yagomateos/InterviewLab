import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { AsyncDemoResult, ExternalDashboardData } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";

export function AsyncDemoPage() {
  const [demo, setDemo] = useState<AsyncDemoResult | null>(null);
  const [external, setExternal] = useState<ExternalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch both endpoints concurrently — they're independent.
    Promise.all([api.getAsyncDemo(), api.getExternalDashboard()])
      .then(([d, e]) => {
        setDemo(d);
        setExternal(e);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;
  if (!demo || !external) return null;

  return (
    <div>
      <PageHeader
        title="Async & Promises Demo"
        subtitle="Live demonstration of the Node.js Event Loop, Promise.all, and Promise.allSettled"
      />

      {/* Event Loop Demo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-800">Event Loop — Concurrent Async Operations</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">{demo.explanation}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {demo.operations.map((op) => (
            <div key={op.name} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-slate-700">{op.name}</p>
                <p className="text-xs text-slate-400">delay: {op.delay}ms</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-sky-600">{op.elapsedMs}ms</p>
                <p className="text-xs text-slate-400">elapsed</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Total elapsed: {demo.totalElapsedMs}ms</strong> — if these were sequential it would be{" "}
            {demo.operations.reduce((sum, op) => sum + op.delay, 0)}ms. The Event Loop processes
            async callbacks concurrently without blocking the main thread.
          </p>
        </div>
      </div>

      {/* Promise.allSettled Demo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-sky-500" />
          <h2 className="font-semibold text-slate-800">Promise.allSettled — External Dashboard</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Four simulated services are called. One fails intentionally (difficulty-service).
          With <code className="text-xs bg-slate-100 px-1 rounded">Promise.allSettled</code>, the
          endpoint returns all results — including the failure — instead of rejecting entirely.
        </p>

        <div className="space-y-3">
          {external.services.map((svc) => (
            <div
              key={svc.name}
              className={`flex items-center justify-between border rounded-lg p-4 ${
                svc.status === "fulfilled"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {svc.status === "fulfilled" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700">{svc.name}</p>
                  {svc.status === "fulfilled" ? (
                    <p className="text-xs text-slate-500">
                      {typeof svc.data === "object" && svc.data !== null
                        ? `${Array.isArray(svc.data) ? svc.data.length : Object.keys(svc.data as object).length} items`
                        : String(svc.data)}
                    </p>
                  ) : (
                    <p className="text-xs text-rose-500">{svc.error}</p>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  svc.status === "fulfilled"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {svc.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <p className="text-sm text-sky-800">
            <strong>Promise.all</strong> would have rejected the entire call when the difficulty-service
            failed — losing the data from the other three services. <strong>Promise.allSettled</strong>{" "}
            waits for all promises and reports each one's outcome individually.
          </p>
        </div>
      </div>
    </div>
  );
}
