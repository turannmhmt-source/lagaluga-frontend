"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Supabase sends access_token in URL hash after redirect
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User is in password recovery mode - form is ready
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleUpdate() {
    if (!password.trim()) return;
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor."); return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı."); return;
    }
    setLoading(true); setError("");
    const supabase = getSupabase();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); }
    else { setSuccess(true); setTimeout(() => router.push("/dashboard"), 2000); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#FFF0F7,#FFF7ED)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif", padding: "20px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "48px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(236,72,153,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <a href="/" style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", textDecoration: "none" }}>laga<span style={{ color: "#EC4899" }}>luga</span></a>
          <div style={{ fontSize: "14px", color: "#94A3B8", marginTop: "8px" }}>Yeni Şifre Belirle</div>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>Şifre Güncellendi!</div>
            <div style={{ fontSize: "14px", color: "#64748B" }}>Dashboard'a yönlendiriliyorsunuz...</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Yeni Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Şifre Tekrar</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleUpdate()}
                  placeholder="Şifrenizi tekrar girin"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FFF1F2", color: "#E11D48", fontSize: "13px", fontWeight: 600 }}>
                  ❌ {error}
                </div>
              )}

              <button
                onClick={handleUpdate}
                disabled={!password.trim() || loading}
                style={{ width: "100%", padding: "14px", borderRadius: "10px", background: password.trim() && !loading ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: password.trim() && !loading ? "#fff" : "#94A3B8", fontSize: "15px", fontWeight: 700, border: "none", cursor: password.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading && <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </button>

              <a href="/auth" style={{ display: "block", textAlign: "center", marginTop: "8px", fontSize: "13px", color: "#EC4899", fontWeight: 600, textDecoration: "none" }}>
                ← Giriş Sayfasına Dön
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function UpdatePassword() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter,sans-serif", color: "#EC4899" }}>Yükleniyor...</div>}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
