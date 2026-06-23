"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    if (!email.trim()) return;
    setLoading(true); setError("");
    const supabase = getSupabase();
    const base = typeof window !== "undefined" ? window.location.origin : "https://lagaluga-frontend.vercel.app";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${base}/auth/update-password`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#FFF0F7,#FFF7ED)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif", padding: "20px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "48px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(236,72,153,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <a href="/" style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", textDecoration: "none" }}>laga<span style={{ color: "#EC4899" }}>luga</span></a>
          <div style={{ fontSize: "14px", color: "#94A3B8", marginTop: "8px" }}>Şifre Sıfırlama</div>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>E-posta Gönderildi!</div>
            <div style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6 }}>
              <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi. E-postanızı kontrol edin.
            </div>
            <a href="/auth" style={{ display: "block", marginTop: "24px", padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
              Giriş Sayfasına Dön
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>E-posta Adresiniz</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReset()}
                placeholder="ornek@email.com"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FFF1F2", color: "#E11D48", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={!email.trim() || loading}
              style={{ width: "100%", padding: "14px", borderRadius: "10px", background: email.trim() && !loading ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: email.trim() && !loading ? "#fff" : "#94A3B8", fontSize: "15px", fontWeight: 700, border: "none", cursor: email.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {loading && <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
              {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </button>

            <a href="/auth" style={{ display: "block", textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#EC4899", fontWeight: 600, textDecoration: "none" }}>
              ← Giriş Sayfasına Dön
            </a>
          </>
        )}
      </div>
    </div>
  );
}
