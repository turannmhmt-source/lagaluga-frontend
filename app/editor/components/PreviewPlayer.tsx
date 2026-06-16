"use client";
import { useRef, useEffect, useCallback, useState } from "react";
import { useEditor } from "../EditorProvider";

const FORMAT_ASPECT: Record<string, number> = {
  "9:16-reels": 9 / 16, "9:16-tiktok": 9 / 16, "9:16-story": 9 / 16, "9:16-shorts": 9 / 16,
  "16:9": 16 / 9, "1:1": 1,
};

export default function PreviewPlayer({ playheadSec, onPlayheadChange, playing, onPlayingChange }: {
  playheadSec: number;
  onPlayheadChange: (s: number) => void;
  playing: boolean;
  onPlayingChange: (p: boolean) => void;
}) {
  const { timeline, computedClips, totalDurationSec } = useEditor();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);

  const aspect = FORMAT_ASPECT[timeline.format] ?? (9 / 16);
  const containerH = 480;
  const containerW = Math.round(containerH * aspect);

  const getActiveClip = useCallback((t: number) => {
    return computedClips.find(c => t >= c.timelineStartSec && t < c.timelineEndSec) ?? null;
  }, [computedClips]);

  const drawCanvas = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const layer of timeline.textLayers) {
      if (t < layer.startSec || t > layer.endSec) continue;
      ctx.save();
      const fs = layer.fontSize * (canvas.height / 1920);
      ctx.font = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${fs}px ${layer.fontFamily}`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (layer.bgColor && layer.bgColor !== "transparent") {
        const metrics = ctx.measureText(layer.text);
        const pad = fs * 0.3;
        ctx.fillStyle = layer.bgColor;
        ctx.fillRect(layer.x * canvas.width - metrics.width / 2 - pad, layer.y * canvas.height - fs / 2 - pad, metrics.width + pad * 2, fs + pad * 2);
        ctx.fillStyle = layer.color;
      }
      ctx.fillText(layer.text, layer.x * canvas.width, layer.y * canvas.height);
      ctx.restore();
    }
  }, [timeline.textLayers]);

  useEffect(() => {
    const clip = getActiveClip(playheadSec);
    const video = videoRef.current;
    if (!video) return;
    if (clip && clip.id !== activeClipId) {
      setActiveClipId(clip.id);
      video.src = clip.sourceUrl;
      video.load();
      video.currentTime = clip.trimStartSec + (playheadSec - clip.timelineStartSec);
    } else if (clip) {
      const expected = clip.trimStartSec + (playheadSec - clip.timelineStartSec);
      if (Math.abs(video.currentTime - expected) > 0.3) video.currentTime = expected;
    } else if (!clip) {
      video.pause();
    }
    drawCanvas(playheadSec);
  }, [playheadSec, getActiveClip, activeClipId, drawCanvas]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.play().catch(() => {});
      const tick = () => {
        const clip = getActiveClip(playheadSec);
        if (!clip) { onPlayingChange(false); return; }
        const newT = clip.timelineStartSec + (video.currentTime - clip.trimStartSec);
        if (newT >= clip.timelineEndSec) {
          const nextIdx = computedClips.findIndex(c => c.id === clip.id) + 1;
          if (nextIdx < computedClips.length) {
            const next = computedClips[nextIdx];
            video.src = next.sourceUrl;
            video.currentTime = next.trimStartSec;
            video.load();
            video.play().catch(() => {});
            onPlayheadChange(next.timelineStartSec);
          } else {
            onPlayingChange(false);
            onPlayheadChange(0);
          }
        } else {
          onPlayheadChange(newT);
        }
        drawCanvas(newT);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      video.pause();
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]); // eslint-disable-line

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "16px" }}>
      <div style={{ position: "relative", width: containerW, height: containerH, background: "#000", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "contain" }} playsInline muted={false} />
        <canvas ref={canvasRef} width={containerW} height={containerH} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        {computedClips.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎬</div>
            <div style={{ fontSize: "14px" }}>Klip eklemek için sol taraftaki düğmeyi kullanın</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12px", color: "#64748B", fontFamily: "monospace", minWidth: "40px" }}>{formatTime(playheadSec)}</span>
        <button onClick={() => onPlayheadChange(0)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "16px" }}>⏮</button>
        <button onClick={() => onPlayingChange(!playing)} style={{ padding: "8px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", cursor: "pointer", fontSize: "18px", fontWeight: 700 }}>
          {playing ? "⏸" : "▶"}
        </button>
        <button onClick={() => onPlayheadChange(Math.min(totalDurationSec, playheadSec + 5))} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "16px" }}>⏭</button>
        <span style={{ fontSize: "12px", color: "#64748B", fontFamily: "monospace", minWidth: "40px" }}>{formatTime(totalDurationSec)}</span>
      </div>
    </div>
  );
}
