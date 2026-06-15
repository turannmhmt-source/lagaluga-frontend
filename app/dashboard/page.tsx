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

const FORMAT_SPECS: Record<string, {label:string;icon:string;sub:string}> = {
  "9:16-reels":  { label:"Reels",   icon:"📱", sub:"1080×1920 · Instagram Reels" },
  "9:16-tiktok": { label:"TikTok",  icon:"🎵", sub:"1080×1920 · TikTok Video" },
  "9:16-story":  { label:"Hikaye",  icon:"⭕", sub:"1080×1920 · IG/WA Hikaye" },
  "16:9":        { label:"YouTube", icon:"▶️", sub:"1920×1080 · YouTube Video" },
  "1:1":         { label:"Gönderi", icon:"⬛", sub:"1080×1080 · Instagram/LinkedIn" },
  "9:16-shorts": { label:"Shorts",  icon:"🩳", sub:"1080×1920 · YouTube Shorts" },
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(3);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]|null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderMessage, setRenderMessage] = useState<string|null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [renderedVideo, setRenderedVideo] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string|null>(null);
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
    setIsAnalyzing(true);
    setScenarios(null); setSelectedId(null); setError(null);
    setScreenshots([]); setVideos([]); setImages([]); setRenderedVideo("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: isUrl(input) ? input : `topic:${input}`, format })
      });
      if (!res.ok) throw new Error("API hatası");
      const data = await res.json();
      setScenarios(data.scenarios);
      if (data.screenshots?.length > 0) setScreenshots(data.screenshots);
      setCredits(c => Math.max(0, c - 1));
    } catch {
      setError("Analiz sırasında hata oluştu. Lütfen tekrar deneyin.");
    } finally { setIsAnalyzing(false); }
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;
    setIsRendering(true);
    setVideos([]); setImages([]); setRenderedVideo("");
    const sel = scenarios?.find(s => s.id === selectedId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scenarios/${selectedId}/render`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: input, format,
            title: sel?.title || "",
            summary: sel?.summary || "",
            duration: sel?.duration || "0:30",
            screenshots: screenshots
          })
        }
      );
      const data = await res.json();
      setRenderMessage(data.message);
      if (data.videos?.length > 0) setVideos(data.videos);
      if (data.images?.length > 0) setImages(data.images);
      if (data.rendered_video) setRenderedVideo(data.rendered_video);
    } catch { setError("Medya getirilemedi."); }
    finally { setIsRendering(false); }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    } catch { alert("İndirme başarısız oldu."); }
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

  const tools = [
    { icon:"🎨", label:"AI Nesne Silici", desc:"Görselden nesne kaldır" },
    { icon:"✏️", label:"Yazı Değiştirici", desc:"Font koruyarak metin düzenle" },
    { icon:"💬", label:"Otomatik Altyazı", desc:"AI ile altyazı oluştur" },
    { icon:"🎵", label:"AI Seslendirme", desc:"Türkçe ses üret" },
    { icon:"🎤", label:"Stüdyo Kalitesi", desc:"Amatör sesi profesyonele dönüştür" },
    { icon:"📤", label:"Sosyal Medya", desc:"Direkt paylaş" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#F8FAFC",fontFamily:"Inter,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #CBD5E1; }
        .hover-scale { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .hover-scale:hover { transform: scale(1.02); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
      `}</style>

      {selectedImage && (
        <div onClick={()=>setSelectedImage(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",maxWidth:"90vw",maxHeight:"90vh",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
            <img src={selectedImage} alt="" style={{maxWidth:"100%",maxHeight:"80vh",borderRadius:"12px",objectFit:"contain"}} />
            <div style={{display:"flex",gap:"12px"}}>
              <button onClick={()=>handleDownload(selectedImage,`gorsel-${Date.now()}.jpg`)} style={{padding:"10px 24px",borderRadius:"8px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",border:"none",cursor:"pointer",fontWeight:700,fontSize:"14px"}}>⬇️ İndir</button>
              <button onClick={()=>setSelectedImage(null)} style={{padding:"10px 24px",borderRadius:"8px",background:"rgba(255,255,255,0.2)",color:"#fff",border:"none",cursor:"pointer",fontSize:"14px"}}>✕ Kapat</button>
            </div>
          </div>
        </div>
      )}

      <nav style={{background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid #F1F5F9",padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{fontSize:"22px",fontWeight:900,color:"#0F172A"}}>laga<span style={{color:"#EC4899"}}>luga</span></div>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{background:"#FFF0F7",border:"1px solid rgba(236,72,153,0.2)",borderRadius:"100px",padding:"6px 16px",fontSize:"13px",color:"#EC4899",fontWeight:700}}>⚡ {credits} Kredi</div>
          <div style={{fontSize:"13px",color:"#64748B"}}>{user.email}</div>
          <button onClick={handleLogout} style={{padding:"8px 16px",borderRadius:"8px",border:"1px solid #E2E8F0",background:"#fff",cursor:"pointer",fontSize:"13px",color:"#64748B"}}>Çıkış</button>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 40px"}}>

        <div style={{marginBottom:"24px"}}>
          <div style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>Platform ve Format Seç</div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {Object.entries(FORMAT_SPECS).map(([id,f])=>(
              <button key={id} onClick={()=>setFormat(id)} style={{padding:"10px 20px",borderRadius:"10px",border:`1.5px solid ${format===id?"#EC4899":"#E2E8F0"}`,background:format===id?"#FFF0F7":"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"18px"}}>{f.icon}</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:"13px",fontWeight:700,color:format===id?"#EC4899":"#0F172A"}}>{f.label}</div>
                  <div style={{fontSize:"10px",color:"#94A3B8"}}>{f.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{background:"#fff",borderRadius:"16px",padding:"24px",border:"1px solid #F1F5F9",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:"24px"}}>
          <div style={{fontSize:"15px",fontWeight:700,color:"#0F172A",marginBottom:"4px"}}>🔗 URL veya Konu Analizi</div>
          <div style={{fontSize:"13px",color:"#94A3B8",marginBottom:"16px"}}>Web sitesi linki veya konu yazın. Sistem siteyi analiz edip hizmetlerinizi tanıtan video senaryoları oluşturur.</div>
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

        {screenshots.length > 0 && (
          <div style={{marginBottom:"24px"}}>
            <div style={{fontSize:"14px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>🖥️ Site Ekran Görüntüleri</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"12px"}}>
              {screenshots.map((s,i)=>(
                <div key={i} className="hover-scale" onClick={()=>setSelectedImage(s)} style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #F1F5F9"}}>
                  <img src={s} alt="" style={{width:"100%",height:"180px",objectFit:"cover",display:"block"}} />
                </div>
              ))}
            </div>
          </div>
        )}

        {scenarios && (
          <div style={{marginBottom:"24px"}}>
            <div style={{fontSize:"15px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>🎬 Video Senaryoları</div>
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
                {isRendering?"Video hazırlanıyor...":"🎬 Video Üret"}
              </button>
            </div>

            {renderedVideo && (
              <div style={{marginTop:"24px",background:"#F0FDF4",borderRadius:"16px",padding:"20px",border:"1px solid #BBF7D0"}}>
                <div style={{fontSize:"15px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>✅ Hazırlanan Video</div>
                <video controls style={{width:"100%",maxWidth:"400px",maxHeight:"500px",borderRadius:"12px"}} src={renderedVideo} />
                <div style={{marginTop:"12px"}}>
                  <button onClick={()=>handleDownload(renderedVideo,`lagaluga-${Date.now()}.mp4`)} style={{padding:"10px 24px",borderRadius:"8px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",border:"none",cursor:"pointer",fontSize:"14px",fontWeight:700}}>
                    ⬇️ Bilgisayara İndir
                  </button>
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div style={{marginTop:"24px"}}>
                <div style={{fontSize:"14px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>🎥 Stok Videolar ({videos.length})</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px"}}>
                  {videos.map((v,i)=>(
                    <div key={i} className="hover-scale" style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #F1F5F9",background:"#fff"}}>
                      <video controls style={{width:"100%",height:"160px",objectFit:"cover"}} src={v} />
                      <div style={{padding:"8px"}}>
                        <button onClick={()=>handleDownload(v,`stok-video-${i+1}.mp4`)} style={{width:"100%",padding:"6px",borderRadius:"6px",background:"#FFF0F7",color:"#EC4899",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:600}}>⬇️ İndir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div style={{marginTop:"24px"}}>
                <div style={{fontSize:"14px",fontWeight:700,color:"#0F172A",marginBottom:"8px"}}>🖼️ Stok Görseller ({images.length}) — tıklayarak büyütün</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px"}}>
                  {images.map((img,i)=>(
                    <div key={i} className="hover-scale" onClick={()=>setSelectedImage(img)} style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #F1F5F9"}}>
                      <img src={img} alt="" style={{width:"100%",height:"160px",objectFit:"cover",display:"block"}} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <div style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>AI Sihirli Araçlar</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"12px"}}>
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
