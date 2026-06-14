"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) setMessage(error.message);
      else setMessage("Aktivasyon maili gönderildi! E-postanızı kontrol edin.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#FFF0F7,#FFF7ED)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif"}}>
      <div style={{background:"#fff",borderRadius:"24px",padding:"48px",width:"420px",boxShadow:"0 20px 60px rgba(236,72,153,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontSize:"28px",fontWeight:900,color:"#0F172A"}}>laga<span style={{color:"#EC4899"}}>luga</span></div>
          <div style={{fontSize:"14px",color:"#94A3B8",marginTop:"6px"}}>{mode==="login"?"Hesabınıza giriş yapın":"Ücretsiz hesap oluşturun"}</div>
        </div>
        {mode==="register"&&(
          <div style={{marginBottom:"16px"}}>
            <label style={{fontSize:"13px",fontWeight:600,color:"#374151",display:"block",marginBottom:"6px"}}>Ad Soyad</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Adınız Soyadınız" style={{width:"100%",padding:"12px 16px",borderRadius:"10px",border:"1.5px solid #E5E7EB",fontSize:"14px",outline:"none"}} />
          </div>
        )}
        <div style={{marginBottom:"16px"}}>
          <label style={{fontSize:"13px",fontWeight:600,color:"#374151",display:"block",marginBottom:"6px"}}>E-posta</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@email.com" style={{width:"100%",padding:"12px 16px",borderRadius:"10px",border:"1.5px solid #E5E7EB",fontSize:"14px",outline:"none"}} />
        </div>
        <div style={{marginBottom:"24px"}}>
          <label style={{fontSize:"13px",fontWeight:600,color:"#374151",display:"block",marginBottom:"6px"}}>Şifre</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{width:"100%",padding:"12px 16px",borderRadius:"10px",border:"1.5px solid #E5E7EB",fontSize:"14px",outline:"none"}} />
        </div>
        {message&&<div style={{padding:"12px",borderRadius:"10px",background:message.includes("Aktivasyon")?"#F0FDF4":"#FFF1F2",color:message.includes("Aktivasyon")?"#16A34A":"#E11D48",fontSize:"13px",marginBottom:"16px"}}>{message}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:"10px",background:"linear-gradient(135deg,#EC4899,#F97316)",color:"#fff",fontSize:"15px",fontWeight:700,border:"none",cursor:"pointer"}}>
          {loading?"Yükleniyor...":(mode==="login"?"Giriş Yap":"Hesap Oluştur")}
        </button>
        <div style={{textAlign:"center",marginTop:"20px",fontSize:"13px",color:"#94A3B8"}}>
          {mode==="login"?"Hesabınız yok mu? ":"Zaten hesabınız var mı? "}
          <span onClick={()=>setMode(mode==="login"?"register":"login")} style={{color:"#EC4899",fontWeight:600,cursor:"pointer"}}>
            {mode==="login"?"Kayıt Ol":"Giriş Yap"}
          </span>
        </div>
      </div>
    </div>
  );
}