import { useEffect, useState, useCallback } from "react";

const API = "https://vortex-server-production-606d.up.railway.app";s
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080b10;--bg2:#0d1018;--bg3:#121620;--sf:#161b26;--sf2:#1c2130;
  --br:#232840;--br2:#2e3550;--tx:#dde2f0;--mu:#5a6080;--mu2:#7a80a0;
  --ac:#00d4ff;--ac2:#7c3aed;--gn:#10b981;--am:#f59e0b;--rd:#ef4444;
  --pk:#ec4899;--cy:#06b6d4;
  --fn:"Syne",sans-serif;--mo:"JetBrains Mono",monospace;
}
html,body,#root{height:100%;overflow:hidden;background:var(--bg);color:var(--tx);font-family:var(--fn);font-size:13px}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:var(--br);border-radius:2px}
body::after{content:"";position:fixed;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.02) 2px,rgba(0,0,0,.02) 4px);pointer-events:none;z-index:9999}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes ping{0%{transform:scale(.8);opacity:1}100%{transform:scale(2);opacity:0}}
@keyframes gridmove{from{background-position:0 0}to{background-position:40px 40px}}
`;
if (!document.getElementById("eg-css")) {
  const s = document.createElement("style");
  s.id = "eg-css"; s.textContent = CSS;
  document.head.appendChild(s);
}

const V = {
  bg:"#080b10",bg2:"#0d1018",bg3:"#121620",sf:"#161b26",sf2:"#1c2130",
  br:"#232840",br2:"#2e3550",tx:"#dde2f0",mu:"#5a6080",mu2:"#7a80a0",
  ac:"#00d4ff",ac2:"#7c3aed",gn:"#10b981",am:"#f59e0b",rd:"#ef4444",
  pk:"#ec4899",cy:"#06b6d4",
};

const Dot = ({ c = V.gn, pulse }) => (
  <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`,flexShrink:0,animation:pulse?"pulse 2s infinite":undefined}}/>
);

const Bdg = ({ label, type = "ok" }) => {
  const map = {
    ok:  {bg:"rgba(16,185,129,.12)", c:V.gn, border:"rgba(16,185,129,.22)"},
    warn:{bg:"rgba(245,158,11,.1)",  c:V.am, border:"rgba(245,158,11,.22)"},
    crit:{bg:"rgba(239,68,68,.1)",   c:V.rd, border:"rgba(239,68,68,.18)"},
    info:{bg:"rgba(0,212,255,.08)",  c:V.ac, border:"rgba(0,212,255,.18)"},
    blk: {bg:"rgba(239,68,68,.15)",  c:V.rd, border:"rgba(239,68,68,.28)"},
    pu:  {bg:"rgba(124,58,237,.15)", c:"#a78bfa", border:"rgba(124,58,237,.25)"},
    off: {bg:"rgba(239,68,68,.1)",   c:V.rd, border:"rgba(239,68,68,.18)"},
  };
  const s = map[type] || map.ok;
  return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 6px",borderRadius:8,fontFamily:V.mo,fontSize:8,fontWeight:500,whiteSpace:"nowrap",background:s.bg,color:s.c,border:`1px solid ${s.border}`}}>{label}</span>;
};

const MiniBar = ({ pct, color }) => {
  const col = pct > 85 ? V.rd : pct > 65 ? V.am : (color || V.gn);
  return (
    <div style={{flex:1,height:4,background:V.bg3,borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(pct||0,100)}%`,background:col,borderRadius:2,transition:"width .5s"}}/>
    </div>
  );
};

const Panel = ({ children, style }) => (
  <div style={{background:V.sf,border:`1px solid ${V.br}`,borderRadius:10,overflow:"hidden",marginBottom:9,...style}}>
    {children}
  </div>
);

const PanelHd = ({ icon, children, right }) => (
  <div style={{padding:"9px 13px",borderBottom:`1px solid ${V.br}`,display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:700,color:V.tx}}>
    <span style={{opacity:.5,fontSize:11}}>{icon}</span>
    <span style={{flex:1}}>{children}</span>
    {right && <div style={{display:"flex",alignItems:"center",gap:5}}>{right}</div>}
  </div>
);

const StatCard = ({ label, value, color = V.ac, sub, accent }) => (
  <div style={{background:V.sf,border:`1px solid ${V.br}`,borderRadius:10,padding:"12px 14px",position:"relative",overflow:"hidden",transition:"border-color .2s",cursor:"default"}}
    onMouseEnter={e => e.currentTarget.style.borderColor=V.br2}
    onMouseLeave={e => e.currentTarget.style.borderColor=V.br}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:accent||color,borderRadius:"10px 10px 0 0"}}/>
    <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>{label}</div>
    <div style={{fontSize:24,fontWeight:800,letterSpacing:-1,lineHeight:1,marginBottom:3,color}}>{value ?? "—"}</div>
    {sub && <div style={{fontFamily:V.mo,fontSize:7,color:V.mu}}>{sub}</div>}
  </div>
);

const LiveBadge = () => (
  <span style={{fontFamily:V.mo,fontSize:8,padding:"2px 6px",borderRadius:8,background:"rgba(16,185,129,.12)",color:V.gn,border:"1px solid rgba(16,185,129,.2)",animation:"blink 2s infinite"}}>● LIVE</span>
);

const Tbl = ({ cols, rows, empty = "No data" }) => (
  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
      <thead>
        <tr>
          {cols.map(c => <th key={c} style={{fontFamily:V.mo,fontSize:7,textTransform:"uppercase",letterSpacing:.8,color:V.mu,padding:"6px 9px",textAlign:"left",borderBottom:`1px solid ${V.br}`,whiteSpace:"nowrap"}}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{padding:24,textAlign:"center",fontFamily:V.mo,fontSize:9,color:V.mu}}>{empty}</td></tr>
          : rows}
      </tbody>
    </table>
  </div>
);

const TR = ({ children, danger }) => (
  <tr style={{borderBottom:`1px solid ${V.br}`,background:danger?"rgba(239,68,68,.04)":"transparent",transition:"background .1s"}}
    onMouseEnter={e => e.currentTarget.style.background = danger ? "rgba(239,68,68,.07)" : V.sf2}
    onMouseLeave={e => e.currentTarget.style.background = danger ? "rgba(239,68,68,.04)" : "transparent"}>
    {children}
  </tr>
);

const TD = ({ ch, color, mono, bold, maxW, title }) => (
  <td style={{padding:"6px 9px",color:color||V.tx,fontFamily:mono?V.mo:V.fn,fontWeight:bold?700:400,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",...(maxW?{maxWidth:maxW}:{})}} title={title}>
    {ch}
  </td>
);

const Btn = ({ children, onClick, primary, danger, sm }) => (
  <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:4,padding:sm?"3px 8px":"5px 10px",borderRadius:6,fontSize:sm?9:10,cursor:"pointer",border:`1px solid ${danger?"rgba(239,68,68,.3)":primary?V.ac:V.br}`,background:danger?"rgba(239,68,68,.15)":primary?V.ac:V.sf,color:danger?V.rd:primary?"#000":V.tx,fontFamily:V.fn,transition:"all .15s",fontWeight:primary||danger?700:400,whiteSpace:"nowrap"}}
    onMouseEnter={e => e.currentTarget.style.filter="brightness(1.15)"}
    onMouseLeave={e => e.currentTarget.style.filter="brightness(1)"}>
    {children}
  </button>
);

const SearchInput = ({ placeholder, onChange }) => (
  <div style={{display:"flex",alignItems:"center",gap:5,background:V.sf,border:`1px solid ${V.br}`,borderRadius:6,padding:"4px 8px",width:165}}>
    <span style={{color:V.mu,fontSize:11}}>⌕</span>
    <input type="text" placeholder={placeholder} onChange={e=>onChange(e.target.value)}
      style={{background:"none",border:"none",outline:"none",color:V.tx,fontFamily:V.mo,fontSize:9,flex:1,minWidth:0}}/>
  </div>
);

const Toggle = ({ on, onClick }) => (
  <div onClick={onClick} style={{display:"inline-flex",width:26,height:15,borderRadius:8,background:on?V.gn:V.br,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
    <div style={{position:"absolute",width:11,height:11,borderRadius:"50%",background:"#fff",top:2,left:2,transition:"transform .2s",transform:on?"translateX(11px)":"none"}}/>
  </div>
);

const FwChip = ({ label, value }) => {
  const on = value === "ON";
  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:4,background:on?"rgba(16,185,129,.08)":"rgba(239,68,68,.08)",border:`1px solid ${on?"rgba(16,185,129,.22)":"rgba(239,68,68,.22)"}`}}>
      <Dot c={on?V.gn:V.rd}/>
      <span style={{fontFamily:V.mo,fontSize:8,color:on?V.gn:V.rd,letterSpacing:.5}}>{label}</span>
    </div>
  );
};

const Toast = ({ msg, type, onClose }) => {
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t)},[onClose]);
  const col = type==="error"?V.rd:type==="warn"?V.am:V.gn;
  return (
    <div style={{padding:"9px 14px",borderRadius:6,marginBottom:6,background:V.sf,border:`1px solid ${V.br}`,borderLeft:`3px solid ${col}`,fontFamily:V.mo,fontSize:9,color:V.tx,animation:"fadein .3s ease",display:"flex",gap:8,alignItems:"center",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
      <span style={{color:col}}>{type==="error"?"✕":"✓"}</span>{msg}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{background:V.bg2,border:`1px solid ${V.br2}`,borderRadius:10,width:460,padding:"24px 28px",position:"relative",boxShadow:"0 0 60px rgba(0,0,0,.6)"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${V.rd},transparent)`,borderRadius:"10px 10px 0 0"}}/>
      <div style={{fontSize:14,fontWeight:800,color:V.rd,marginBottom:18}}>{title}</div>
      {children}
      <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:V.mu,cursor:"pointer",fontSize:16,lineHeight:1}}>✕</button>
    </div>
  </div>
);

const ModalInput = ({ label, value, set, placeholder }) => (
  <div style={{marginBottom:12}}>
    <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{label}</div>
    <input value={value} onChange={e=>set(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"8px 10px",background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:10,outline:"none",transition:"border-color .15s"}}
      onFocus={e=>e.target.style.borderColor=V.rd}
      onBlur={e=>e.target.style.borderColor=V.br}/>
  </div>
);

/* ════════ LOGIN ════════ */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [loading,setL]    = useState(false);

  const handle = () => {
    setL(true);
    setTimeout(() => {
      if (email==="admin@gmail.com" && pass==="1234") { onLogin(); }
      else { setErr("Access denied. Invalid credentials."); setL(false); }
    }, 800);
  };

  return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:V.bg,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${V.br}66 1px,transparent 1px),linear-gradient(90deg,${V.br}66 1px,transparent 1px)`,backgroundSize:"40px 40px",animation:"gridmove 10s linear infinite",opacity:.35}}/>
      <div style={{position:"relative",width:360,background:V.bg2,border:`1px solid ${V.br2}`,borderRadius:12,padding:"36px 32px",boxShadow:"0 0 80px rgba(0,0,0,.6)",animation:"fadein .5s ease"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${V.ac},transparent)`,opacity:.3,borderRadius:"12px 12px 0 0"}}/>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:42,height:42,margin:"0 auto 12px",borderRadius:10,background:`linear-gradient(135deg,${V.ac2},${V.ac})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",boxShadow:`0 0 20px rgba(0,212,255,.3)`}}>EG</div>
          <div style={{fontSize:16,fontWeight:800,letterSpacing:-1,color:V.ac}}>ENDPOINT<span style={{color:V.mu2,fontWeight:400,fontSize:12}}> GUARDIAN</span></div>
          <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:4,letterSpacing:1}}>ENTERPRISE SECURITY CONSOLE</div>
        </div>
        {[{label:"Email Address",val:email,set:setEmail,type:"email"},{label:"Password",val:pass,set:setPass,type:"password"}].map(f=>(
          <div key={f.label} style={{marginBottom:12}}>
            <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{f.label}</div>
            <input type={f.type} value={f.val}
              onChange={e=>{f.set(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&handle()}
              placeholder={f.type==="email"?"admin@gmail.com":"••••••••"}
              style={{width:"100%",padding:"8px 10px",background:V.bg3,border:`1px solid ${V.br}`,borderRadius:6,color:V.tx,fontFamily:V.mo,fontSize:10,outline:"none",transition:"border-color .15s"}}
              onFocus={e=>e.target.style.borderColor=V.ac}
              onBlur={e=>e.target.style.borderColor=V.br}/>
          </div>
        ))}
        {err && <div style={{padding:"6px 10px",marginBottom:10,borderRadius:4,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:V.rd,fontFamily:V.mo,fontSize:8}}>{err}</div>}
        <button onClick={handle} disabled={loading}
          style={{width:"100%",padding:"9px",background:loading?V.sf:V.ac,color:loading?V.mu:"#000",border:`1px solid ${loading?V.br:V.ac}`,borderRadius:6,cursor:loading?"not-allowed":"pointer",fontFamily:V.fn,fontSize:11,fontWeight:700,letterSpacing:.5,transition:"all .2s",marginTop:4}}>
          {loading?"Authenticating…":"Sign In"}
        </button>
        <div style={{marginTop:14,textAlign:"center",fontFamily:V.mo,fontSize:7,color:V.mu}}>
          ENDPOINT GUARDIAN v2.0 · ALL SESSIONS MONITORED · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

/* ════════ SHELL ════════ */
function Shell({ children, stats, alerts, onLogout, activeTab, setTab, threatCount }) {
  const [time, setTime] = useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t)},[]);

  const isBlacklisted = stats?.is_blacklisted;
  const agentStatus   = isBlacklisted?"BLACKLISTED":(stats?.agent_status||"PROTECTED");
  const statusColor   = agentStatus==="PROTECTED"?V.gn:agentStatus==="WARNING"?V.am:V.rd;

  const NAV = [
    {s:"OVERVIEW", items:[
      {id:"dashboard",i:"⬡",l:"Dashboard",badge:alerts.length||null,badgeColor:V.am},
      {id:"clients",  i:"⬢",l:"Clients"},
    ]},
    {s:"MONITORING", items:[
      {id:"network",   i:"~",l:"Network"},
      {id:"processes", i:"◉",l:"Processes"},
      {id:"health",    i:"^",l:"System Health"},
      {id:"urls",      i:"↗",l:"File Activity"},
    ]},
    {s:"SECURITY", items:[
      {id:"threats",   i:"!",l:"Threats",  badge:threatCount||null,badgeColor:V.rd},
      {id:"firewall",  i:"#",l:"Firewall"},
      {id:"blacklist", i:"⊗",l:"Blacklist",color:V.rd},
      {id:"apps",      i:"*",l:"App Control"},
    ]},
    {s:"ANALYTICS", items:[
      {id:"history",i:"◷",l:"History"},
      {id:"audit",  i:"O",l:"Audit Log"},
    ]},
    {s:"ADMIN", items:[
      {id:"settings",i:"#",l:"Settings"},
    ]},
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gridTemplateRows:"52px 1fr",height:"100vh",overflow:"hidden"}}>
      {/* TOPBAR */}
      <div style={{gridColumn:"1/-1",background:V.bg2,borderBottom:`1px solid ${V.br}`,display:"flex",alignItems:"center",padding:"0 18px",gap:9,zIndex:20,position:"relative"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${V.ac},transparent)`,opacity:.2}}/>
        <div style={{fontSize:14,fontWeight:800,letterSpacing:-1,color:V.ac,flexShrink:0,display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:24,height:24,borderRadius:6,background:`linear-gradient(135deg,${V.ac2},${V.ac})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff"}}>EG</div>
          ENDPOINT<span style={{color:V.mu2,fontWeight:400,fontSize:11}}> GUARDIAN</span>
        </div>
        {[
          {c:V.gn,label:`${stats?.process_count||0} PROCS`,pulse:true},
          {c:V.am,label:`${alerts.length||0} ALERTS`},
          {c:V.rd,label:`${threatCount||0} THREATS`},
        ].map(p=>(
          <div key={p.label} style={{display:"flex",alignItems:"center",gap:5,background:V.sf,border:`1px solid ${V.br}`,borderRadius:20,padding:"3px 8px",fontFamily:V.mo,fontSize:9,color:V.mu2,whiteSpace:"nowrap"}}>
            <Dot c={p.c} pulse={p.pulse}/>{p.label}
          </div>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:6,background:V.sf,border:`1px solid ${V.br}`,borderRadius:6,padding:"4px 10px"}}>
          <Dot c={statusColor} pulse={agentStatus==="PROTECTED"}/>
          <span style={{fontFamily:V.mo,fontSize:9,color:statusColor,fontWeight:600,letterSpacing:.5,animation:agentStatus==="BLACKLISTED"?"blink .7s step-end infinite":undefined}}>{agentStatus}</span>
        </div>
        <div style={{fontFamily:V.mo,fontSize:9,color:V.mu2,background:V.sf,border:`1px solid ${V.br}`,borderRadius:6,padding:"4px 8px"}}>
          {time.toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour12:false}).replace(","," ")} IST
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,background:V.sf,border:`1px solid ${V.br}`,borderRadius:6,padding:"4px 8px",fontFamily:V.mo,fontSize:9}}>
          <span style={{color:V.mu}}>RAM</span>
          <span style={{color:stats?.ram_usage>85?V.rd:stats?.ram_usage>65?V.am:V.gn,fontWeight:600}}>{stats?.ram_usage||0}%</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",padding:"3px 7px",borderRadius:6,border:"1px solid transparent",transition:"all .15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=V.sf;e.currentTarget.style.borderColor=V.br;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";}}>
          <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${V.ac2},${V.ac})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>AD</div>
          <div>
            <div style={{fontSize:11,fontWeight:600}}>Admin</div>
            <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,cursor:"pointer"}} onClick={onLogout}>Sign out ⏻</div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div style={{background:V.bg2,borderRight:`1px solid ${V.br}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"10px 12px",borderBottom:`1px solid ${V.br}`}}>
          <div style={{background:V.sf,border:`1px solid ${V.br}`,borderRadius:6,padding:"6px 9px"}}>
            <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Agent Scope</div>
            <div style={{fontSize:10,fontWeight:600}}>{stats?.hostname||"Localhost"}</div>
            <div style={{fontFamily:V.mo,fontSize:8,color:V.ac,marginTop:1}}>{stats?.ip_address||"—"}</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"4px 0"}}>
          {NAV.map(sec=>(
            <div key={sec.s}>
              <div style={{padding:"9px 13px 2px",fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:2}}>{sec.s}</div>
              {sec.items.map(it=>{
                const isAct = activeTab===it.id;
                return (
                  <div key={it.id} onClick={()=>setTab(it.id)}
                    style={{display:"flex",alignItems:"center",gap:7,padding:"7px 13px",cursor:"pointer",borderLeft:`2px solid ${isAct?V.ac:"transparent"}`,transition:"all .12s",fontSize:11,color:isAct?V.ac:(it.color||V.mu2),background:isAct?`linear-gradient(90deg,rgba(0,212,255,.07),transparent)`:"transparent"}}
                    onMouseEnter={e=>{if(!isAct){e.currentTarget.style.background=V.sf;e.currentTarget.style.color=V.tx;}}}
                    onMouseLeave={e=>{if(!isAct){e.currentTarget.style.background="transparent";e.currentTarget.style.color=it.color||V.mu2;}}}>
                    <span style={{width:14,textAlign:"center",flexShrink:0,fontSize:11,opacity:.7}}>{it.i}</span>
                    <span style={{flex:1,fontWeight:isAct?700:400}}>{it.l}</span>
                    {it.badge>0 && <span style={{fontFamily:V.mo,fontSize:7,padding:"1px 5px",borderRadius:8,background:`${it.badgeColor}33`,color:it.badgeColor,border:`1px solid ${it.badgeColor}44`,animation:"blink 1.5s infinite"}}>{it.badge}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{padding:"9px 12px",borderTop:`1px solid ${V.br}`}}>
          <div style={{background:V.sf,border:`1px solid ${V.br}`,borderRadius:6,padding:"6px 9px",display:"flex",gap:7,alignItems:"center"}}>
            <Dot c={V.gn} pulse/>
            <div>
              <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1}}>Agent v2.0</div>
              <div style={{fontFamily:V.mo,fontSize:9,color:V.gn}}>Online · Syncing</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{overflowY:"auto",background:V.bg}}>{children}</div>
    </div>
  );
}

/* ════════ PAGE: DASHBOARD ════════ */
function PageDashboard({ data, stats, threats, alerts, clearAlerts }) {
  const ram = parseFloat(data.ram_usage_percent||0);
  const tc  = {CRITICAL:0,HIGH:0,MEDIUM:0,LOW:0};
  threats.forEach(t=>{if(tc[t.severity]!==undefined)tc[t.severity]++;});
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Dashboard</div>
          <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>{data.hostname||"—"} · {data.logged_in_user||"—"} · Last scan: {data.last_update||"—"}</div>
        </div>
        <Btn onClick={clearAlerts}>✔ Clear Alerts</Btn>
      </div>
      {data.is_blacklisted && (
        <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"7px 13px",marginBottom:11,display:"flex",alignItems:"center",gap:9,fontFamily:V.mo,fontSize:9,animation:"blink .8s step-end infinite"}}>
          <span style={{color:V.rd,fontWeight:700}}>⛔ CRITICAL</span>
          <span style={{color:V.mu}}>|</span>
          <span style={{color:V.tx}}>Device BLACKLISTED — MAC: {data.mac_address}</span>
          <span style={{color:V.mu}}>Reason: {data.blacklist_reason||"—"}</span>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9,marginBottom:11}}>
        {[
          {label:"Total Processes", value:stats?.process_count||0,       color:V.ac, sub:"running",      accent:V.ac},
          {label:"Connections",     value:stats?.connection_count||0,     color:V.gn, sub:"established",  accent:V.gn},
          {label:"Active Threats",  value:threats.length,                 color:threats.length?V.rd:V.gn, sub:threats.length?"needs action":"all clear", accent:threats.length?V.rd:V.gn},
          {label:"RAM Usage",       value:`${ram}%`,                      color:ram>85?V.rd:ram>65?V.am:V.gn, sub:data.total_ram_gb||"—", accent:ram>85?V.rd:ram>65?V.am:V.gn},
          {label:"File Events",     value:stats?.file_events_today||0,    color:V.cy, sub:"today",        accent:V.cy},
        ].map(s=><StatCard key={s.label} {...s}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.7fr 1fr",gap:9,marginBottom:9}}>
        <Panel>
          <PanelHd icon="▶" right={<LiveBadge/>}>Network Traffic — Live</PanelHd>
          <div style={{padding:"11px 13px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:V.br,borderRadius:4,overflow:"hidden",marginBottom:11}}>
              {[{l:"Connections",v:`${stats?.connection_count||0}`,c:V.gn},{l:"Firewall",v:data.firewall_public==="ON"?"ON":"OFF",c:data.firewall_public==="ON"?V.gn:V.rd},{l:"Threats",v:threats.length,c:threats.length?V.rd:V.gn}].map(m=>(
                <div key={m.l} style={{background:V.sf,padding:"7px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:14,fontWeight:800,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1.5,marginBottom:7}}>Firewall Profiles</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:11}}>
              <FwChip label="DOMAIN"  value={data.firewall_domain}/>
              <FwChip label="PRIVATE" value={data.firewall_private}/>
              <FwChip label="PUBLIC"  value={data.firewall_public}/>
            </div>
            <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1.5,marginBottom:7}}>System Health</div>
            {[{l:"RAM",pct:parseFloat(data.ram_usage_percent||0),c:V.am},{l:"Disk",pct:parseFloat(data.disk_used_pct||0),c:V.ac},{l:"CPU",pct:parseFloat(data.cpu_usage||0),c:V.gn}].map(b=>(
              <div key={b.l} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,width:34}}>{b.l}</div>
                <MiniBar pct={b.pct} color={b.c}/>
                <div style={{fontFamily:V.mo,fontSize:8,color:b.pct>80?V.rd:b.pct>65?V.am:V.mu,width:27,textAlign:"right"}}>{b.pct.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHd icon="!" right={<span style={{fontFamily:V.mo,fontSize:8,color:V.mu}}>{alerts.length} alerts</span>}>Active Alerts</PanelHd>
          <div style={{maxHeight:280,overflowY:"auto"}}>
            {alerts.length===0
              ? <div style={{padding:"18px 13px",textAlign:"center",fontFamily:V.mo,fontSize:9,color:V.mu}}>No alerts</div>
              : alerts.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"8px 13px",borderBottom:`1px solid ${V.br}`,alignItems:"flex-start",transition:"background .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=V.sf2}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:19,height:19,borderRadius:4,background:"rgba(239,68,68,.2)",border:"1px solid rgba(239,68,68,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:V.rd,flexShrink:0,marginTop:1}}>!</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.alert_message||a.message||"Alert"}</div>
                    <div style={{fontFamily:V.mo,fontSize:8,color:V.mu}}>{a.created_at}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </Panel>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
        <Panel>
          <PanelHd icon="🔒">Security Posture</PanelHd>
          <div style={{padding:"7px 13px"}}>
            {[["Antivirus",data.antivirus_status,"ok"],["Secure Boot",data.secure_boot,"ok"],["BitLocker",data.bitlocker_status,"ok"],["TPM",data.tpm_version,"info"]].map(([l,v,t])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${V.br}22`}}>
                <span style={{fontFamily:V.mo,fontSize:8,color:V.mu}}>{l}</span>
                <Bdg label={v||"—"} type={t}/>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHd icon="*">System Identity</PanelHd>
          <div style={{padding:"7px 13px"}}>
            {[["Hostname",data.hostname],["IP Address",data.ip_address],["OS",data.os_name],["Build",data.os_build],["User",data.logged_in_user]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${V.br}22`}}>
                <span style={{fontFamily:V.mo,fontSize:8,color:V.mu}}>{l}</span>
                <span style={{fontFamily:V.mo,fontSize:9,color:V.tx,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v||"—"}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHd icon="◈">Threat Breakdown</PanelHd>
          <div style={{padding:"7px 13px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {Object.entries(tc).map(([s,c])=>{
              const col=s==="CRITICAL"||s==="HIGH"?V.rd:s==="MEDIUM"?V.am:V.ac;
              return (
                <div key={s} style={{background:c>0?`${col}10`:V.bg3,border:`1px solid ${c>0?`${col}33`:V.br}`,borderRadius:6,padding:"8px 10px"}}>
                  <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{s}</div>
                  <div style={{fontSize:20,fontWeight:800,letterSpacing:-1,color:c>0?col:V.mu}}>{c}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ════════ PAGE: CLIENTS ════════ */
function PageClients({ data }) {
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Clients</div>
        <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Fleet overview · Device specs · Asset inventory</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:11}}>
        <StatCard label="Total Clients"  value="1"                          color={V.ac}  sub="this machine" accent={V.ac}/>
        <StatCard label="Online"         value="1"                          color={V.gn}  sub="active"       accent={V.gn}/>
        <StatCard label="NIC Count"      value={data.nic_count||0}          color={V.cy}  sub="interfaces"   accent={V.cy}/>
        <StatCard label="Installed Apps" value={data.installed_apps?.length||0} color={V.ac2} sub="detected" accent={V.ac2}/>
      </div>
      <Panel>
        <PanelHd icon="#">{data.hostname||"—"} — Hardware Details</PanelHd>
        <div style={{padding:13}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:7}}>
            {[
              ["Manufacturer",data.system_manufacturer],["System Model",data.system_model],
              ["CPU Model",data.cpu_model],["CPU Cores",data.cpu_core_count],
              ["Total RAM",data.total_ram_gb],["GPU Model",data.gpu_model],
              ["Storage Type",data.storage_type],["Disk Health",data.disk_health],
              ["Resolution",data.monitor_resolution],["Chassis",data.chassis_type],
              ["BIOS Version",data.bios_version],["TPM Version",data.tpm_version],
              ["Motherboard Serial",data.motherboard_serial],["Serial Number",data.serial_number],
              ["MAC Address",data.mac_address],["IP Address",data.ip_address],
              ["OS Name",data.os_name],["OS Build",data.os_build],
              ["Boot Time",data.system_boot_time],["Battery",data.battery_health],
            ].map(([l,v])=>(
              <div key={l} style={{background:V.bg3,borderRadius:6,padding:"7px 9px"}}>
                <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{l}</div>
                <div style={{fontSize:10,fontWeight:600,color:V.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={v}>{v||"—"}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: THREATS ════════ */
function PageThreats({ threats }) {
  const [search,setSearch] = useState("");
  const filtered = threats.filter(t=>!search||[t.type,t.severity,t.detail,t.source].join(" ").toLowerCase().includes(search.toLowerCase()));
  const tc={CRITICAL:0,HIGH:0,MEDIUM:0,LOW:0};
  threats.forEach(t=>{if(tc[t.severity]!==undefined)tc[t.severity]++;});
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Threat Intelligence</div>
        <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Blacklisted detection · Suspicious process · Network anomaly</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:11}}>
        {Object.entries(tc).map(([s,c])=>{
          const col=s==="CRITICAL"||s==="HIGH"?V.rd:s==="MEDIUM"?V.am:V.ac;
          return <StatCard key={s} label={s} value={c} color={c>0?col:V.mu} sub="threats" accent={c>0?col:V.br}/>;
        })}
      </div>
      <Panel>
        <PanelHd icon="!" right={<SearchInput placeholder="Filter threats…" onChange={setSearch}/>}>Active Threat Feed</PanelHd>
        <Tbl cols={["SEVERITY","TYPE","SOURCE","DETAIL","TIMESTAMP"]} empty="✓ No threats detected"
          rows={filtered.map((t,i)=>{
            const col=t.severity==="CRITICAL"||t.severity==="HIGH"?V.rd:t.severity==="MEDIUM"?V.am:V.ac;
            const btype=t.severity==="CRITICAL"?"blk":t.severity==="HIGH"?"crit":t.severity==="MEDIUM"?"warn":"info";
            return (
              <TR key={i} danger={t.severity==="CRITICAL"||t.severity==="HIGH"}>
                <TD ch={<Bdg label={t.severity} type={btype}/>}/>
                <TD ch={t.type} color={col} mono bold/>
                <TD ch={t.source} color={V.ac} mono/>
                <TD ch={t.detail} color={V.mu2} maxW={380} title={t.detail}/>
                <TD ch={t.timestamp} color={V.mu} mono/>
              </TR>
            );
          })}/>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: NETWORK ════════ */
function PageNetwork({ data }) {
  const [search,setSearch] = useState("");
  const conns = (data.network_connections||[]).filter(c=>!search||[c.app_name,c.remote_addr,c.status,c.user,c.exe_path].join(" ").toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Network Monitor</div>
        <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Live connections · Protocol analysis</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:11}}>
        <StatCard label="Active Connections" value={conns.length}          color={V.ac} sub="established" accent={V.ac}/>
        <StatCard label="FW Domain"   value={data.firewall_domain}  color={data.firewall_domain==="ON"?V.gn:V.rd}  sub="profile" accent={data.firewall_domain==="ON"?V.gn:V.rd}/>
        <StatCard label="FW Private"  value={data.firewall_private} color={data.firewall_private==="ON"?V.gn:V.rd} sub="profile" accent={data.firewall_private==="ON"?V.gn:V.rd}/>
        <StatCard label="FW Public"   value={data.firewall_public}  color={data.firewall_public==="ON"?V.gn:V.rd}  sub="profile" accent={data.firewall_public==="ON"?V.gn:V.rd}/>
      </div>
      <Panel>
        <PanelHd icon="~" right={[<LiveBadge key="l"/>,<SearchInput key="s" placeholder="Search app, IP…" onChange={setSearch}/>]}>Live Connections — {data.hostname||"—"}</PanelHd>
        <Tbl cols={["APPLICATION","REMOTE ADDR","LOCAL ADDR","STATUS","TYPE","USER","PATH"]} empty="No connections"
          rows={conns.map((c,i)=>(
            <TR key={i}>
              <TD ch={c.app_name} color={V.gn} bold/>
              <TD ch={c.remote_addr} color={V.ac} mono/>
              <TD ch={c.local_addr||"—"} color={V.mu} mono/>
              <TD ch={<Bdg label={c.status} type={c.status==="ESTABLISHED"?"ok":"warn"}/>}/>
              <TD ch={c.type||"TCP"} color={V.ac2} mono/>
              <TD ch={c.user||"—"} color={V.mu2}/>
              <TD ch={c.exe_path||"—"} color={V.mu} mono maxW={180} title={c.exe_path}/>
            </TR>
          ))}/>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: PROCESSES ════════ */
function PageProcesses({ data }) {
  const [search,setSearch] = useState("");
  const procs = (data.processes||[]).filter(p=>!search||[p.pid,p.name,p.user,p.status,p.start_time,p.io_activity,p.image_path].join(" ").toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Processes</div>
          <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Running processes · {procs.length} shown</div>
        </div>
        <SearchInput placeholder="Search PID, name, user, path…" onChange={setSearch}/>
      </div>
      {procs.filter(p=>p.is_suspicious).length>0 && (
        <div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"7px 13px",marginBottom:11,display:"flex",gap:9,alignItems:"center",fontFamily:V.mo,fontSize:9}}>
          <span style={{color:V.rd,fontWeight:700}}>⚠ SUSPICIOUS PROCESSES:</span>
          {procs.filter(p=>p.is_suspicious).map(p=><Bdg key={p.pid} label={p.name} type="blk"/>)}
        </div>
      )}
      <Panel>
        <PanelHd icon="O" right={<LiveBadge/>}>{data.hostname||"—"} — {procs.length} Processes</PanelHd>
        <Tbl cols={["PID","PROCESS NAME","USER","STATUS","STARTED","I/O","PATH","ACTION"]} empty="No processes"
          rows={procs.map((p,i)=>(
            <TR key={i} danger={p.is_suspicious}>
              <TD ch={p.pid} color={V.am} mono bold/>
              <TD ch={p.name} color={p.is_suspicious?V.rd:p.is_browser?V.cy:V.tx} bold/>
              <TD ch={p.user} color={V.mu2}/>
              <TD ch={<Bdg label={p.status} type={p.status==="running"?"ok":"warn"}/>}/>
              <TD ch={p.start_time} color={V.mu} mono/>
              <TD ch={p.io_activity} color={V.ac2} mono/>
              <TD ch={p.image_path||"—"} color={V.mu} mono maxW={180} title={p.image_path}/>
              <TD ch={<button style={{background:"none",border:`1px solid ${V.br}`,borderRadius:4,padding:"2px 7px",fontSize:8,cursor:"pointer",fontFamily:V.mo,color:V.mu2,transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=V.rd;e.currentTarget.style.color=V.rd;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=V.br;e.currentTarget.style.color=V.mu2;}}>Kill</button>}/>
            </TR>
          ))}/>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: SYSTEM HEALTH ════════ */
function PageHealth({ data }) {
  const ram  = parseFloat(data.ram_usage_percent||0);
  const disk = parseFloat(data.disk_used_pct||0);
  const cpu  = parseFloat(data.cpu_usage||0);
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>System Health</div>
        <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>CPU · RAM · Disk · Uptime</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:11}}>
        <StatCard label="CPU Usage"   value={`${cpu.toFixed(0)}%`}  color={cpu>80?V.rd:cpu>65?V.am:V.gn}  sub={data.cpu_model?.slice(0,20)||"—"} accent={cpu>80?V.rd:V.gn}/>
        <StatCard label="RAM Usage"   value={`${ram.toFixed(0)}%`}  color={ram>85?V.rd:ram>65?V.am:V.gn}  sub={data.total_ram_gb||"—"}           accent={ram>85?V.rd:V.am}/>
        <StatCard label="Disk Usage"  value={`${disk.toFixed(0)}%`} color={disk>90?V.rd:disk>70?V.am:V.gn} sub={data.storage_type||"—"}           accent={disk>90?V.rd:V.ac}/>
        <StatCard label="Disk Health" value={data.disk_health||"—"} color={V.gn}                            sub="status"                           accent={V.gn}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Panel>
          <PanelHd icon="^">Resource Usage</PanelHd>
          <div style={{padding:"11px 13px"}}>
            {[{l:"CPU",pct:cpu,c:V.gn},{l:"RAM",pct:ram,c:V.am},{l:"Disk",pct:disk,c:V.ac}].map(b=>(
              <div key={b.l} style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,width:60}}>{b.l}</div>
                <MiniBar pct={b.pct} color={b.c}/>
                <div style={{fontFamily:V.mo,fontSize:8,color:b.pct>80?V.rd:b.pct>65?V.am:V.mu,width:27,textAlign:"right"}}>{b.pct.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelHd icon="#">Health Overview</PanelHd>
          <Tbl cols={["METRIC","VALUE","STATUS"]} empty="No data"
            rows={[
              ["OS",data.os_name,cpu<80&&ram<85?"ok":"warn"],
              ["Boot Time",data.system_boot_time?.slice(0,16)||"—","info"],
              ["Antivirus",data.antivirus_status||"—","ok"],
              ["Secure Boot",data.secure_boot||"—","ok"],
              ["BitLocker",data.bitlocker_status||"—","ok"],
              ["Battery",data.battery_health||"—","info"],
            ].map(([l,v,t],i)=>(
              <TR key={i}>
                <TD ch={l} color={V.mu} mono/>
                <TD ch={v} color={V.tx}/>
                <TD ch={<Bdg label={t==="ok"?"OK":t==="warn"?"Warn":"Info"} type={t}/>}/>
              </TR>
            ))}/>
        </Panel>
      </div>
    </div>
  );
}

/* ════════ PAGE: FILE ACTIVITY ════════ */
function PageFileActivity({ data }) {
  const [search,setSearch] = useState("");
  const files = (data.file_activity||[]).filter(f=>!search||(f.path||"").toLowerCase().includes(search.toLowerCase())||(f.action||"").toLowerCase().includes(search.toLowerCase()));
  const aColor = {Created:V.gn,Deleted:V.rd,Modified:V.ac,Moved:V.am};
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>File Activity</div>
          <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>C: Drive monitoring · {files.length} events</div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <LiveBadge/>
          <SearchInput placeholder="Search path or action…" onChange={setSearch}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:11}}>
        {["Created","Modified","Deleted","Moved"].map(a=>{
          const cnt=(data.file_activity||[]).filter(f=>f.action===a).length;
          return <StatCard key={a} label={a} value={cnt} color={aColor[a]||V.ac} sub="events" accent={aColor[a]||V.ac}/>;
        })}
      </div>
      <Panel>
        <PanelHd icon="~">Live Event Feed</PanelHd>
        <Tbl cols={["TIMESTAMP","ACTION","FILE PATH"]} empty="Waiting for file activity…"
          rows={files.map((f,i)=>(
            <TR key={i}>
              <TD ch={f.time} color={V.mu} mono/>
              <TD ch={<Bdg label={f.action} type={f.action==="Created"?"ok":f.action==="Deleted"?"crit":f.action==="Modified"?"info":"warn"}/>}/>
              <TD ch={f.path} color={V.tx} mono maxW={600} title={f.path}/>
            </TR>
          ))}/>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: HISTORY ════════ */
function PageHistory({ history, timeFilter, setTimeFilter, fetchHistory }) {
  const filters = [{id:"17h",l:"17 Hours"},{id:"1",l:"24 Hours"},{id:"7d",l:"7 Days"},{id:"all",l:"All Time"}];
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>System History</div>
          <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Property change log · {history.length} entries</div>
        </div>
        <div style={{display:"flex",gap:5}}>
          {filters.map(f=>(
            <Btn key={f.id} primary={timeFilter===f.id} onClick={()=>{setTimeFilter(f.id);fetchHistory(f.id);}}>{f.l}</Btn>
          ))}
        </div>
      </div>
      <Panel>
        <PanelHd icon="◷">Change Log</PanelHd>
        <Tbl cols={["PROPERTY","OLD VALUE","NEW VALUE","FIRST SEEN","LAST REPORTED"]} empty="No history found"
          rows={history.map((h,i)=>(
            <TR key={i}>
              <TD ch={h.property_name} color={V.ac} bold/>
              <TD ch={h.old_value||"—"} color={V.mu} mono maxW={160}/>
              <TD ch={h.new_value||"—"} color={V.gn} mono maxW={160}/>
              <TD ch={h.first_reported||"—"} color={V.mu2} mono/>
              <TD ch={h.last_reported||"—"} color={V.am} mono bold/>
            </TR>
          ))}/>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: FIREWALL ════════ */
function PageFirewall({ data }) {
  const [rules,setRules] = useState([
    {port:"4444",proto:"TCP",desc:"Metasploit default",scope:"All",action:"Block"},
    {port:"6881-6889",proto:"TCP/UDP",desc:"BitTorrent ports",scope:"All",action:"Block"},
    {port:"3389",proto:"TCP",desc:"RDP — IT only",scope:"IT group",action:"Restrict"},
    {port:"22",proto:"TCP",desc:"SSH — Eng only",scope:"Eng dept",action:"Allow"},
    {port:"443",proto:"TCP",desc:"HTTPS outbound",scope:"All",action:"Allow"},
    {port:"5938",proto:"TCP",desc:"TeamViewer relay",scope:"All",action:"Block"},
  ]);
  const [port,setPort]=useState("");
  const [ip,setIp]=useState("");
  const [proto,setProto]=useState("TCP");
  const [action,setAction]=useState("Block");
  const addRule=()=>{
    if(!port.trim()) return;
    setRules(r=>[{port,proto,desc:`Custom — ${ip||"all IPs"}`,scope:"All",action},...r]);
    setPort("");setIp("");
  };
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Firewall Control</div>
          <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Rules · Push to clients · Hit log</div>
        </div>
        <Btn primary onClick={()=>alert("Rules pushed!")}>Push All Rules</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:11}}>
        <StatCard label="Active Rules" value={rules.length}          color={V.ac} sub="configured" accent={V.ac}/>
        <StatCard label="FW Domain"   value={data.firewall_domain}  color={data.firewall_domain==="ON"?V.gn:V.rd}  sub="profile" accent={V.gn}/>
        <StatCard label="FW Private"  value={data.firewall_private} color={data.firewall_private==="ON"?V.gn:V.rd} sub="profile" accent={V.gn}/>
        <StatCard label="FW Public"   value={data.firewall_public}  color={data.firewall_public==="ON"?V.gn:V.rd}  sub="profile" accent={V.gn}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.7fr 1fr",gap:9}}>
        <Panel>
          <PanelHd icon="#">Rules</PanelHd>
          <div style={{padding:"11px 13px"}}>
            <div style={{display:"flex",gap:5,marginBottom:9,flexWrap:"wrap",alignItems:"center"}}>
              <input value={port} onChange={e=>setPort(e.target.value)} placeholder="Port" style={{width:70,padding:"4px 7px",background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:9,outline:"none"}}/>
              <input value={ip} onChange={e=>setIp(e.target.value)} placeholder="IP/CIDR" style={{width:110,padding:"4px 7px",background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:9,outline:"none"}}/>
              <select value={proto} onChange={e=>setProto(e.target.value)} style={{background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:9,padding:"4px 7px",outline:"none"}}>
                <option>TCP</option><option>UDP</option><option>TCP/UDP</option>
              </select>
              <select value={action} onChange={e=>setAction(e.target.value)} style={{background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:9,padding:"4px 7px",outline:"none"}}>
                <option>Block</option><option>Allow</option><option>Restrict</option>
              </select>
              <Btn primary onClick={addRule} sm>+ Add</Btn>
            </div>
            <Tbl cols={["PORT","PROTO","DESCRIPTION","SCOPE","ACTION"]} empty="No rules"
              rows={rules.map((r,i)=>(
                <TR key={i}>
                  <TD ch={r.port} color={V.tx} mono bold/>
                  <TD ch={r.proto} color={V.mu} mono/>
                  <TD ch={r.desc} color={V.mu2}/>
                  <TD ch={r.scope} color={V.mu} mono/>
                  <TD ch={<Bdg label={r.action} type={r.action==="Block"?"blk":r.action==="Allow"?"ok":"warn"}/>}/>
                </TR>
              ))}/>
          </div>
        </Panel>
        <Panel>
          <PanelHd icon="!">Recent Hits</PanelHd>
          <Tbl cols={["TIME","DST IP","PORT","RESULT"]} empty="No hits"
            rows={[["12:41","185.220.101.47","4444","Block"],["12:39","91.108.4.10","6882","Block"],["12:35","5.9.243.187","5938","Block"],["12:28","10.10.4.1","22","Allow"]].map(([t,ip,p,a],i)=>(
              <TR key={i}>
                <TD ch={t} color={V.mu} mono/>
                <TD ch={ip} color={a==="Block"?V.rd:V.tx} mono/>
                <TD ch={p} color={V.mu} mono/>
                <TD ch={<Bdg label={a} type={a==="Block"?"blk":"ok"}/>}/>
              </TR>
            ))}/>
        </Panel>
      </div>
    </div>
  );
}

/* ════════ PAGE: APP CONTROL ════════ */
function PageApps({ apps, blacklist, addToast, onRefreshBL }) {
  const [search,   setSearch]  = useState("");
  const [showModal,setModal]   = useState(false);
  const [blName,   setBlName]  = useState("");
  const [blReason, setBlReason]= useState("");
  const [saving,   setSaving]  = useState(false);

  const filtered  = apps.filter(a=>!search||[a.app_name||a.name,a.status,a.publisher].join(" ").toLowerCase().includes(search.toLowerCase()));
  const installed = apps.filter(a=>a.status==="Installed").length;

  const blacklistApp = async () => {
    if (!blName.trim()) { addToast("App name required","error"); return; }
    setSaving(true);
    try {
      const r = await fetch(`${API}/blacklist/add`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          mac_address:"APP::"+blName.trim().toUpperCase().replace(/\s+/g,"_"),
          reason:blReason||`Blacklisted application: ${blName}`
        })
      });
      if (r.ok) {
        addToast(`✓ App blacklisted: ${blName}`);
        setBlName(""); setBlReason(""); setModal(false);
        if (onRefreshBL) onRefreshBL();
      } else addToast("Failed to blacklist","error");
    } catch { addToast("Server error","error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      {showModal && (
        <Modal title="⊗ Blacklist Application" onClose={()=>setModal(false)}>
          <ModalInput label="Application Name" value={blName} set={setBlName} placeholder="e.g. BitTorrent, Discord, TeamViewer…"/>
          <ModalInput label="Reason" value={blReason} set={setBlReason} placeholder="Policy violation / Security risk…"/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:6}}>
            <Btn onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn danger onClick={blacklistApp}>{saving?"Saving…":"⊗ Blacklist App"}</Btn>
          </div>
        </Modal>
      )}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>App Control</div>
          <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Installed inventory · Blacklist matching · Violations</div>
        </div>
        <div style={{display:"flex",gap:5}}>
          <Btn danger onClick={()=>setModal(true)}>+ Blacklist App</Btn>
          <SearchInput placeholder="Search apps…" onChange={setSearch}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:11}}>
        <StatCard label="Installed Apps"  value={installed}             color={V.ac}  sub="detected"    accent={V.ac}/>
        <StatCard label="Removed (6mo)"   value={apps.length-installed} color={V.rd}  sub="uninstalled" accent={V.rd}/>
        <StatCard label="Total Scanned"   value={apps.length}           color={V.gn}  sub="in registry" accent={V.gn}/>
        <StatCard label="Compliant"       value={installed}             color={V.ac2} sub="fleet clean" accent={V.ac2}/>
      </div>
      <Panel>
        <PanelHd icon="*">Installed Applications — Fleet</PanelHd>
        <div style={{maxHeight:"calc(100vh - 320px)",overflowY:"auto"}}>
          <Tbl cols={["APP NAME","STATUS","PUBLISHER","VERSION","INSTALL DATE","UNINSTALL DATE"]} empty="No apps found"
            rows={filtered.map((a,i)=>{
              const name = a.app_name||a.name||"—";
              const isBlacklisted = blacklist.some(b=>
                b.mac_address?.toUpperCase().includes(
                  name.toUpperCase().replace(/\s+/g,"_")
                )
              );
              const btype = isBlacklisted?"blk":a.status==="Installed"?"ok":"off";
              return (
                <TR key={i} danger={a.status==="Uninstalled"||isBlacklisted}>
                  <TD ch={
                    <span style={{display:"flex",alignItems:"center",gap:6}}>
                      {isBlacklisted && <span style={{color:V.rd,fontSize:10}}>⊗</span>}
                      <span style={{color:isBlacklisted?V.rd:V.tx,fontWeight:700}}>{name}</span>
                    </span>
                  }/>
                  <TD ch={<Bdg label={isBlacklisted?"BLACKLISTED":a.status} type={btype}/>}/>
                  <TD ch={a.publisher||"—"} color={V.mu2}/>
                  <TD ch={a.version||"—"}   color={V.mu}  mono/>
                  <TD ch={a.install_date?.split(" ")[0]||"—"} color={V.ac2} mono/>
                  <TD ch={a.uninstall_date||"—"} color={a.status==="Uninstalled"?V.rd:V.mu} mono/>
                </TR>
              );
            })}/>
        </div>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: BLACKLIST ════════ */
function PageBlacklist({ blacklist, onRefresh, addToast }) {
  const [mac,    setMac]   = useState("");
  const [reason, setReason]= useState("");
  const [removing,setRem]  = useState(null);

  const addDevice = async () => {
    if (!mac.trim()) { addToast("MAC address required","error"); return; }
    try {
      const r = await fetch(`${API}/blacklist/add`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mac_address:mac.trim(),reason:reason||"Policy violation"})});
      if (r.ok) { addToast(`Blacklisted: ${mac}`); setMac(""); setReason(""); onRefresh(); }
      else addToast("Failed","error");
    } catch { addToast("Server error","error"); }
  };

  const removeDevice = async (macAddr) => {
    setRem(macAddr);
    try {
      const r = await fetch(`${API}/blacklist/remove`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mac_address:macAddr})});
      if (r.ok) { addToast(`Removed: ${macAddr}`); onRefresh(); }
      else addToast("Failed","error");
    } catch { addToast("Server error","error"); }
    finally { setRem(null); }
  };

  const inp = (val,set,ph) => (
    <input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
      style={{width:"100%",padding:"7px 9px",background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:9,outline:"none"}}
      onFocus={e=>e.target.style.borderColor=V.rd}
      onBlur={e=>e.target.style.borderColor=V.br}/>
  );

  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5,color:V.rd}}>Blacklist Registry</div>
        <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Blocked devices & apps · {blacklist.length} entries</div>
      </div>
      <Panel>
        <PanelHd icon="⊗"><span style={{color:V.rd}}>Block New Device by MAC</span></PanelHd>
        <div style={{padding:"11px 13px",display:"flex",gap:9,alignItems:"flex-end"}}>
          <div style={{flex:1}}><div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>MAC Address</div>{inp(mac,setMac,"AA:BB:CC:DD:EE:FF")}</div>
          <div style={{flex:2}}><div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Reason</div>{inp(reason,setReason,"Policy violation / Unauthorized device…")}</div>
          <Btn danger onClick={addDevice}>⊗ Block Device</Btn>
        </div>
      </Panel>
      <Panel>
        <PanelHd icon="!"><span style={{color:V.rd}}>Blacklisted Entries ({blacklist.length})</span></PanelHd>
        <Tbl cols={["MAC / APP ID","REASON","ADDED AT","ACTION"]} empty="Blacklist is empty"
          rows={blacklist.map((b,i)=>(
            <TR key={i} danger>
              <TD ch={b.mac_address} color={V.rd} bold mono/>
              <TD ch={b.reason} color={V.tx}/>
              <TD ch={b.added_at||"—"} color={V.mu} mono/>
              <TD ch={<button style={{background:"none",border:`1px solid ${V.br}`,borderRadius:4,padding:"2px 7px",fontSize:8,cursor:"pointer",fontFamily:V.mo,color:V.mu2,transition:"all .15s"}}
                onClick={()=>removeDevice(b.mac_address)}>{removing===b.mac_address?"…":"Remove"}</button>}/>
            </TR>
          ))}/>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: AUDIT LOG ════════ */
function PageAudit({ history }) {
  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Audit Log</div>
        <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>All system property changes · Full traceability</div>
      </div>
      <Panel>
        <PanelHd icon="O" right={<span style={{fontFamily:V.mo,fontSize:8,color:V.mu}}>{history.length} entries</span>}>All Changes</PanelHd>
        <Tbl cols={["PROPERTY","OLD VALUE","NEW VALUE","FIRST SEEN","LAST REPORTED"]} empty="No audit records"
          rows={history.map((h,i)=>(
            <TR key={i}>
              <TD ch={h.property_name} color={V.ac} bold/>
              <TD ch={h.old_value||"—"} color={V.mu} mono maxW={160}/>
              <TD ch={h.new_value||"—"} color={V.gn} mono maxW={160}/>
              <TD ch={h.first_reported||"—"} color={V.mu2} mono/>
              <TD ch={h.last_reported||"—"} color={V.am} mono bold/>
            </TR>
          ))}/>
      </Panel>
    </div>
  );
}

/* ════════ PAGE: SETTINGS ════════ */
function PageSettings({ addToast }) {
  const [serverUrl,setServerUrl] = useState("http://127.0.0.1:5000");
  const [emailAddr,setEmailAddr] = useState("admin@vortex.corp");
  const [intervalV,setIntervalV] = useState("15 seconds");
  const [tls,      setTls]       = useState(true);
  const [autokill, setAutokill]  = useState(true);
  const [urllog,   setUrllog]    = useState(true);

  return (
    <div style={{padding:"15px 18px 22px",animation:"fadein .3s ease"}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:19,fontWeight:800,letterSpacing:-.5}}>Settings</div>
        <div style={{fontFamily:V.mo,fontSize:8,color:V.mu,marginTop:2}}>Server config · Agent settings · Notifications</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        <Panel>
          <PanelHd icon="#">Server Configuration</PanelHd>
          <div style={{padding:"11px 13px"}}>
            {[{l:"Server Address",val:serverUrl,set:setServerUrl},{l:"Alert Email",val:emailAddr,set:setEmailAddr}].map(f=>(
              <div key={f.l} style={{marginBottom:9}}>
                <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{f.l}</div>
                <input value={f.val} onChange={e=>f.set(e.target.value)} style={{width:"100%",padding:"7px 9px",background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:9,outline:"none"}}/>
              </div>
            ))}
            <div style={{marginBottom:9}}>
              <div style={{fontFamily:V.mo,fontSize:7,color:V.mu,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Check-in Interval</div>
              <select value={intervalV} onChange={e=>setIntervalV(e.target.value)} style={{width:"100%",padding:"7px 9px",background:V.bg3,border:`1px solid ${V.br}`,borderRadius:4,color:V.tx,fontFamily:V.mo,fontSize:9,outline:"none"}}>
                <option>15 seconds</option><option>30 seconds</option><option>1 minute</option>
              </select>
            </div>
            {[{l:"Enforce TLS 1.3",sub:"Agent-server communication",v:tls,set:setTls},{l:"Auto-kill blacklisted processes",sub:"Kill on detection",v:autokill,set:setAutokill},{l:"File logging",sub:"Log all file events",v:urllog,set:setUrllog}].map(s=>(
              <div key={s.l} style={{marginBottom:9,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><div style={{fontSize:10,fontWeight:600}}>{s.l}</div><div style={{fontFamily:V.mo,fontSize:8,color:V.mu}}>{s.sub}</div></div>
                <Toggle on={s.v} onClick={()=>s.set(v=>!v)}/>
              </div>
            ))}
            <Btn primary onClick={()=>addToast("Settings saved")}>Save Settings</Btn>
          </div>
        </Panel>
        <Panel>
          <PanelHd icon="*">About</PanelHd>
          <div style={{padding:"11px 13px"}}>
            {[["Product","Endpoint Guardian"],["Version","v2.0.0"],["Agent","Guardian Agent"],["Stack","Python + Flask + React"],["DB","MySQL (vortex_db)"],["Login","admin@gmail.com / 1234"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${V.br}22`}}>
                <span style={{fontFamily:V.mo,fontSize:8,color:V.mu}}>{l}</span>
                <span style={{fontFamily:V.mo,fontSize:9,color:V.ac}}>{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   ROOT APP
════════════════════════════════════ */
export default function App() {
  const [isLoggedIn,setLoggedIn] = useState(localStorage.getItem("isLoggedIn")==="true");
  const [activeTab, setTab]      = useState("dashboard");
  const [data,      setData]     = useState({});
  const [history,   setHistory]  = useState([]);
  const [blacklist, setBL]       = useState([]);
  const [alerts,    setAlerts]   = useState([]);
  const [apps,      setApps]     = useState([]);
  const [threats,   setThreats]  = useState([]);
  const [stats,     setStats]    = useState({});
  const [timeFilter,setTF]       = useState("all");
  const [toasts,    setToasts]   = useState([]);

  const addToast    = useCallback((msg,type="success")=>{const id=Date.now();setToasts(t=>[...t,{id,msg,type}]);},[]);
  const removeToast = useCallback((id)=>setToasts(t=>t.filter(x=>x.id!==id)),[]);
  const login  = ()=>{ localStorage.setItem("isLoggedIn","true"); setLoggedIn(true); };
  const logout = ()=>{ localStorage.removeItem("isLoggedIn"); setLoggedIn(false); };

  const fetchAll = useCallback(async()=>{
    const res = await Promise.allSettled([
      fetch(`${API}/data`).then(r=>r.json()),
      fetch(`${API}/history?filter=${timeFilter}`).then(r=>r.json()),
      fetch(`${API}/blacklist`).then(r=>r.json()),
      fetch(`${API}/alerts`).then(r=>r.json()),
      fetch(`${API}/apps-inventory`).then(r=>r.json()),
      fetch(`${API}/api/threats`).then(r=>r.json()),
      fetch(`${API}/api/stats`).then(r=>r.json()),
    ]);
    const [d,h,bl,al,ap,th,st]=res;
    if(d.status==="fulfilled"  && !d.value?.error)        setData(d.value);
    if(h.status==="fulfilled"  && Array.isArray(h.value)) setHistory(h.value);
    if(bl.status==="fulfilled" && Array.isArray(bl.value))setBL(bl.value);
    if(al.status==="fulfilled" && Array.isArray(al.value))setAlerts(al.value);
    if(ap.status==="fulfilled" && Array.isArray(ap.value))setApps(ap.value);
    if(th.status==="fulfilled" && Array.isArray(th.value))setThreats(th.value);
    if(st.status==="fulfilled" && !st.value?.error)        setStats(st.value);
  },[timeFilter]);

  const fetchHistory   = useCallback(async(f)=>{try{const r=await fetch(`${API}/history?filter=${f}`);const v=await r.json();if(Array.isArray(v))setHistory(v);}catch{}},[]);
  const fetchBlacklist = useCallback(async()=>{try{const r=await fetch(`${API}/blacklist`);const v=await r.json();if(Array.isArray(v))setBL(v);}catch{}},[]);
  const clearAlerts    = async()=>{try{await fetch(`${API}/mark-read`,{method:"POST"});setAlerts([]);addToast("Alerts cleared");}catch{addToast("Failed","error");}};

  useEffect(()=>{
    if(!isLoggedIn) return;
    fetchAll();
    const iv=setInterval(fetchAll,8000);
    return()=>clearInterval(iv);
  },[isLoggedIn,fetchAll]);

  if(!isLoggedIn) return <LoginScreen onLogin={login}/>;

  const vp = {data,stats,threats,alerts,history,apps,blacklist};

  return (
    <Shell stats={stats} alerts={alerts} onLogout={logout} activeTab={activeTab} setTab={setTab} threatCount={threats.length}>
      {activeTab==="dashboard"  && <PageDashboard  {...vp} clearAlerts={clearAlerts}/>}
      {activeTab==="clients"    && <PageClients     {...vp}/>}
      {activeTab==="threats"    && <PageThreats     {...vp}/>}
      {activeTab==="network"    && <PageNetwork     {...vp}/>}
      {activeTab==="processes"  && <PageProcesses   {...vp}/>}
      {activeTab==="health"     && <PageHealth      {...vp}/>}
      {activeTab==="urls"       && <PageFileActivity {...vp}/>}
      {activeTab==="history"    && <PageHistory     {...vp} timeFilter={timeFilter} setTimeFilter={setTF} fetchHistory={fetchHistory}/>}
      {activeTab==="firewall"   && <PageFirewall    {...vp}/>}
      {activeTab==="blacklist"  && <PageBlacklist   {...vp} onRefresh={fetchBlacklist} addToast={addToast}/>}
      {activeTab==="apps"       && <PageApps        {...vp} addToast={addToast} onRefreshBL={fetchBlacklist}/>}
      {activeTab==="audit"      && <PageAudit       {...vp}/>}
      {activeTab==="settings"   && <PageSettings    addToast={addToast}/>}
      <div style={{position:"fixed",bottom:18,right:18,zIndex:9998,display:"flex",flexDirection:"column",gap:5,minWidth:260}}>
        {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>removeToast(t.id)}/>)}
      </div>
    </Shell>
  );
}