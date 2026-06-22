"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthClient() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit() {
    if (!mounted) return;
    setLoading(true);
    setMessage("");
    const supabase = getSupabase();
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) {
        if (error.message.includes("already registered")) setMessage("Bu e-posta zaten kayıtlı. Giriş yapın.");
        else if (error.message.includes("invalid")) setMessage("Geçersiz e-posta adresi.");
        else if (error.message.includes("password")) setMessage("Şifre en az 6 karakter olmalı.");
        else setMessage(error.message);
      } else setMessage("Aktivasyon maili gönderildi! E-postanızı kontrol edin.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login")) setMessage("E-posta veya şifre hatalı.");
        else if (error.message.includes("Email not confirmed")) setMessage("E-postanızı doğrulayın.");
        else setMessage(error.message);
      } else router.push("/dashboard");
    }
    setLoading(false);
  }

  if (!mounted) return null;

  const isSuccess = message.includes("Aktivasyon");

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#FFF0F7,#FFF7ED)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif", padding: "20px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "48px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(236,72,153,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A" }}>laga<span style={{ color: "#EC4899" }}>luga</span></div>
          <div style={{ fontSize: "14px", color: "#94A3B8", marginTop: "6px" }}>{mode === "login" ? "Hesabınıza giriş yapın" : "Ücretsiz hesap oluşturun"}</div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", borderRadius: "12px", background: "#F1F5F9", padding: "4px", marginBottom: "28px" }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setMessage(""); }} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, background: mode === m ? "#fff" : "transparent", color: mode === m ? "#EC4899" : "#64748B", boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
              {m === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Ad Soyad</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Adınız Soyadınız" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>E-posta</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="ornek@email.com" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Şifre</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="••••••••" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>

        {message && (
          <div style={{ padding: "12px", borderRadius: "10px", background: isSuccess ? "#F0FDF4" : "#FFF1F2", color: isSuccess ? "#16A34A" : "#E11D48", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>
            {message}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: "10px", background: "linear-gradient(135deg,#EC4899,#F97316)", color: "#fff", fontSize: "15px", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          {loading && <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
          {loading ? "Yükleniyor..." : (mode === "login" ? "Giriş Yap" : "Hesap Oluştur")}
        </button>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#94A3B8" }}>
          {mode === "login" ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }} style={{ color: "#EC4899", fontWeight: 600, cursor: "pointer" }}>
            {mode === "login" ? "Kayıt Ol" : "Giriş Yap"}
          </span>
        </div>
        {mode === "login" && (
          <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px" }}>
            <a href="/auth/reset" style={{ color: "#94A3B8", textDecoration: "none" }}>Şifremi Unuttum</a>
          </div>
        )}
      </div>
    </div>
  );
}
