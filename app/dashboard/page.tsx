// v4
"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { callApi, uploadFile } from "@/lib/api";

type Scenario = { id: string; title: string; summary: string; style: string; duration: string; };
type MediaFile = { url: string; type: "image" | "video"; name: string; file?: File; };

const FORMATS: Record<string, { label: string; icon: string; sub: string }> = {
  "9:16-reels":  { label: "Reels",   icon: "📱", sub: "1080×1920 · Instagram" },
  "9:16-tiktok": { label: "TikTok",  icon: "🎵", sub: "1080×1920 · TikTok" },
  "9:16-story":  { label: "Hikaye",  icon: "⭕", sub: "1080×1920 · Story" },
  "16:9":        { label: "YouTube", icon: "▶️", sub: "1920×1080 · YouTube" },
  "1:1":         { label: "Gönderi", icon: "⬛", sub: "1080×1080 · Kare" },
  "9:16-shorts": { label: "Shorts",  icon: "🩳", sub: "1080×1920 · Shorts" },
};

const TOOLS = [
  { key: "object-remove", icon: "🎨", label: "AI Nesne Silici", desc: "Görselden istenmeyen nesne kaldır", accept: "image/*", active: true },
  { key: "text-edit", icon: "✏️", label: "Yazı Değiştirici", desc: "Font yapısını koruyarak metin düzenle", accept: "image/*", active: true },
  { key: "bg-remove", icon: "🖼️", label: "Arkaplan Silici", desc: "Görselden arka planı otomatik kaldır", accept: "image/*", active: true },
  { key: "subtitle", icon: "💬", label: "Otomatik Altyazı", desc: "AI ile saniyeler içinde altyazı", accept: "video/*", active: true },
  { key: "voiceover", icon: "🎵", label: "AI Seslendirme", desc: "Türkçe profesyonel ses üret", accept: "", active: true },
  { key: "studio-audio", icon: "🎤", label: "Stüdyo Kalitesi", desc: "Amatör sesi profesyonele dönüştür", accept: "audio/*,video/*", active: true },
  { key: "social-export", icon: "📤", label: "Sosyal Medya", desc: "Tek videodan tüm platform formatlarını üret", accept: "image/*,video/*", active: true },
];

const MUSIC_TRACKS: { id: string; label: string; icon: string }[] = [
  { id: "none", label: "Yok", icon: "🔇" },
  { id: "energetic", label: "Enerjik Pop", icon: "🎉" },
  { id: "corporate", label: "Kurumsal", icon: "💼" },
  { id: "chill", label: "Sakin Lo-fi", icon: "☕" },
  { id: "cinematic", label: "Sinematik", icon: "🎬" },
];

const SUBTITLE_LANGS: { id: string; label: string }[] = [
  { id: "tr", label: "Türkçe" },
  { id: "en", label: "İngilizce" },
];

const VOICEOVER_VOICES: { id: string; label: string }[] = [
  { id: "tr-TR-EmelNeural", label: "Emel (Kadın)" },
  { id: "tr-TR-AhmetNeural", label: "Ahmet (Erkek)" },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(3);
  const [input, setInput] = useState("");
  const [format, setFormat] = useState("9:16-reels");
  const [addVoice, setAddVoice] = useState(false);
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
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolMedia, setToolMedia] = useState<MediaFile | null>(null);
  const [isProcessingTool, setIsProcessingTool] = useState(false);
  const [toolResult, setToolResult] = useState<string>("");
  const [toolResultUrl, setToolResultUrl] = useState<string>("");
  const [toolError, setToolError] = useState<string>("");
  const [toolResultsMap, setToolResultsMap] = useState<Record<string, string>>({});
  const [objectDesc, setObjectDesc] = useState("");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [subtitleLang, setSubtitleLang] = useState("tr");
  const [voiceoverScript, setVoiceoverScript] = useState("");
  const [voiceoverVoice, setVoiceoverVoice] = useState(VOICEOVER_VOICES[0].id);
  const [socialFormats, setSocialFormats] = useState<string[]>([]);
  const [bgMusic, setBgMusic] = useState("none");
  const [musicVolume, setMusicVolume] = useState(50);
  const [pageScreenshots, setPageScreenshots] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all"|"videos"|"images">("all");
  const [isSearching, setIsSearching] = useState(false);
  const [trendingVideos, setTrendingVideos] = useState<string[]>([]);
  const [trendingImages, setTrendingImages] = useState<string[]>([]);
  const [trendingLoaded, setTrendingLoaded] = useState(false);
  const [searchVideos, setSearchVideos] = useState<string[]>([]);
  const [searchImages, setSearchImages] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; url: string; created_at: string }[]>([]);
  const [editingScenario, setEditingScenario] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolFileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<any>(null);
  const renderPollRef = useRef<any>(null);
  const analyzeTimeoutRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
      supabase.from("profiles").select("credits").eq("id", session.user.id).single().then(({ data, error }) => {
        if (!error && data && typeof (data as any).credits !== "undefined") setCredits((data as any).credits);
      });
    });
  }, [router]);

  useEffect(() => {
    if (!user || trendingLoaded) return;
    setTrendingLoaded(true);
    callApi('/scenarios/trending')
      .then(d => { if (d) { setTrendingVideos(d.videos || []); setTrendingImages(d.images || []); } })
      .catch(() => {});
    // Geçmiş videoları yükle
    const supabase = getSupabase();
    (supabase as any).from("tasks")
      .select("id,input,result,created_at")
      .eq("user_id", user.id)
      .eq("type", "render")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }: any) => {
        if (data) {
          const vids = data
            .filter((t: any) => t.result?.rendered_video)
            .map((t: any) => ({
              id: t.id,
              title: t.input?.title || "Video",
              url: t.result.rendered_video,
              created_at: t.created_at,
            }));
          setHistory(vids);
        }
      });
  }, [user, trendingLoaded]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (renderPollRef.current) clearInterval(renderPollRef.current);
      if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) { setError("Tarayıcınız sesli komut desteklemiyor. Chrome kullanın."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const [renderTaskId, setRenderTaskId] = useState<string | null>(null);
  const pollErrorCountRef = useRef(0);

  const pollTask = useCallback(async (taskId: string) => {
    try {
      const data = await callApi(`/projects/task/${taskId}`);
      pollErrorCountRef.current = 0;
      if (data.status === "completed") {
        clearInterval(pollRef.current); pollRef.current = null;
        if (analyzeTimeoutRef.current) { clearTimeout(analyzeTimeoutRef.current); analyzeTimeoutRef.current = null; }
        setIsAnalyzing(false); setAnalyzeStep("");
        setScenarios(data.result?.scenarios || []);
        setPageScreenshots(data.result?.screenshots || []);
      } else if (data.status === "scrape_failed") {
        clearInterval(pollRef.current); pollRef.current = null;
        if (analyzeTimeoutRef.current) { clearTimeout(analyzeTimeoutRef.current); analyzeTimeoutRef.current = null; }
        setIsAnalyzing(false); setAnalyzeStep(""); setScrapeFailed(true);
      } else if (data.status === "failed") {
        clearInterval(pollRef.current); pollRef.current = null;
        if (analyzeTimeoutRef.current) { clearTimeout(analyzeTimeoutRef.current); analyzeTimeoutRef.current = null; }
        setIsAnalyzing(false); setAnalyzeStep("");
        setError("Analiz başarısız oldu.");
      }
    } catch {
      pollErrorCountRef.current += 1;
      if (pollErrorCountRef.current >= 5) {
        clearInterval(pollRef.current); pollRef.current = null;
        if (analyzeTimeoutRef.current) { clearTimeout(analyzeTimeoutRef.current); analyzeTimeoutRef.current = null; }
        setIsAnalyzing(false); setAnalyzeStep("");
        setError("Sunucuya ulaşılamıyor. Lütfen bağlantınızı kontrol edin.");
        pollErrorCountRef.current = 0;
      }
    }
  }, []);

  const pollRender = useCallback(async (taskId: string) => {
    try {
      const data = await callApi(`/projects/task/${taskId}`);
      const done = data.status === "completed" || data.status === "partial" || data.status === "failed";
      if (!done) return;
      clearInterval(renderPollRef.current); renderPollRef.current = null;
      setIsRendering(false); setRenderTaskId(null);
      if (data.status === "failed") { setError("Video üretilemedi. Lütfen tekrar deneyin."); return; }
      const result = data.result || {};
      setRenderMessage(result.message || "");
      if (result.videos?.length) setVideos(result.videos);
      if (result.images?.length) setImages(result.images);
      if (result.rendered_video) setRenderedVideo(result.rendered_video);
      if (data.status === "partial" && !result.rendered_video) setError("Video kısmen oluştu — stok görsel bulunamadı.");
    } catch (e) { console.error(e); }
  }, []);

  const handleAnalyze = async (useManual = false) => {
    if ((!input.trim() && !useManual) || isAnalyzing || credits <= 0) return;
    setIsAnalyzing(true); setAnalyzeStep("Analiz başlatılıyor...");
    setScenarios(null); setSelectedId(null); setError(null);
    setScrapeFailed(false); setVideos([]); setImages([]);
    setRenderedVideo(""); setRenderMessage(null); setPageScreenshots([]);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    // Kullanıcı "https://site.com tanıtım yap" gibi karışık metin girebilir
    // → URL'yi ayıkla, geri kalan metni yok say; format ipuçlarını otomatik algıla
    const urlMatch = input.match(/https?:\/\/[^\s),.;!?:]+/);
    const cleanUrl = urlMatch ? urlMatch[0] : input.trim();
    const isUrl = !!urlMatch;

    const FORMAT_HINTS: [string, string][] = [
      ["hikaye", "9:16-story"], ["story", "9:16-story"], ["durum", "9:16-story"], ["whatsapp", "9:16-story"],
      ["reels", "9:16-reels"], ["reel", "9:16-reels"], ["instagram", "9:16-reels"],
      ["tiktok", "9:16-tiktok"], ["tik tok", "9:16-tiktok"],
      ["shorts", "9:16-shorts"], ["youtube shorts", "9:16-shorts"],
      ["youtube", "16:9"], ["yatay", "16:9"], ["geniş", "16:9"],
      ["kare", "1:1"], ["gönderi", "1:1"], ["linkedin", "1:1"],
    ];
    const lowerInput = input.toLowerCase();
    for (const [hint, fmt] of FORMAT_HINTS) {
      if (lowerInput.includes(hint)) { setFormat(fmt); break; }
    }
    if (lowerInput.includes("seslendir") || lowerInput.includes("seslendirme") || lowerInput.includes("ses ekle") || lowerInput.includes("ses ver") || lowerInput.includes("voiceover")) {
      setAddVoice(true);
    }

    const urlToSend = isUrl ? cleanUrl : `topic:${cleanUrl}`;
    try {
      const data = await callApi('/projects/analyze', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToSend, format, user_id: user?.id || "", manual_description: useManual ? manualDesc : "" })
      });

      if (data.task_id) {
        setAnalyzeStep("Senaryo hazırlanıyor...");
        // Krediyi Supabase RPC ile güvenli şekilde düş, yoksa direkt update
        const supabase = getSupabase();
        if (user?.id) {
          const { error: rpcErr } = await (supabase as any).rpc("use_credit", { uid: user.id });
          if (rpcErr) {
            await (supabase as any).from("profiles").update({ credits: Math.max(0, credits - 1) }).eq("id", user.id);
          }
        }
        setCredits(c => Math.max(0, c - 1));
        pollRef.current = setInterval(() => pollTask(data.task_id), 3000);
        if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
        analyzeTimeoutRef.current = setTimeout(() => {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; setIsAnalyzing(false); setAnalyzeStep(""); setError("Sunucu yanıt vermedi. Lütfen tekrar deneyin."); }
          analyzeTimeoutRef.current = null;
        }, 180000);
      } else if (data.scenarios) {
        setIsAnalyzing(false); setAnalyzeStep("");
        setScenarios(data.scenarios); setCredits(c => Math.max(0, c - 1));
      } else throw new Error("Geçersiz yanıt");
    } catch (e: any) {
      setIsAnalyzing(false); setAnalyzeStep("");
      if (e.message?.includes("Kredi yetersiz") || e.message?.includes("402")) {
        setShowUpgradeModal(true);
      } else {
        setError(`Hata: ${e.message}`);
      }
    }
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;
    const sel = scenarios?.find(s => s.id === selectedId);
    if (!sel) { setError("Senaryo bulunamadı. Lütfen tekrar seçin."); return; }
    setIsRendering(true); setVideos([]); setImages([]); setRenderedVideo(""); setRenderMessage(null); setError(null);

    try {
      // Blob URL'leri olan dosyaları önce backend'e yükle
      const uploadedUrls: string[] = [];
      for (const m of mediaFiles) {
        if (m.file) {
          try { uploadedUrls.push(await uploadFile(m.file)); } catch {}
        } else if (m.url && !m.url.startsWith("blob:")) {
          uploadedUrls.push(m.url);
        }
      }

      const data = await callApi(`/scenarios/${selectedId}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input, format, title: sel?.title || "", summary: sel?.summary || "", duration: sel?.duration || "0:45", add_voice: addVoice, user_media: uploadedUrls, background_music: bgMusic === "none" ? "" : bgMusic, music_volume: musicVolume, screenshots: pageScreenshots, user_id: user?.id || "" })
      });

      // Hemen gelen stok video listesini göster
      if (data.videos?.length) setVideos(data.videos);
      if (data.images?.length) setImages(data.images);

      if (data.task_id) {
        // Async render — poll et
        setRenderTaskId(data.task_id);
        setRenderMessage("Video işleniyor, lütfen bekleyin...");
        renderPollRef.current = setInterval(() => pollRender(data.task_id), 4000);
        setTimeout(() => {
          if (renderPollRef.current) {
            clearInterval(renderPollRef.current); renderPollRef.current = null;
            setIsRendering(false); setRenderTaskId(null);
            setError("Video işleme zaman aşımına uğradı. Lütfen tekrar deneyin.");
          }
        }, 180000);
      } else {
        // Eski sync yanıt (fallback)
        setRenderMessage(data.message || "");
        if (data.rendered_video) setRenderedVideo(data.rendered_video);
        setIsRendering(false);
      }
    } catch (e: any) {
      setIsRendering(false);
      if (e.message?.includes("Kredi yetersiz") || e.message?.includes("402")) {
        setShowUpgradeModal(true);
      } else {
        setError(`Video üretilemedi: ${e.message}`);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMedia: MediaFile[] = files.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith("video") ? "video" : "image", name: f.name, file: f }));
    setMediaFiles(prev => [...prev, ...newMedia].slice(0, 20));
    e.target.value = "";
  };

  const handleToolFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setToolMedia({ url: URL.createObjectURL(f), type: f.type.startsWith("video") ? "video" : "image", name: f.name, file: f });
    e.target.value = "";
  };

  const openTool = (label: string) => {
    setActiveTool(label); setToolMedia(null); setToolResult(""); setToolResultUrl(""); setToolError(""); setToolResultsMap({});
    setObjectDesc(""); setOldText(""); setNewText(""); setSubtitleLang("tr");
    setVoiceoverScript(""); setVoiceoverVoice(VOICEOVER_VOICES[0].id); setSocialFormats([]);
  };

  const closeToolModal = () => {
    setActiveTool(null); setToolMedia(null); setToolResult(""); setToolResultUrl(""); setToolError(""); setToolResultsMap({});
  };

  const handleToolAction = async (tool: typeof TOOLS[number]) => {
    if (!toolMedia?.file && tool.accept !== "") {
      setToolError("Lütfen önce bir dosya yükleyin.");
      return;
    }
    setIsProcessingTool(true); setToolResult(""); setToolResultUrl(""); setToolError("");

    const form = new FormData();
    if (toolMedia?.file) form.append("file", toolMedia.file);

    switch (tool.key) {
      case "object-remove":
        form.append("description", objectDesc);
        break;
      case "text-edit":
        form.append("old_text", oldText);
        form.append("new_text", newText);
        break;
      case "subtitle":
        form.append("language", subtitleLang);
        break;
      case "voiceover":
        form.append("text", voiceoverScript);
        form.append("voice", voiceoverVoice);
        break;
      case "social-export":
        socialFormats.forEach(f => form.append("formats", f));
        break;
    }

    try {
      const data = await callApi(`/tools/${tool.key}`, { method: "POST", body: form });
      if (data.status === "completed") {
        setToolResult(data.message || "İşlem tamamlandı.");
        if (data.result_url) setToolResultUrl(data.result_url);
        if (data.results && Object.keys(data.results).length > 0) setToolResultsMap(data.results);
      } else {
        setToolError(data.message || "İşlem başarısız oldu. Lütfen tekrar deneyin.");
      }
    } catch (e: any) {
      console.error("Hata:", e);
      setToolError(e?.message || "İşlem sırasında hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsProcessingTool(false);
    }
  };

  const handleDownload = async (url: string, name: string) => {
    try {
      const res = await fetch(url); const blob = await res.blob();
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    } catch { setToolError("İndirme başarısız. Linki yeni sekmede açmayı deneyin."); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true); setSearchVideos([]); setSearchImages([]);
    try {
      const data = await callApi(`/scenarios/search?keyword=${encodeURIComponent(searchQuery)}&type=${searchType}&per_page=12`);
      setSearchVideos(data.videos || []);
      setSearchImages(data.images || []);
      if (!data.videos?.length && !data.images?.length) {
        setError("Arama sonucu bulunamadı. Farklı bir kelime veya İngilizce deneyin.");
        setTimeout(() => setError(null), 4000);
      }
    } catch (e: any) {
      setError(`Arama başarısız: ${e.message}`);
      setTimeout(() => setError(null), 4000);
    }
    finally { setIsSearching(false); }
  };

  const handleLogout = async () => { await getSupabase().auth.signOut(); router.push("/auth"); };

  if (!user) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter,sans-serif", color: "#EC4899" }}>Yükleniyor...</div>;

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
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        .mic-pulse { animation: pulse 1s infinite; }
        @keyframes progress-bar { 0%{width:5%;margin-left:0} 50%{width:60%;margin-left:20%} 100%{width:5%;margin-left:90%} }
      `}</style>

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <img src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: "12px", objectFit: "contain" }} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => handleDownload(lightbox, `gorsel-${Date.now()}.jpg`)} style={{ padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>⬇️ İndir</button>
              <button onClick={() => setLightbox(null)} style={{ padding: "10px 24px", borderRadius: "8px", background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", cursor: "pointer" }}>✕ Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* AI ARAÇ MODALI */}
      {activeTool && (() => {
        const tool = TOOLS.find(t => t.label === activeTool)!;
        const needsFile = tool.accept !== "";
        const canSubmit =
          tool.key === "object-remove" ? !!toolMedia && !!objectDesc.trim() :
          tool.key === "text-edit" ? !!toolMedia && !!oldText.trim() && !!newText.trim() :
          tool.key === "voiceover" ? !!voiceoverScript.trim() :
          tool.key === "social-export" ? !!toolMedia && socialFormats.length > 0 :
          !!toolMedia;

        return (
        <div onClick={closeToolModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px", padding: "32px", width: "600px", maxWidth: "95vw", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", marginBottom: "20px" }}>
              {tool.icon} {activeTool}
            </div>

            <input ref={toolFileRef} type="file" accept={tool.accept || "image/*,video/*"} onChange={handleToolFileUpload} style={{ display: "none" }} />

            {needsFile && (!toolMedia ? (
              <div onClick={() => toolFileRef.current?.click()} style={{ border: "2px dashed #E2E8F0", borderRadius: "16px", padding: "40px", textAlign: "center", cursor: "pointer", marginBottom: "16px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📁</div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#0F172A" }}>Dosya Yükle</div>
                <div style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>Fotoğraf veya video seçin</div>
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ borderRadius: "12px", overflow: "hidden", maxHeight: "400px", marginBottom: "12px", position: "relative" }}>
                  {toolMedia.type === "image"
                    ? <img src={toolMedia.url} alt="" style={{ width: "100%", maxHeight: "400px", objectFit: "contain", background: "#F8FAFC" }} />
                    : <video src={toolMedia.url} controls style={{ width: "100%", maxHeight: "400px" }} />}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => toolFileRef.current?.click()} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>Değiştir</button>
                  <button onClick={() => { setToolMedia(null); setToolResult(""); setToolResultUrl(""); setToolError(""); }} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#E11D48" }}>Kaldır</button>
                </div>
              </div>
            ))}

            {/* TOOL-SPECIFIC FIELDS */}
            {tool.key === "object-remove" && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "6px" }}>Kaldırılacak nesneyi tarif edin</div>
                <input value={objectDesc} onChange={e => setObjectDesc(e.target.value)} placeholder="Örn: sol üstteki logo, arka plandaki kişi..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A" }} />
              </div>
            )}

            {tool.key === "text-edit" && (
              <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "6px" }}>Eski metin</div>
                  <input value={oldText} onChange={e => setOldText(e.target.value)} placeholder="Görseldeki mevcut metin" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A" }} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "6px" }}>Yeni metin</div>
                  <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="Yerine gelecek metin" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A" }} />
                </div>
              </div>
            )}

            {tool.key === "subtitle" && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "6px" }}>Altyazı dili</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {SUBTITLE_LANGS.map(l => (
                    <button key={l.id} onClick={() => setSubtitleLang(l.id)} style={{ padding: "8px 18px", borderRadius: "8px", border: `1.5px solid ${subtitleLang === l.id ? "#EC4899" : "#E2E8F0"}`, background: subtitleLang === l.id ? "#FFF0F7" : "#fff", color: subtitleLang === l.id ? "#EC4899" : "#64748B", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>{l.label}</button>
                  ))}
                </div>
              </div>
            )}

            {tool.key === "voiceover" && (
              <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "6px" }}>Seslendirilecek metin</div>
                  <textarea value={voiceoverScript} onChange={e => setVoiceoverScript(e.target.value)} placeholder="Seslendirilmesini istediğiniz metni yazın..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A", minHeight: "90px", resize: "vertical" }} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "6px" }}>Ses</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {VOICEOVER_VOICES.map(v => (
                      <button key={v.id} onClick={() => setVoiceoverVoice(v.id)} style={{ padding: "8px 18px", borderRadius: "8px", border: `1.5px solid ${voiceoverVoice === v.id ? "#EC4899" : "#E2E8F0"}`, background: voiceoverVoice === v.id ? "#FFF0F7" : "#fff", color: voiceoverVoice === v.id ? "#EC4899" : "#64748B", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>{v.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tool.key === "social-export" && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "8px" }}>Aktarılacak formatları seçin</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {Object.entries(FORMATS).map(([id, f]) => {
                    const selected = socialFormats.includes(id);
                    return (
                      <button key={id} onClick={() => setSocialFormats(prev => selected ? prev.filter(x => x !== id) : [...prev, id])} style={{ padding: "8px 14px", borderRadius: "8px", border: `1.5px solid ${selected ? "#EC4899" : "#E2E8F0"}`, background: selected ? "#FFF0F7" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: selected ? "#EC4899" : "#64748B" }}>
                        <span>{f.icon}</span>{f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isProcessingTool && (toolResult || toolError) && (
              <button onClick={() => handleToolAction(tool)} disabled={!canSubmit} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: canSubmit ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: canSubmit ? "#fff" : "#94A3B8", border: "none", cursor: canSubmit ? "pointer" : "not-allowed", fontSize: "15px", fontWeight: 700, marginTop: "8px" }}>
                🔄 Tekrar Dene
              </button>
            )}

            {!toolResult && !toolError && (
              isProcessingTool ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "#F8FAFC", borderRadius: "10px" }}>
                  <div className="spinner" />
                  <span style={{ fontSize: "14px", color: "#64748B" }}>İşleniyor...</span>
                </div>
              ) : (
                <button onClick={() => handleToolAction(tool)} disabled={!canSubmit} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: canSubmit ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: canSubmit ? "#fff" : "#94A3B8", border: "none", cursor: canSubmit ? "pointer" : "not-allowed", fontSize: "15px", fontWeight: 700 }}>
                  ✨ {activeTool} Uygula
                </button>
              )
            )}

            {toolResult && (
              <div style={{ padding: "16px", background: "#F0FDF4", borderRadius: "10px", border: "1px solid #BBF7D0", marginTop: "12px" }}>
                <div style={{ fontSize: "14px", color: "#16A34A", fontWeight: 600, marginBottom: "10px" }}>✅ {toolResult}</div>
                {Object.keys(toolResultsMap).length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {Object.entries(toolResultsMap).map(([fmt, url]) => (
                      <button key={fmt} onClick={() => handleDownload(url, `${fmt.replace(/:/g,'-')}.${url.endsWith('.mp4') ? 'mp4' : 'jpg'}`)} style={{ padding: "8px 16px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>
                        ⬇️ {FORMATS[fmt]?.label || fmt}
                      </button>
                    ))}
                  </div>
                ) : (toolResultUrl || toolMedia) ? (
                  <button onClick={() => handleDownload(toolResultUrl || toolMedia!.url, `duzenlenmis-${Date.now()}.${toolMedia?.type === "video" ? "mp4" : "jpg"}`)} style={{ padding: "8px 20px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                    ⬇️ İndir
                  </button>
                ) : null}
              </div>
            )}

            {toolError && (
              <div style={{ padding: "16px", background: "#FFF1F2", borderRadius: "10px", border: "1px solid #FECDD3", marginTop: "12px" }}>
                <div style={{ fontSize: "14px", color: "#E11D48", fontWeight: 600 }}>❌ {toolError}</div>
              </div>
            )}

            <button onClick={closeToolModal} style={{ marginTop: "16px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>Kapat</button>
          </div>
        </div>
        );
      })()}

      <nav style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F1F5F9", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A" }}>laga<span style={{ color: "#EC4899" }}>luga</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "#FFF0F7", border: "1px solid rgba(236,72,153,0.2)", borderRadius: "100px", padding: "6px 16px", fontSize: "13px", color: "#EC4899", fontWeight: 700 }}>⚡ {credits} Kredi</div>
          {credits <= 0 && <button onClick={() => setShowUpgradeModal(true)} style={{ padding: "6px 14px", borderRadius: "100px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>🚀 Plan Yükselt</button>}
          <a href="/editor" style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>🎬 Video Editörü</a>
          <a href="/profile" style={{ fontSize: "13px", color: "#64748B", textDecoration: "none", padding: "8px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff" }}>👤 {user.email}</a>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>Çıkış</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 40px" }}>

        {/* FORMAT */}
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

        {/* ANALİZ */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>🔗 URL veya Konu Analizi</div>
          <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>Web sitesi linki veya konu yazın. Sesli komut için 🎤 butonuna basın.</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyze()}
              placeholder="https://sirketiniz.com veya 'Gaziantep seyahat acentesi uçak bileti otel'"
              style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A", background: "#fff" }}
            />
            <button onClick={startListening} className={isListening ? "mic-pulse" : ""} style={{ padding: "12px 14px", borderRadius: "10px", border: `1.5px solid ${isListening ? "#EC4899" : "#E2E8F0"}`, background: isListening ? "#FFF0F7" : "#fff", cursor: "pointer", fontSize: "18px" }} title="Sesli komut">🎤</button>
            <button onClick={() => handleAnalyze()} disabled={!input.trim() || isAnalyzing || credits <= 0} style={{ padding: "12px 20px", borderRadius: "10px", background: (!input.trim() || isAnalyzing || credits <= 0) ? "#E2E8F0" : "linear-gradient(135deg,#EC4899,#F97316)", color: (!input.trim() || isAnalyzing || credits <= 0) ? "#94A3B8" : "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: (!input.trim() || isAnalyzing || credits <= 0) ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
              {isAnalyzing ? "Analiz ediliyor..." : credits <= 0 ? "Kredi bitti" : "Analiz Et →"}
            </button>
          </div>

          {isListening && <div style={{ marginTop: "8px", fontSize: "13px", color: "#EC4899", fontWeight: 600 }}>🔴 Dinleniyor... Konuşun</div>}

          {/* AI Seslendirme checkbox */}
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" id="addVoice" checked={addVoice} onChange={e => setAddVoice(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#EC4899", cursor: "pointer" }} />
            <label htmlFor="addVoice" style={{ fontSize: "13px", color: "#64748B", cursor: "pointer", fontWeight: 500 }}>🔊 AI Seslendirme ekle (Türkçe, ücretsiz)</label>
          </div>

          {/* Arka Plan Müziği */}
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "8px" }}>🎵 Arka Plan Müziği</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {MUSIC_TRACKS.map(m => (
                <button key={m.id} onClick={() => setBgMusic(m.id)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1.5px solid ${bgMusic === m.id ? "#EC4899" : "#E2E8F0"}`, background: bgMusic === m.id ? "#FFF0F7" : "#fff", color: bgMusic === m.id ? "#EC4899" : "#64748B", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
            {bgMusic !== "none" && (
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>🔈</span>
                <input type="range" min={0} max={100} value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} style={{ flex: 1, accentColor: "#EC4899" }} />
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>🔊</span>
                <span style={{ fontSize: "12px", color: "#64748B", minWidth: "32px", textAlign: "right" }}>{musicVolume}%</span>
              </div>
            )}
          </div>

          {/* Medya yükleme */}
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "8px" }}>📁 Fotoğraf ve Video Yükle (en fazla 20 dosya)</div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: "8px 18px", borderRadius: "8px", border: "1.5px dashed #E2E8F0", background: "#FAFAFA", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>+ Dosya Ekle</button>
            {mediaFiles.length > 0 && (
              <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: "8px" }}>
                {mediaFiles.map((m, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", height: "70px" }}>
                    {m.type === "image" ? <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <video src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    <button onClick={() => setMediaFiles(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "11px" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "#FFF1F2", color: "#E11D48", fontSize: "13px" }}>{error}</div>}
        </div>

        {/* SCRAPE FAILED */}
        {scrapeFailed && (
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#C2410C", marginBottom: "8px" }}>⚠️ Site okunamadı</div>
            <div style={{ fontSize: "13px", color: "#92400E", marginBottom: "12px" }}>Lütfen işletmenizi kısaca açıklayın:</div>
            <textarea value={manualDesc} onChange={e => setManualDesc(e.target.value)} placeholder="Örn: Gaziantep'te seyahat acentesi, uçak bileti, otel rezervasyonu ve tur paketleri sunuyoruz..." style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #FED7AA", fontSize: "13px", color: "#0F172A", outline: "none", minHeight: "80px", resize: "vertical" }} />
            <button onClick={() => handleAnalyze(true)} disabled={!manualDesc.trim() || isAnalyzing} style={{ marginTop: "12px", padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Manuel Analiz Et →</button>
          </div>
        )}

        {/* LOADING */}
        {isAnalyzing && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div className="spinner" />
              <div style={{ fontSize: "14px", color: "#64748B" }}>{analyzeStep}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "140px" }} />)}
            </div>
          </div>
        )}

        {/* SENARYOLAR */}
        {scenarios && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>🎬 Video Senaryoları</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "12px" }}>
              {scenarios.map(s => (
                <div key={s.id} className="card" style={{ padding: "20px", borderRadius: "14px", border: `1.5px solid ${selectedId === s.id ? "#EC4899" : "#E2E8F0"}`, background: selectedId === s.id ? "#FFF0F7" : "#fff", cursor: "pointer", textAlign: "left" }} onClick={() => { setSelectedId(s.id); setEditingScenario(null); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#EC4899", textTransform: "uppercase", letterSpacing: "1px" }}>{s.style}</div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <div style={{ fontSize: "11px", color: "#94A3B8", background: "#F1F5F9", padding: "2px 8px", borderRadius: "100px" }}>⏱ {s.duration}</div>
                      <button onClick={e => { e.stopPropagation(); setEditingScenario(s.id); setEditTitle(s.title); setEditSummary(s.summary); setSelectedId(s.id); }} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: "#94A3B8", padding: "2px 6px", borderRadius: "6px" }} title="Düzenle">✏️</button>
                    </div>
                  </div>
                  {editingScenario === s.id ? (
                    <div onClick={e => e.stopPropagation()}>
                      <input value={editTitle} onChange={e => { setEditTitle(e.target.value); setScenarios(prev => prev!.map(x => x.id === s.id ? { ...x, title: e.target.value } : x)); }} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #EC4899", fontSize: "14px", fontWeight: 700, color: "#0F172A", outline: "none", marginBottom: "8px", boxSizing: "border-box" }} />
                      <textarea value={editSummary} onChange={e => { setEditSummary(e.target.value); setScenarios(prev => prev!.map(x => x.id === s.id ? { ...x, summary: e.target.value } : x)); }} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1.5px solid #EC4899", fontSize: "13px", color: "#64748B", outline: "none", minHeight: "80px", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }} />
                      <button onClick={e => { e.stopPropagation(); setEditingScenario(null); }} style={{ marginTop: "8px", padding: "6px 14px", borderRadius: "6px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>✓ Kaydet</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>{s.title}</div>
                      <div style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.7 }}>{s.summary}</div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {isRendering && (
                <div style={{ background: "#FFF8F0", border: "1px solid #FED7AA", borderRadius: "10px", padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div className="spinner" />
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#C2410C" }}>Video işleniyor...</span>
                  </div>
                  <div style={{ background: "#FEE2B0", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg,#F97316,#EC4899)", borderRadius: "4px", animation: "progress-bar 3s ease-in-out infinite" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "#92400E", marginTop: "6px" }}>Stok videolar indiriliyor, kliplere dönüştürülüyor. Bu işlem 1-3 dakika sürebilir.</div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
                {renderMessage && !isRendering && <div style={{ fontSize: "13px", color: "#16A34A", background: "#F0FDF4", padding: "8px 14px", borderRadius: "8px", border: "1px solid #BBF7D0" }}>{renderMessage}</div>}
                <button onClick={handleRender} disabled={!selectedId || isRendering} style={{ padding: "12px 32px", borderRadius: "10px", background: (selectedId && !isRendering) ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: (selectedId && !isRendering) ? "#fff" : "#94A3B8", fontSize: "14px", fontWeight: 700, border: "none", cursor: (selectedId && !isRendering) ? "pointer" : "not-allowed" }}>
                  {isRendering ? "⏳ İşleniyor..." : "🎬 Video Üret"}
                </button>
              </div>
            </div>

            {renderedVideo && (
              <div style={{ marginTop: "24px", background: "#F0FDF4", borderRadius: "16px", padding: "24px", border: "1px solid #BBF7D0" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>✅ Hazırlanan Video</div>
                <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <video controls style={{ width: "320px", maxWidth: "100%", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }} src={renderedVideo} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px", flex: 1, minWidth: "220px" }}>
                    <button onClick={() => handleDownload(renderedVideo, `lagaluga-${Date.now()}.mp4`)} style={{ padding: "12px 28px", borderRadius: "10px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>⬇️ Bilgisayara İndir</button>

                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", marginTop: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Paylaş</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <button onClick={() => { navigator.clipboard.writeText(renderedVideo); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }} style={{ padding: "9px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", background: linkCopied ? "#F0FDF4" : "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: linkCopied ? "#16A34A" : "#64748B" }}>{linkCopied ? "✅ Kopyalandı" : "🔗 Linki Kopyala"}</button>
                      <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Lagaluga ile oluşturduğum tanıtım videosu: " + renderedVideo)}`, "_blank")} style={{ padding: "9px 16px", borderRadius: "8px", border: "1.5px solid #25D366", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#25D366" }}>💬 WhatsApp</button>
                      <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(renderedVideo)}&text=${encodeURIComponent("Lagaluga AI ile oluşturduğum tanıtım videosu 🎬")}`, "_blank")} style={{ padding: "9px 16px", borderRadius: "8px", border: "1.5px solid #1DA1F2", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#1DA1F2" }}>𝕏 Twitter</button>
                      <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(renderedVideo)}`, "_blank")} style={{ padding: "9px 16px", borderRadius: "8px", border: "1.5px solid #0A66C2", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#0A66C2" }}>in LinkedIn</button>
                      <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(renderedVideo)}`, "_blank")} style={{ padding: "9px 16px", borderRadius: "8px", border: "1.5px solid #1877F2", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#1877F2" }}>f Facebook</button>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", lineHeight: 1.5 }}>Instagram ve TikTok için videoyu indirip uygulamadan yükleyin.</div>
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
                        <button onClick={() => handleDownload(v, `stok-${i+1}.mp4`)} style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "#FFF0F7", color: "#EC4899", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>⬇️ İndir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>🖼️ Stok Görseller ({images.length})</div>
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

        {/* ANA EKRAN GALERİSİ */}
        {(trendingVideos.length > 0 || trendingImages.length > 0) && (
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>🌟 Öne Çıkan Telifsiz İçerikler</div>
            {trendingVideos.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "10px" }}>🎥 Videolar</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "10px" }}>
                  {trendingVideos.slice(0,8).map((v, i) => (
                    <div key={i} className="card" style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #F1F5F9", background: "#fff" }}>
                      <video style={{ width: "100%", height: "110px", objectFit: "cover", display: "block" }} src={v} muted onMouseOver={e => (e.target as HTMLVideoElement).play()} onMouseOut={e => { const vid = e.target as HTMLVideoElement; vid.pause(); vid.currentTime = 0; }} />
                      <div style={{ padding: "6px" }}>
                        <button onClick={() => handleDownload(v, `video-${i+1}.mp4`)} style={{ width: "100%", padding: "5px", borderRadius: "6px", background: "#FFF0F7", color: "#EC4899", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>⬇️ İndir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {trendingImages.length > 0 && (
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "10px" }}>🖼️ Görseller</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: "8px" }}>
                  {trendingImages.slice(0,16).map((img, i) => (
                    <div key={i} className="media-item" onClick={() => setLightbox(img)} style={{ borderRadius: "8px", overflow: "hidden", height: "90px" }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GÖRSEL ARAMA MOTORU */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>🔍 Telifsiz İçerik Ara</div>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Kelime yazın: 'kahve', 'İstanbul', 'teknoloji'..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", color: "#0F172A" }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                {(["all","videos","images"] as const).map(t => (
                  <button key={t} onClick={() => setSearchType(t)} style={{ padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${searchType===t?"#EC4899":"#E2E8F0"}`, background: searchType===t?"#FFF0F7":"#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: searchType===t?"#EC4899":"#64748B" }}>
                    {t==="all"?"Tümü":t==="videos"?"🎥 Video":"🖼️ Görsel"}
                  </button>
                ))}
              </div>
              <button onClick={handleSearch} disabled={!searchQuery.trim()||isSearching} style={{ padding: "10px 20px", borderRadius: "10px", background: (searchQuery.trim()&&!isSearching)?"linear-gradient(135deg,#EC4899,#F97316)":"#E2E8F0", color: (searchQuery.trim()&&!isSearching)?"#fff":"#94A3B8", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>
                {isSearching ? <span className="spinner" /> : "Ara →"}
              </button>
            </div>

            {!isSearching && searchQuery && searchVideos.length === 0 && searchImages.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
                Kaynak: Pexels · Pixabay · Unsplash · Google Görseller — sonuç bulunamadı, İngilizce deneyin.
              </div>
            )}
            {(searchVideos.length > 0 || searchImages.length > 0) && (
              <div>
                {searchVideos.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "10px" }}>🎥 Videolar ({searchVideos.length})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "10px" }}>
                      {searchVideos.map((v, i) => (
                        <div key={i} className="card" style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #F1F5F9", background: "#fff" }}>
                          <video controls style={{ width: "100%", height: "110px", objectFit: "cover", display: "block" }} src={v} />
                          <div style={{ padding: "6px" }}>
                            <button onClick={() => handleDownload(v, `video-${i+1}.mp4`)} style={{ width: "100%", padding: "5px", borderRadius: "6px", background: "#FFF0F7", color: "#EC4899", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>⬇️ İndir</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchImages.length > 0 && (
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "10px" }}>🖼️ Görseller ({searchImages.length})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: "8px" }}>
                      {searchImages.map((img, i) => (
                        <div key={i} className="media-item" onClick={() => setLightbox(img)} style={{ borderRadius: "8px", overflow: "hidden", height: "90px" }}>
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GEÇMİŞ VİDEOLAR */}
        {history.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>📼 Geçmiş Videolarım</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px" }}>
              {history.map(v => (
                <div key={v.id} className="card" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #F1F5F9", background: "#fff" }}>
                  <video controls style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }} src={v.url} />
                  <div style={{ padding: "10px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#0F172A", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title || "Video"}</div>
                    <div style={{ fontSize: "10px", color: "#94A3B8", marginBottom: "6px" }}>{new Date(v.created_at).toLocaleDateString("tr-TR")}</div>
                    <button onClick={() => handleDownload(v.url, `lagaluga-${v.id.slice(0,8)}.mp4`)} style={{ width: "100%", padding: "6px", borderRadius: "6px", background: "#FFF0F7", color: "#EC4899", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>⬇️ İndir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI ARAÇLAR */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1.5px" }}>AI Sihirli Araçlar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
            {TOOLS.map(t => (
              <div key={t.label} onClick={() => t.active && openTool(t.label)} className="card" style={{ padding: "18px", borderRadius: "12px", border: `1px solid ${t.active ? "#E8F5E9" : "#F1F5F9"}`, background: t.active ? "#FAFFF9" : "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.03)", cursor: t.active ? "pointer" : "default" }}>
                <div style={{ fontSize: "26px", marginBottom: "10px" }}>{t.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>{t.label}</div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "10px", lineHeight: 1.5 }}>{t.desc}</div>
                <div style={{ fontSize: "11px", color: t.active ? "#16A34A" : "#94A3B8", fontWeight: 600 }}>{t.active ? "✓ Kullan →" : "Yakında →"}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div onClick={() => setShowUpgradeModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "24px", padding: "40px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚡</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>Krediniz Bitti</div>
              <div style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6 }}>Video üretmeye devam etmek için bir plan seçin.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <a
                href="https://www.shopier.com/lagaluga/aylik"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", padding: "20px", borderRadius: "16px", border: "2px solid #EC4899", background: "#FFF0F7", textDecoration: "none", cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>Aylık Plan</div>
                    <div style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>999 kredi · Tüm özellikler</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#EC4899" }}>₺300</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>/ay</div>
                  </div>
                </div>
              </a>
              <a
                href="https://www.shopier.com/lagaluga/yillik"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", padding: "20px", borderRadius: "16px", border: "2px solid #F97316", background: "#FFF7ED", textDecoration: "none", cursor: "pointer", position: "relative" }}
              >
                <div style={{ position: "absolute", top: "-10px", right: "16px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "100px" }}>EN AVANTAJLI</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>Yıllık Plan</div>
                    <div style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>999 kredi · Tüm özellikler · 2 ay ücretsiz</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#F97316" }}>₺2500</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>/yıl</div>
                  </div>
                </div>
              </a>
            </div>
            <button onClick={() => setShowUpgradeModal(false)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#64748B", fontWeight: 600 }}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}
