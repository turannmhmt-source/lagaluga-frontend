"use client";
import { useState } from "react";
import { useEditor } from "../EditorProvider";
import { TextLayer } from "../types";

const FONTS = ["Inter", "Arial", "Georgia", "Courier New", "Verdana", "Impact"];

export default function TextLayerPanel({ totalDuration }: { totalDuration: number }) {
  const { timeline, dispatch } = useEditor();
  const [selected, setSelected] = useState<string | null>(null);

  const addText = () => {
    const layer: TextLayer = {
      id: crypto.randomUUID(), text: "Metnini buraya yaz", fontFamily: "Inter",
      fontSize: 72, color: "#FFFFFF", bgColor: "transparent",
      x: 0.5, y: 0.5, startSec: 0, endSec: Math.min(5, totalDuration),
      bold: false, italic: false,
    };
    dispatch({ type: "ADD_TEXT_LAYER", layer });
    setSelected(layer.id);
  };

  const sel = timeline.textLayers.find(l => l.id === selected);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>📝 Metin Katmanları</span>
        <button onClick={addText} style={{ padding: "6px 12px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>+ Metin Ekle</button>
      </div>

      {timeline.textLayers.length === 0 && (
        <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "12px", padding: "16px" }}>Henüz metin yok</div>
      )}

      {timeline.textLayers.map(l => (
        <div key={l.id} onClick={() => setSelected(l.id === selected ? null : l.id)}
          style={{ padding: "10px", borderRadius: "8px", border: `1.5px solid ${selected === l.id ? "#EC4899" : "#E2E8F0"}`, background: selected === l.id ? "#FFF0F7" : "#F8FAFC", cursor: "pointer" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#0F172A", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{l.text}</div>
          <div style={{ fontSize: "11px", color: "#64748B" }}>{l.startSec.toFixed(1)}s – {l.endSec.toFixed(1)}s</div>
        </div>
      ))}

      {sel && (
        <div style={{ padding: "12px", borderRadius: "10px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Metin</label>
            <input value={sel.text} onChange={e => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { text: e.target.value } })}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "13px", marginTop: "4px", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Font</label>
              <select value={sel.fontFamily} onChange={e => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { fontFamily: e.target.value } })}
                style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "12px", marginTop: "4px" }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Boyut</label>
              <input type="number" value={sel.fontSize} min={20} max={200} onChange={e => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { fontSize: +e.target.value } })}
                style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "12px", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Yazı Rengi</label>
              <input type="color" value={sel.color} onChange={e => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { color: e.target.value } })}
                style={{ width: "100%", height: "32px", borderRadius: "6px", border: "1px solid #E2E8F0", marginTop: "4px", cursor: "pointer" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Arka Plan</label>
              <input type="color" value={sel.bgColor === "transparent" ? "#000000" : sel.bgColor} onChange={e => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { bgColor: e.target.value } })}
                style={{ width: "100%", height: "32px", borderRadius: "6px", border: "1px solid #E2E8F0", marginTop: "4px", cursor: "pointer" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Başlangıç (s)</label>
              <input type="number" value={sel.startSec} min={0} max={sel.endSec - 0.5} step={0.1} onChange={e => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { startSec: +e.target.value } })}
                style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "12px", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Bitiş (s)</label>
              <input type="number" value={sel.endSec} min={sel.startSec + 0.5} max={totalDuration} step={0.1} onChange={e => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { endSec: +e.target.value } })}
                style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "12px", marginTop: "4px", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[["Kalın", "bold"], ["İtalik", "italic"]].map(([label, key]) => (
              <button key={key} onClick={() => dispatch({ type: "UPDATE_TEXT_LAYER", id: sel.id, patch: { [key]: !sel[key as "bold" | "italic"] } })}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", background: sel[key as "bold" | "italic"] ? "#EC4899" : "#fff", color: sel[key as "bold" | "italic"] ? "#fff" : "#0F172A", cursor: "pointer", fontSize: "12px", fontWeight: key === "bold" ? 700 : 400 }}>
                {label}
              </button>
            ))}
            <button onClick={() => dispatch({ type: "REMOVE_TEXT_LAYER", id: sel.id })}
              style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: "6px", border: "1px solid #FCA5A5", background: "#FFF5F5", color: "#EF4444", cursor: "pointer", fontSize: "12px" }}>
              🗑 Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
