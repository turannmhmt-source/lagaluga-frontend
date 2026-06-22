"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_accepted")) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => { localStorage.setItem("cookie_accepted", "1"); setVisible(false); };

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, background: "#0F172A", color: "#fff", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", boxShadow: "0 -4px 20px rgba(0,0,0,0.2)" }}>
      <p style={{ margin: 0, fontSize: "13px", color: "#CBD5E1", lineHeight: 1.6, flex: 1, minWidth: "200px" }}>
        🍪 Lagaluga, kullanıcı deneyimini iyileştirmek için çerez kullanır.{" "}
        <a href="/privacy" style={{ color: "#EC4899", textDecoration: "none", fontWeight: 600 }}>Gizlilik Politikası</a>
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={accept} style={{ padding: "9px 20px", borderRadius: "8px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>
          Kabul Et
        </button>
        <button onClick={() => setVisible(false)} style={{ padding: "9px 16px", borderRadius: "8px", background: "transparent", color: "#64748B", border: "1px solid #334155", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}>
          Kapat
        </button>
      </div>
    </div>
  );
}
