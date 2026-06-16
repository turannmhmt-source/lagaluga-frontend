export type TransitionType = "none" | "fade" | "slideleft" | "slideright" | "zoomin";

export interface Transition {
  type: TransitionType;
  durationMs: number;
}

export interface Clip {
  id: string;
  sourceUrl: string;
  sourceDurationSec: number;
  trimStartSec: number;
  trimEndSec: number;
  orderIndex: number;
  transitionIn: Transition;
  thumbnail?: string;
}

export interface TextLayer {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bgColor: string;
  x: number;
  y: number;
  startSec: number;
  endSec: number;
  bold: boolean;
  italic: boolean;
}

export interface EditorTimeline {
  id: string;
  format: string;
  clips: Clip[];
  textLayers: TextLayer[];
  backgroundMusicId: string;
  musicVolumePercent: number;
}

export interface ComputedClip extends Clip {
  timelineStartSec: number;
  timelineEndSec: number;
}

export type EditorAction =
  | { type: "ADD_CLIP"; clip: Clip }
  | { type: "REMOVE_CLIP"; id: string }
  | { type: "TRIM_CLIP"; id: string; trimStartSec: number; trimEndSec: number }
  | { type: "REORDER_CLIPS"; clips: Clip[] }
  | { type: "SPLIT_CLIP"; id: string; splitAtTimelineSec: number }
  | { type: "SET_TRANSITION"; id: string; transition: Transition }
  | { type: "ADD_TEXT_LAYER"; layer: TextLayer }
  | { type: "UPDATE_TEXT_LAYER"; id: string; patch: Partial<TextLayer> }
  | { type: "REMOVE_TEXT_LAYER"; id: string }
  | { type: "SET_MUSIC"; musicId: string }
  | { type: "SET_MUSIC_VOLUME"; volume: number }
  | { type: "SET_FORMAT"; format: string };
