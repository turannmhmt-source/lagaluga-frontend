"use client";
import { useState, useEffect, useRef } from "react";
import { useEditor } from "../EditorProvider";
import { callApi } from "@/lib/api";

export default function ExportModal({ onClose, userId }: { onClose: () => void; userId: string }) {
  const { timeline } = useEditor();
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "failed">("idle");
  const [resultUrl, setResultUrl] = useState("");
  const [message, setMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExport = async () => {
    if (timeline.clips.length === 0) { setMessage("Önce klip ekleyin."); return; }
    setStatus("pending");
    setMessage("Video oluşturuluyor...");
    try {
      const data = await callApi('/editor/render', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeline, user_id: userId }),
      });
      if (!data.task_id) { setStatus("failed"); setMessage(data.message || "Render başlatılamadı."); return; }
      pollRef.current = setInterval(async () => {
        try {
          const d = await callApi(`/projects/task/${data.task_id}`);
          if (d.status === "completed") {
            clearInterval(pollRef.current!);
            setStatus("done");
            setResultUrl(d.result?.rendered_video || "");
            setMessage("✅ Video hazır!");
          } else if (d.status === "failed") {
            clearInterval(pollRef.current!);
            setStatus("failed");
            setMessage(d.error || "Render başarısız.");
          }
        } catch {}
      }, 4000);
      setTimeout(() => { clearInterval(pollRef.current!); if (status === "pending") { setStatus("failed"); setMessage("Zaman aşımı."); } }, 300000);
    } catch (e) {
      setStatus("failed");
      setMessage("Bağlantı hatası.");
    }
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>🚀 Videoyu Dışa Aktar</h2>
        <div style={{ padding: "12px", background: "#F8FAFC", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", color: "#64748B" }}>
          <div>Format: <strong>{timeline.format}</strong></div>
          <div>Klip sayısı: <strong>{timeline.clips.length}</strong></div>
          <div>Metin katmanı: <strong>{timeline.textLayers.length}</strong></div>
          <div>Müzik: <strong>{timeline.backgroundMusicId === "none" ? "Yok" : timeline.backgroundMusicId}</strong></div>
        </div>

        {status === "idle" && (
          <button onClick={startExport} style={{ width: "100%", padding: "14px", borderRadius: "10px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700 }}>
            🎬 Render Başlat
          </button>
        )}

        {status === "pending" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            <div style={{ fontSize: "14px", color: "#64748B" }}>Video oluşturuluyor... (2-5 dk)</div>
            <div style={{ marginTop: "16px", height: "4px", background: "#E2E8F0", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#EC4899,#F97316)", width: "60%", animation: "progress-bar 2s ease-in-out infinite", borderRadius: "2px" }} />
            </div>
          </div>
        )}

        {status === "done" && resultUrl && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <video src={resultUrl} controls style={{ width: "100%", borderRadius: "8px", maxHeight: "200px" }} />
            <a href={resultUrl} download="lagaluga-export.mp4" style={{ display: "block", padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg,#10B981,#3B82F6)", color: "#fff", textDecoration: "none", textAlign: "center", fontWeight: 700 }}>
              ⬇️ İndir
            </a>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["WhatsApp", "https://wa.me/?text=", "🟢"], ["Twitter", "https://twitter.com/intent/tweet?url=", "🐦"]].map(([name, url, icon]) => (
                <a key={name} href={`${url}${encodeURIComponent(resultUrl)}`} target="_blank" rel="noreferrer"
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #E2E8F0", textAlign: "center", textDecoration: "none", fontSize: "12px", color: "#0F172A", fontWeight: 600 }}>
                  {icon} {name}
                </a>
              ))}
            </div>
          </div>
        )}

        {status === "failed" && (
          <div>
            <div style={{ padding: "12px", background: "#FFF5F5", borderRadius: "8px", color: "#EF4444", fontSize: "13px", marginBottom: "12px" }}>{message}</div>
            <button onClick={() => setStatus("idle")} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px" }}>Tekrar Dene</button>
          </div>
        )}

        {message && status !== "failed" && <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748B", textAlign: "center" }}>{message}</div>}

        <button onClick={onClose} style={{ marginTop: "16px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>
          Kapat
        </button>
      </div>
    </div>
  );
}
