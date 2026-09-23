import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { AsyncDemoResult, ExternalDashboardData } from "@/types";
import { Loading, ErrorBanner, PageHeader } from "@/components/ui";
import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { translateError } from "@/i18n/translations";

export function AsyncDemoPage() {
  const { t } = useLanguage();
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
  if (error) return <ErrorBanner message={translateError(error, t)} />;
  if (!demo || !external) return null;

  return (
    <div>
      <PageHeader
        title={t.asyncDemo.title}
        subtitle={t.asyncDemo.subtitle}
      />

      {/* Event Loop Demo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-800">{t.asyncDemo.eventLoopTitle}</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">{t.asyncDemo.explanationText}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {demo.operations.map((op) => (
            <div key={op.name} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-slate-700">{op.name}</p>
                <p className="text-xs text-slate-400">{t.asyncDemo.delayLabel}: {op.delay}ms</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-sky-600">{op.elapsedMs}ms</p>
                <p className="text-xs text-slate-400">{t.asyncDemo.elapsedLabel}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>{t.asyncDemo.totalElapsedPrefix} {demo.totalElapsedMs}ms</strong> {t.asyncDemo.totalElapsedMid}{" "}
            {demo.operations.reduce((sum, op) => sum + op.delay, 0)}{t.asyncDemo.totalElapsedSuffix}
          </p>
        </div>
      </div>

      {/* Promise.allSettled Demo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-sky-500" />
          <h2 className="font-semibold text-slate-800">{t.asyncDemo.allSettledTitle}</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          {t.asyncDemo.allSettledDescPrefix}{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">Promise.allSettled</code>{t.asyncDemo.allSettledDescSuffix}
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
                        ? `${Array.isArray(svc.data) ? svc.data.length : Object.keys(svc.data as object).length} ${t.asyncDemo.items}`
                        : String(svc.data)}
                    </p>
                  ) : (
                    <p className="text-xs text-rose-500">{translateError(svc.error ?? "", t)}</p>
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
            <strong>Promise.all</strong> {t.asyncDemo.allNote1} <strong>Promise.allSettled</strong>{" "}
            {t.asyncDemo.allNote2}
          </p>
        </div>
      </div>
    </div>
  );
}
