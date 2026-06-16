"use client";
import { useRef, useState } from "react";
import { useEditor } from "../EditorProvider";
import { Clip } from "../types";

const API = "https://lagaluga-backend-production.up.railway.app";

async function probeVideo(url: string): Promise<number> {
  try {
    const res = await fetch(`${API}/editor/probe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
    if (res.ok) { const d = await res.json(); return d.duration_sec ?? 10; }
  } catch {}
  return 10;
}

export default function Toolbar({ playheadSec, selectedClipId, onExport }: {
  playheadSec: number;
  selectedClipId: string | null;
  onExport: () => void;
}) {
  const { dispatch, computedClips } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/tools/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url = data.result_url;
      if (!url) throw new Error("No URL");
      const duration = await probeVideo(url);
      const clip: Clip = {
        id: crypto.randomUUID(), sourceUrl: url, sourceDurationSec: duration,
        trimStartSec: 0, trimEndSec: duration, orderIndex: 0,
        transitionIn: { type: "fade", durationMs: 500 },
      };
      dispatch({ type: "ADD_CLIP", clip });
    } catch (err) {
      alert("Yükleme başarısız: " + err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSplit = () => {
    const clip = computedClips.find(c => playheadSec >= c.timelineStartSec && playheadSec < c.timelineEndSec);
    if (!clip) return alert("Önce kesmek istediğiniz klibin üzerine playhead'i getirin.");
    dispatch({ type: "SPLIT_CLIP", id: clip.id, splitAtTimelineSec: playheadSec });
  };

  const handleDelete = () => {
    if (selectedClipId) dispatch({ type: "REMOVE_CLIP", id: selectedClipId });
  };

  const btnStyle = (accent = false, danger = false): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: "8px", border: danger ? "1px solid #FCA5A5" : "1px solid #E2E8F0",
    background: accent ? "linear-gradient(135deg,#EC4899,#F97316)" : danger ? "#FFF5F5" : "#fff",
    color: accent ? "#fff" : danger ? "#EF4444" : "#0F172A",
    cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "#fff", borderBottom: "1px solid #E2E8F0", flexWrap: "wrap" }}>
      <input ref={fileInputRef} type="file" accept="video/*,image/*" style={{ display: "none" }} onChange={handleFileUpload} />
      <button style={btnStyle()} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? "⏳ Yükleniyor..." : "📁 Klip Ekle"}
      </button>
      <button style={btnStyle()} onClick={handleSplit}>✂️ Böl</button>
      <button style={btnStyle(false, true)} onClick={handleDelete} disabled={!selectedClipId}>🗑 Sil</button>
      <div style={{ marginLeft: "auto" }}>
        <button style={btnStyle(true)} onClick={onExport}>🚀 Dışa Aktar</button>
      </div>
    </div>
  );
}
