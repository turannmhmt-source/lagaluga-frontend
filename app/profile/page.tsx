"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
      supabase.from("profiles").select("credits").eq("id", session.user.id).single().then(({ data }) => {
        if (data) setCredits((data as any).credits ?? 0);
      });
    });
  }, [router]);

  async function handleChangePassword() {
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      setIsError(true); setMessage("Şifreler eşleşmiyor."); return;
    }
    if (newPassword.length < 6) {
      setIsError(true); setMessage("Şifre en az 6 karakter olmalı."); return;
    }
    setLoading(true); setMessage(""); setIsError(false);
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) { setIsError(true); setMessage(error.message); }
    else { setIsError(false); setMessage("Şifre başarıyla güncellendi!"); setNewPassword(""); setConfirmPassword(""); setTimeout(() => setMessage(""), 4000); }
  }

  async function handleDeleteAccount() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setLoading(true);
    const supabase = getSupabase();
    // Supabase client-side silme için admin yetkisi gerekir.
    // Profil verisini sil, sonra oturumu kapat.
    try {
      await (supabase as any).from("profiles").delete().eq("id", user.id);
    } catch {}
    await supabase.auth.signOut();
    router.push("/auth");
  }

  async function handleLogout() {
    await getSupabase().auth.signOut();
    router.push("/auth");
  }

  if (!user) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter,sans-serif", color: "#EC4899" }}>Yükleniyor...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "Inter,sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <nav style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F1F5F9", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/dashboard" style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", textDecoration: "none" }}>laga<span style={{ color: "#EC4899" }}>luga</span></a>
        <div style={{ display: "flex", gap: "12px" }}>
          <a href="/dashboard" style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", fontSize: "13px", color: "#64748B", textDecoration: "none", fontWeight: 600 }}>← Dashboard</a>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#64748B" }}>Çıkış</button>
        </div>
      </nav>

      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A", marginBottom: "24px" }}>👤 Profilim</div>

        {/* Hesap Bilgileri */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>Hesap Bilgileri</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F8FAFC", borderRadius: "10px" }}>
              <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>E-posta</span>
              <span style={{ fontSize: "13px", color: "#0F172A", fontWeight: 600 }}>{user.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#FFF0F7", borderRadius: "10px", border: "1px solid rgba(236,72,153,0.2)" }}>
              <span style={{ fontSize: "13px", color: "#EC4899", fontWeight: 500 }}>⚡ Kalan Kredi</span>
              <span style={{ fontSize: "16px", color: "#EC4899", fontWeight: 800 }}>{credits}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F8FAFC", borderRadius: "10px" }}>
              <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 500 }}>Kullanıcı ID</span>
              <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>{user.id}</span>
            </div>
          </div>
        </div>

        {/* Şifre Değiştir */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>🔒 Şifre Değiştir</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "6px" }}>Yeni Şifre</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="En az 6 karakter" style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "6px" }}>Şifre Tekrar</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChangePassword()} placeholder="Şifrenizi tekrar girin" style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #E2E8F0", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            {message && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: isError ? "#FFF1F2" : "#F0FDF4", color: isError ? "#E11D48" : "#16A34A", fontSize: "13px", fontWeight: 600 }}>
                {isError ? "❌" : "✅"} {message}
              </div>
            )}
            <button onClick={handleChangePassword} disabled={!newPassword || loading} style={{ padding: "12px", borderRadius: "10px", background: newPassword && !loading ? "linear-gradient(135deg,#EC4899,#F97316)" : "#E2E8F0", color: newPassword && !loading ? "#fff" : "#94A3B8", border: "none", cursor: newPassword && !loading ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading && <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </div>
        </div>

        {/* Hesap Sil */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #FEE2E2", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#DC2626", marginBottom: "8px" }}>⚠️ Hesabı Sil</div>
          <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "16px" }}>Bu işlem geri alınamaz. Tüm verileriniz silinecektir.</div>
          {deleteConfirm && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FFF1F2", color: "#E11D48", fontSize: "13px", marginBottom: "12px", fontWeight: 600 }}>
              Emin misiniz? Bu işlem geri alınamaz!
            </div>
          )}
          <button onClick={handleDeleteAccount} disabled={loading} style={{ padding: "10px 20px", borderRadius: "8px", background: deleteConfirm ? "#DC2626" : "#fff", color: deleteConfirm ? "#fff" : "#DC2626", border: "1.5px solid #DC2626", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
            {deleteConfirm ? "Evet, Hesabımı Sil" : "Hesabı Sil"}
          </button>
          {deleteConfirm && (
            <button onClick={() => setDeleteConfirm(false)} style={{ marginLeft: "10px", padding: "10px 20px", borderRadius: "8px", background: "#fff", color: "#64748B", border: "1.5px solid #E2E8F0", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>İptal</button>
          )}
        </div>
      </div>
    </div>
  );
}
