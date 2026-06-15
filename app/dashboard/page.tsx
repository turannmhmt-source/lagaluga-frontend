"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ffbtiktwzrlzlndfnyzy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYnRpa3R3enJsemxuZGZueXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDUwMzgsImV4cCI6MjA5NjkyMTAzOH0.88tvA2bJF3pv3TaUwOMTkn4PFGHjZcI8otUGJhZm8pk"
);

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
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
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
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
    });
  }, [router]);

  const isUrl = (s: string) => s.startsWith("http://") || s.startsWith("https://");

  const handleAnalyze = async () => {
    if (!input.trim() || isAnalyzing || credits <= 0) return;
    setIsAnalyzing(true);
    setScenarios(null); setSelectedId(null); setError(null);
    setVideos([]); setImages([]); setRenderedVideo(""); setRenderMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: isUrl(input) ? input : `topic:${input}`, format })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScenarios(data.scenarios);
      setCredits(c => Math.max(0, c - 1));
    } catch {
      setError("Analiz sırasında hata oluştu. Lütfen tekrar deneyin.");
    } finally { setIsAnalyzing(false); }
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;
    setIsRendering(true);
    setVideos([]); setImages([]); setRenderedVideo(""); setRenderMessage(null);
    const sel = scenarios?.find(s => s.id === selectedId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scenarios/${selectedId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input, format, title: sel?.title || "", summary: sel?.summary || "", duration: sel?.duration || "0:45" })
      });
      const data = await res.json();
      setRenderMessage(data.message);
      if (data.videos?.length) setVideos(data.videos);
      if (data.images?.length) setImages(data.images);
      if (data.rendered_video) setRenderedVideo(data.rendered_video);
    } catch { setError("Video üretilemedi. Lütfen tekrar deneyin."); }
    finally { setIsRendering(false); }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video") ? "video" : "image";
    setUploadedMedia({ url, type });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter,sans-serif", color: "#EC4899", fontSize: "18px" }}>
      Yükleniyor...
    </div>
  );

  const tools = [
    { icon: "🎨", label: "AI Nesne Silici", desc: "Görselden istenmeyen nesne kaldır" },
    { icon: "✏️", label: "Yazı Değiştirici", desc: "Font yapısını koruyarak metin düzenle" },
    { icon: "💬", label: "Otomatik Altyazı", desc: "AI ile saniyeler içinde altyazı oluştur" },
    { icon: "🎵", label: "AI Seslendirme", desc: "Türkçe profesyonel ses üret" },
    { icon: "🎤", label: "Stüdyo Kalitesi", desc: "Amatör sesi profesyonele dönüştür" },
    { icon: "📤", label: "Sosyal Medya", desc: "Direkt paylaş" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "Inter,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #CBD5E1; }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .media-hover { transition: transform 0.15s; cursor: pointer; }
        .media-hover:hover { transform: scale(1.02); }
      `}</style>

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", maxWidth: "90vw" }}>
            <img src={lightbox} alt="" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "12px", objectFit: "contain" }} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => handleDownload(lightbox, `gorsel-${Date.now()}.jpg`)} style={{ padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>⬇️ İndir</button>
              <button onClick={() => setLightbox(null)} style={{ padding: "10px 24px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px" }}>✕ Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F1F5F9", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A" }}>laga<span style={{ color: "#EC4899" }}>luga</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "#FFF0F7", border: "1px solid rgba(236,72,153,0.2)", borderRadius: "100px", padding: "6px 16px", fontSize: "13px", color: "#EC4899", fontWeight: 700 }}>⚡ {credits} Kredi</div>
          <div style={{ fontSize: "13px", color: "#64748B" }}>{user.email}</div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>Çıkış</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 40px" }}>

        {/* FORMAT SEÇİMİ */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>Platform ve Format</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(FORMATS).map(([id, f]) => (
              <button key={id} onClick={() => setFormat(id)} style={{ padding: "10px 18px", borderRadius: "10px", border: `1.5px solid ${format === id ? "#EC4899" : "#E2E8F0"}`, background: format === id ? "#FFF0F7" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>{f.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: format === id ? "#EC4899" : "#0F172A" }}>{f.label}</div>
                  <div style={{ fontSize: "10px", color: "#94A3B8" }}>{f.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ANALİZ KUTUSU */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>🔗 URL veya Konu Analizi</div>
          <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>İşletmenizin web sitesi linkini veya konu yazın. Yapay zeka siteyi analiz edip hizmetlerinizi tanıtan profesyonel video senaryoları oluşturur.</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyze()}
              placeholder="https://sirketiniz.com veya 'İstanbul gezisi'"
              style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A", background: "#fff" }}
            />
            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing || credits <= 0}
              style={{ padding: "12px 24px", borderRadius: "10px", background: (input.trim() && !isAnalyzing && credits > 0) ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: (input.trim() && !isAnalyzing && credits > 0) ? "#fff" : "#94A3B8", fontSize: "14px", fontWeight: 700, border: "none", cursor: (input.trim() && !isAnalyzing && credits > 0) ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
            >
              {isAnalyzing ? "Analiz ediliyor..." : credits <= 0 ? "Kredi bitti" : "Analiz Et →"}
            </button>
          </div>

          {/* MEDYA YÜKLEME */}
          <div style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: "8px 18px", borderRadius: "8px", border: "1.5px dashed #E2E8F0", background: "#FAFAFA", cursor: "pointer", fontSize: "13px", color: "#64748B", fontWeight: 500 }}>
              📁 Fotoğraf veya Video Yükle
            </button>
            {uploadedMedia && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {uploadedMedia.type === "image"
                  ? <img src={uploadedMedia.url} alt="" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
                  : <video src={uploadedMedia.url} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />}
                <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 600 }}>✓ Yüklendi</span>
                <button onClick={() => setUploadedMedia(null)} style={{ fontSize: "12px", color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              </div>
            )}
          </div>

          {error && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "#FFF1F2", color: "#E11D48", fontSize: "13px" }}>{error}</div>}
        </div>

        {/* SENARYOLAR */}
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
              <button
                onClick={handleRender}
                disabled={!selectedId || isRendering}
                style={{ padding: "12px 32px", borderRadius: "10px", background: (selectedId && !isRendering) ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: (selectedId && !isRendering) ? "#fff" : "#94A3B8", fontSize: "14px", fontWeight: 700, border: "none", cursor: (selectedId && !isRendering) ? "pointer" : "not-allowed", boxShadow: (selectedId && !isRendering) ? "0 4px 15px rgba(236,72,153,0.3)" : "none" }}
              >
                {isRendering ? "⏳ Video hazırlanıyor..." : "🎬 Video Üret"}
              </button>
            </div>

            {/* HAZIRLANAN VİDEO */}
            {renderedVideo && (
              <div style={{ marginTop: "24px", background: "#F0FDF4", borderRadius: "16px", padding: "24px", border: "1px solid #BBF7D0" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>✅ Hazırlanan Video</div>
                <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <video controls style={{ width: "320px", maxWidth: "100%", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }} src={renderedVideo} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px" }}>
                    <button onClick={() => handleDownload(renderedVideo, `lagaluga-${Date.now()}.mp4`)} style={{ padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>
                      ⬇️ Bilgisayara İndir
                    </button>
                    <div style={{ fontSize: "12px", color: "#64748B", textAlign: "center" }}>MP4 formatında</div>
                  </div>
                </div>
              </div>
            )}

            {/* STOK VİDEOLAR */}
            {videos.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>🎥 Stok Videolar ({videos.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px" }}>
                  {videos.map((v, i) => (
                    <div key={i} className="card" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #F1F5F9", background: "#fff" }}>
                      <video controls style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} src={v} />
                      <div style={{ padding: "8px" }}>
                        <button onClick={() => handleDownload(v, `stok-${i + 1}.mp4`)} style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "#FFF0F7", color: "#EC4899", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>⬇️ İndir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STOK GÖRSELLER */}
            {images.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>🖼️ Stok Görseller ({images.length}) — tıklayarak büyütün</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "10px" }}>
                  {images.map((img, i) => (
                    <div key={i} className="media-hover" onClick={() => setLightbox(img)} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #F1F5F9", height: "120px" }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI ARAÇLAR */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>AI Sihirli Araçlar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
            {tools.map(t => (
              <div key={t.label} className="card" style={{ padding: "18px", borderRadius: "12px", border: "1px solid #F1F5F9", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.03)", cursor: "default" }}>
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
