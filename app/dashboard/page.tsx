"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ffbtiktwzrlzlndfnyzy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYnRpa3R3enJsemxuZGZueXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDUwMzgsImV4cCI6MjA5NjkyMTAzOH0.88tvA2bJF3pv3TaUwOMTkn4PFGHjZcI8otUGJhZm8pk"
);

type Scenario = { id: string; title: string; summary: string; style: string; duration: string; };

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(3);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]|null>(null);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderMessage, setRenderMessage] = useState<string|null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [format, setFormat] = useState("9:16-reels");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
    });
  }, [router]);

  const isUrl = (str: string) => str.startsWith("http://") || str.startsWith("https://");

  const handleAnalyze = async () => {
    if (!input.trim() || isAnalyzing) return;
    setIsAnalyzing(true); setScenarios(null); setSelectedId(null); setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: isUrl(input) ? input : `topic:${input}`, format })
      });
      if (!res.ok) throw new Error("API hatası");
      const data = await res.json();
      setScenarios(data.scenarios);
      setCredits(c => Math.max(0, c - 1));
    } catch {
      setError("Analiz sırasında hata oluştu. Lütfen tekrar deneyin.");
    } finally { setIsAnalyzing(false); }
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;
    setIsRendering(true);
    setVideos([]); setImages([]);
    const sel = scenarios?.find(s => s.id === selectedId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scenarios/${selectedId}/render`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input, format, title: sel?.title || "", summary: sel?.summary || "" })
        }
      );
      const data = await res.json();
      setRenderMessage(data.message);
      if (data.videos?.length > 0) setVideos(data.videos);
      if (data.images?.length > 0) setImages(data.images);
    } catch { setError("Medya getirilemedi."); }
    finally { setIsRendering(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",fontFamily:"Inter,sans-serif",color:"#EC4899",fontSize:"18px"}}>
      Yükleniyor...
    </div>
  );

  const formats = [
    { id: "9:16-reels", label: "Reels", sub: "Instagram Reels", icon: "📱" },
    { id: "9:16-tiktok", label: "TikTok", sub: "TikTok Video", icon: "🎵" },
    { id: "9:16-story", label: "Hikaye", sub: "IG/WA Hikaye", icon: "⭕" },
    { id: "16:9", label: "YouTube", sub: "YouTube Video", icon: "▶️" },
    { id: "1:1", label: "Gönderi", sub: "IG/LinkedIn", icon: "⬛" },
    { id: "9:16-shorts", label: "Shorts", sub: "YouTube Shorts", icon: "🩳" },
  ];

  const tools = [
    { icon: "🎨", label: "AI Nesne Silici", desc: "Görselden nesne kaldır" },
    { icon: "✏️", label: "Yazı Değiştirici", desc: "Font koruyarak değiştir" },
    { icon: "💬", label: "Otomatik Altyazı", desc: "AI altyazı eşle" },
    { icon: "🎵", label: "AI Seslendirme", desc: "Türkçe ses üret" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:"Inter,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #CBD5E1; }
      `}</style>

      <nav style={{background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid #F1F5F9",padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{fontSize:"22px",fontWeight:900,color:"#0F172A"}}>laga<span style={{color:"#EC4899"}}>luga</span></div>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{background:"#FFF0F7",border:"1px solid rgba(236,72,153,0.2)",borderRadius:"100px",padding:"6px 16px",fontSize:"13px",color:"#EC4899",fontWeight:700}}>⚡ {credits} Kredi</div>
          <div style={{fontSize:"13px",color:"#64748B"}}>{user.email}</div>
          <button onClick={handleLogout} style={{padding:"8px 16px",borderRadius:"8px",border:"1px solid #E2E8F0",background:"#fff",cursor:"pointer",fontSize:"13px",color:"#64748B"}}>Çıkış</button>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 40px"}}>

        {/* FORMAT */}
        <div style={{marginBottom:"24px"}}>
          <div style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>Platform ve Format Seç</div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {formats.map(f=>(
              <button key={f.id} onClick={()=>setFormat(f.id)} style={{padding:"10px 20px",borderRadius:"10px",border:`1.5px solid ${format===f.id?"#EC4899":"#E2E8F0"}`,background:format===f.id?"#FFF0F7":"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"18px"}}>{f.icon}</span>
                <div>
                  <div style={{fontSize:"13px",fontWeight:700,color:format===f.id?"#EC4899":"#0F172A"}}>{f.label}</div>
                  <div style={{fontSize:"11px",color:"#94A3B8"}}>{f.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ANALİZ */}
        <div style={{background:"#fff",borderRadius:"16px",padding:"24px",border:"1px solid #F1F5F9",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:"24px"}}>
          <div style={{fontSize:"15px",fontWeight:700,color:"#0F172A",marginBottom:"4px"}}>🔗 URL veya Konu Analizi</div>
          <div style={{fontSize:"13px",color:"#94A3B8",marginBottom:"16px"}}>Web sitesi linki veya konu yazın (örn: "travel istanbul", "teknoloji startup")</div>
          <div style={{display:"flex",gap:"10px"}}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleAnalyze()}
              placeholder="https://sirketiniz.com veya 'travel istanbul'"
              style={{flex:1,padding:"12px 16px",borderRadius:"10px",border:"1.5px solid #E2E8F0",fontSize:"14px",outline:"none",color:"#0F172A",background:"#fff"}}
            />
            <button
              onClick={handleAnalyze}
              disabled={!input.trim()||isAnalyzing||credits<=0}
              style={{padding:"12px 24px",borderRadius:"10px",background:credits>0?"linear-gradient(135deg,#EC4899,#F97316)":"#E2E8F0",color:credits>0?"#fff":"#94A3B8",fontSize:"14px",fontWeight:700,border:"none",cursor:credits>0?"pointer":"not-allowed",whiteSpace:"nowrap"}}
            >
              {isAnalyzing?"Analiz ediliyor...":credits<=0?"Kredi bitti":"Analiz Et →"}
            </button>
          </div>
          {error&&<div style={{marginTop:"12px",padding:"10px 14px",borderRadius:"8px",background:"#FFF1F2",color:"#E11D48",fontSize:"13px"}}>{error}</div>}
        </div>

        {/* SENARYOLAR */}
        {scenarios&&(
          <div style={{marginBottom:"24px"}}>
            <div style={{fontSize:"15px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>🎬 Senaryo Önerileri</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"12px"}}>
              {scenarios.map(s=>(
                <button key={s.id} onClick={()=>setSelectedId(s.id)} style={{padding:"20px",borderRadius:"12px",border:`1.5px solid ${selectedId===s.id?"#EC4899":"#E2E8F0"}`,background:selectedId===s.id?"#FFF0F7":"#fff",cursor:"pointer",textAlign:"left"}}>
                  <div style={{fontSize:"11px",fontWeight:700,color:"#EC4899",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>{s.style} · {s.duration}</div>
                  <div style={{fontSize:"14px",fontWeight:700,color:"#0F172A",marginBottom:"6px"}}>{s.title}</div>
                  <div style={{fontSize:"13px",color:"#64748B",lineHeight:1.6}}>{s.summary}</div>
                </button>
              ))}
            </div>
            <div style={{marginTop:"16px",display:"flex",justifyContent:"flex-end",gap:"12px",alignItems:"center"}}>
              {renderMessage&&<div style={{fontSize:"13px",color:"#16A34A",background:"#F0FDF4",padding:"8px 14px",borderRadius:"8px"}}>{renderMessage}</div>}
              <button onClick={handleRender} disabled={!selectedId||isRendering} style={{padding:"12px 28px",borderRadius:"10px",background:selectedId?"linear-gradient(135deg,#EC4899,#F97316)":"#E2E8F0",color:selectedId?"#fff":"#94A3B8",fontSize:"14px",fontWeight:700,border:"none",cursor:selectedId?"pointer":"not-allowed"}}>
                {isRendering?"İşleniyor...":"🎬 Medya Getir"}
              </button>
            </div>

            {videos.length > 0 && (
              <div style={{marginTop:"24px"}}>
                <div style={{fontSize:"14px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>🎥 Stok Videolar ({videos.length})</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"12px"}}>
                  {videos.map((v,i)=>(
                    <video key={i} controls style={{width:"100%",borderRadius:"12px",border:"1px solid #F1F5F9"}} src={v} />
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div style={{marginTop:"24px"}}>
                <div style={{fontSize:"14px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>🖼️ Stok Görseller ({images.length})</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px"}}>
                  {images.map((img,i)=>(
                    <img key={i} src={img} alt="" style={{width:"100%",borderRadius:"12px",border:"1px solid #F1F5F9",objectFit:"cover",height:"200px"}} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ARAÇLAR */}
        <div>
          <div style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>AI Sihirli Araçlar</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px"}}>
            {tools.map(t=>(
              <div key={t.label} style={{padding:"20px",borderRadius:"12px",border:"1px solid #F1F5F9",background:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.03)"}}>
                <div style={{fontSize:"28px",marginBottom:"10px"}}>{t.icon}</div>
                <div style={{fontSize:"13px",fontWeight:700,color:"#0F172A",marginBottom:"4px"}}>{t.label}</div>
                <div style={{fontSize:"12px",color:"#94A3B8",marginBottom:"10px"}}>{t.desc}</div>
                <div style={{fontSize:"11px",color:"#EC4899",fontWeight:600}}>Yakında →</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
