export default function Privacy() {
  return (
    <div style={{ fontFamily: "Inter,sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", textDecoration: "none" }}>laga<span style={{ color: "#EC4899" }}>luga</span></a>
        <a href="/" style={{ fontSize: "13px", color: "#64748B", textDecoration: "none" }}>← Ana Sayfa</a>
      </nav>
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>Gizlilik Politikası</h1>
        <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "32px" }}>Son güncelleme: Haziran 2026</p>

        {[
          ["1. Toplanan Veriler", "Lagaluga, hizmetlerimizi sunmak amacıyla e-posta adresinizi, oluşturduğunuz videoları ve platform kullanım verilerinizi toplar. Ödeme bilgileriniz Shopier altyapısı üzerinden güvenli şekilde işlenir; kartı bilgileriniz tarafımızca saklanmaz."],
          ["2. Verilerin Kullanımı", "Toplanan veriler; hesabınızın yönetimi, video üretim hizmetlerinin sunulması ve platform güvenliğinin sağlanması amacıyla kullanılır. Verileriniz hiçbir koşulda üçüncü şahıslara satılmaz."],
          ["3. Çerezler", "Lagaluga, oturum yönetimi ve kullanıcı deneyimini iyileştirmek amacıyla çerez (cookie) kullanır. Tarayıcınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler çalışmayabilir."],
          ["4. Veri Güvenliği", "Verileriniz Supabase altyapısında şifrelenerek saklanır. Hesabınıza yetkisiz erişim tespit edildiğinde sizi bilgilendiririz."],
          ["5. Veri Saklama Süresi", "Hesabınızı sildiğinizde kişisel verileriniz 30 gün içinde sistemlerimizden kalıcı olarak silinir. Oluşturulan videolar 90 gün süreyle Supabase Storage'da tutulur."],
          ["6. KVKK Hakları", "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında; verilerinize erişme, düzeltme, silme ve işlenmesini kısıtlama haklarına sahipsiniz. Bu haklarınızı kullanmak için destek@lagaluga.com adresine yazabilirsiniz."],
          ["7. İletişim", "Gizlilik politikamızla ilgili sorularınız için destek@lagaluga.com adresine ulaşabilirsiniz."],
        ].map(([title, content]) => (
          <div key={title} style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>{title}</h2>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.8 }}>{content}</p>
          </div>
        ))}
      </div>
      <footer style={{ textAlign: "center", padding: "24px", fontSize: "12px", color: "#94A3B8", borderTop: "1px solid #F1F5F9" }}>
        <a href="/terms" style={{ color: "#EC4899", textDecoration: "none", marginRight: "16px" }}>Kullanım Şartları</a>
        <a href="/faq" style={{ color: "#EC4899", textDecoration: "none" }}>SSS</a>
      </footer>
    </div>
  );
}
