// v2 - Professional Editor
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

// ─── Types ───────────────────────────────────────────────────────────────────
type Clip = { id: string; url: string; name: string; dur: number; trimStart: number; trimEnd: number; };
type TextEl = { id: string; text: string; x: number; y: number; fontSize: number; color: string; fontFamily: string; bold: boolean; italic: boolean; startSec: number; endSec: number; animation: string; };
type StickerEl = { id: string; emoji: string; x: number; y: number; size: number; startSec: number; endSec: number; };
type FilterEl = { name: string; css: string; };
type TransitionType = "none" | "fade" | "slide" | "zoom" | "wipe";
type ActiveTool = "clips" | "text" | "sticker" | "music" | "voice" | "subtitle" | "filter" | "transition" | "ai" | "export" | "background" | "stock";

const FILTERS: FilterEl[] = [
  { name: "Orijinal", css: "none" },
  { name: "Canlı", css: "saturate(1.5) contrast(1.1)" },
  { name: "Sinema", css: "sepia(0.3) contrast(1.2) brightness(0.9)" },
  { name: "Soğuk", css: "hue-rotate(180deg) saturate(0.8)" },
  { name: "Sıcak", css: "sepia(0.5) saturate(1.3)" },
  { name: "B&W", css: "grayscale(1)" },
  { name: "Fade", css: "brightness(1.1) saturate(0.7) contrast(0.9)" },
  { name: "Neon", css: "saturate(2) hue-rotate(30deg) contrast(1.3)" },
  { name: "Retro", css: "sepia(0.8) contrast(1.1) brightness(0.95)" },
];

const TRANSITIONS: { type: TransitionType; label: string; icon: string }[] = [
  { type: "none", label: "Yok", icon: "⬜" },
  { type: "fade", label: "Fade", icon: "🌫️" },
  { type: "slide", label: "Kayma", icon: "➡️" },
  { type: "zoom", label: "Zoom", icon: "🔍" },
  { type: "wipe", label: "Sil Süpür", icon: "🧹" },
];

const MUSIC_TRACKS = [
  { id: "none", label: "Yok", icon: "🔇" },
  { id: "energetic", label: "Enerjik Pop", icon: "🎉" },
  { id: "corporate", label: "Kurumsal", icon: "💼" },
  { id: "chill", label: "Sakin Lo-fi", icon: "☕" },
  { id: "cinematic", label: "Sinematik", icon: "🎬" },
];

const VOICES = [
  { id: "tr-TR-EmelNeural", label: "Emel (Kadın)" },
  { id: "tr-TR-AhmetNeural", label: "Ahmet (Erkek)" },
];

const TEXT_ANIMATIONS = ["Yok", "Belirme", "Yazılma", "Sola Kayma", "Yukarı Çık", "Zıplama"];
const FONTS = ["Inter", "Arial", "Georgia", "Impact", "Courier New", "Verdana", "Trebuchet MS"];
const STICKERS = ["😀","😍","🔥","💯","✨","🎉","👍","❤️","🚀","⭐","🎬","📱","💎","🎵","🌟","💪","🏆","👑","💡","🎯","📸","🎨","🌈","⚡","🦋","🌸","🎭","🎪","🏋️","🌺"];
const FORMATS = [
  { id: "9:16-reels", label: "Reels / TikTok", icon: "📱", size: "1080×1920" },
  { id: "9:16-story", label: "Hikaye", icon: "⭕", size: "1080×1920" },
  { id: "9:16-shorts", label: "YouTube Shorts", icon: "🩳", size: "1080×1920" },
  { id: "16:9", label: "YouTube / Geniş", icon: "▶️", size: "1920×1080" },
  { id: "1:1", label: "Kare Gönderi", icon: "⬛", size: "1080×1080" },
];

// ─── Left Sidebar Tools ───────────────────────────────────────────────────────
const TOOLS: { id: ActiveTool; icon: string; label: string }[] = [
  { id: "clips", icon: "🎬", label: "Klip" },
  { id: "stock", icon: "🗃️", label: "Stok Medya" },
  { id: "text", icon: "T", label: "Metin" },
  { id: "sticker", icon: "😀", label: "Stiker" },
  { id: "filter", icon: "🎨", label: "Filtre" },
  { id: "transition", icon: "✨", label: "Geçiş" },
  { id: "music", icon: "🎵", label: "Müzik" },
  { id: "voice", icon: "🎤", label: "Seslendirme" },
  { id: "subtitle", icon: "💬", label: "Altyazı" },
  { id: "background", icon: "🖼️", label: "Arka Plan Sil" },
  { id: "ai", icon: "🤖", label: "AI Araçlar" },
  { id: "export", icon: "📤", label: "Paylaş" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Editor() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Project state
  const [clips, setClips] = useState<Clip[]>([]);
  const [texts, setTexts] = useState<TextEl[]>([]);
  const [stickers, setStickers] = useState<StickerEl[]>([]);
  const [filter, setFilter] = useState<FilterEl>(FILTERS[0]);
  const [transition, setTransition] = useState<TransitionType>("fade");
  const [music, setMusic] = useState("none");
  const [musicVol, setMusicVol] = useState(50);
  const [format, setFormat] = useState("9:16-reels");
  const [projectName, setProjectName] = useState("Yeni Proje");

  // UI state
  const [activeTool, setActiveTool] = useState<ActiveTool>("clips");
  const [selectedClipIdx, setSelectedClipIdx] = useState<number | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Stock media state
  const [stockQuery, setStockQuery] = useState("");
  const [stockType, setStockType] = useState<"video" | "image">("video");
  const [stockResults, setStockResults] = useState<any[]>([]);
  const [stockLoading, setStockLoading] = useState(false);

  // Tool-specific state
  const [voiceText, setVoiceText] = useState("");
  const [voiceVoice, setVoiceVoice] = useState("tr-TR-EmelNeural");
  const [subtitleLang, setSubtitleLang] = useState("tr");
  const [aiPrompt, setAiPrompt] = useState("");
  const [bgRemoveUrl, setBgRemoveUrl] = useState("");
  const [toolResult, setToolResult] = useState("");
  const [toolError, setToolError] = useState("");
  const [toolLoading, setToolLoading] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState("");
  const [exportTaskId, setExportTaskId] = useState("");
  const exportPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const subtitleFileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      setUser(data.session.user);
    });
  }, [router]);

  const totalDur = clips.reduce((s, c) => s + (c.trimEnd - c.trimStart), 0);

  // ── Upload clip ──
  const uploadClip = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/tools/upload`, { method: "POST", body: form });
      const d = await res.json();
      if (!d.result_url) throw new Error("URL yok");
      const probe = await fetch(`${API}/editor/probe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: d.result_url }) });
      const pd = await probe.json();
      const dur = pd.duration_sec || 10;
      setClips(prev => [...prev, { id: crypto.randomUUID(), url: d.result_url, name: file.name, dur, trimStart: 0, trimEnd: dur }]);
    } catch (e) { alert("Yükleme hatası: " + e); }
    setUploading(false);
  };

  // ── Add text ──
  const addText = () => {
    const el: TextEl = { id: crypto.randomUUID(), text: "Metin", x: 50, y: 50, fontSize: 48, color: "#FFFFFF", fontFamily: "Inter", bold: true, italic: false, startSec: 0, endSec: Math.min(5, totalDur || 5), animation: "Belirme" };
    setTexts(prev => [...prev, el]);
    setSelectedTextId(el.id);
  };

  // ── Voiceover ──
  const runVoiceover = async () => {
    if (!voiceText.trim()) return;
    setToolLoading(true); setToolError(""); setToolResult("");
    try {
      const form = new FormData();
      form.append("text", voiceText);
      form.append("voice", voiceVoice);
      const res = await fetch(`${API}/tools/voiceover`, { method: "POST", body: form });
      const d = await res.json();
      if (d.status === "completed") setToolResult(d.result_url);
      else setToolError(d.message);
    } catch { setToolError("Hata oluştu."); }
    setToolLoading(false);
  };

  // ── Subtitle ──
  const runSubtitle = async (file: File) => {
    setToolLoading(true); setToolError(""); setToolResult("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("language", subtitleLang);
      const res = await fetch(`${API}/tools/subtitle`, { method: "POST", body: form });
      const d = await res.json();
      if (d.status === "completed") setToolResult(d.result_url);
      else setToolError(d.message);
    } catch { setToolError("Hata oluştu."); }
    setToolLoading(false);
  };

  // ── Background removal ──
  const runBgRemove = async (file: File) => {
    setToolLoading(true); setToolError(""); setToolResult("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("description", "arka planı kaldır");
      const res = await fetch(`${API}/tools/object-remove`, { method: "POST", body: form });
      const d = await res.json();
      if (d.status === "completed") setToolResult(d.result_url);
      else setToolError(d.message);
    } catch { setToolError("Hata oluştu."); }
    setToolLoading(false);
  };

  // ── Stock search ──
  const searchStock = async () => {
    if (!stockQuery.trim()) return;
    setStockLoading(true); setStockResults([]);
    try {
      const res = await fetch(`${API}/editor/stock-search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: stockQuery, type: stockType, per_page: 12 }) });
      const d = await res.json();
      setStockResults(d.results || []);
    } catch { setStockResults([]); }
    setStockLoading(false);
  };

  const addStockClip = async (item: any) => {
    setUploading(true);
    try {
      const probe = await fetch(`${API}/editor/probe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: item.url }) });
      const pd = await probe.json();
      const dur = pd.duration_sec || (item.type === "image" ? 5 : 10);
      setClips(prev => [...prev, { id: crypto.randomUUID(), url: item.url, name: item.source + " - " + stockQuery, dur, trimStart: 0, trimEnd: Math.min(dur, 15) }]);
    } catch {}
    setUploading(false);
  };

  // ── Export ──
  const startExport = async () => {
    if (clips.length === 0) { alert("Önce klip ekleyin."); return; }
    setExporting(true); setExportUrl("");
    try {
      const timeline = {
        id: crypto.randomUUID(),
        format,
        filterName: filter.name,
        clips: clips.map((c, i) => ({ id: c.id, sourceUrl: c.url, sourceDurationSec: c.dur, trimStartSec: c.trimStart, trimEndSec: c.trimEnd, orderIndex: i, transitionIn: { type: transition, durationMs: 500 } })),
        textLayers: texts.map(t => ({ id: t.id, text: t.text, fontFamily: t.fontFamily, fontSize: t.fontSize, color: t.color, bgColor: "transparent", x: t.x / 100, y: t.y / 100, startSec: t.startSec, endSec: t.endSec, bold: t.bold, italic: t.italic })),
        stickers: stickers.map(s => ({ id: s.id, emoji: s.emoji, x: s.x / 100, y: s.y / 100, size: s.size, startSec: s.startSec, endSec: s.endSec })),
        backgroundMusicId: music,
        musicVolumePercent: musicVol,
      };
      const res = await fetch(`${API}/editor/render`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ timeline, user_id: user?.id || "" }) });
      const d = await res.json();
      if (!d.task_id) { setExporting(false); alert(d.message || "Render başlatılamadı."); return; }
      setExportTaskId(d.task_id);
      exportPollRef.current = setInterval(async () => {
        const r = await fetch(`${API}/projects/task/${d.task_id}`);
        const rd = await r.json();
        if (rd.status === "completed") {
          clearInterval(exportPollRef.current!);
          setExporting(false);
          setExportUrl(rd.result?.rendered_video || "");
          setActiveTool("export");
        } else if (rd.status === "failed") {
          clearInterval(exportPollRef.current!);
          setExporting(false);
          alert("Render başarısız: " + rd.error);
        }
      }, 4000);
    } catch { setExporting(false); alert("Bağlantı hatası."); }
  };

  const selText = texts.find(t => t.id === selectedTextId);
  const selSticker = stickers.find(s => s.id === selectedStickerId);
  const selClip = selectedClipIdx !== null ? clips[selectedClipIdx] : null;

  const pinkGrad = "linear-gradient(135deg, #EC4899, #F97316)";
  const pink = "#EC4899";

  if (!user) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFF0F7", fontSize: "16px", color: pink, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 700 }}>Yükleniyor...</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Inter,system-ui,sans-serif", background: "#FFF5FB", color: "#0F172A", overflow: "hidden" }}>

      {/* ── TOP BAR ── */}
      <div style={{ height: "52px", background: "#fff", borderBottom: "1.5px solid #FCE7F3", display: "flex", alignItems: "center", padding: "0 16px", gap: "12px", flexShrink: 0, boxShadow: "0 1px 8px rgba(236,72,153,0.08)" }}>
        <a href="/dashboard" style={{ textDecoration: "none", fontSize: "20px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.5px" }}>laga<span style={{ color: pink }}>luga</span></a>
        <div style={{ width: "1px", height: "24px", background: "#FCE7F3" }} />
        <input value={projectName} onChange={e => setProjectName(e.target.value)} style={{ border: "none", outline: "none", fontSize: "14px", fontWeight: 600, color: "#0F172A", background: "transparent", minWidth: "120px", maxWidth: "200px" }} />
        <div style={{ flex: 1 }} />
        {/* Format selector */}
        <select value={format} onChange={e => setFormat(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", fontWeight: 600, color: "#0F172A", background: "#fff", cursor: "pointer" }}>
          {FORMATS.map(f => <option key={f.id} value={f.id}>{f.icon} {f.label}</option>)}
        </select>
        <a href="/dashboard" style={{ padding: "7px 14px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "13px", color: "#64748B", textDecoration: "none", fontWeight: 600 }}>← Dashboard</a>
        <button onClick={startExport} disabled={exporting || clips.length === 0}
          style={{ padding: "8px 20px", borderRadius: "10px", border: "none", background: clips.length === 0 ? "#E2E8F0" : pinkGrad, color: clips.length === 0 ? "#94A3B8" : "#fff", fontWeight: 700, fontSize: "14px", cursor: clips.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          {exporting ? "⏳ Render..." : "🚀 Dışa Aktar"}
        </button>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── LEFT SIDEBAR: Tool Icons ── */}
        <div style={{ width: "68px", flexShrink: 0, background: "#fff", borderRight: "1.5px solid #FCE7F3", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: "2px", overflowY: "auto" }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id)}
              style={{ width: "52px", padding: "8px 4px", borderRadius: "10px", border: "none", background: activeTool === t.id ? "#FFF0F7" : "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", transition: "background 0.15s" }}>
              <span style={{ fontSize: t.id === "text" ? "16px" : "20px", fontWeight: t.id === "text" ? 900 : 400, color: activeTool === t.id ? pink : "#475569", fontFamily: t.id === "text" ? "Impact,Arial" : "inherit" }}>{t.icon}</span>
              <span style={{ fontSize: "9px", color: activeTool === t.id ? pink : "#94A3B8", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── LEFT PANEL: Tool Options ── */}
        <div style={{ width: "240px", flexShrink: 0, background: "#fff", borderRight: "1.5px solid #FCE7F3", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #FCE7F3", fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
            {TOOLS.find(t => t.id === activeTool)?.icon} {TOOLS.find(t => t.id === activeTool)?.label}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {renderLeftPanel()}
          </div>
        </div>

        {/* ── CENTER: Preview ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFF5FB", gap: "12px", padding: "16px", overflow: "hidden" }}>
          {renderPreview()}

          {/* Play controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>{fmtTime(playheadSec)}</span>
            <button onClick={() => setPlayheadSec(0)} style={ctrlBtn()}>⏮</button>
            <button onClick={() => setPlaying(p => !p)} style={{ ...ctrlBtn(), background: pinkGrad, color: "#fff", border: "none", width: "40px", height: "40px", fontSize: "18px" }}>{playing ? "⏸" : "▶"}</button>
            <button onClick={() => setPlayheadSec(Math.min(totalDur, playheadSec + 5))} style={ctrlBtn()}>⏭</button>
            <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>{fmtTime(totalDur)}</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: Properties ── */}
        <div style={{ width: "240px", flexShrink: 0, background: "#fff", borderLeft: "1.5px solid #FCE7F3", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #FCE7F3", fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>⚙️ Özellikler</div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {renderRightPanel()}
          </div>
        </div>
      </div>

      {/* ── BOTTOM TIMELINE ── */}
      <div style={{ height: "140px", flexShrink: 0, background: "#fff", borderTop: "1.5px solid #FCE7F3" }}>
        {renderTimeline()}
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="video/*,image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadClip(f); e.target.value = ""; }} />
      <input ref={bgFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) runBgRemove(f); e.target.value = ""; }} />
      <input ref={subtitleFileRef} type="file" accept="video/*,audio/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) runSubtitle(f); e.target.value = ""; }} />

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #FFF5FB; }
        ::-webkit-scrollbar-thumb { background: #F9A8D4; border-radius: 2px; }
        @keyframes progress-bar { 0%{width:5%;margin-left:0} 50%{width:60%;margin-left:20%} 100%{width:5%;margin-left:90%} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  // ── Helpers ──────────────────────────────────────────────────────────────
  function fmtTime(s: number) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`; }
  function ctrlBtn(): React.CSSProperties { return { padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #FCE7F3", background: "#fff", cursor: "pointer", fontSize: "16px", color: "#0F172A" }; }
  function label(text: string): React.JSX.Element { return <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "5px", marginTop: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{text}</div>; }
  function toolBtn(onClick: () => void, children: React.ReactNode, accent = false, disabled = false): React.JSX.Element {
    return <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: "9px 14px", borderRadius: "10px", border: "none", background: disabled ? "#E2E8F0" : accent ? pinkGrad : "#FFF0F7", color: disabled ? "#94A3B8" : accent ? "#fff" : pink, fontWeight: 700, fontSize: "13px", cursor: disabled ? "not-allowed" : "pointer", marginBottom: "6px" }}>{children}</button>;
  }
  function resultBox(): React.JSX.Element | null {
    if (!toolResult && !toolError) return null;
    return <div style={{ marginTop: "10px", padding: "10px", borderRadius: "10px", background: toolError ? "#FFF5F5" : "#F0FFF4", border: `1px solid ${toolError ? "#FCA5A5" : "#86EFAC"}` }}>
      {toolError && <div style={{ fontSize: "12px", color: "#EF4444" }}>{toolError}</div>}
      {toolResult && <>
        <div style={{ fontSize: "11px", color: "#16A34A", fontWeight: 600, marginBottom: "6px" }}>✅ Tamamlandı</div>
        <a href={toolResult} download target="_blank" style={{ fontSize: "12px", color: "#EC4899", fontWeight: 700 }}>⬇️ İndir / Önizle</a>
      </>}
    </div>;
  }

  // ── Left Panel Content ────────────────────────────────────────────────────
  function renderLeftPanel() {
    switch (activeTool) {
      case "stock": return (
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            {(["video", "image"] as const).map(t => (
              <button key={t} onClick={() => setStockType(t)}
                style={{ flex: 1, padding: "6px", borderRadius: "8px", border: `1.5px solid ${stockType === t ? pink : "#FCE7F3"}`, background: stockType === t ? "#FFF0F7" : "#F8FAFC", color: stockType === t ? pink : "#64748B", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                {t === "video" ? "🎬 Video" : "🖼️ Görsel"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
            <input value={stockQuery} onChange={e => setStockQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchStock()} placeholder="Ara... (İngilizce)" style={{ flex: 1, padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", outline: "none", color: "#0F172A" }} />
            <button onClick={searchStock} disabled={stockLoading} style={{ padding: "7px 10px", borderRadius: "8px", border: "none", background: pinkGrad, color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>🔍</button>
          </div>
          {stockLoading && <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px", padding: "16px" }}>⏳ Aranıyor...</div>}
          {stockResults.length === 0 && !stockLoading && (
            <div style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center", paddingTop: "10px" }}>
              Pexels · Pixabay · Unsplash<br />milyonlarca ücretsiz medya
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {stockResults.map((item, i) => (
              <div key={i} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #FCE7F3", background: "#F8FAFC" }}>
                {item.thumb && <img src={item.thumb} alt="" style={{ width: "100%", height: "80px", objectFit: "cover", display: "block" }} />}
                <div style={{ padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600 }}>{item.source}{item.duration ? ` · ${item.duration}s` : ""}</span>
                  <button onClick={() => addStockClip(item)} disabled={uploading}
                    style={{ padding: "4px 8px", borderRadius: "6px", border: "none", background: pinkGrad, color: "#fff", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>
                    + Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      case "clips": return (
        <div>
          {toolBtn(() => fileInputRef.current?.click(), uploading ? "⏳ Yükleniyor..." : "📁 Klip / Fotoğraf Ekle", true, uploading)}
          {clips.length === 0 && <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px", paddingTop: "20px" }}>Henüz klip yok.<br />Yukarıdan ekleyin.</div>}
          {clips.map((c, i) => (
            <div key={c.id} onClick={() => { setSelectedClipIdx(i); setActiveTool("clips"); }}
              style={{ padding: "8px 10px", borderRadius: "8px", background: selectedClipIdx === i ? "#FFF0F7" : "#F8FAFC", border: `1.5px solid ${selectedClipIdx === i ? pink : "#F1F5F9"}`, marginBottom: "6px", cursor: "pointer" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🎬 {c.name}</div>
              <div style={{ fontSize: "11px", color: "#94A3B8" }}>{(c.trimEnd - c.trimStart).toFixed(1)}s</div>
            </div>
          ))}
        </div>
      );

      case "text": return (
        <div>
          {toolBtn(addText, "➕ Metin Ekle", true)}
          {texts.map(t => (
            <div key={t.id} onClick={() => setSelectedTextId(t.id)}
              style={{ padding: "8px 10px", borderRadius: "8px", background: selectedTextId === t.id ? "#FFF0F7" : "#F8FAFC", border: `1.5px solid ${selectedTextId === t.id ? pink : "#F1F5F9"}`, marginBottom: "6px", cursor: "pointer" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📝 {t.text}</div>
              <div style={{ fontSize: "11px", color: "#94A3B8" }}>{t.startSec.toFixed(1)}s – {t.endSec.toFixed(1)}s</div>
            </div>
          ))}
        </div>
      );

      case "sticker": return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "6px" }}>
            {STICKERS.map(emoji => (
              <button key={emoji} onClick={() => {
                const el: StickerEl = { id: crypto.randomUUID(), emoji, x: 50, y: 50, size: 60, startSec: 0, endSec: Math.min(5, totalDur || 5) };
                setStickers(prev => [...prev, el]);
                setSelectedStickerId(el.id);
                setActiveTool("sticker");
              }} style={{ fontSize: "24px", padding: "6px", borderRadius: "8px", border: "1px solid #F1F5F9", background: "#F8FAFC", cursor: "pointer" }}>{emoji}</button>
            ))}
          </div>
        </div>
      );

      case "filter": return (
        <div>
          {FILTERS.map(f => (
            <button key={f.name} onClick={() => setFilter(f)}
              style={{ width: "100%", padding: "10px 14px", marginBottom: "6px", borderRadius: "10px", border: `1.5px solid ${filter.name === f.name ? pink : "#F1F5F9"}`, background: filter.name === f.name ? "#FFF0F7" : "#F8FAFC", cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: 600, color: filter.name === f.name ? pink : "#0F172A" }}>
              🎨 {f.name}
            </button>
          ))}
        </div>
      );

      case "transition": return (
        <div>
          {TRANSITIONS.map(tr => (
            <button key={tr.type} onClick={() => setTransition(tr.type)}
              style={{ width: "100%", padding: "10px 14px", marginBottom: "6px", borderRadius: "10px", border: `1.5px solid ${transition === tr.type ? pink : "#F1F5F9"}`, background: transition === tr.type ? "#FFF0F7" : "#F8FAFC", cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: 600, color: transition === tr.type ? pink : "#0F172A" }}>
              {tr.icon} {tr.label}
            </button>
          ))}
        </div>
      );

      case "music": return (
        <div>
          {MUSIC_TRACKS.map(tr => (
            <button key={tr.id} onClick={() => setMusic(tr.id)}
              style={{ width: "100%", padding: "10px 14px", marginBottom: "6px", borderRadius: "10px", border: `1.5px solid ${music === tr.id ? pink : "#F1F5F9"}`, background: music === tr.id ? "#FFF0F7" : "#F8FAFC", cursor: "pointer", textAlign: "left", fontSize: "13px", fontWeight: 600, color: music === tr.id ? pink : "#0F172A" }}>
              {tr.icon} {tr.label}
            </button>
          ))}
          {music !== "none" && (
            <div style={{ marginTop: "10px" }}>
              {label("Ses Seviyesi")}
              <input type="range" min={10} max={100} value={musicVol} onChange={e => setMusicVol(+e.target.value)} style={{ width: "100%", accentColor: pink }} />
              <div style={{ fontSize: "12px", color: "#94A3B8", textAlign: "right" }}>%{musicVol}</div>
            </div>
          )}
        </div>
      );

      case "voice": return (
        <div>
          {label("Seslendirilecek Metin")}
          <textarea value={voiceText} onChange={e => setVoiceText(e.target.value)} rows={4} placeholder="Seslendirilecek metni yazın..." style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", resize: "vertical", outline: "none", color: "#0F172A" }} />
          {label("Ses")}
          <select value={voiceVoice} onChange={e => setVoiceVoice(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", marginBottom: "10px" }}>
            {VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          {toolBtn(runVoiceover, toolLoading ? "⏳ Oluşturuluyor..." : "🎤 Seslendir", true, toolLoading || !voiceText.trim())}
          {resultBox()}
        </div>
      );

      case "subtitle": return (
        <div>
          {label("Dil")}
          <select value={subtitleLang} onChange={e => setSubtitleLang(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", marginBottom: "10px" }}>
            <option value="tr">Türkçe</option>
            <option value="en">İngilizce</option>
            <option value="de">Almanca</option>
            <option value="fr">Fransızca</option>
          </select>
          {toolBtn(() => subtitleFileRef.current?.click(), toolLoading ? "⏳ İşleniyor..." : "💬 Video Seç & Altyazı Ekle", true, toolLoading)}
          {resultBox()}
        </div>
      );

      case "background": return (
        <div>
          <div style={{ padding: "10px", background: "#FFF0F7", borderRadius: "10px", fontSize: "12px", color: "#64748B", marginBottom: "10px" }}>
            AI ile görseldeki arka planı otomatik sil, şeffaf PNG elde et.
          </div>
          {toolBtn(() => bgFileInputRef.current?.click(), toolLoading ? "⏳ İşleniyor..." : "🖼️ Görsel Seç & Arka Plan Sil", true, toolLoading)}
          {resultBox()}
        </div>
      );

      case "ai": return (
        <div>
          <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "10px", lineHeight: 1.5 }}>AI ile video scripti oluştur, sonra Dashboard'dan tam video üret.</div>
          {label("Video Konusu / URL")}
          <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3} placeholder="Örn: https://sirketim.com veya 'Gaziantep seyahat acentesi'" style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", resize: "none", outline: "none", color: "#0F172A", marginBottom: "8px" }} />
          {toolBtn(() => { window.location.href = `/dashboard?q=${encodeURIComponent(aiPrompt)}`; }, "🤖 AI Video Oluştur →", true, !aiPrompt.trim())}
          <div style={{ marginTop: "12px", borderTop: "1px solid #FCE7F3", paddingTop: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "8px" }}>DİĞER AI ARAÇLAR</div>
            {toolBtn(() => setActiveTool("voice"), "🎤 AI Seslendirme")}
            {toolBtn(() => setActiveTool("subtitle"), "💬 Otomatik Altyazı")}
            {toolBtn(() => setActiveTool("background"), "🖼️ Arka Plan Silici")}
          </div>
        </div>
      );

      case "export": return (
        <div>
          {exportUrl ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#16A34A" }}>✅ Video Hazır!</div>
              <video src={exportUrl} controls style={{ width: "100%", borderRadius: "8px" }} />
              <a href={exportUrl} download style={{ display: "block", padding: "9px", borderRadius: "10px", background: pinkGrad, color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>⬇️ İndir</a>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {[["💬 WhatsApp", `https://wa.me/?text=${encodeURIComponent(exportUrl)}`], ["🐦 Twitter", `https://twitter.com/intent/tweet?url=${encodeURIComponent(exportUrl)}`], ["💼 LinkedIn", `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(exportUrl)}`]].map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" style={{ padding: "7px", borderRadius: "8px", border: "1px solid #FCE7F3", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#0F172A", textDecoration: "none" }}>{label}</a>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px", paddingTop: "20px" }}>
              Üst sağdaki <strong>"Dışa Aktar"</strong> butonuna basın.
            </div>
          )}
        </div>
      );

      default: return null;
    }
  }

  // ── Right Panel ──────────────────────────────────────────────────────────
  function renderRightPanel() {
    if (selText) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {label("Metin")}
        <input value={selText.text} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, text: e.target.value } : t))}
          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "13px", outline: "none", color: "#0F172A" }} />
        {label("Font")}
        <select value={selText.fontFamily} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, fontFamily: e.target.value } : t))}
          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px" }}>
          {FONTS.map(f => <option key={f}>{f}</option>)}
        </select>
        {label("Boyut")}
        <input type="range" min={16} max={150} value={selText.fontSize} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, fontSize: +e.target.value } : t))} style={{ width: "100%", accentColor: pink }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>{label("Renk")}<input type="color" value={selText.color} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, color: e.target.value } : t))} style={{ width: "100%", height: "36px", borderRadius: "8px", border: "1.5px solid #FCE7F3", cursor: "pointer" }} /></div>
          <div>
            {label("Animasyon")}
            <select value={selText.animation} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, animation: e.target.value } : t))} style={{ width: "100%", padding: "7px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "11px" }}>
              {TEXT_ANIMATIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[["Kalın", "bold"], ["İtalik", "italic"]].map(([lbl, key]) => (
            <button key={key} onClick={() => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, [key]: !t[key as "bold" | "italic"] } : t))}
              style={{ padding: "7px", borderRadius: "8px", border: `1.5px solid ${selText[key as "bold" | "italic"] ? pink : "#FCE7F3"}`, background: selText[key as "bold" | "italic"] ? "#FFF0F7" : "#fff", color: selText[key as "bold" | "italic"] ? pink : "#64748B", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              {lbl}
            </button>
          ))}
        </div>
        {label("Konum X %")}
        <input type="range" min={0} max={100} value={selText.x} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, x: +e.target.value } : t))} style={{ width: "100%", accentColor: pink }} />
        {label("Konum Y %")}
        <input type="range" min={0} max={100} value={selText.y} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, y: +e.target.value } : t))} style={{ width: "100%", accentColor: pink }} />
        {label("Başlangıç (s)")}
        <input type="number" value={selText.startSec} min={0} max={selText.endSec - 0.5} step={0.1} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, startSec: +e.target.value } : t))}
          style={{ width: "100%", padding: "7px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", outline: "none" }} />
        {label("Bitiş (s)")}
        <input type="number" value={selText.endSec} min={selText.startSec + 0.5} step={0.1} onChange={e => setTexts(prev => prev.map(t => t.id === selText.id ? { ...t, endSec: +e.target.value } : t))}
          style={{ width: "100%", padding: "7px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", outline: "none" }} />
        <button onClick={() => { setTexts(prev => prev.filter(t => t.id !== selText.id)); setSelectedTextId(null); }}
          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #FCA5A5", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: "12px", fontWeight: 700, marginTop: "6px" }}>
          🗑 Metni Sil
        </button>
      </div>
    );

    if (selClip) return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {label("Klip Adı")}
        <div style={{ fontSize: "12px", color: "#0F172A", fontWeight: 600, padding: "8px", background: "#F8FAFC", borderRadius: "8px" }}>{selClip.name}</div>
        {label("Trim Başlangıç (s)")}
        <input type="number" value={selClip.trimStart} min={0} max={selClip.trimEnd - 0.5} step={0.1} onChange={e => setClips(prev => prev.map((c, i) => i === selectedClipIdx ? { ...c, trimStart: +e.target.value } : c))}
          style={{ width: "100%", padding: "7px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", outline: "none" }} />
        {label("Trim Bitiş (s)")}
        <input type="number" value={selClip.trimEnd} min={selClip.trimStart + 0.5} max={selClip.dur} step={0.1} onChange={e => setClips(prev => prev.map((c, i) => i === selectedClipIdx ? { ...c, trimEnd: +e.target.value } : c))}
          style={{ width: "100%", padding: "7px", borderRadius: "8px", border: "1.5px solid #FCE7F3", fontSize: "12px", outline: "none" }} />
        <div style={{ fontSize: "12px", color: "#94A3B8" }}>Süre: {(selClip.trimEnd - selClip.trimStart).toFixed(1)}s</div>
        <button onClick={() => { setClips(prev => prev.filter((_, i) => i !== selectedClipIdx)); setSelectedClipIdx(null); }}
          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #FCA5A5", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
          🗑 Klibi Sil
        </button>
      </div>
    );

    if (selSticker) return (
      <div>
        <div style={{ fontSize: "40px", textAlign: "center", padding: "10px" }}>{selSticker.emoji}</div>
        {label("Boyut")}
        <input type="range" min={20} max={150} value={selSticker.size} onChange={e => setStickers(prev => prev.map(s => s.id === selSticker.id ? { ...s, size: +e.target.value } : s))} style={{ width: "100%", accentColor: pink }} />
        <button onClick={() => { setStickers(prev => prev.filter(s => s.id !== selSticker.id)); setSelectedStickerId(null); }}
          style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #FCA5A5", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: "12px", fontWeight: 700, marginTop: "8px" }}>
          🗑 Sil
        </button>
      </div>
    );

    return <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px", paddingTop: "24px" }}>Bir öğe seçin<br />özelliklerini düzenleyin.</div>;
  }

  // ── Preview ───────────────────────────────────────────────────────────────
  function renderPreview() {
    const aspect = format.startsWith("9:16") ? 9 / 16 : format === "16:9" ? 16 / 9 : 1;
    const h = 360, w = Math.round(h * aspect);
    const currentClip = clips.find((c, i) => {
      let s = clips.slice(0, i).reduce((acc, x) => acc + (x.trimEnd - x.trimStart), 0);
      return playheadSec >= s && playheadSec < s + (c.trimEnd - c.trimStart);
    });

    return (
      <div style={{ position: "relative", width: w, height: h, background: "#000", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 32px rgba(236,72,153,0.15)", flexShrink: 0 }}>
        {currentClip ? (
          <video key={currentClip.id} src={currentClip.url} style={{ width: "100%", height: "100%", objectFit: "contain", filter: filter.css !== "none" ? filter.css : undefined }} autoPlay={playing} muted={false} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#475569" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎬</div>
            <div style={{ fontSize: "12px" }}>Klip ekleyin</div>
          </div>
        )}
        {/* Text overlays */}
        {texts.filter(t => playheadSec >= t.startSec && playheadSec <= t.endSec).map(t => (
          <div key={t.id} onClick={() => { setSelectedTextId(t.id); setActiveTool("text"); }}
            style={{ position: "absolute", left: `${t.x}%`, top: `${t.y}%`, transform: "translate(-50%,-50%)", fontSize: `${t.fontSize * h / 1080}px`, color: t.color, fontFamily: t.fontFamily, fontWeight: t.bold ? 700 : 400, fontStyle: t.italic ? "italic" : "normal", cursor: "move", textShadow: "0 2px 8px rgba(0,0,0,0.7)", userSelect: "none", whiteSpace: "nowrap" }}>
            {t.text}
          </div>
        ))}
        {/* Stickers */}
        {stickers.filter(s => playheadSec >= s.startSec && playheadSec <= s.endSec).map(s => (
          <div key={s.id} onClick={() => { setSelectedStickerId(s.id); }}
            style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%,-50%)", fontSize: `${s.size * h / 1080}px`, cursor: "move", userSelect: "none" }}>
            {s.emoji}
          </div>
        ))}
        {/* Filter label */}
        {filter.name !== "Orijinal" && (
          <div style={{ position: "absolute", top: "8px", right: "8px", padding: "3px 8px", background: "rgba(236,72,153,0.85)", borderRadius: "100px", fontSize: "10px", color: "#fff", fontWeight: 700 }}>{filter.name}</div>
        )}
        {/* Render progress overlay */}
        {exporting && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(255,255,255,0.2)", borderTop: "3px solid #EC4899", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>Video render ediliyor...</div>
          </div>
        )}
      </div>
    );
  }

  // ── Timeline ──────────────────────────────────────────────────────────────
  function renderTimeline() {
    const PX = 80;
    const total = Math.max(totalDur, 10);
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "6px 16px 4px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #FCE7F3" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8" }}>TİMLİNE</span>
          <span style={{ fontSize: "11px", color: "#94A3B8" }}>Toplam: {fmtTime(totalDur)}</span>
        </div>
        <div style={{ flex: 1, overflowX: "auto", position: "relative", paddingLeft: "16px" }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
            setPlayheadSec(Math.min(total, Math.max(0, x / PX)));
          }}>
          <div style={{ width: Math.max(total * PX + 100, 400), position: "relative", height: "100%" }}>
            {/* Time marks */}
            {Array.from({ length: Math.ceil(total) + 2 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: i * PX, top: 0, bottom: 0, borderLeft: "1px solid #FCE7F3", pointerEvents: "none" }}>
                <span style={{ fontSize: "9px", color: "#CBD5E1", paddingLeft: "2px" }}>{i}s</span>
              </div>
            ))}
            {/* Clips track */}
            {(() => {
              let offset = 0;
              return clips.map((c, i) => {
                const dur = c.trimEnd - c.trimStart;
                const left = offset * PX;
                offset += dur;
                const colors = ["#EC4899", "#F97316", "#3B82F6", "#10B981", "#8B5CF6"];
                return (
                  <div key={c.id} onClick={e => { e.stopPropagation(); setSelectedClipIdx(i); setActiveTool("clips"); }}
                    style={{ position: "absolute", left, top: "20px", width: dur * PX - 2, height: "48px", background: colors[i % colors.length], borderRadius: "6px", cursor: "pointer", border: selectedClipIdx === i ? "2px solid #fff" : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <span style={{ fontSize: "11px", color: "#fff", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>🎬 {dur.toFixed(1)}s</span>
                  </div>
                );
              });
            })()}
            {/* Text track */}
            {texts.map(t => (
              <div key={t.id} onClick={e => { e.stopPropagation(); setSelectedTextId(t.id); setActiveTool("text"); }}
                style={{ position: "absolute", left: t.startSec * PX, top: "72px", width: Math.max(4, (t.endSec - t.startSec) * PX - 2), height: "16px", background: "rgba(236,72,153,0.7)", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", paddingLeft: "4px", overflow: "hidden" }}>
                <span style={{ fontSize: "9px", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>T: {t.text.slice(0, 10)}</span>
              </div>
            ))}
            {/* Playhead */}
            <div style={{ position: "absolute", left: playheadSec * PX, top: 0, width: "2px", height: "100%", background: pink, pointerEvents: "none", zIndex: 10 }}>
              <div style={{ width: "8px", height: "8px", background: pink, borderRadius: "50%", marginLeft: "-3px" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
