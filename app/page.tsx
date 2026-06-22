"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CookieBanner from "@/components/CookieBanner";

const phrases = ["video içerikleri","sosyal medya postları","TikTok senaryoları","YouTube videoları","Instagram Reels","pazarlama metinleri"];

export default function Home() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = phrases[phraseIndex];
    let t: ReturnType<typeof setTimeout>;
    if (!isDeleting && charIndex <= current.length) {
      t = setTimeout(() => { setDisplayed(current.slice(0, charIndex)); setCharIndex(i => i + 1); }, 65);
    } else if (!isDeleting && charIndex > current.length) {
      t = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex >= 0) {
      t = setTimeout(() => { setDisplayed(current.slice(0, charIndex)); setCharIndex(i => i - 1); }, 35);
    } else {
      setIsDeleting(false);
      setPhraseIndex(i => (i + 1) % phrases.length);
    }
    return () => clearTimeout(t);
  }, [charIndex, isDeleting, phraseIndex]);

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:"#FAFAFA",color:"#1a1a2e",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* NAV */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 80px",background:"rgba(255,255,255,0.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(236,72,153,0.1)",position:"sticky",top:0,zIndex:100}}>
        <div style={{fontSize:"24px",fontWeight:900,letterSpacing:"-0.5px"}}>laga<span style={{color:"#EC4899"}}>luga</span></div>
        <div style={{display:"flex",gap:"32px",fontSize:"14px",fontWeight:500,color:"#64748B"}}>
          <a href="#features" style={{textDecoration:"none",color:"#64748B"}}>Özellikler</a>
          <a href="#how" style={{textDecoration:"none",color:"#64748B"}}>Nasıl Çalışır</a>
          <a href="#pricing" style={{textDecoration:"none",color:"#64748B"}}>Fiyatlar</a>
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <Link href="/auth" style={{padding:"9px 22px",borderRadius:"10px",border:"1.5px solid #EC4899",color:"#EC4899",textDecoration:"none",fontSize:"14px",fontWeight:600}}>Giriş Yap</Link>
          <Link href="/auth" style={{padding:"9px 22px",borderRadius:"10px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",textDecoration:"none",fontSize:"14px",fontWeight:700}}>Ücretsiz Başla</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{textAlign:"center",padding:"90px 80px 70px",maxWidth:"1000px",margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#FFF0F7",border:"1px solid rgba(236,72,153,0.2)",borderRadius:"100px",padding:"6px 16px",fontSize:"13px",color:"#EC4899",fontWeight:600,marginBottom:"28px"}}>
          ✦ Yapay Zeka Destekli Video & İçerik Platformu
        </div>
        <h1 style={{fontSize:"clamp(40px,6vw,72px)",fontWeight:900,lineHeight:1.08,letterSpacing:"-2.5px",margin:"0 0 16px",color:"#0F172A"}}>
          Saniyeler içinde<br/>
          <span style={{background:"linear-gradient(135deg,#EC4899,#F97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {displayed}<span style={{WebkitTextFillColor:"#EC4899",borderRight:"3px solid #EC4899",animation:"blink 1s step-end infinite"}}>&nbsp;</span>
          </span><br/>
          üret.
        </h1>
        <p style={{fontSize:"19px",color:"#64748B",maxWidth:"600px",margin:"0 auto 40px",lineHeight:1.7}}>
          Web sitenizin linkini yapıştırın — Lagaluga içeriğinizi analiz edip otomatik olarak TikTok, Instagram Reels ve YouTube videoları üretsin.
        </p>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
          <Link href="/auth" style={{padding:"15px 36px",borderRadius:"12px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",textDecoration:"none",fontSize:"17px",fontWeight:700,boxShadow:"0 8px 25px rgba(236,72,153,0.35)"}}>
            Ücretsiz Dene →
          </Link>
          <a href="#how" style={{padding:"15px 36px",borderRadius:"12px",border:"1.5px solid #E2E8F0",color:"#64748B",textDecoration:"none",fontSize:"17px",fontWeight:600,background:"#fff"}}>
            Nasıl Çalışır? ▶
          </a>
        </div>
        <p style={{fontSize:"13px",color:"#94A3B8"}}>Kredi kartı gerekmez · 3 video ücretsiz · Anında başla</p>
      </section>

      {/* STATS */}
      <section style={{background:"#fff",borderTop:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9",padding:"36px 80px"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:"24px"}}>
          {[["10.000+","Aktif Kullanıcı"],["500K+","Üretilen Video"],["9:16 / 16:9 / 1:1","Format Desteği"],["4.9★","Kullanıcı Puanı"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:"28px",fontWeight:900,color:"#EC4899",letterSpacing:"-1px"}}>{n}</div>
              <div style={{fontSize:"13px",color:"#94A3B8",marginTop:"4px",fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:"90px 80px",maxWidth:"1200px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"56px"}}>
          <div style={{fontSize:"13px",color:"#EC4899",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Özellikler</div>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#0F172A",letterSpacing:"-1px"}}>CapCut'tan fazlası, tamamen ücretsiz</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"20px"}}>
          {[
            {icon:"🔗",title:"URL'den Video Üret",desc:"Web sitenizi analiz edip otomatik TikTok, Reels ve YouTube videoları oluşturur."},
            {icon:"🎬",title:"9:16 / 16:9 / 1:1",desc:"Tek tıkla tüm sosyal medya formatlarına uygun video üretin."},
            {icon:"🤖",title:"AI Senaryo Yazarı",desc:"Yapay zeka içeriğinizi analiz edip 3 farklı video senaryosu önerir."},
            {icon:"🎨",title:"AI Nesne Silici",desc:"Görseldeki istemediğiniz nesneleri yapay zeka ile temizleyin."},
            {icon:"💬",title:"Otomatik Altyazı",desc:"AI ile saniyeler içinde altyazı oluşturun ve videoya ekleyin."},
            {icon:"📅",title:"Otomatik Zamanlayıcı",desc:"İçeriklerinizi planlayın, belirlediğiniz tarihte otomatik yayınlansın."},
          ].map(({icon,title,desc})=>(
            <div key={title} style={{background:"#fff",border:"1px solid #F1F5F9",borderRadius:"16px",padding:"28px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#FFF0F7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",marginBottom:"16px"}}>{icon}</div>
              <div style={{fontSize:"17px",fontWeight:700,color:"#0F172A",marginBottom:"8px"}}>{title}</div>
              <div style={{fontSize:"14px",color:"#64748B",lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" style={{background:"linear-gradient(135deg,#FFF0F7,#FFF7ED)",padding:"90px 80px",borderTop:"1px solid rgba(236,72,153,0.1)"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"13px",color:"#EC4899",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Nasıl Çalışır</div>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#0F172A",letterSpacing:"-1px",marginBottom:"56px"}}>3 adımda profesyonel video</h2>
          <div style={{display:"flex",gap:"32px",justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {n:"1",title:"URL yapıştır",desc:"Web sitenizin veya bir makalenin linkini girin"},
              {n:"2",title:"AI üretir",desc:"Yapay zeka içeriği analiz edip 3 senaryo önerir"},
              {n:"3",title:"İndir & paylaş",desc:"Videonuzu indirin, sosyal medyada paylaşın"},
            ].map(({n,title,desc})=>(
              <div key={n} style={{flex:"1",minWidth:"200px",textAlign:"center"}}>
                <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",fontSize:"22px",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 20px rgba(236,72,153,0.3)"}}>{n}</div>
                <div style={{fontSize:"18px",fontWeight:700,color:"#0F172A",marginBottom:"8px"}}>{title}</div>
                <div style={{fontSize:"14px",color:"#64748B"}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:"90px 80px",maxWidth:"1100px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"56px"}}>
          <div style={{fontSize:"13px",color:"#EC4899",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Fiyatlar</div>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#0F172A",letterSpacing:"-1px"}}>Şu an tamamen ücretsiz</h2>
          <p style={{color:"#64748B",marginTop:"12px",fontSize:"16px"}}>Lansman döneminde tüm özellikler ücretsiz. Sınırlı süre!</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
          {[
            {name:"Ücretsiz",price:"₺0",sub:"/ay",features:["3 video/ay","Tüm formatlar","AI senaryo","Temel araçlar"],cta:"Hemen Başla",hot:false},
            {name:"Profesyonel",price:"₺300",sub:"/ay",features:["Sınırsız video","Tüm formatlar","AI nesne silici","Otomatik zamanlayıcı","Öncelikli destek"],cta:"Yakında",hot:true},
            {name:"Yıllık",price:"₺2500",sub:"/yıl",features:["Sınırsız video","Tüm özellikler","2 ay ücretsiz","Özel destek"],cta:"Yakında",hot:false},
          ].map(({name,price,sub,features,cta,hot})=>(
            <div key={name} style={{background:hot?"linear-gradient(135deg,#EC4899,#F97316)":"#fff",border:hot?"none":"1px solid #F1F5F9",borderRadius:"20px",padding:"32px",boxShadow:hot?"0 20px 50px rgba(236,72,153,0.3)":"0 2px 8px rgba(0,0,0,0.04)",transform:hot?"scale(1.04)":"none",position:"relative"}}>
              {hot&&<div style={{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:"#0F172A",color:"#fff",fontSize:"11px",fontWeight:700,padding:"4px 14px",borderRadius:"100px"}}>⭐ EN POPÜLER</div>}
              <div style={{fontSize:"14px",fontWeight:600,color:hot?"rgba(255,255,255,0.8)":"#94A3B8",marginBottom:"6px"}}>{name}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"20px"}}>
                <span style={{fontSize:"36px",fontWeight:900,color:hot?"#fff":"#0F172A"}}>{price}</span>
                <span style={{fontSize:"14px",color:hot?"rgba(255,255,255,0.7)":"#94A3B8"}}>{sub}</span>
              </div>
              <ul style={{listStyle:"none",padding:0,margin:"0 0 24px",display:"flex",flexDirection:"column",gap:"10px"}}>
                {features.map(f=>(
                  <li key={f} style={{fontSize:"14px",color:hot?"rgba(255,255,255,0.9)":"#64748B",display:"flex",gap:"8px",alignItems:"center"}}>
                    <span style={{color:hot?"#fff":"#EC4899",fontWeight:700}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:"10px",background:hot?"#fff":"linear-gradient(135deg,#EC4899,#F97316)",color:hot?"#EC4899":"#fff",textDecoration:"none",fontSize:"14px",fontWeight:700}}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{margin:"0 80px 80px",borderRadius:"24px",background:"linear-gradient(135deg,#EC4899,#F97316)",padding:"70px 60px",textAlign:"center"}}>
        <h2 style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:900,color:"#fff",letterSpacing:"-1.5px",marginBottom:"14px"}}>Bugün üretmeye başlayın.</h2>
        <p style={{color:"rgba(255,255,255,0.8)",fontSize:"17px",marginBottom:"32px"}}>3 video ücretsiz. Kredi kartı gerekmez.</p>
        <Link href="/auth" style={{display:"inline-block",padding:"16px 42px",borderRadius:"12px",background:"#fff",color:"#EC4899",textDecoration:"none",fontSize:"17px",fontWeight:800}}>
          Ücretsiz Hesap Oluştur →
        </Link>
      </section>

      <CookieBanner />

      {/* FOOTER */}
      <footer style={{padding:"28px 80px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
        <div style={{fontSize:"20px",fontWeight:900,color:"#0F172A"}}>laga<span style={{color:"#EC4899"}}>luga</span></div>
        <div style={{fontSize:"13px",color:"#94A3B8"}}>© 2026 Lagaluga. Tüm hakları saklıdır.</div>
        <div style={{display:"flex",gap:"20px",fontSize:"13px"}}>
          <a href="/privacy" style={{color:"#94A3B8",textDecoration:"none"}}>Gizlilik</a>
          <a href="/terms" style={{color:"#94A3B8",textDecoration:"none"}}>Kullanım Şartları</a>
          <a href="/faq" style={{color:"#94A3B8",textDecoration:"none"}}>SSS</a>
        </div>
      </footer>
    </div>
  );
}
