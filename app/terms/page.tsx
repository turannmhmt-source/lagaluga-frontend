export default function Terms() {
  return (
    <div style={{ fontFamily: "Inter,sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #F1F5F9", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", textDecoration: "none" }}>laga<span style={{ color: "#EC4899" }}>luga</span></a>
        <a href="/" style={{ fontSize: "13px", color: "#64748B", textDecoration: "none" }}>← Ana Sayfa</a>
      </nav>
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>Kullanım Şartları</h1>
        <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "32px" }}>Son güncelleme: Haziran 2026</p>

        {[
          ["1. Hizmet Tanımı", "Lagaluga, yapay zeka destekli sosyal medya video üretim platformudur. Kullanıcılar, web sitesi URL'si veya konu girerek otomatik video senaryosu ve video içeriği üretebilir."],
          ["2. Hesap Oluşturma", "Platformu kullanmak için geçerli bir e-posta adresiyle kayıt olmanız gerekmektedir. Hesabınızın güvenliğinden siz sorumlusunuz. Sahte kimlikle oluşturulan hesaplar iptal edilir."],
          ["3. Kredi Sistemi", "Ücretsiz hesaplara 3 kredi tanımlanır. Her video üretimi 1 kredi kullanır. Krediler Profesyonel veya Yıllık plan satın alınarak yenilenebilir. Kullanılmayan krediler iade edilmez."],
          ["4. Telif Hakkı ve İçerik", "Lagaluga aracılığıyla üretilen videolarda kullanılan stok görseller ve videolar Pexels, Pixabay ve Unsplash lisansları kapsamındadır. Üretilen içeriklerin yasal kullanımı kullanıcının sorumluluğundadır."],
          ["5. Yasaklı Kullanımlar", "Yanıltıcı içerik, nefret söylemi, şiddet içeren materyal, telif hakkı ihlali veya yasadışı amaçlarla kullanım kesinlikle yasaktır. Bu tür kullanımlar tespit edildiğinde hesap derhal kapatılır."],
          ["6. Hizmet Kesintileri", "Lagaluga, planlı bakım veya beklenmedik teknik sorunlar nedeniyle hizmetleri geçici olarak askıya alabilir. Bu durumlarda kredi iadesi yapılmaz; ancak kaybedilen krediler manuel olarak telafi edilebilir."],
          ["7. Ücretlendirme ve İptal", "Ücretli planlar Shopier üzerinden alınır. Abonelik iptallerinde mevcut dönem sonuna kadar erişim devam eder. Hizmet kalitesinden memnun kalınmaması durumunda 7 gün içinde iade talep edilebilir."],
          ["8. Değişiklikler", "Lagaluga bu şartları önceden bildirmeksizin güncelleyebilir. Güncellemeler yayınlandıktan sonra platformu kullanmaya devam etmek bu şartları kabul etmek anlamına gelir."],
          ["9. İletişim", "Kullanım şartlarıyla ilgili sorularınız için destek@lagaluga.com adresine ulaşabilirsiniz."],
        ].map(([title, content]) => (
          <div key={title} style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>{title}</h2>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.8 }}>{content}</p>
          </div>
        ))}
      </div>
      <footer style={{ textAlign: "center", padding: "24px", fontSize: "12px", color: "#94A3B8", borderTop: "1px solid #F1F5F9" }}>
        <a href="/privacy" style={{ color: "#EC4899", textDecoration: "none", marginRight: "16px" }}>Gizlilik Politikası</a>
        <a href="/faq" style={{ color: "#EC4899", textDecoration: "none" }}>SSS</a>
      </footer>
    </div>
  );
}
