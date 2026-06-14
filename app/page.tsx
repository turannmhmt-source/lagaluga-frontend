"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const phrases = ["Hukuk sözleşmeleri","Pazarlama metinleri","Video senaryoları","Sosyal medya içerikleri","İş teklifleri","Proje raporları"];

export default function Home() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = phrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!isDeleting && charIndex <= current.length) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIndex)); setCharIndex(i => i + 1); }, 60);
    } else if (!isDeleting && charIndex > current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && charIndex >= 0) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIndex)); setCharIndex(i => i - 1); }, 30);
    } else {
      setIsDeleting(false);
      setPhraseIndex(i => (i + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#080D1A",color:"#E2E8F0",minHeight:"100vh"}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 60px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontSize:"22px",fontWeight:800,color:"#fff"}}>laga<span style={{color:"#6366F1"}}>luga</span></div>
        <div style={{display:"flex",gap:"12px"}}>
          <Link href="/dashboard" style={{padding:"8px 20px",borderRadius:"8px",border:"1px solid rgba(99,102,241,0.4)",color:"#6366F1",textDecoration:"none",fontSize:"14px",fontWeight:500}}>Giriş Yap</Link>
          <Link href="/dashboard" style={{padding:"8px 20px",borderRadius:"8px",background:"#6366F1",color:"#fff",textDecoration:"none",fontSize:"14px",fontWeight:600}}>Ücretsiz Başla</Link>
        </div>
      </nav>
      <section style={{textAlign:"center",padding:"100px 60px 80px",maxWidth:"900px",margin:"0 auto"}}>
        <h1 style={{fontSize:"clamp(36px,6vw,68px)",fontWeight:800,lineHeight:1.1,letterSpacing:"-2px",margin:"0 0 24px",color:"#F8FAFC"}}>
          Saniyeler içinde<br/>
          <span style={{color:"#6366F1"}}>{displayed}<span style={{borderRight:"2px solid #6366F1",marginLeft:"2px"}}>&nbsp;</span></span><br/>üret.
        </h1>
        <p style={{fontSize:"18px",color:"#94A3B8",maxWidth:"560px",margin:"0 auto 40px",lineHeight:1.7}}>Lagaluga, bireylerden kurumsal ekiplere kadar herkes için yapay zeka destekli içerik üretim platformudur.</p>
        <Link href="/dashboard" style={{padding:"14px 32px",borderRadius:"10px",background:"#6366F1",color:"#fff",textDecoration:"none",fontSize:"16px",fontWeight:700,boxShadow:"0 0 40px rgba(99,102,241,0.4)"}}>Hemen Dene — Ücretsiz</Link>
        <p style={{marginTop:"20px",fontSize:"13px",color:"#475569"}}>Kredi kartı gerekmez · 14 gün ücretsiz</p>
      </section>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
    </div>
  );
}
