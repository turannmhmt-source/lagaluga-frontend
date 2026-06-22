import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XZT1Y3LEQ7";

export const metadata: Metadata = {
  title: "Lagaluga | AI Video Editörü",
  description: "Web sitenizin linkini yapıştırın — Lagaluga AI ile saniyeler içinde TikTok, Instagram Reels ve YouTube videoları üretin. Türkçe seslendirme, otomatik altyazı ve çok daha fazlası.",
  keywords: ["ai video editörü", "sosyal medya video", "tiktok video üret", "instagram reels", "türkçe seslendirme", "video oluşturucu", "yapay zeka video"],
  authors: [{ name: "Lagaluga" }],
  creator: "Lagaluga",
  publisher: "Lagaluga",
  metadataBase: new URL("https://lagaluga-frontend.vercel.app"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://lagaluga-frontend.vercel.app",
    siteName: "Lagaluga",
    title: "Lagaluga | AI Video Editörü",
    description: "URL'den saniyeler içinde profesyonel sosyal medya videosu üret. TikTok, Reels, YouTube Shorts — hepsi bir arada.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lagaluga AI Video Editörü" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lagaluga | AI Video Editörü",
    description: "URL'den saniyeler içinde profesyonel sosyal medya videosu üret.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
