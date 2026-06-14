"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const phrases = ["pazarlama metinleri","video senaryoları","hukuki belgeler","sosyal medya içerikleri","iş teklifleri","e-posta kampanyaları"];

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .hero-section{animation:fadeUp 0.8s ease forwards;}
        .feature-card{transition:all 0.2s ease;cursor:default;}
        .feature-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(236,72,153,0.12);}
        .cta-btn{transition:all 0.2s ease;}
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(236,72,153,0.4);}
        .nav-link{transition:color 0.2s;text-decoration:none;}
        .nav-link:hover{color:#EC4899;}
      `}</style>

      {/* NAV */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 80px",background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(236,72,153,0.1)",position:"sticky",top:0,zIndex:100}}>
        <div style={{fontSize:"24px",fontWeight:900,letterSpacing:"-0.5px"}}>
          laga<span style={{color:"#EC4899"}}>luga</span>
        </div>
        <div style={{display:"flex",gap:"32px",fontSize:"14px",fontWeight:500,color:"#64748B"}}>
          <a href="#features" className="nav-link">Özellikler</a>
          <a href="#how" className="nav-link">Nasıl Çalışır</a>
          <a href="#pricing" className="nav-link">Fiyatlar</a>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <Link href="/dashboard" style={{padding:"9px 22px",borderRadius:"10px",border:"1.5px solid #EC4899",color:"#EC4899",textDecoration:"none",fontSize:"14px",fontWeight:600}}>Giriş Yap</Link>
          <Link href="/dashboard" style={{padding:"9px 22px",borderRadius:"10px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",textDecoration:"none",fontSize:"14px",fontWeight:700,boxShadow:"0 4px 15px rgba(236,72,153,0.3)"}}>Ücretsiz Başla</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{textAlign:"center",padding:"90px 80px 70px",maxWidth:"1000px",margin:"0 auto",position:"relative"}}>
        <div style={{position:"absolute",top:"-50px",left:"50%",transform:"translateX(-50%)",width:"600px",height:"400px",background:"radial-gradient(ellipse,rgba(236,72,153,0.08) 0%,transparent 70%)",pointerEvents:"none"}} />
        <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#FFF0F7",border:"1px solid rgba(236,72,153,0.2)",borderRadius:"100px",padding:"6px 16px",fontSize:"13px",color:"#EC4899",fontWeight:600,marginBottom:"28px"}}>
          <span>✦</span> Yapay Zeka Destekli İçerik Platformu
        </div>
        <h1 style={{fontSize:"clamp(40px,6vw,72px)",fontWeight:900,lineHeight:1.08,letterSpacing:"-2.5px",margin:"0 0 16px",color:"#0F172A"}}>
          Yapay zeka ile anında<br/>
          <span style={{background:"linear-gradient(135deg,#EC4899,#F97316)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            {displayed}<span style={{WebkitTextFillColor:"#EC4899",borderRight:"3px solid #EC4899",animation:"blink 1s step-end infinite"}}>&nbsp;</span>
          </span><br/>
          <span style={{color:"#0F172A"}}>oluştur.</span>
        </h1>
        <p style={{fontSize:"19px",color:"#64748B",maxWidth:"580px",margin:"0 auto 40px",lineHeight:1.7,fontWeight:400}}>
          Lagaluga ile dakikalar içinde profesyonel içerik üretin. Bireysel kullanıcıdan kurumsal ekibe, herkese uygun çözümler.
        </p>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap",marginBottom:"24px"}}>
          <Link href="/dashboard" className="cta-btn" style={{padding:"15px 36px",borderRadius:"12px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",textDecoration:"none",fontSize:"17px",fontWeight:700,boxShadow:"0 8px 25px rgba(236,72,153,0.35)"}}>
            Ücretsiz Dene →
          </Link>
          <a href="#how" style={{padding:"15px 36px",borderRadius:"12px",border:"1.5px solid #E2E8F0",color:"#64748B",textDecoration:"none",fontSize:"17px",fontWeight:600,background:"#fff"}}>
            Demo İzle ▶
          </a>
        </div>
        <p style={{fontSize:"13px",color:"#94A3B8"}}>Kredi kartı gerekmez · 14 gün ücretsiz · Anında başla</p>
      </section>

      {/* STATS */}
      <section style={{background:"#fff",borderTop:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9",padding:"36px 80px"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:"24px"}}>
          {[["50.000+","Aktif Kullanıcı"],["5M+","Üretilen İçerik"],["99%","Memnuniyet"],["4.9★","Kullanıcı Puanı"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:"30px",fontWeight:900,color:"#EC4899",letterSpacing:"-1px"}}>{n}</div>
              <div style={{fontSize:"13px",color:"#94A3B8",marginTop:"4px",fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:"90px 80px",maxWidth:"1200px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"56px"}}>
          <div style={{fontSize:"13px",color:"#EC4899",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Özellikler</div>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#0F172A",letterSpacing:"-1px"}}>İhtiyacınız olan her şey</h2>
          <p style={{color:"#64748B",fontSize:"17px",marginTop:"12px",maxWidth:"500px",margin:"12px auto 0"}}>Tek platformda içerik üretiminin tüm gücü</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:"20px"}}>
          {[
            {icon:"⚡",title:"Anında İçerik",desc:"Saniyeler içinde blog yazısı, sosyal medya postu, e-posta veya senaryo üretin.",color:"#FFF0F7"},
            {icon:"🎯",title:"Sektöre Özel Şablonlar",desc:"Hukuk, finans, pazarlama, eğitim — her sektör için optimize edilmiş 200+ şablon.",color:"#FFF7ED"},
            {icon:"🤖",title:"Gelişmiş AI Modeli",desc:"En güncel yapay zeka teknolojisiyle insan kalitesinde içerik üretimi.",color:"#F0FDF4"},
            {icon:"👥",title:"Ekip Çalışması",desc:"Projelerinizi ekibinizle paylaşın, yorum ekleyin ve birlikte düzenleyin.",color:"#EFF6FF"},
            {icon:"🌍",title:"Çok Dil Desteği",desc:"Türkçe başta olmak üzere 50+ dilde içerik üretin ve çevirin.",color:"#FFF0F7"},
            {icon:"📊",title:"Performans Analizi",desc:"Hangi içerikler daha çok dönüşüm sağlıyor? Veriye dayalı kararlar alın.",color:"#FFF7ED"},
          ].map(({icon,title,desc,color})=>(
            <div key={title} className="feature-card" style={{background:"#fff",border:"1px solid #F1F5F9",borderRadius:"16px",padding:"28px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{width:"48px",height:"48px",borderRadius:"12px",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",marginBottom:"16px"}}>{icon}</div>
              <div style={{fontSize:"17px",fontWeight:700,color:"#0F172A",marginBottom:"8px"}}>{title}</div>
              <div style={{fontSize:"14px",color:"#64748B",lineHeight:1.7}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" style={{background:"linear-gradient(135deg,#FFF0F7,#FFF7ED)",padding:"90px 80px",borderTop:"1px solid rgba(236,72,153,0.1)",borderBottom:"1px solid rgba(236,72,153,0.1)"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"13px",color:"#EC4899",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Nasıl Çalışır</div>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#0F172A",letterSpacing:"-1px",marginBottom:"56px"}}>3 adımda profesyonel içerik</h2>
          <div style={{display:"flex",gap:"0",justifyContent:"center",flexWrap:"wrap",position:"relative"}}>
            {[
              {n:"1",title:"Konuyu yazın",desc:"Ne üretmek istediğinizi birkaç kelimeyle anlatın"},
              {n:"2",title:"AI üretir",desc:"Yapay zeka saniyeler içinde profesyonel içerik hazırlar"},
              {n:"3",title:"Düzenle & paylaş",desc:"Kopyalayın, indirin veya direkt yayınlayın"},
            ].map(({n,title,desc},i)=>(
              <div key={n} style={{flex:"1",minWidth:"220px",textAlign:"center",padding:"0 20px",position:"relative"}}>
                {i < 2 && <div style={{position:"absolute",top:"28px",right:"-10px",width:"20px",height:"2px",background:"linear-gradient(90deg,#EC4899,#F97316)",display:"none"}} />}
                <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",fontSize:"22px",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 20px rgba(236,72,153,0.3)"}}>{n}</div>
                <div style={{fontSize:"18px",fontWeight:700,color:"#0F172A",marginBottom:"8px"}}>{title}</div>
                <div style={{fontSize:"14px",color:"#64748B",lineHeight:1.6}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:"90px 80px",maxWidth:"1100px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"56px"}}>
          <div style={{fontSize:"13px",color:"#EC4899",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Fiyatlar</div>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#0F172A",letterSpacing:"-1px"}}>Büyüdükçe ölçeklenen planlar</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
          {[
            {name:"Başlangıç",price:"Ücretsiz",sub:"Sonsuza dek",features:["50 içerik/ay","5 proje","Temel şablonlar","Türkçe destek"],cta:"Hemen Başla",hot:false},
            {name:"Profesyonel",price:"₺299",sub:"/ay",features:["Sınırsız içerik","Sınırsız proje","200+ şablon","Ekip işbirliği","Öncelikli destek"],cta:"14 Gün Ücretsiz Dene",hot:true},
            {name:"Kurumsal",price:"Teklif",sub:"alın",features:["Özel AI modeli","SSO & API","SLA garantisi","Özel eğitim","Hesap yöneticisi"],cta:"Bize Ulaşın",hot:false},
          ].map(({name,price,sub,features,cta,hot})=>(
            <div key={name} style={{background:hot?"linear-gradient(135deg,#EC4899,#F97316)":"#fff",border:hot?"none":"1px solid #F1F5F9",borderRadius:"20px",padding:"32px",boxShadow:hot?"0 20px 50px rgba(236,72,153,0.3)":"0 2px 8px rgba(0,0,0,0.04)",position:"relative",transform:hot?"scale(1.04)":"none"}}>
              {hot&&<div style={{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:"#0F172A",color:"#fff",fontSize:"11px",fontWeight:700,padding:"4px 14px",borderRadius:"100px",letterSpacing:"1px",whiteSpace:"nowrap"}}>⭐ EN POPÜLER</div>}
              <div style={{fontSize:"14px",fontWeight:600,color:hot?"rgba(255,255,255,0.8)":"#94A3B8",marginBottom:"6px"}}>{name}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"6px"}}>
                <span style={{fontSize:"36px",fontWeight:900,color:hot?"#fff":"#0F172A"}}>{price}</span>
                <span style={{fontSize:"14px",color:hot?"rgba(255,255,255,0.7)":"#94A3B8"}}>{sub}</span>
              </div>
              <ul style={{listStyle:"none",padding:0,margin:"20px 0 24px",display:"flex",flexDirection:"column",gap:"10px"}}>
                {features.map(f=>(
                  <li key={f} style={{fontSize:"14px",color:hot?"rgba(255,255,255,0.9)":"#64748B",display:"flex",gap:"8px",alignItems:"center"}}>
                    <span style={{color:hot?"#fff":"#EC4899",fontWeight:700}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" style={{display:"block",textAlign:"center",padding:"13px",borderRadius:"10px",background:hot?"#fff":"linear-gradient(135deg,#EC4899,#F97316)",color:hot?"#EC4899":"#fff",textDecoration:"none",fontSize:"14px",fontWeight:700}}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{margin:"0 80px 80px",borderRadius:"24px",background:"linear-gradient(135deg,#EC4899,#F97316)",padding:"70px 60px",textAlign:"center",boxShadow:"0 20px 60px rgba(236,72,153,0.3)"}}>
        <h2 style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:900,color:"#fff",letterSpacing:"-1.5px",marginBottom:"14px"}}>Bugün üretmeye başlayın.</h2>
        <p style={{color:"rgba(255,255,255,0.8)",fontSize:"17px",marginBottom:"32px"}}>14 gün boyunca tüm özellikleri ücretsiz deneyin. Kredi kartı gerekmez.</p>
        <Link href="/dashboard" style={{display:"inline-block",padding:"16px 42px",borderRadius:"12px",background:"#fff",color:"#EC4899",textDecoration:"none",fontSize:"17px",fontWeight:800,boxShadow:"0 8px 25px rgba(0,0,0,0.15)"}}>
          Ücretsiz Hesap Oluştur →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"28px 80px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
        <div style={{fontSize:"20px",fontWeight:900,color:"#0F172A"}}>laga<span style={{color:"#EC4899"}}>luga</span></div>
        <div style={{fontSize:"13px",color:"#94A3B8"}}>© 2026 Lagaluga. Tüm hakları saklıdır.</div>
        <div style={{display:"flex",gap:"20px",fontSize:"13px"}}>
          <a href="#" style={{color:"#94A3B8",textDecoration:"none"}}>Gizlilik</a>
          <a href="#" style={{color:"#94A3B8",textDecoration:"none"}}>Kullanım Şartları</a>
          <a href="#" style={{color:"#94A3B8",textDecoration:"none"}}>İletişim</a>
        </div>
      </footer>
    </div>
  );
}
