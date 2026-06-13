"use client";

import { useState } from "react";

import { api } from "@/lib/api";

type Scenario = {
  id: string;
  title: string;
  summary: string;
  style: string;
  duration: string;
};

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderMessage, setRenderMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setScenarios(null);
    setSelectedId(null);
    setError(null);

    try {
      const response = await api.post<{ scenarios: Scenario[] }>(
        "/projects/analyze",
        { url }
      );
      setScenarios(response.data.scenarios);
    } catch {
      setError("Analiz sirasinda bir hata olustu. Lutfen tekrar deneyin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;

    setIsRendering(true);
    setRenderMessage(null);
    setError(null);

    try {
      await api.post(`/scenarios/${selectedId}/render`);
      setRenderMessage("Render basladi, isleniyor...");
    } catch {
      setError("Render baslatilirken bir hata olustu. Lutfen tekrar deneyin.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Lagaluga</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Bir URL yapistir, icerigi analiz edelim ve sana video senaryolari
            onerelim.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <label
            htmlFor="source-url"
            className="block text-sm font-medium text-zinc-700"
          >
            Icerik URL&apos;si
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="source-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://ornek.com/makale"
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isAnalyzing ? "Analiz ediliyor..." : "Analiz Et"}
            </button>
          </div>
        </section>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {scenarios && (
          <section className="mt-10">
            <h2 className="text-sm font-medium text-zinc-700">
              Senaryo onerileri
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {scenarios.map((scenario) => {
                const isSelected = scenario.id === selectedId;

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedId(scenario.id)}
                    className={`flex flex-col rounded-2xl border bg-white p-5 text-left transition-all ${
                      isSelected
                        ? "border-zinc-900 ring-1 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        {scenario.style}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {scenario.duration}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-zinc-900">
                      {scenario.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      {scenario.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-end gap-4">
              {renderMessage && (
                <p className="text-sm text-zinc-500">{renderMessage}</p>
              )}
              <button
                type="button"
                onClick={handleRender}
                disabled={!selectedId || isRendering}
                className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {isRendering ? "Render ediliyor..." : "Videoyu Render Et"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
