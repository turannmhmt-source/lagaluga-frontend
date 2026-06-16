// v1 - Video Editor
"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { EditorProvider } from "./EditorProvider";
import { useEditor } from "./EditorProvider";
import PreviewPlayer from "./components/PreviewPlayer";
import Timeline from "./components/Timeline";
import Toolbar from "./components/Toolbar";
import PropertiesPanel from "./components/PropertiesPanel";
import ExportModal from "./components/ExportModal";

const supabase = createClient(
  "https://ffbtiktwzrlzlndfnyzy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYnRpa3R3enJsemxuZGZueXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDUwMzgsImV4cCI6MjA5NjkyMTAzOH0.88tvA2bJF3pv3TaUwOMTkn4PFGHjZcI8otUGJhZm8pk"
);

function EditorInner({ userId }: { userId: string }) {
  const { totalDurationSec } = useEditor();
  const [playheadSec, setPlayheadSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0F172A", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", background: "#1E293B", borderBottom: "1px solid #334155", gap: "12px" }}>
        <a href="/dashboard" style={{ color: "#94A3B8", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>← Dashboard</a>
        <div style={{ flex: 1, textAlign: "center", color: "#F1F5F9", fontWeight: 700, fontSize: "15px" }}>🎬 Lagaluga Editör</div>
        <span style={{ fontSize: "12px", color: "#64748B" }}>Beta</span>
      </div>

      {/* Toolbar */}
      <div style={{ background: "#1E293B" }}>
        <Toolbar playheadSec={playheadSec} selectedClipId={selectedClipId} onExport={() => setShowExport(true)} />
      </div>

      {/* Main area: preview + properties */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Preview */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A", overflow: "auto" }}>
          <PreviewPlayer
            playheadSec={playheadSec}
            onPlayheadChange={setPlayheadSec}
            playing={playing}
            onPlayingChange={setPlaying}
          />
        </div>

        {/* Properties panel */}
        <div style={{ width: "280px", flexShrink: 0, overflow: "hidden" }}>
          <PropertiesPanel selectedClipId={selectedClipId} totalDuration={totalDurationSec} />
        </div>
      </div>

      {/* Timeline */}
      <div style={{ height: "160px", flexShrink: 0, padding: "8px 12px", background: "#0F172A" }}>
        <Timeline
          playheadSec={playheadSec}
          onPlayheadChange={sec => { setPlayheadSec(sec); setPlaying(false); }}
          selectedId={selectedClipId}
          onSelect={setSelectedClipId}
        />
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} userId={userId} />}

      <style>{`
        @keyframes progress-bar {
          0%{width:5%;margin-left:0}
          50%{width:60%;margin-left:20%}
          100%{width:5%;margin-left:90%}
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1E293B; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
      `}</style>
    </div>
  );
}

export default function EditorPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/auth"); return; }
      setUserId(data.session.user.id);
    });
  }, [router]);

  if (!userId) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A", color: "#94A3B8", fontSize: "16px" }}>
      Yükleniyor...
    </div>
  );

  return (
    <EditorProvider>
      <EditorInner userId={userId} />
    </EditorProvider>
  );
}
