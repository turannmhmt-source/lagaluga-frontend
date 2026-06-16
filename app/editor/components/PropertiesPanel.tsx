"use client";
import { useState } from "react";
import { useEditor } from "../EditorProvider";
import TextLayerPanel from "./TextLayerPanel";
import { Transition, TransitionType } from "../types";

const MUSIC_TRACKS = [
  { id: "none", label: "Yok", icon: "🔇" },
  { id: "energetic", label: "Enerjik Pop", icon: "🎉" },
  { id: "corporate", label: "Kurumsal", icon: "💼" },
  { id: "chill", label: "Sakin Lo-fi", icon: "☕" },
  { id: "cinematic", label: "Sinematik", icon: "🎬" },
];

const TRANSITIONS: { type: TransitionType; label: string; icon: string }[] = [
  { type: "none", label: "Yok", icon: "⬜" },
  { type: "fade", label: "Fade", icon: "🌫️" },
  { type: "slideleft", label: "Sola Kayma", icon: "◀" },
  { type: "slideright", label: "Sağa Kayma", icon: "▶" },
  { type: "zoomin", label: "Yakınlaştır", icon: "🔍" },
];

const FORMATS: { id: string; label: string; icon: string }[] = [
  { id: "9:16-reels", label: "Reels/TikTok", icon: "📱" },
  { id: "9:16-story", label: "Hikaye", icon: "⭕" },
  { id: "16:9", label: "YouTube", icon: "▶️" },
  { id: "1:1", label: "Kare", icon: "⬛" },
  { id: "9:16-shorts", label: "Shorts", icon: "🩳" },
];

export default function PropertiesPanel({ selectedClipId, totalDuration }: { selectedClipId: string | null; totalDuration: number }) {
  const { timeline, dispatch } = useEditor();
  const [tab, setTab] = useState<"clip" | "text" | "music" | "format">("clip");
  const selectedClip = timeline.clips.find(c => c.id === selectedClipId);

  const setTransition = (t: Transition) => {
    if (selectedClipId) dispatch({ type: "SET_TRANSITION", id: selectedClipId, transition: t });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff", borderLeft: "1px solid #E2E8F0" }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0" }}>
        {[["clip", "✂️ Klip"], ["text", "📝 Metin"], ["music", "🎵 Müzik"], ["format", "📐 Format"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            style={{ flex: 1, padding: "10px 4px", fontSize: "11px", fontWeight: 600, border: "none", background: tab === key ? "#FFF0F7" : "#fff", color: tab === key ? "#EC4899" : "#64748B", cursor: "pointer", borderBottom: tab === key ? "2px solid #EC4899" : "2px solid transparent" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {tab === "clip" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {!selectedClip && <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px", paddingTop: "32px" }}>Timeline'dan bir klip seçin</div>}
            {selectedClip && (
              <>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>✂️ Geçiş Efekti</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {TRANSITIONS.map(tr => (
                    <button key={tr.type} onClick={() => setTransition({ type: tr.type, durationMs: 500 })}
                      style={{ padding: "8px", borderRadius: "8px", border: `1.5px solid ${selectedClip.transitionIn.type === tr.type ? "#EC4899" : "#E2E8F0"}`, background: selectedClip.transitionIn.type === tr.type ? "#FFF0F7" : "#F8FAFC", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: selectedClip.transitionIn.type === tr.type ? "#EC4899" : "#0F172A" }}>
                      {tr.icon} {tr.label}
                    </button>
                  ))}
                </div>
                {selectedClip.transitionIn.type !== "none" && (
                  <div>
                    <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Süre: {selectedClip.transitionIn.durationMs}ms</label>
                    <input type="range" min={200} max={1500} step={100} value={selectedClip.transitionIn.durationMs}
                      onChange={e => setTransition({ ...selectedClip.transitionIn, durationMs: +e.target.value })}
                      style={{ width: "100%", accentColor: "#EC4899", marginTop: "6px" }} />
                  </div>
                )}
                <button onClick={() => dispatch({ type: "REMOVE_CLIP", id: selectedClip.id })}
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid #FCA5A5", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  🗑 Klibi Sil
                </button>
              </>
            )}
          </div>
        )}

        {tab === "text" && <TextLayerPanel totalDuration={totalDuration} />}

        {tab === "music" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>🎵 Arka Plan Müziği</div>
            {MUSIC_TRACKS.map(tr => (
              <button key={tr.id} onClick={() => dispatch({ type: "SET_MUSIC", musicId: tr.id })}
                style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${timeline.backgroundMusicId === tr.id ? "#EC4899" : "#E2E8F0"}`, background: timeline.backgroundMusicId === tr.id ? "#FFF0F7" : "#F8FAFC", cursor: "pointer", fontSize: "13px", fontWeight: 600, textAlign: "left", color: timeline.backgroundMusicId === tr.id ? "#EC4899" : "#0F172A" }}>
                {tr.icon} {tr.label}
              </button>
            ))}
            {timeline.backgroundMusicId !== "none" && (
              <div>
                <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Ses Seviyesi: %{timeline.musicVolumePercent}</label>
                <input type="range" min={10} max={100} value={timeline.musicVolumePercent}
                  onChange={e => dispatch({ type: "SET_MUSIC_VOLUME", volume: +e.target.value })}
                  style={{ width: "100%", accentColor: "#EC4899", marginTop: "6px" }} />
              </div>
            )}
          </div>
        )}

        {tab === "format" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>📐 Video Formatı</div>
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => dispatch({ type: "SET_FORMAT", format: f.id })}
                style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${timeline.format === f.id ? "#EC4899" : "#E2E8F0"}`, background: timeline.format === f.id ? "#FFF0F7" : "#F8FAFC", cursor: "pointer", fontSize: "13px", fontWeight: 600, textAlign: "left", color: timeline.format === f.id ? "#EC4899" : "#0F172A" }}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
