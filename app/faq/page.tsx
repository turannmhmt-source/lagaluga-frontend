"use client";
import { useState } from "react";

const FAQS = [
  { q: "Lagaluga nedir?", a: "Lagaluga, web sitenizin URL'sini analiz ederek otomatik olarak TikTok, Instagram Reels, YouTube Shorts ve diğer platformlar için video içerikleri üreten yapay zeka destekli bir platformdur." },
  { q: "Nasıl çalışır?", a: "1) Web sitenizin linkini yapıştırın veya konu yazın. 2) AI senaryo önerileri oluşturur. 3) Beğendiğiniz senaryoyu seçin ve Video Üret butonuna basın. 4) Videonuz birkaç dakika içinde hazır olur." },
  { q: "Ücretsiz planda kaç video üretebilirim?", a: "Ücretsiz hesaplarda 3 kredi verilir. Her video üretimi 1 kredi kullanır. Daha fazla video için Profesyonel (₺300/ay) veya Yıllık (₺2500/yıl) plana geçebilirsiniz." },
  { q: "Hangi platformlar destekleniyor?", a: "Instagram Reels (9:16), TikTok (9:16), Instagram Hikaye (9:16), YouTube Video (16:9), YouTube Shorts (9:16), Instagram/LinkedIn Gönderi (1:1) formatları desteklenmektedir." },
  { q: "AI Seslendirme nasıl çalışır?", a: "Microsoft Edge TTS altyapısını kullanan Lagaluga, Türkçe erkek (Ahmet) ve kadın (Emel) sesi seçenekleri sunar. Seslendirme, senaryonuza göre otomatik oluşturulur ve videoya eklenir." },
  { q: "AI araçlar ne işe yarar?", a: "Nesne Silici görseldeki istenmeyen nesneleri kaldırır. Yazı Değiştirici görseldeki metinleri düzenler. Arkaplan Silici arka planı şeffaf yapar. Otomatik Altyazı videoya AI ile altyazı ekler. Stüdyo Kalitesi ses kalitesini iyileştirir." },
  { q: "Videolarda kullanılan stok içerikler telif hakki sorununa yol açar mı?", a: "Hayır. Lagaluga yalnızca Pexels, Pixabay ve Unsplash gibi ücretsiz ve ticari kullanıma uygun platformlardan içerik kullanır. Bu içerikler Creative Commons veya benzer lisanslarla serbestçe kullanılabilir." },
  { q: "Verilerим güvende mi?", a: "Evet. Verileriniz Supabase altyapısında şifreli olarak saklanır. Kişisel bilgileriniz üçüncü taraflarla paylaşılmaz. Detaylı bilgi için Gizlilik Politikamızı inceleyebilirsiniz." },
  { q: "Mobil cihazdan kullanabilir miyim?", a: "Evet, Lagaluga tüm modern tarayıcılarda ve mobil cihazlarda çalışır. En iyi deneyim için Chrome veya Safari kullanmanızı öneririz." },
  { q: "Aboneliğimi nasıl iptal ederim?", a: "Profil sayfanızdan veya destek@lagaluga.com adresine e-posta göndererek aboneliğinizi iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar erişiminiz devam eder." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ fontFamily: "Inter,sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", textDecoration: "none" }}>laga<span style={{ color: "#EC4899" }}>luga</span></a>
        <a href="/" style={{ fontSize: "13px", color: "#64748B", textDecoration: "none" }}>← Ana Sayfa</a>
      </nav>
      <div style={{ maxWidth: "720px", margin: "40px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>Sık Sorulan Sorular</h1>
        <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "32px" }}>Aradığınız cevabı bulamadıysanız destek@lagaluga.com adresine yazabilirsiniz.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${open === i ? "#EC4899" : "#F1F5F9"}`, overflow: "hidden", transition: "border-color 0.2s" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>{faq.q}</span>
                <span style={{ fontSize: "18px", color: "#EC4899", flexShrink: 0 }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 18px", fontSize: "14px", color: "#64748B", lineHeight: 1.8 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <footer style={{ textAlign: "center", padding: "24px", fontSize: "12px", color: "#94A3B8", borderTop: "1px solid #F1F5F9", marginTop: "40px" }}>
        <a href="/privacy" style={{ color: "#EC4899", textDecoration: "none", marginRight: "16px" }}>Gizlilik Politikası</a>
        <a href="/terms" style={{ color: "#EC4899", textDecoration: "none", marginRight: "16px" }}>Kullanım Şartları</a>
        <a href="/auth" style={{ color: "#EC4899", textDecoration: "none" }}>Ücretsiz Başla</a>
      </footer>
    </div>
  );
}
