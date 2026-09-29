/* Nexo Futuro AI · Panel de control */
"use strict";
/* ================= PANEL DE CONTROL ================= */
const PF={period:30,distrito:"",estado:"",q:"",sort:{k:"creado",dir:"desc"},page:0,insight:null,insightBusy:false,open:null,busyDemo:false};
try{const v=JSON.parse(localStorage.getItem("nexo2-pf")||"null");if(v){PF.period=v.period??30;PF.distrito=v.distrito||"";PF.estado=v.estado||""}}catch(e){}
function savePF(){try{localStorage.setItem("nexo2-pf",JSON.stringify({period:PF.period,distrito:PF.distrito,estado:PF.estado}))}catch(e){}}
const DAY=864e5;
const mask=s=>{s=String(s||"");return CAP.isAdmin?s:(s?s[0]+"•••":"")};
const fullName=r=>CAP.isAdmin?`${r.nombre||""} ${r.apellido||""}`.trim():mask(r.nombre);

function inPeriod(r,days,offset=0){if(!days)return !offset;const now=Date.now();return r.creado>now-(offset+days)*DAY&&r.creado<=now-offset*DAY}
function baseRows(){return ROWS.filter(r=>inPeriod(r,PF.period)&&(!PF.distrito||r.distrito===PF.distrito))}
function tableRows(){
  const q=PF.q.trim().toLowerCase();
  let rs=baseRows().filter(r=>(!PF.estado||r.estado===PF.estado)&&(!q||[r.nombre,r.apellido,codeOf(r.id),r.distrito,r.oportunidad?.titulo,r.perfil?.titulo].join(" ").toLowerCase().includes(q)));
  const {k,dir}=PF.sort;const m=dir==="asc"?1:-1;
  const val=r=>k==="nombre"?(r.nombre||"").toLowerCase():k==="estado"?ESTADOS.findIndex(e=>e.k===r.estado):k==="distrito"?r.distrito||"":k==="avance"?(r.rutaAvance||0):r.creado||0;
  return rs.sort((a,b)=>val(a)>val(b)?m:val(a)<val(b)?-m:0);
}
function countBy(rs,f){const m=new Map();rs.forEach(r=>{const ks=[].concat(f(r)).filter(Boolean);ks.forEach(k=>m.set(k,(m.get(k)||0)+1))});return [...m.entries()].sort((a,b)=>b[1]-a[1])}
function firstResp(r){const h=r.historial||[];return h.length>1?h[1].t-r.creado:null}
function fmtDur(ms){if(ms==null)return "—";const h=ms/36e5;return h<48?`${Math.round(h)} h`:`${(h/24).toFixed(1).replace(".",",")} días`}

function renderPanel(){
  const main=$("#main");
  if(!CAP.ready){main.innerHTML=`<div class="card empty"><span class="spin"></span><p class="ink2">Conectando con la base de datos…</p></div>`;return}
  if(!CAP.db){main.innerHTML=`<div class="card empty"><span class="ic">${ic("db")}</span><h2>El panel necesita la base de datos</h2><p class="ink2" style="max-width:52ch">No se pudo acceder al almacenamiento del navegador. Revisa que no esté bloqueado (por ejemplo, en modo incógnito).</p></div>`;return}
  if(!$("#panelRoot")){
    main.innerHTML=`<div id="panelRoot">
    <div class="phead">
      <div style="display:grid;gap:6px"><p class="eyebrow">Centro de gestión · Piloto Trujillo</p><h1 style="font-size:clamp(1.7rem,4vw,2.3rem)">Panel de control</h1><p class="ink2">Solicitudes de jóvenes en tiempo real para controlar, evaluar y decidir.</p></div>
      <div class="row">
        <div class="seg" role="radiogroup" aria-label="Periodo">${[[7,"7 días"],[30,"30 días"],[90,"90 días"],[0,"Todo"]].map(([v,t])=>`<label><input type="radio" name="per" id="per${v}" value="${v}" ${PF.period===v?"checked":""}><span>${t}</span></label>`).join("")}</div>
        <button class="btn sec sm" id="csvBtn" ${CAP.downloads?"":"hidden"}>${ic("download","sm")} Exportar CSV</button>
      </div>
    </div>
    <div id="accessNote"></div>
    <div class="filters" role="search">
      <label class="sr" for="fDist">Distrito</label><select id="fDist"><option value="">Todos los distritos</option>${DISTRITOS.map(d=>`<option ${d===PF.distrito?"selected":""}>${d}</option>`).join("")}</select>
      <label class="sr" for="fEst">Estado</label><select id="fEst"><option value="">Todos los estados</option>${ESTADOS.map(e=>`<option value="${e.k}" ${e.k===PF.estado?"selected":""}>${e.t}</option>`).join("")}</select>
      <div class="search">${ic("search")}<label class="sr" for="fQ">Buscar</label><input type="search" id="fQ" placeholder="Buscar por nombre, código u oportunidad" value="${esc(PF.q)}"></div>
      <button class="btn ghost sm" id="fClear">Limpiar filtros</button>
    </div>
    <div class="kpis" id="kpis"></div>
    <div class="pgrid">
      <section class="card w8" aria-labelledby="h-line"><div class="chead"><div><h3 id="h-line">Solicitudes recibidas</h3><p id="lineSub">Por día</p></div></div><div class="chart" id="lineChart" style="height:230px"></div></section>
      <section class="card w4" aria-labelledby="h-pipe"><div class="chead"><div><h3 id="h-pipe">Embudo de atención</h3><p>Estado actual · clic para filtrar</p></div></div><div id="pipe"></div></section>
      <section class="card w4" aria-labelledby="h-d"><div class="chead"><div><h3 id="h-d">Por distrito</h3><p>Dónde está la demanda</p></div></div><div class="bars" id="bDist"></div></section>
      <section class="card w4" aria-labelledby="h-i"><div class="chead"><div><h3 id="h-i">Áreas de interés</h3><p>Qué quieren aprender o trabajar</p></div></div><div class="bars" id="bInt"></div></section>
      <section class="card w4" aria-labelledby="h-f"><div class="chead"><div><h3 id="h-f">Barreras reportadas</h3><p>Por qué siguen siendo NINI</p></div></div><div class="bars" id="bDif"></div></section>
      <section class="card w4" aria-labelledby="h-a"><div class="chead"><div><h3 id="h-a">Alertas</h3><p>Reglas automáticas de control</p></div></div><div class="alerts" id="alerts"></div></section>
      <section class="card w8" aria-labelledby="h-ia"><div class="chead"><div><h3 id="h-ia">Informe para la toma de decisiones</h3><p>Qué pasa · por qué · qué decidir · cómo medirlo</p></div><button class="btn sm" id="iaBtn">${ic("spark","sm")} Generar informe</button></div><div id="insight"></div></section>
    </div>
    <section aria-labelledby="h-t"><div class="row between" style="margin-bottom:12px"><div><h2 id="h-t" style="font-size:1.3rem">Solicitudes</h2><p class="muted" id="tCount" style="font-size:.88rem"></p></div><div class="row" id="demoCtl"></div></div>
      <div class="tablewrap" id="table"></div></section>
    </div>`;
    $$('input[name=per]').forEach(r=>r.onchange=()=>{PF.period=+r.value;PF.page=0;savePF();updatePanel()});
    $("#fDist").onchange=e=>{PF.distrito=e.target.value;PF.page=0;savePF();updatePanel()};
    $("#fEst").onchange=e=>{PF.estado=e.target.value;PF.page=0;savePF();updatePanel()};
    let qt;$("#fQ").oninput=e=>{clearTimeout(qt);qt=setTimeout(()=>{PF.q=e.target.value;PF.page=0;drawTable()},200)};
    $("#fClear").onclick=()=>{PF.distrito="";PF.estado="";PF.q="";PF.page=0;$("#fDist").value="";$("#fEst").value="";$("#fQ").value="";savePF();updatePanel()};
    $("#csvBtn").onclick=exportCSV;
    $("#iaBtn").onclick=genInsight;
  }
  updatePanel();
}
function updatePanel(){
  if(!$("#panelRoot"))return;
  $("#accessNote").innerHTML=!CAP.isAdmin?`<div class="note sun" style="margin-bottom:16px">${ic("lock")}<div><b>Vista de solo lectura.</b> Los nombres y teléfonos están ocultos. Solo el equipo de Nexo Futuro (editores) puede gestionar solicitudes.</div></div>`:(dbError?`<div class="note crit" style="margin-bottom:16px">${ic("alert")}<div>No se pudieron cargar las solicitudes (${esc(dbError)}). Recarga la página.</div></div>`:"");
  $("#fEst").value=PF.estado;
  drawKPIs();drawLine();drawPipe();
  drawBars("#bDist",countBy(baseRows(),r=>r.distrito),6);
  drawBars("#bInt",countBy(baseRows(),r=>r.intereses),6);
  drawBars("#bDif",countBy(baseRows(),r=>r.dificultades),6);
  drawAlerts();drawInsight();drawTable();drawDemoCtl();
}
function drawKPIs(){
  const rs=baseRows();const prev=PF.period?ROWS.filter(r=>inPeriod(r,PF.period,PF.period)&&(!PF.distrito||r.distrito===PF.distrito)):null;
  const n=rs.length,np=prev?prev.length:null;
  const delta=np==null?null:np===0?(n?100:0):Math.round((n-np)/np*100);
  const nuevas=rs.filter(r=>r.estado==="nueva");const late=nuevas.filter(r=>Date.now()-r.creado>2*DAY).length;
  const ins=rs.filter(r=>r.estado==="insertada").length;const der=rs.filter(r=>r.estado==="derivada").length;
  const rt=rs.map(firstResp).filter(v=>v!=null);const avg=rt.length?rt.reduce((a,b)=>a+b,0)/rt.length:null;
  const per=PF.period?`vs. ${PF.period} días anteriores`:"desde el inicio del piloto";
  $("#kpis").innerHTML=`
   <div class="kpi"><span class="lab">${ic("inbox","sm")} Solicitudes recibidas</span><span class="val num">${n}</span><span class="sub">${delta==null?per:`<span class="delta ${delta>=0?"up":"down"}">${delta>=0?"▲":"▼"} ${Math.abs(delta)}%</span> ${per}`}</span></div>
   <div class="kpi ${late?"alert":""}"><span class="lab">${ic("clock","sm")} Pendientes de atención</span><span class="val num">${nuevas.length}</span><span class="sub">${late?`<span class="delta down">${ic("alert","sm")} ${late}</span> con más de 48 h sin respuesta`:"Todas dentro del plazo de 48 h"}</span></div>
   <div class="kpi"><span class="lab">${ic("brief","sm")} Tasa de inserción</span><span class="val num">${n?Math.round(ins/n*100):0}%</span><span class="sub">${ins} insertados · ${der} derivados a programas</span></div>
   <div class="kpi"><span class="lab">${ic("trend","sm")} Tiempo de primera respuesta</span><span class="val num">${fmtDur(avg)}</span><span class="sub">Meta: menos de 48 h · promedio del periodo</span></div>`;
}
function niceMax(v){if(v<=4)return 4;const p=Math.pow(10,Math.floor(Math.log10(v)));const f=v/p;return (f<=1?1:f<=2?2:f<=5?5:10)*p}
function drawLine(){
  const el=$("#lineChart");if(!el)return;
  const rs=baseRows();const now=new Date();now.setHours(0,0,0,0);
  let days=PF.period;if(!days){const first=rs.length?Math.min(...rs.map(r=>r.creado)):Date.now();days=Math.max(7,Math.ceil((now.getTime()+DAY-first)/DAY))}
  const weekly=days>60;const step=weekly?7:1;const nb=Math.ceil(days/step);
  const start=now.getTime()+DAY-nb*step*DAY;
  const pts=Array.from({length:nb},(_,i)=>({t:start+i*step*DAY,v:0}));
  rs.forEach(r=>{const i=Math.floor((r.creado-start)/(step*DAY));if(i>=0&&i<nb)pts[i].v++});
  $("#lineSub").textContent=(weekly?"Por semana":"Por día")+(PF.distrito?` · ${PF.distrito}`:"");
  if(!rs.length){el.innerHTML=`<div class="empty" style="padding:40px 10px"><p class="muted">Sin solicitudes en este periodo.</p></div>`;return}
  const W=Math.max(280,el.clientWidth),H=230,ml=34,mr=14,mt=14,mb=28,iw=W-ml-mr,ih=H-mt-mb;
  const ymax=niceMax(Math.max(...pts.map(p=>p.v)));
  const x=i=>ml+(nb===1?iw/2:i*iw/(nb-1)),y=v=>mt+ih-v/ymax*ih;
  const yt=[0,.25,.5,.75,1].map(f=>Math.round(f*ymax)).filter((v,i,a)=>a.indexOf(v)===i);
  const nx=Math.min(6,nb);const xt=Array.from({length:nx},(_,k)=>Math.round(k*(nb-1)/Math.max(1,nx-1)));
  const line=pts.map((p,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
  const area=line+`L${x(nb-1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const last=pts[nb-1];
  const lab=p=>weekly?`Semana del ${fmtDate(p.t)}`:new Date(p.t).toLocaleDateString("es-PE",{weekday:"short",day:"2-digit",month:"short"});
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="Solicitudes ${weekly?"por semana":"por día"}: total ${rs.length}, máximo ${Math.max(...pts.map(p=>p.v))} en un ${weekly?"semana":"día"}" tabindex="0">
   <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:var(--s-new);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--s-new);stop-opacity:0"/></linearGradient></defs>
   ${yt.map(v=>`<line class="gl" x1="${ml}" x2="${W-mr}" y1="${y(v)}" y2="${y(v)}"/><text class="tk num" x="${ml-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`).join("")}
   <line class="base" x1="${ml}" x2="${W-mr}" y1="${y(0)}" y2="${y(0)}"/>
   ${xt.map(i=>`<text class="tk" x="${x(i)}" y="${H-8}" text-anchor="${i===0?"start":i===nb-1?"end":"middle"}">${fmtDate(pts[i].t)}</text>`).join("")}
   <path d="${area}" fill="url(#ga)"/>
   <path d="${line}" fill="none" style="stroke:var(--s-new)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
   <circle cx="${x(nb-1)}" cy="${y(last.v)}" r="4.5" style="fill:var(--s-new);stroke:var(--surface)" stroke-width="2"/>
   <g id="hov" style="display:none"><line id="hl" y1="${mt}" y2="${y(0)}" style="stroke:var(--line-2)" stroke-dasharray="3 3"/><circle id="hc" r="5" style="fill:var(--s-new);stroke:var(--surface)" stroke-width="2"/></g>
   <rect x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent" id="hit"/>
  </svg><div class="tip" id="ltip" hidden></div>`;
  const svg=el.querySelector("svg"),hov=el.querySelector("#hov"),tip=el.querySelector("#ltip");
  let cur=-1;
  const show=i=>{cur=i;const p=pts[i];hov.style.display="";el.querySelector("#hl").setAttribute("x1",x(i));el.querySelector("#hl").setAttribute("x2",x(i));el.querySelector("#hc").setAttribute("cx",x(i));el.querySelector("#hc").setAttribute("cy",y(p.v));
    tip.hidden=false;tip.innerHTML=`${esc(lab(p))}<br><b>${p.v}</b> solicitud${p.v===1?"":"es"}`;const sx=svg.getBoundingClientRect().width/W;tip.style.left=Math.min(Math.max(x(i)*sx,70),svg.getBoundingClientRect().width-70)+"px";tip.style.top=(y(p.v)*sx)+"px"};
  const hide=()=>{hov.style.display="none";tip.hidden=true;cur=-1};
  svg.addEventListener("pointermove",e=>{const r=svg.getBoundingClientRect();const px=(e.clientX-r.left)*W/r.width;const i=Math.round((px-ml)/iw*(nb-1));show(Math.max(0,Math.min(nb-1,i)))});
  svg.addEventListener("pointerleave",hide);svg.addEventListener("blur",hide);
  svg.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();show(Math.max(0,Math.min(nb-1,(cur<0?nb-1:cur)+(e.key==="ArrowRight"?1:-1))))}});
}
function drawPipe(){
  const rs=baseRows();const n=rs.length||1;const c=Object.fromEntries(ESTADOS.map(e=>[e.k,rs.filter(r=>r.estado===e.k).length]));
  $("#pipe").innerHTML=`<div class="pipe" role="img" aria-label="${ESTADOS.map(e=>`${e.t} ${c[e.k]}`).join(", ")}">${ESTADOS.filter(e=>c[e.k]).map(e=>`<span style="--c:var(--s-${{nueva:"new",revision:"rev",derivada:"der",insertada:"ins",descartada:"des"}[e.k]});flex:${c[e.k]}"></span>`).join("")}</div>
   <div class="pipe-legend">${ESTADOS.map(e=>`<button class="pl" data-est="${e.k}" aria-pressed="${PF.estado===e.k}">${stPill(e.k)}<span class="pc">${rs.length?Math.round(c[e.k]/n*100):0}%</span><span class="ct">${c[e.k]}</span></button>`).join("")}</div>`;
  $$("#pipe .pl").forEach(b=>b.onclick=()=>{PF.estado=PF.estado===b.dataset.est?"":b.dataset.est;PF.page=0;savePF();updatePanel();$("#table").scrollIntoView({behavior:"smooth",block:"start"})});
}
function drawBars(sel,entries,max){
  const el=$(sel);if(!entries.length){el.innerHTML=`<p class="muted" style="font-size:.88rem">Sin datos en este periodo.</p>`;return}
  let list=entries.slice(0,max);if(entries.length>max){const rest=entries.slice(max).reduce((a,[,v])=>a+v,0);list.push(["Otros",rest])}
  const top=Math.max(...list.map(e=>e[1]));
  el.innerHTML=list.map(([k,v])=>`<div class="bar" title="${esc(k)}: ${v}"><span class="lb">${esc(k)}</span><span class="tr"><span class="fl" style="width:${v/top*100}%"></span></span><span class="v">${v}</span></div>`).join("");
}
function computeAlerts(){
  const rs=baseRows();const n=rs.length;const out=[];
  if(!n)return [{lv:"ok",t:"Sin solicitudes en el periodo",d:"Cuando lleguen solicitudes, aquí verás las alertas automáticas."}];
  const late=rs.filter(r=>r.estado==="nueva"&&Date.now()-r.creado>2*DAY);
  if(late.length)out.push({lv:"crit",t:`${late.length} solicitud${late.length>1?"es":""} sin atender hace más de 48 h`,d:"Asignar orientador hoy. Cada día sin respuesta aumenta la deserción.",act:"nueva"});
  const dist=countBy(rs,r=>r.distrito);if(n>=8&&dist[0][1]/n>=.3)out.push({lv:"warn",t:`Alta concentración en ${dist[0][0]} (${Math.round(dist[0][1]/n*100)}%)`,d:"Priorizar ferias de empleabilidad y orientadores en ese distrito."});
  const money=rs.filter(r=>(r.dificultades||[]).includes("Falta de dinero")).length;if(n>=8&&money/n>=.35)out.push({lv:"warn",t:`${Math.round(money/n*100)}% reporta falta de dinero`,d:"Derivar a Beca 18 y cursos gratuitos; negociar cupos patrocinados."});
  const cel=rs.filter(r=>r.acceso==="Solo celular").length;if(n>=8&&cel/n>=.5)out.push({lv:"info",t:`${Math.round(cel/n*100)}% se conecta solo por celular`,d:"Priorizar contenidos móviles y seguimiento por WhatsApp."});
  const ins=rs.filter(r=>r.estado==="insertada").length;if(n>=10&&ins/n<.15)out.push({lv:"warn",t:`Inserción baja (${Math.round(ins/n*100)}%)`,d:"Ampliar la red de empresas aliadas y revisar el matching."});
  if(!out.length)out.push({lv:"ok",t:"Indicadores dentro de lo esperado",d:"No hay alertas activas en este periodo."});
  return out;
}
function drawAlerts(){
  const icon={crit:"alert",warn:"alert",info:"spark",ok:"check"};
  $("#alerts").innerHTML=computeAlerts().map(a=>`<div class="al ${a.lv==="info"?"":a.lv}">${ic(icon[a.lv])}<div><b>${esc(a.t)}</b><span class="ink2">${esc(a.d)}</span>${a.act?` <button class="btn ghost sm" data-act="${a.act}" style="min-height:0;padding:2px 6px;text-decoration:underline">Ver solicitudes</button>`:""}</div></div>`).join("");
  $$("#alerts [data-act]").forEach(b=>b.onclick=()=>{PF.estado=b.dataset.act;savePF();updatePanel();$("#table").scrollIntoView({behavior:"smooth"})});
}
function stats(){
  const rs=baseRows();const n=rs.length;const pc=x=>n?Math.round(x/n*100):0;
  return {periodo_dias:PF.period||"todo",distrito:PF.distrito||"todos",total:n,
    por_estado:Object.fromEntries(ESTADOS.map(e=>[e.t,rs.filter(r=>r.estado===e.k).length])),
    sin_atender_mas_48h:rs.filter(r=>r.estado==="nueva"&&Date.now()-r.creado>2*DAY).length,
    tiempo_primera_respuesta:fmtDur((()=>{const v=rs.map(firstResp).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null})()),
    por_distrito:Object.fromEntries(countBy(rs,r=>r.distrito)),por_interes:Object.fromEntries(countBy(rs,r=>r.intereses)),
    barreras_pct:Object.fromEntries(countBy(rs,r=>r.dificultades).map(([k,v])=>[k,pc(v)+"%"])),
    acceso_solo_celular_pct:pc(rs.filter(r=>r.acceso==="Solo celular").length)+"%",
    oportunidades_mas_pedidas:Object.fromEntries(countBy(rs,r=>r.oportunidad?.titulo||"Acompañamiento").slice(0,5)),
    avance_ruta_promedio:n?Math.round(rs.reduce((a,r)=>a+(r.rutaAvance||0),0)/n)+"%":"0%"};
}
function ruleInsight(){
  const a=computeAlerts().filter(x=>x.lv!=="ok");const st=stats();
  const map={crit:{p:"La demora rompe el vínculo con el joven recién registrado.",i:"% de solicitudes atendidas en menos de 48 h (meta 90%)"},warn:{p:"Patrón detectado por las reglas automáticas del panel.",i:"Variación del indicador en el próximo periodo"},info:{p:"Condición de acceso de la mayoría de usuarios.",i:"Tasa de finalización de cursos móviles"}};
  return {resumen:`En el periodo hay ${st.total} solicitudes; ${st.por_estado["Insertada"]} jóvenes insertados y ${st.sin_atender_mas_48h} pendientes fuera de plazo.`,
    hallazgos:(a.length?a:[{lv:"info",t:"Operación estable",d:"Mantener el ritmo de atención y ampliar alianzas."}]).slice(0,3).map(x=>({que:x.t,porque:(map[x.lv]||map.info).p,decision:x.d,indicador:(map[x.lv]||map.info).i})),fuente:"reglas"};
}
async function genInsight(){
  if(PF.insightBusy)return;const st=stats();
  if(!st.total){toast("No hay solicitudes en el periodo para analizar.","alert");return}
  PF.insightBusy=true;drawInsight();
  let res=null;
  if(CAP.sample){
    try{res=await CAP.sample.json(`Eres analista de gestión por resultados de "Nexo Futuro AI", empresa de base tecnológica que reduce la población de jóvenes NINI (ni estudian ni trabajan) en Trujillo, Perú. Con estos indicadores agregados del panel (JSON), escribe un informe breve para la toma de decisiones del equipo directivo. Español peruano, profesional y concreto. No inventes cifras que no estén en los datos.

${JSON.stringify(st)}

Responde SOLO con JSON: {"resumen":"2 frases con la situación general y la cifra clave","hallazgos":[{"que":"qué está pasando (con cifra)","porque":"causa probable","decision":"decisión concreta a tomar esta semana","indicador":"indicador para medir si funcionó, con meta"}]} con exactamente 3 hallazgos ordenados por prioridad.`,{cache:false});
      if(!res||!Array.isArray(res.hallazgos)||!res.hallazgos.length)res=null;else res.fuente="ia"}
    catch(e){if(["not_granted","sampling_disabled"].includes(e.code)){CAP.sample=null;setAI()}res=null}
  }
  PF.insight=res||ruleInsight();PF.insight.t=Date.now();PF.insightBusy=false;drawInsight();
}
function drawInsight(){
  const el=$("#insight");if(!el)return;const b=$("#iaBtn");
  if(b){b.disabled=PF.insightBusy;b.innerHTML=`${ic("spark","sm")} ${PF.insight?"Actualizar":(CAP.sample?"Generar con IA":"Generar informe")}`}
  if(PF.insightBusy){el.innerHTML=`<div class="loading" style="margin-bottom:12px"><span class="spin"></span><span>Analizando indicadores… suele tardar entre 10 y 40 segundos.</span></div><div class="stack" style="gap:10px"><div class="skel" style="width:80%"></div><div class="skel" style="width:60%"></div><div class="skel" style="width:90%"></div></div>`;return}
  const I=PF.insight;
  if(!I){el.innerHTML=`<div class="note">${ic("spark")}<div>El sistema lee los indicadores del periodo y filtros actuales y propone <b>3 decisiones priorizadas</b>, cada una con su indicador de seguimiento. ${CAP.sample?"Usa IA generativa.":"Usa el motor de reglas del panel."}</div></div>`;return}
  el.innerHTML=`<div class="insight"><p class="ink2">${esc(I.resumen)}</p>${I.hallazgos.slice(0,3).map((h,i)=>`<div class="dec"><div><span class="eyebrow">${i+1} · Qué pasa</span><span>${esc(h.que)}</span></div><div><span class="eyebrow">Por qué</span><span class="ink2">${esc(h.porque)}</span></div><div><span class="eyebrow">Decisión</span><b>${esc(h.decision)}</b></div><div><span class="eyebrow">Cómo medirlo</span><span class="ink2">${esc(h.indicador)}</span></div></div>`).join("")}<p class="muted" style="font-size:.8rem">${I.fuente==="ia"?"Generado con IA generativa":"Generado con reglas del panel"} · ${fmtDT(I.t)}</p></div>`;
}
function drawTable(){
  const rs=tableRows();const per=12;const pages=Math.max(1,Math.ceil(rs.length/per));PF.page=Math.min(PF.page,pages-1);
  const slice=rs.slice(PF.page*per,PF.page*per+per);
  $("#tCount").textContent=`${rs.length} resultado${rs.length===1?"":"s"}${PF.estado?` · ${EST[PF.estado]}`:""}${PF.distrito?` · ${PF.distrito}`:""}`;
  const th=(k,t)=>{const on=PF.sort.k===k;return `<th aria-sort="${on?(PF.sort.dir==="asc"?"ascending":"descending"):"none"}"><button data-sort="${k}">${t}${on?(PF.sort.dir==="asc"?" ↑":" ↓"):""}</button></th>`};
  const el=$("#table");
  if(!rowsLoaded){el.innerHTML=`<div style="padding:20px" class="stack"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>`;return}
  if(!ROWS.length){el.innerHTML=`<div class="empty"><span class="ic">${ic("inbox")}</span><h3>Aún no hay solicitudes</h3><p class="ink2" style="max-width:52ch">Las postulaciones que los jóvenes envían desde el Portal aparecen aquí al instante.${CAP.isAdmin?" Para la demostración, puedes cargar datos de ejemplo.":""}</p><div class="row">${CAP.isAdmin?`<button class="btn" id="demoLoad2">${ic("db")} Cargar datos de demostración</button>`:""}<button class="btn sec" id="toPortal">Ir al Portal del joven</button></div></div>`;
    const d=$("#demoLoad2");if(d)d.onclick=loadDemo;$("#toPortal").onclick=()=>setView("portal");return}
  if(!rs.length){el.innerHTML=`<div class="empty"><span class="ic">${ic("search")}</span><h3>Sin resultados</h3><p class="ink2">Ninguna solicitud coincide con los filtros.</p><button class="btn sec" id="clr2">Limpiar filtros</button></div>`;$("#clr2").onclick=()=>$("#fClear").click();return}
  el.innerHTML=`<table><thead><tr><th>Código</th>${th("nombre","Joven")}${th("distrito","Distrito")}<th>Solicitud</th><th>Perfil IA</th>${th("creado","Recibida")}${th("avance","Ruta")}${th("estado","Estado")}</tr></thead><tbody>
   ${slice.map(r=>`<tr tabindex="0" data-id="${esc(r.id)}"><td class="code">${codeOf(r.id)}${r.demo?`<span class="demo-flag">DEMO</span>`:""}</td><td><div class="who"><b>${esc(fullName(r))}</b><span>${esc(r.edad)} años · ${esc(r.nivel||"")}</span></div></td><td>${esc(r.distrito)}</td><td><div class="who"><b style="font-weight:600">${esc(r.oportunidad?.titulo||"Acompañamiento")}</b><span>${esc(r.oportunidad?.tipo||"Orientador")}</span></div></td><td class="ink2">${esc(r.perfil?.titulo||"—")}</td><td class="num">${fmtDate(r.creado)}</td><td class="num">${r.rutaAvance||0}%</td><td>${stPill(r.estado)}</td></tr>`).join("")}
  </tbody></table><div class="tfoot"><span>Mostrando ${PF.page*per+1}–${PF.page*per+slice.length} de ${rs.length}</span><div class="row"><button class="btn sec sm" id="pPrev" ${PF.page===0?"disabled":""}>${ic("left","sm")} Anterior</button><button class="btn sec sm" id="pNext" ${PF.page>=pages-1?"disabled":""}>Siguiente ${ic("right","sm")}</button></div></div>`;
  $$("#table [data-sort]").forEach(b=>b.onclick=()=>{const k=b.dataset.sort;PF.sort=PF.sort.k===k?{k,dir:PF.sort.dir==="asc"?"desc":"asc"}:{k,dir:k==="creado"||k==="avance"?"desc":"asc"};drawTable()});
  $$("#table tbody tr").forEach(tr=>{tr.onclick=()=>openDrawer(tr.dataset.id);tr.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDrawer(tr.dataset.id)}}});
  $("#pPrev").onclick=()=>{PF.page--;drawTable()};$("#pNext").onclick=()=>{PF.page++;drawTable()};
  if(PF.open)openDrawer(PF.open,true);
}
function drawDemoCtl(){
  const el=$("#demoCtl");if(!CAP.isAdmin||!ROWS.length){el.innerHTML="";return}
  const nd=ROWS.filter(r=>r.demo).length;
  el.innerHTML=nd?`<span class="muted" style="font-size:.84rem">${nd} registros demo</span><button class="btn ghost sm" id="demoDel">${ic("trash","sm")} Quitar datos demo</button>`:`<button class="btn ghost sm" id="demoLoad">${ic("db","sm")} Cargar datos demo</button>`;
  const a=$("#demoDel");if(a)a.onclick=delDemo;const b=$("#demoLoad");if(b)b.onclick=loadDemo;
}

/* ---------- detalle ---------- */
let lastFocus=null;
function openDrawer(id,refresh){
  const r=ROWS.find(x=>x.id===id);const root=$("#drawerRoot");
  if(!r){closeDrawer();return}
  if(!refresh){lastFocus=document.activeElement}
  const wasOpen=!!$(".drawer.on");PF.open=id;
  const cm=r.perfil?.competencias||{};const h=(r.historial||[]).slice().sort((a,b)=>b.t-a.t);
  const noteVal=refresh&&$("#dNotes")?$("#dNotes").value:(r.notas||"");
  root.innerHTML=`<div class="scrim ${wasOpen?"on":""}" id="scrim"></div>
  <aside class="drawer ${wasOpen?"on":""}" role="dialog" aria-modal="true" aria-labelledby="dTitle">
   <div class="dh"><div class="row between"><span class="code">${codeOf(r.id)}${r.demo?`<span class="demo-flag">DEMO</span>`:""}</span><button class="btn ghost sm" id="dClose" aria-label="Cerrar detalle">${ic("x")}</button></div>
    <h2 id="dTitle" style="font-size:1.4rem">${esc(fullName(r))}</h2>
    <div class="row">${stPill(r.estado)}<span class="tag">${ic("pin","sm")} ${esc(r.distrito)}</span><span class="tag">${esc(r.edad)} años</span></div></div>
   <div class="db">
    <div class="note">${ic(r.tipo==="orientacion"?"users":"brief")}<div><b>${esc(r.oportunidad?.titulo||"Solicita acompañamiento de un orientador")}</b><br><span class="ink2" style="font-size:.86rem">${esc(r.oportunidad?.tipo||"Orientación personalizada")} · recibida ${fmtDT(r.creado)}</span></div></div>
    <dl class="kv"><dt>Estudios</dt><dd>${esc(r.nivel)}</dd><dt>Busca</dt><dd>${esc(r.situacion)}</dd><dt>Acceso</dt><dd>${esc(r.acceso)} · ${esc(r.horas)} h/sem</dd><dt>Celular</dt><dd>${CAP.isAdmin?(r.celular?`<span class="num">${esc(r.celular)}</span> <button class="btn ghost sm" id="dCopy" style="min-height:0;padding:2px 6px">${ic("copy","sm")} Copiar</button>`:"No registrado"):"Oculto"}</dd><dt>Avance de ruta</dt><dd class="num">${r.rutaAvance||0}%</dd></dl>
    <div style="display:grid;gap:8px"><h3>Perfil IA · ${esc(r.perfil?.titulo||"—")}</h3>
     ${Object.entries(cm).map(([k,v])=>`<div class="meter"><span>${esc(k)}</span><div class="track"><div class="fill" style="width:${+v||0}%"></div></div><span class="v">${+v||0}</span></div>`).join("")}</div>
    <div style="display:grid;gap:8px"><h3>Intereses y barreras</h3><div class="tags">${(r.intereses||[]).map(x=>`<span class="tag brand">${esc(x)}</span>`).join("")}${(r.dificultades||[]).map(x=>`<span class="tag sun">${esc(x)}</span>`).join("")}</div>
     ${r.meta?`<p class="ink2" style="font-size:.9rem"><b>Meta:</b> ${esc(r.meta)}</p>`:""}</div>
    <div style="display:grid;gap:10px"><h3>Historial</h3><ul class="tl">${h.map(x=>`<li style="--c:var(--s-${{nueva:"new",revision:"rev",derivada:"der",insertada:"ins",descartada:"des"}[x.estado]||"des"})"><span class="d"></span><div><b>${esc(EST[x.estado]||x.estado)}</b> <span class="muted">· ${fmtDT(x.t)}</span>${x.nota?`<br><span class="ink2">${esc(x.nota)}</span>`:""}</div></li>`).join("")}</ul></div>
    ${CAP.isAdmin?`<label class="f">Notas internas<textarea id="dNotes" placeholder="Acuerdos, llamadas, derivaciones…">${esc(noteVal)}</textarea></label><div class="row"><button class="btn sec sm" id="dSaveN">Guardar nota</button><span class="muted" id="dNs" style="font-size:.84rem"></span></div>`:""}
   </div>
   ${CAP.isAdmin?`<div class="df"><span class="muted" style="font-size:.84rem;width:100%">Cambiar estado</span><div class="stbtns">${ESTADOS.map(e=>`<button class="btn sec sm" data-to="${e.k}" aria-pressed="${r.estado===e.k}">${e.t}</button>`).join("")}</div><div class="row" style="width:100%;justify-content:flex-end" id="delRow"><button class="btn danger sm" id="dDel">${ic("trash","sm")} Eliminar</button></div></div>`:""}
  </aside>`;
  if(!wasOpen)requestAnimationFrame(()=>{$("#scrim").classList.add("on");$(".drawer").classList.add("on")});
  $("#dClose").onclick=closeDrawer;$("#scrim").onclick=closeDrawer;
  const cp=$("#dCopy");if(cp)cp.onclick=async()=>{try{await navigator.clipboard.writeText(r.celular);toast("Número copiado")}catch(e){toast("Copia el número manualmente: "+r.celular,"copy")}};
  $$(".stbtns [data-to]").forEach(b=>b.onclick=()=>setEstado(r,b.dataset.to));
  const sn=$("#dSaveN");if(sn)sn.onclick=async()=>{sn.disabled=true;try{await CAP.db.doc("solicitudes/"+r.id).update({notas:$("#dNotes").value,actualizado:Date.now()});$("#dNs").textContent="Nota guardada"}catch(e){$("#dNs").textContent="No se pudo guardar"}sn.disabled=false};
  const dl=$("#dDel");if(dl)dl.onclick=()=>{$("#delRow").innerHTML=`<span class="ink2" style="font-size:.86rem;margin-right:auto">¿Eliminar esta solicitud? No se puede deshacer.</span><button class="btn sec sm" id="dNo">Cancelar</button><button class="btn danger sm" id="dYes">Eliminar</button>`;$("#dNo").onclick=()=>openDrawer(r.id,true);$("#dYes").onclick=async()=>{try{await CAP.db.doc("solicitudes/"+r.id).delete();closeDrawer();toast("Solicitud eliminada")}catch(e){toast("No se pudo eliminar","alert")}}};
  if(!refresh)setTimeout(()=>$("#dClose").focus(),50);
}
function closeDrawer(){PF.open=null;const d=$(".drawer"),s=$("#scrim");if(d){d.classList.remove("on");s&&s.classList.remove("on");setTimeout(()=>{if(!PF.open)$("#drawerRoot").innerHTML=""},260)}if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&PF.open)closeDrawer()});
async function setEstado(r,to){
  if(r.estado===to)return;
  const nota={revision:"Orientador revisando el perfil",derivada:"Derivado al programa o empresa aliada",insertada:"Joven insertado en estudio o empleo",descartada:"Solicitud cerrada",nueva:"Reabierta"}[to];
  const hist=(r.historial||[]).concat([{estado:to,t:Date.now(),nota}]);
  $$(".stbtns button").forEach(b=>b.disabled=true);
  try{await CAP.db.doc("solicitudes/"+r.id).update({estado:to,actualizado:Date.now(),historial:hist});toast(`Estado actualizado: ${EST[to]}`)}
  catch(e){toast(e.code==="invalid_argument"?"No tienes permiso para cambiar estados.":"No se pudo actualizar. Intenta de nuevo.","alert");$$(".stbtns button").forEach(b=>b.disabled=false)}
}

/* ---------- exportación ---------- */
async function exportCSV(){
  const rs=tableRows();const cols=["Código","Nombres","Apellidos","Edad","Distrito","Nivel","Busca","Acceso","Celular","Intereses","Barreras","Tipo","Oportunidad","Perfil IA","Estado","Recibida","Avance ruta %","Demo"];
  const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
  const lines=[cols.join(",")].concat(rs.map(r=>[codeOf(r.id),CAP.isAdmin?r.nombre:mask(r.nombre),CAP.isAdmin?r.apellido:"",r.edad,r.distrito,r.nivel,r.situacion,r.acceso,CAP.isAdmin?r.celular:"",(r.intereses||[]).join("; "),(r.dificultades||[]).join("; "),r.tipo,r.oportunidad?.titulo||"Acompañamiento",r.perfil?.titulo,EST[r.estado],new Date(r.creado).toISOString().slice(0,16).replace("T"," "),r.rutaAvance||0,r.demo?"sí":"no"].map(q).join(",")));
  try{await CAP.downloads.save({filename:`nexo-futuro-solicitudes-${new Date().toISOString().slice(0,10)}.csv`,data:"﻿"+lines.join("\n")});toast("CSV listo")}
  catch(e){if(e&&e.code!=="declined"&&e.code!=="cancelled")toast("No se pudo exportar el archivo.","alert")}
}

/* ---------- datos de demostración ---------- */
function genDemo(n,seed){
  let a=seed>>>0;const rnd=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const pick=(list,w)=>{const s=w.reduce((x,y)=>x+y,0);let r=rnd()*s;for(let i=0;i<list.length;i++){r-=w[i];if(r<=0)return list[i]}return list[list.length-1]};
  const now=Date.now();const out=[];
  for(let i=0;i<n;i++){
    const ago=Math.floor(Math.pow(rnd(),0.85)*44);const creado=now-ago*DAY-Math.floor(rnd()*10*36e5)-36e5;
    const int0=pick(INTERESES,[22,18,10,12,14,12,5,7]);let ints=[int0];if(rnd()<.6){const b=pick(INTERESES,[1,1,1,1,1,1,1,1]);if(b!==int0)ints.push(b)}
    const difs=[...new Set([pick(DIF,[16,26,30,10,10,8]),...(rnd()<.5?[pick(DIF,[16,26,30,10,10,8])]:[])])];
    const opps=OPPS.filter(o=>o.area.includes("*")||o.area.some(x=>ints.includes(x)));
    const tipo=rnd()<.78?"postulacion":"orientacion";const o=tipo==="postulacion"?opps[Math.floor(rnd()*opps.length)]:null;
    let est;if(ago<2)est=rnd()<.8?"nueva":"revision";else if(ago<7)est=pick(["nueva","revision","derivada"],[2,5,3]);else est=pick(["nueva","revision","derivada","insertada","descartada"],[1,2,4,3,1]);
    const chain={nueva:["nueva"],revision:["nueva","revision"],derivada:["nueva","revision","derivada"],insertada:["nueva","revision","derivada","insertada"],descartada:["nueva","revision","descartada"]}[est];
    let t=creado;const notas={nueva:"Postulación enviada desde el portal",revision:"Orientador revisando el perfil",derivada:"Derivado al programa o empresa aliada",insertada:"Joven insertado en estudio o empleo",descartada:"Solicitud cerrada"};
    const hist=chain.map((s,j)=>{if(j){t=Math.min(now-36e5,t+(6+rnd()*(j===1?60:120))*36e5)}return {estado:s,t,nota:notas[s]}});
    const c=()=>Math.round(30+rnd()*60);
    const A=AREAS[int0];
    out.push({nombre:`Joven demo ${String(i+1).padStart(2,"0")}`,apellido:"",edad:16+Math.floor(rnd()*14),distrito:pick(DISTRITOS,[12,20,17,8,14,6,6,6,6,5]),
      nivel:pick(NIVELES,[4,18,50,16,12]),situacion:pick(SITUACIONES,[45,25,12,18]),acceso:pick(ACCESOS,[60,28,12]),horas:[6,8,10,12,15,20][Math.floor(rnd()*6)],celular:"",
      intereses:ints,dificultades:difs,meta:"",perfil:{titulo:A.t,competencias:{"Digital":c(),"Comunicación":c(),"Numérica":c(),"Técnica":c(),"Empleabilidad":c()},mejorar:A.skills,fortalezas:[]},
      tipo,oportunidad:o?{id:o.id,titulo:o.t,tipo:o.tipo}:null,estado:est,creado,actualizado:hist[hist.length-1].t,historial:hist,notas:"",creadoPor:null,demo:true,fuente:"demo",
      rutaAvance:{nueva:0,revision:20,derivada:40,insertada:100,descartada:20}[est]+(est==="insertada"?0:Math.floor(rnd()*3)*20)});
  }
  return out;
}
async function loadDemo(){
  if(PF.busyDemo)return;PF.busyDemo=true;const rows=genDemo(48,20260929);let ok=0;
  toast("Cargando datos de demostración…","db");
  for(let i=0;i<rows.length;i++){try{await CAP.db.doc("solicitudes/demo-"+String(i+1).padStart(3,"0")).set(rows[i]);ok++}catch(e){if(e.code==="invalid_argument"){toast("No tienes permiso para escribir datos.","lock");break}}}
  PF.busyDemo=false;if(ok)toast(`${ok} solicitudes de demostración cargadas`);
}
async function delDemo(){
  if(PF.busyDemo)return;PF.busyDemo=true;const d=ROWS.filter(r=>r.demo);toast("Quitando datos de demostración…","trash");
  for(const r of d){try{await CAP.db.doc("solicitudes/"+r.id).delete()}catch(e){}}
  PF.busyDemo=false;toast("Datos de demostración eliminados");
}

let rz;window.addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{if(VIEW==="panel")drawLine()},150)});

