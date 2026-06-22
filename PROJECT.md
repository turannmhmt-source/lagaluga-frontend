# LAGALUGA — TAM PROJE TANIMI VE GELİŞTİRME TALİMATI

## PROJE KİMLİĞİ

Proje adı: Lagaluga
Vizyon: Türkçe odaklı, dünyada benzeri olmayan AI destekli sosyal medya video üretim SaaS platformu. Canva + CapCut + Adobe Firefly karması.
Temel fark: Kullanıcı bir işletmenin URL'sini yapıştırır, sistem o sitenin arayüzünü analiz edip hizmetlerini tanıtan video üretir. Stok video değil, sitenin kendi ekran görüntüleri videoda görünür.

---

## TEKNİK ALTYAPI

Stack: FastAPI (Backend) + Next.js (Frontend) + Supabase (DB/Auth) + Railway (Backend Host) + Vercel (Frontend Host) + GitHub (Kod)

Başka platform önerilmeyecek. Sadece bu stack kullanılacak.

- Backend URL: `https://lagaluga-backend-production.up.railway.app`
- Frontend URL: `https://lagaluga-frontend.vercel.app`
- Supabase URL: `https://ffbtiktwzrlzlndfnyzy.supabase.co`
- GitHub Backend: `turannmhmt-source/lagaluga-backend`
- GitHub Frontend: `turannmhmt-source/lagaluga-frontend`
- Local Backend: `C:\Users\masar\source\repos\turannmhmt-source\lagaluga-backend`
- Local Frontend: `C:\Users\masar\source\repos\turannmhmt-source\lagaluga-frontend`

Railway Env Variables: `OPENAI_API_KEY`, `PEXELS_API_KEY`, `PIXABAY_API_KEY`, `UNSPLASH_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `JWT_SECRET`

---

## MEVCUT DOSYA YAPISI

Backend dosyaları:
- `lagaluga.py` — FastAPI ana app, tüm router'lar dahil
- `db.py` — Supabase client (SUPABASE_URL + SUPABASE_KEY env var)
- `api/auth.py` — Auth router
- `api/projects.py` — URL/konu analizi, OpenAI entegrasyonu, asenkron task sistemi
- `api/scenarios.py` — Video render, FFmpeg, Pexels/Pixabay/Unsplash, Supabase upload
- `api/tools.py` — AI araçlar (nesne silme, yazı değiştirme, altyazı, seslendirme)
- `api/payments.py` — Shopier webhook, HMAC doğrulama
- `api/videos.py` — Video kuyruk yönetimi
- `Dockerfile` — python:3.11-slim + ffmpeg + edge-tts
- `requirements.txt` — fastapi, uvicorn, httpx, pydantic, supabase, edge-tts, Pillow, email-validator, beautifulsoup4

Frontend dosyaları:
- `app/page.tsx` — Landing page
- `app/auth/page.tsx` — Auth yönlendirme (force-dynamic)
- `app/auth/AuthClient.tsx` — Login/register formu
- `app/dashboard/page.tsx` — Ana dashboard
- `app/editor/page.tsx` — Video editörü
- `lib/supabase.ts` — Singleton Supabase client (getSupabase())
- `lib/api.ts` — callApi() ve uploadFile() merkezi handler

Supabase şema:
- `profiles` tablosu: `id UUID`, `email TEXT`, `credits INT DEFAULT 3`
- `tasks` tablosu: `id UUID`, `user_id UUID`, `status TEXT`, `type TEXT`, `input JSONB`, `result JSONB`, `error TEXT`, `created_at`, `updated_at`
- `render_queue`, `payments` tabloları
- `rendered-videos` bucket (public)
- `deduct_credit(p_user_id UUID)` RPC fonksiyonu

---

## ŞU AN ÇALIŞAN ÖZELLİKLER

- Auth (login/register/logout) — Supabase Auth
- Dashboard format seçimi: Instagram Reels, TikTok, Hikaye, YouTube, Gönderi, Shorts
- URL/konu analizi — OpenAI gpt-4o-mini ile senaryo üretimi
- Asenkron task sistemi — BackgroundTasks + 3 saniye polling
- Pexels + Pixabay + Unsplash paralel medya çekimi
- FFmpeg video birleştirme
- Supabase Storage upload
- Video indirme
- Görsel lightbox
- Sesli komut (Web Speech API, Türkçe)
- Çoklu medya yükleme (max 20 dosya)
- AI araçlar modal
- Skeleton loading animasyonu
- Scrape failed → manuel açıklama formu
- Kredi göstergesi navbar'da

---

## KURALLAR — HİÇ DEĞİŞMEYECEK

1. Tüm altyapılar ücretsiz, profesyonel ve sınırsız olacak
2. Sadece Railway, Vercel, Supabase, GitHub kullanılacak
3. Her güncellemede önceki kodlar bozulmayacak, üstüne inşa edilecek
4. Çıkabilecek tüm hatalar öngörülerek tek seferde düzeltilecek
5. Türkçe dil kullanılacak, noktalama işaretleri doğru olacak
6. Railway free plan 512MB RAM limiti gözetilecek
7. edge-tts async event loop sorunu için asyncio doğru kullanılacak
8. Her deploy sonrası Railway/Vercel logs kontrol edilecek

---

## YAPILACAKLAR — 25 MODÜL

### Modül 1: Ses ve Müzik
- edge-tts `tr-TR-EmelNeural` sesi düzelt
- AI seslendirme checkbox `add_voice` backend'e doğru gönderilecek
- Pixabay Music API ile arka plan müziği
- TTS sesi + arka plan müziği FFmpeg ile karıştırılacak (TTS vol=1.0, müzik vol=0.3)

### Modül 2: Video Kalitesi
- FFmpeg crossfade geçiş
- Kullanıcı fotoğrafları slayt videoya dönüşecek (her fotoğraf 3-5sn, fade)
- `user_media` array backend'de işlenecek
- Tmp dosyalar işlem sonrası temizlenecek
- Re-encode ile codec uyumsuzluğu giderilecek

### Modül 3: URL Analizi
- Jina AI (`r.jina.ai/{url}`) birincil kaynak
- Jina başarısız → BeautifulSoup fallback
- Her ikisi başarısız → `SCRAPE_FAILED`
- Google URL'lerinde `q=` parametresi regex ile ayıklanacak
- OpenAI prompt güçlendirilecek — keyword her zaman İngilizce

### Modül 4: AI Sihirli Araçlar (Gerçek İmplementasyon)
- 🎨 AI Nesne Silici: gpt-image-1 ile nesne kaldırma
- ✏️ Yazı Değiştirici: gpt-image-1 ile metin düzenleme
- 💬 Otomatik Altyazı: FFmpeg subtitle filtresi ile SRT
- 🎵 AI Seslendirme: edge-tts Türkçe ses
- 🎤 Stüdyo Kalitesi: FFmpeg ses temizleme filtresi
- 🖼️ Arkaplan Silici: remove.bg API

### Modül 5: Sosyal Medya
- Platform seçim modalı (Instagram/TikTok/YouTube/Twitter/LinkedIn/WhatsApp)
- Her platform için uygun format/piksel/süre

### Modül 6: Dashboard UX
- Kredi değeri Supabase'den çekilecek, hardcode olmayacak
- Race condition koruması
- Mobil responsive düzeltmeler
- Task polling memory leak düzeltilecek

### Modül 7: Stok Medya Genişletme
- Pexels + Pixabay + Unsplash + Coverr paralel çekim
- Pixabay Music API müzik için

### Modül 8: Veritabanı
- `profiles` trigger: yeni kayıt → otomatik profil satırı
- RLS politikaları eksiksiz
- `deduct_credit` RPC atomic transaction

### Modül 9: Güvenlik
- CORS: sadece izin verilen domainler
- Rate limiting: 1 dakikada max 5 analiz
- Supabase RLS tüm tablolarda aktif

### Modül 10: Eksik Özellikler
- Kullanıcı geçmiş videoları listesi
- Video önizleme (üretmeden önce)
- Senaryo düzenleme
- Watermark (ücretsiz planda)

### Modül 11: Ödeme Sistemi
- Shopier webhook HMAC doğrulama
- Kredi satın alma akışı
- Fiyatlandırma: Ücretsiz (3 video), Profesyonel (₺300/ay), Yıllık (₺2500)

### Modül 12: Landing Page
- Nav butonları `/auth`'a yönlendirecek
- SEO meta tagları (Open Graph, Twitter Card)
- Sitemap ve robots.txt

### Modül 13: Auth ve Kullanıcı Yönetimi
- Şifre sıfırlama sayfası
- Hesap silme (KVKK)
- Profil sayfası

### Modül 14: Performans
- Streaming video upload
- Tmp dosya otomatik temizleme
- API response cache

### Modül 15: Deployment
- Railway memory optimizasyon
- Docker image boyutu minimize

### Modül 16-25: (Test/Monitoring, SEO, İçerik Kalitesi, Çoklu Dil, İşbirliği, İçerik Kütüphanesi, Public API, Yasal Sayfalar, Destek, İleri Özellikler)

---

## BİLİNEN SORUNLAR VE ÇÖZÜMLER

1. `edge-tts` async conflict → `await communicate.save(path)` direkt çağrılacak
2. FFmpeg OOM (returncode=-9) → scale yerine `-c:v copy`
3. Railway DNS sorunu → Jina başarısız olursa BeautifulSoup dene
4. Supabase upload 400 → RLS policy eksik
5. `gotrue` import → `from gotrue.errors import AuthApiError`
6. Task `user_id` UUID constraint → boş string değil `None`
7. Keyword Türkçe çıkması → OpenAI prompt'a "Return ONLY English" ekle
8. Playwright çalışmıyor → Railway 512MB RAM yetmiyor, alternatif bulunacak
9. DALL-E-2 nesne kaldırmada zayıf → gpt-image-1 kullanıldı
10. Supabase rpc/from TypeScript hataları → `(supabase as any).rpc(...)` cast'i

---

## RAFA KALDIRMA NOTU

Bu proje 2026-06-16 tarihinde aktif geliştirme durdurularak rafa kaldırıldı.
Son çalışılan branch: `claude/charming-lovelace-elhbkj`
Ana branch (`main`) stabil durumda.
Dönünce bu dosyadan devam et.
