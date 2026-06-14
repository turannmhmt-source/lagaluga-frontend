"use client";
import { useState } from "react";
import { api } from "@/lib/api";

type Scenario = { id: string; title: string; summary: string; style: string; duration: string; };

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]|null>(null);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderMessage, setRenderMessage] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [format, setFormat] = useState("9:16");

  const handleAnalyze = async () => {
    if (!url.trim() || isAnalyzing) return;
    setIsAnalyzing(true); setScenarios(null); setSelectedId(null); setError(null);
    try {
      const response = await api.post<{scenarios: Scenario[]}>("/projects/analyze", { url });
      setScenarios(response.data.scenarios);
    } catch {
      setError("Backend bağlantısı kurulamadı. Railway servisini kontrol edin.");
    } finally { setIsAnalyzing(false); }
  };

  const handleRender = async () => {
    if (!selectedId || isRendering) return;
    setIsRendering(true); setRenderMessage(null);
    try {
      await api.post(`/scenarios/${selectedId}/render`);
      setRenderMessage("Video kuyruğa alındı! Hazır olduğunda bildirim alacaksınız.");
    } catch { setError("Render başlatılamadı."); }
    finally { setIsRendering(false); }
  };

  const formats = [
    { id: "9:16", label: "9:16", sub: "TikTok / Reels", icon: "📱" },
    { id: "16:9", label: "16:9", sub: "YouTube", icon: "🖥️" },
    { id: "1:1", label: "1:1", sub: "Instagram", icon: "⬛" },
  ];

  const tools = [
    { icon: "🎨", label: "AI Nesne Silici", desc: "Görselden nesne kaldır" },
    { icon: "✏️", label: "Yazı Değiştirici", desc: "Font koruyarak değiştir" },
    { icon: "💬", label: "Otomatik Altyazı", desc: "AI altyazı eşle" },
    { icon: "🎵", label: "AI Seslendirme", desc: "Türkçe ses üret" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#FAFAFA",fontFamily:"Inter,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* NAV */}
      <nav style={{background:"rgba(255,255,255,0.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid #F1F5F9",padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{fontSize:"22px",fontWeight:900}}>laga<span style={{color:"#EC4899"}}>luga</span></div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{background:"linear-gradient(135deg,#FFF0F7,#FFF7ED)",border:"1px solid rgba(236,72,153,0.2)",borderRadius:"100px",padding:"4px 14px",fontSize:"13px",color:"#EC4899",fontWeight:600}}>⚡ 3 Kredi</div>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg,#EC4899,#F97316)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:"14px"}}>U</div>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 40px"}}>

        {/* FORMAT BUTONLARI */}
        <div style={{marginBottom:"24px"}}>
          <div style={{fontSize:"13px",fontWeight:600,color:"#64748B",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>Video Formatı</div>
          <div style={{display:"flex",gap:"10px"}}>
            {formats.map(f=>(
              <button key={f.id} onClick={()=>setFormat(f.id)} style={{padding:"10px 20px",borderRadius:"10px",border:`1.5px solid ${format===f.id?"#EC4899":"#E2E8F0"}`,background:format===f.id?"#FFF0F7":"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",transition:"all 0.2s"}}>
                <span style={{fontSize:"18px"}}>{f.icon}</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:"13px",fontWeight:700,color:format===f.id?"#EC4899":"#0F172A"}}>{f.label}</div>
                  <div style={{fontSize:"11px",color:"#94A3B8"}}>{f.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* URL ANALİZ */}
        <div style={{background:"#fff",borderRadius:"16px",padding:"24px",border:"1px solid #F1F5F9",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",marginBottom:"24px"}}>
          <div style={{fontSize:"15px",fontWeight:700,color:"#0F172A",marginBottom:"4px"}}>🔗 Web Sitesi Analizi</div>
          <div style={{fontSize:"13px",color:"#94A3B8",marginBottom:"16px"}}>URL girin, AI içeriği analiz edip 3 video senaryosu önersin</div>
          <div style={{display:"flex",gap:"10px"}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAnalyze()} placeholder="https://sirketiniz.com" style={{flex:1,padding:"12px 16px",borderRadius:"10px",border:"1.5px solid #E2E8F0",fontSize:"14px",outline:"none"}} />
            <button onClick={handleAnalyze} disabled={!url.trim()||isAnalyzing} style={{padding:"12px 24px",borderRadius:"10px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",fontSize:"14px",fontWeight:700,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>
              {isAnalyzing?"Analiz ediliyor...":"Analiz Et →"}
            </button>
          </div>
          {error&&<div style={{marginTop:"12px",padding:"10px 14px",borderRadius:"8px",background:"#FFF1F2",color:"#E11D48",fontSize:"13px"}}>{error}</div>}
        </div>

        {/* SENARYOLAR */}
        {scenarios&&(
          <div style={{marginBottom:"24px"}}>
            <div style={{fontSize:"15px",fontWeight:700,color:"#0F172A",marginBottom:"12px"}}>🎬 Senaryo Önerileri</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
              {scenarios.map(s=>(
                <button key={s.id} onClick={()=>setSelectedId(s.id)} style={{padding:"20px",borderRadius:"12px",border:`1.5px solid ${selectedId===s.id?"#EC4899":"#E2E8F0"}`,background:selectedId===s.id?"#FFF0F7":"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                  <div style={{fontSize:"11px",fontWeight:600,color:"#EC4899",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"8px"}}>{s.style} · {s.duration}</div>
                  <div style={{fontSize:"14px",fontWeight:700,color:"#0F172A",marginBottom:"6px"}}>{s.title}</div>
                  <div style={{fontSize:"13px",color:"#64748B",lineHeight:1.6}}>{s.summary}</div>
                </button>
              ))}
            </div>
            <div style={{marginTop:"16px",display:"flex",justifyContent:"flex-end",gap:"12px",alignItems:"center"}}>
              {renderMessage&&<div style={{fontSize:"13px",color:"#16A34A",background:"#F0FDF4",padding:"8px 14px",borderRadius:"8px"}}>{renderMessage}</div>}
              <button onClick={handleRender} disabled={!selectedId||isRendering} style={{padding:"12px 28px",borderRadius:"10px",background:selectedId?"linear-gradient(135deg,#EC4899,#F97316)":"#E2E8F0",color:selectedId?"#fff":"#94A3B8",fontSize:"14px",fontWeight:700,border:"none",cursor:selectedId?"pointer":"not-allowed"}}>
                {isRendering?"İşleniyor...":"🎬 Video Üret"}
              </button>
            </div>
          </div>
        )}

        {/* AI ARAÇLAR */}
        <div style={{marginBottom:"24px"}}>
          <div style={{fontSize:"13px",fontWeight:600,color:"#64748B",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>AI Sihirli Araçlar</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
            {tools.map(t=>(
              <button key={t.label} style={{padding:"20px",borderRadius:"12px",border:"1px solid #F1F5F9",background:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.2s",boxShadow:"0 2px 6px rgba(0,0,0,0.03)"}}>
                <div style={{fontSize:"28px",marginBottom:"10px"}}>{t.icon}</div>
                <div style={{fontSize:"13px",fontWeight:700,color:"#0F172A",marginBottom:"4px"}}>{t.label}</div>
                <div style={{fontSize:"12px",color:"#94A3B8"}}>{t.desc}</div>
                <div style={{marginTop:"10px",fontSize:"11px",color:"#EC4899",fontWeight:600}}>Yakında →</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}