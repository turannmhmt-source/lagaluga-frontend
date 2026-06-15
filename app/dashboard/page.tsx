"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ffbtiktwzrlzlndfnyzy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYnRpa3R3enJsemxuZGZueXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDUwMzgsImV4cCI6MjA5NjkyMTAzOH0.88tvA2bJF3pv3TaUwOMTkn4PFGHjZcI8otUGJhZm8pk"
);

const API = "https://lagaluga-backend-production.up.railway.app";

type Scenario = { id: string; title: string; summary: string; style: string; duration: string; };

const FORMATS: Record<string, { label: string; icon: string; sub: string }> = {
  "9:16-reels":  { label: "Reels",   icon: "📱", sub: "1080×1920 · Instagram" },
  "9:16-tiktok": { label: "TikTok",  icon: "🎵", sub: "1080×1920 · TikTok" },
  "9:16-story":  { label: "Hikaye",  icon: "⭕", sub: "1080×1920 · Story" },
  "16:9":        { label: "YouTube", icon: "▶️", sub: "1920×1080 · YouTube" },
  "1:1":         { label: "Gönderi", icon: "⬛", sub: "1080×1080 · Kare" },
  "9:16-shorts": { label: "Shorts",  icon: "🩳", sub: "1080×1920 · Shorts" },
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(3);
  const [input, setInput] = useState("");
  const [format, setFormat] = useState("9:16-reels");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [scrapeFailed, setScrapeFailed] = useState(false);
  const [manualDesc, setManualDesc] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderMessage, setRenderMessage] = useState<string | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [renderedVideo, setRenderedVideo] = useState<string>("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<{ url: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
      supabase.from("profiles").select("credits").eq("id", session.user.id).single().then(({ data }) => {
        if (data?.credits !== undefined) setCredits(data.credits);
      });
    });
  }, [router]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const pollTask = useCallback(async (taskId: string) => {
    try {
      const res = await fetch(`${API}/projects/task/${taskId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "completed") {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setIsAnalyzing(false);
        setAnalyzeStep("");
        setScenarios(data.result?.scenarios || []);
      } else if (data.status === "scrape_failed") {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setIsAnalyzing(false);
        setAnalyzeStep("");
        setScrapeFailed(true);
      } else if (data.status === "failed") {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setIsAnalyzing(false);
        setAnalyzeStep("");
        setError("Analiz başarısız oldu. Lütfen tekrar deneyin.");
      }
    } catch (e) {
      console.error("Poll error:", e);
    }
  }, []);

  const handleAnalyze = async (useManual = false) => {
    if ((!input.trim() && !useManual) || isAnalyzing || credits <= 0) return;
    setIsAnalyzing(true);
    setAnalyzeStep("Site analiz ediliyor...");
    setScenarios(null); setSelectedId(null); setError(null);
    setScrapeFailed(false); setVideos([]); setImages([]);
    setRenderedVideo(""); setRenderMessage(null);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    const isUrl = input.startsWith("http://") || input.startsWith("https://");
    const urlToSend = isUrl ? input : `topic:${input}`;

    try {
      const res = await fetch(`${API}/projects/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlToSend,
          format,
          user_id: user?.id || "",
          manual_description: useManual ? manualDesc : ""
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Analyze response:", data);

      if (data.task_id) {
        setAnalyzeStep("Senaryo hazırlanıyor...");
        setCredits(c => Math.max(0, c - 1));
        pollRef.current = setInterval(() => pollTask(data.task_id), 3000);
        setTimeout(() => {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setIsAnalyzing(false);
            setAnalyzeStep("");
            setError("Analiz zaman aşımına uğradı. Lütfen tekrar deneyin.");
          }
        }, 60000);
      } else if (data.scenarios) {
        // Senkron response — direkt göster
        setIsAnalyzing(false);
        setAnalyzeStep("");
        setScenarios(data.scenarios);
        setCredits(c => Math.max(0, c - 1));
      } else {
        throw new Error("Geçersiz response");
      }
    } catch (e: any) {
      console.error("Analyze error:", e);
      setIsAnalyzing(false);
      setAnalyzeStep("");
      setError(`Analiz başlatılamadı: ${e.message}`);
    }
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;
    setIsRendering(true);
    setVideos([]); setImages([]); setRenderedVideo(""); setRenderMessage(null);
    const sel = scenarios?.find(s => s.id === selectedId);
    try {
      const res = await fetch(`${API}/scenarios/${selectedId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: input, format,
          title: sel?.title || "",
          summary: sel?.summary || "",
          duration: sel?.duration || "0:45"
        })
      });
      const data = await res.json();
      setRenderMessage(data.message);
      if (data.videos?.length) setVideos(data.videos);
      if (data.images?.length) setImages(data.images);
      if (data.rendered_video) setRenderedVideo(data.rendered_video);
    } catch {
      setError("Video üretilemedi. Lütfen tekrar deneyin.");
    } finally { setIsRendering(false); }
  };

  const handleDownload = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
    } catch { alert("İndirme başarısız oldu."); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter,sans-serif", color: "#EC4899" }}>
      Yükleniyor...
    </div>
  );

  const tools = [
    { icon: "🎨", label: "AI Nesne Silici", desc: "Görselden istenmeyen nesne kaldır" },
    { icon: "✏️", label: "Yazı Değiştirici", desc: "Font yapısını koruyarak metin düzenle" },
    { icon: "💬", label: "Otomatik Altyazı", desc: "AI ile saniyeler içinde altyazı" },
    { icon: "🎵", label: "AI Seslendirme", desc: "Türkçe profesyonel ses üret" },
    { icon: "🎤", label: "Stüdyo Kalitesi", desc: "Amatör sesi profesyonele dönüştür" },
    { icon: "📤", label: "Sosyal Medya", desc: "Direkt paylaş" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "Inter,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: #CBD5E1; }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .media-item { transition: transform 0.15s; cursor: pointer; }
        .media-item:hover { transform: scale(1.03); }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 20px; height: 20px; border: 2px solid rgba(236,72,153,0.3); border-top-color: #EC4899; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <img src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: "12px", objectFit: "contain" }} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => handleDownload(lightbox, `gorsel-${Date.now()}.jpg`)} style={{ padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>⬇️ İndir</button>
              <button onClick={() => setLightbox(null)} style={{ padding: "10px 24px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", cursor: "pointer" }}>✕ Kapat</button>
            </div>
          </div>
        </div>
      )}

      <nav style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F1F5F9", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A" }}>laga<span style={{ color: "#EC4899" }}>luga</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "#FFF0F7", border: "1px solid rgba(236,72,153,0.2)", borderRadius: "100px", padding: "6px 16px", fontSize: "13px", color: "#EC4899", fontWeight: 700 }}>⚡ {credits} Kredi</div>
          <div style={{ fontSize: "13px", color: "#64748B" }}>{user.email}</div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>Çıkış</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 40px" }}>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Platform ve Format</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(FORMATS).map(([id, f]) => (
              <button key={id} onClick={() => setFormat(id)} style={{ padding: "10px 18px", borderRadius: "10px", border: `1.5px solid ${format === id ? "#EC4899" : "#E2E8F0"}`, background: format === id ? "#FFF0F7" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: format === id ? "#EC4899" : "#0F172A" }}>{f.label}</div>
                  <div style={{ fontSize: "10px", color: "#94A3B8" }}>{f.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>🔗 URL veya Konu Analizi</div>
          <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>İşletmenizin web sitesi linkini veya konu yazın. Yapay zeka siteyi analiz edip hizmetlerinizi tanıtan profesyonel video senaryoları oluşturur.</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyze()}
              placeholder="https://sirketiniz.com veya 'seyahat acentesi İstanbul turu'"
              style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A", background: "#fff" }}
            />
            <button
              onClick={() => handleAnalyze()}
              disabled={!input.trim() || isAnalyzing || credits <= 0}
              style={{ padding: "12px 24px", borderRadius: "10px", background: (!input.trim() || isAnalyzing || credits <= 0) ? "#E2E8F0" : "linear-gradient(135deg,#EC4899,#F97316)", color: (!input.trim() || isAnalyzing || credits <= 0) ? "#94A3B8" : "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: (!input.trim() || isAnalyzing || credits <= 0) ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
            >
              {isAnalyzing ? "Analiz ediliyor..." : credits <= 0 ? "Kredi bitti" : "Analiz Et →"}
            </button>
          </div>

          <div style={{ marginTop: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadedMedia({ url: URL.createObjectURL(file), type: file.type.startsWith("video") ? "video" : "image" });
            }} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: "8px 18px", borderRadius: "8px", border: "1.5px dashed #E2E8F0", background: "#FAFAFA", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>
              📁 Fotoğraf veya Video Yükle
            </button>
            {uploadedMedia && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {uploadedMedia.type === "image"
                  ? <img src={uploadedMedia.url} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }} />
                  : <video src={uploadedMedia.url} style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }} />}
                <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 600 }}>✓ Yüklendi</span>
                <button onClick={() => setUploadedMedia(null)} style={{ fontSize: "12px", color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              </div>
            )}
          </div>

          {error && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "#FFF1F2", color: "#E11D48", fontSize: "13px" }}>{error}</div>}
        </div>

        {scrapeFailed && (
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#C2410C", marginBottom: "8px" }}>⚠️ Site koruması aşılamadı</div>
            <div style={{ fontSize: "13px", color: "#92400E", marginBottom: "12px" }}>Bu site bot koruması kullanıyor. Lütfen işletmenizi kısaca açıklayın:</div>
            <textarea
              value={manualDesc}
              onChange={e => setManualDesc(e.target.value)}
              placeholder="Örn: Gaziantep'te seyahat acentesi, uçak bileti, otel rezervasyonu ve tur paketleri sunuyoruz..."
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #FED7AA", fontSize: "13px", color: "#0F172A", outline: "none", minHeight: "80px", resize: "vertical" }}
            />
            <button
              onClick={() => handleAnalyze(true)}
              disabled={!manualDesc.trim() || isAnalyzing}
              style={{ marginTop: "12px", padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}
            >
              Manuel Analiz Et →
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div className="spinner" />
              <div style={{ fontSize: "14px", color: "#64748B" }}>{analyzeStep}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "140px" }} />)}
            </div>
          </div>
        )}

        {scenarios && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>🎬 Video Senaryoları</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "12px" }}>
              {scenarios.map(s => (
                <button key={s.id} onClick={() => setSelectedId(s.id)} className="card" style={{ padding: "20px", borderRadius: "14px", border: `1.5px solid ${selectedId === s.id ? "#EC4899" : "#E2E8F0"}`, background: selectedId === s.id ? "#FFF0F7" : "#fff", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#EC4899", textTransform: "uppercase", letterSpacing: "1px" }}>{s.style}</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", background: "#F1F5F9", padding: "2px 8px", borderRadius: "100px" }}>⏱ {s.duration}</div>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>{s.title}</div>
                  <div style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.7 }}>{s.summary}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
              {renderMessage && <div style={{ fontSize: "13px", color: "#16A34A", background: "#F0FDF4", padding: "8px 14px", borderRadius: "8px", border: "1px solid #BBF7D0" }}>{renderMessage}</div>}
              <button onClick={handleRender} disabled={!selectedId || isRendering} style={{ padding: "12px 32px", borderRadius: "10px", background: (selectedId && !isRendering) ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: (selectedId && !isRendering) ? "#fff" : "#94A3B8", fontSize: "14px", fontWeight: 700, border: "none", cursor: (selectedId && !isRendering) ? "pointer" : "not-allowed" }}>
                {isRendering ? "⏳ Video hazırlanıyor..." : "🎬 Video Üret"}
              </button>
            </div>

            {renderedVideo && (
              <div style={{ marginTop: "24px", background: "#F0FDF4", borderRadius: "16px", padding: "24px", border: "1px solid #BBF7D0" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>✅ Hazırlanan Video</div>
                <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <video controls style={{ width: "320px", maxWidth: "100%", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }} src={renderedVideo} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px" }}>
                    <button onClick={() => handleDownload(renderedVideo, `lagaluga-${Date.now()}.mp4`)} style={{ padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>
                      ⬇️ Bilgisayara İndir
                    </button>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>MP4 formatında kaydedilir.</div>
                  </div>
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>🎥 Stok Videolar ({videos.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px" }}>
                  {videos.map((v, i) => (
                    <div key={i} className="card" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #F1F5F9", background: "#fff" }}>
                      <video controls style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }} src={v} />
                      <div style={{ padding: "8px" }}>
                        <button onClick={() => handleDownload(v, `stok-${i + 1}.mp4`)} style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "#FFF0F7", color: "#EC4899", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>⬇️ İndir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>🖼️ Stok Görseller ({images.length}) — tıklayarak büyütün</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "10px" }}>
                  {images.map((img, i) => (
                    <div key={i} className="media-item" onClick={() => setLightbox(img)} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #F1F5F9", height: "110px" }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>AI Sihirli Araçlar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
            {tools.map(t => (
              <div key={t.label} className="card" style={{ padding: "18px", borderRadius: "12px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "26px", marginBottom: "10px" }}>{t.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>{t.label}</div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "10px", lineHeight: 1.5 }}>{t.desc}</div>
                <div style={{ fontSize: "11px", color: "#EC4899", fontWeight: 600 }}>Yakında →</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
