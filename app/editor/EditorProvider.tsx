"use client";
import { createContext, useContext, useReducer, useMemo, ReactNode } from "react";
import { EditorTimeline, EditorAction, Clip, ComputedClip } from "./types";

const initialTimeline: EditorTimeline = {
  id: crypto.randomUUID(),
  format: "9:16-reels",
  clips: [],
  textLayers: [],
  backgroundMusicId: "none",
  musicVolumePercent: 50,
};

function computeClips(clips: Clip[]): ComputedClip[] {
  let cursor = 0;
  return [...clips].sort((a, b) => a.orderIndex - b.orderIndex).map(c => {
    const duration = c.trimEndSec - c.trimStartSec;
    const start = cursor;
    cursor += duration;
    return { ...c, timelineStartSec: start, timelineEndSec: cursor };
  });
}

function reducer(state: EditorTimeline, action: EditorAction): EditorTimeline {
  switch (action.type) {
    case "ADD_CLIP":
      return { ...state, clips: [...state.clips, { ...action.clip, orderIndex: state.clips.length }] };
    case "REMOVE_CLIP":
      return { ...state, clips: state.clips.filter(c => c.id !== action.id).map((c, i) => ({ ...c, orderIndex: i })) };
    case "TRIM_CLIP":
      return { ...state, clips: state.clips.map(c => c.id === action.id ? { ...c, trimStartSec: action.trimStartSec, trimEndSec: action.trimEndSec } : c) };
    case "REORDER_CLIPS":
      return { ...state, clips: action.clips.map((c, i) => ({ ...c, orderIndex: i })) };
    case "SPLIT_CLIP": {
      const computed = computeClips(state.clips);
      const cc = computed.find(c => c.id === action.id);
      if (!cc) return state;
      const localSec = cc.trimStartSec + (action.splitAtTimelineSec - cc.timelineStartSec);
      if (localSec <= cc.trimStartSec + 0.1 || localSec >= cc.trimEndSec - 0.1) return state;
      const c1: Clip = { ...cc, id: crypto.randomUUID(), trimEndSec: localSec };
      const c2: Clip = { ...cc, id: crypto.randomUUID(), trimStartSec: localSec, transitionIn: { type: "none", durationMs: 0 } };
      const others = state.clips.filter(c => c.id !== action.id);
      const newClips = [...others.filter(c => c.orderIndex < cc.orderIndex), c1, c2, ...others.filter(c => c.orderIndex > cc.orderIndex)].map((c, i) => ({ ...c, orderIndex: i }));
      return { ...state, clips: newClips };
    }
    case "SET_TRANSITION":
      return { ...state, clips: state.clips.map(c => c.id === action.id ? { ...c, transitionIn: action.transition } : c) };
    case "ADD_TEXT_LAYER":
      return { ...state, textLayers: [...state.textLayers, action.layer] };
    case "UPDATE_TEXT_LAYER":
      return { ...state, textLayers: state.textLayers.map(l => l.id === action.id ? { ...l, ...action.patch } : l) };
    case "REMOVE_TEXT_LAYER":
      return { ...state, textLayers: state.textLayers.filter(l => l.id !== action.id) };
    case "SET_MUSIC":
      return { ...state, backgroundMusicId: action.musicId };
    case "SET_MUSIC_VOLUME":
      return { ...state, musicVolumePercent: action.volume };
    case "SET_FORMAT":
      return { ...state, format: action.format };
    default:
      return state;
  }
}

interface EditorContextValue {
  timeline: EditorTimeline;
  computedClips: ComputedClip[];
  totalDurationSec: number;
  dispatch: React.Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [timeline, dispatch] = useReducer(reducer, initialTimeline);
  const computedClips = useMemo(() => computeClips(timeline.clips), [timeline.clips]);
  const totalDurationSec = computedClips.length > 0 ? computedClips[computedClips.length - 1].timelineEndSec : 0;
  return <EditorContext.Provider value={{ timeline, computedClips, totalDurationSec, dispatch }}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
}
