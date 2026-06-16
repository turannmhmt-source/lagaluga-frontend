"use client";
import { useRef, useCallback } from "react";
import { useEditor } from "../EditorProvider";
import { ComputedClip } from "../types";

const PX_PER_SEC = 80;

const CLIP_COLORS = ["#EC4899", "#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

export default function Timeline({ playheadSec, onPlayheadChange, selectedId, onSelect }: {
  playheadSec: number;
  onPlayheadChange: (s: number) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { computedClips, totalDurationSec, dispatch } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0) - 48;
    const t = Math.max(0, x / PX_PER_SEC);
    onPlayheadChange(Math.min(t, totalDurationSec));
    onSelect(null);
  }, [totalDurationSec, onPlayheadChange, onSelect]);

  const startTrimDrag = useCallback((clip: ComputedClip, side: "left" | "right", e: React.PointerEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const origStart = clip.trimStartSec;
    const origEnd = clip.trimEndSec;
    const onMove = (me: PointerEvent) => {
      const dx = (me.clientX - startX) / PX_PER_SEC;
      if (side === "left") {
        const newStart = Math.max(0, Math.min(origStart + dx, origEnd - 0.5));
        dispatch({ type: "TRIM_CLIP", id: clip.id, trimStartSec: newStart, trimEndSec: origEnd });
      } else {
        const newEnd = Math.max(origStart + 0.5, Math.min(origEnd + dx, clip.sourceDurationSec));
        dispatch({ type: "TRIM_CLIP", id: clip.id, trimStartSec: origStart, trimEndSec: newEnd });
      }
    };
    const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [dispatch]);

  const totalW = Math.max(totalDurationSec * PX_PER_SEC + 200, 600);
  const playheadX = 48 + playheadSec * PX_PER_SEC;

  return (
    <div style={{ background: "#1E293B", borderRadius: "12px", overflow: "hidden" }}>
      {/* Time ruler */}
      <div ref={containerRef} onClick={handleTrackClick} style={{ position: "relative", overflowX: "auto", cursor: "crosshair", minHeight: "120px" }}>
        <div style={{ width: totalW, position: "relative", paddingTop: "24px", paddingLeft: "48px", paddingBottom: "16px" }}>
          {/* Ruler marks */}
          {Array.from({ length: Math.ceil(totalDurationSec) + 5 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 48 + i * PX_PER_SEC, top: 0, height: "100%", borderLeft: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginLeft: "3px", position: "absolute", top: "4px" }}>{i}s</span>
            </div>
          ))}

          {/* Clips */}
          {computedClips.map((clip, idx) => {
            const clipW = (clip.trimEndSec - clip.trimStartSec) * PX_PER_SEC;
            const clipLeft = clip.timelineStartSec * PX_PER_SEC;
            const color = CLIP_COLORS[idx % CLIP_COLORS.length];
            const isSelected = selectedId === clip.id;
            return (
              <div key={clip.id} onClick={e => { e.stopPropagation(); onSelect(clip.id); }}
                style={{ position: "absolute", left: clipLeft, top: "24px", width: clipW, height: "64px", background: color, borderRadius: "6px", cursor: "pointer", border: isSelected ? "2px solid #fff" : "2px solid transparent", boxSizing: "border-box", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Left trim handle */}
                <div onPointerDown={e => startTrimDrag(clip, "left", e)}
                  style={{ position: "absolute", left: 0, top: 0, width: "8px", height: "100%", background: "rgba(0,0,0,0.4)", cursor: "ew-resize", borderRadius: "4px 0 0 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "2px", height: "20px", background: "#fff", borderRadius: "1px" }} />
                </div>
                <span style={{ fontSize: "11px", color: "#fff", fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", padding: "0 12px" }}>
                  Klip {idx + 1} · {(clip.trimEndSec - clip.trimStartSec).toFixed(1)}s
                </span>
                {/* Right trim handle */}
                <div onPointerDown={e => startTrimDrag(clip, "right", e)}
                  style={{ position: "absolute", right: 0, top: 0, width: "8px", height: "100%", background: "rgba(0,0,0,0.4)", cursor: "ew-resize", borderRadius: "0 4px 4px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "2px", height: "20px", background: "#fff", borderRadius: "1px" }} />
                </div>
              </div>
            );
          })}

          {/* Text layer indicators */}
          {useEditor.name && null /* workaround to call hook — text layers shown as thin bars */}

          {/* Playhead */}
          <div style={{ position: "absolute", left: playheadX, top: 0, width: "2px", height: "100%", background: "#EC4899", pointerEvents: "none", zIndex: 10 }}>
            <div style={{ width: "10px", height: "10px", background: "#EC4899", borderRadius: "50%", marginLeft: "-4px", marginTop: "-1px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
