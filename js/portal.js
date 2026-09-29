/* Nexo Futuro AI · Portal del joven */
"use strict";
/* ================= Estado local ================= */
const FRESH=()=>({step:0,maxStep:0,p:null,res:null,done:{},chat:[],sent:{}});
let S=FRESH();
try{const v=JSON.parse(localStorage.getItem("nexo2")||"null");if(v&&typeof v==="object")S=Object.assign(FRESH(),v)}catch(e){}
function save(){try{localStorage.setItem("nexo2",JSON.stringify(S))}catch(e){}}
let VIEW="portal";
try{if(location.hash==="#panel")VIEW="panel";else{const v=localStorage.getItem("nexo2-view");if(v==="panel"||v==="portal")VIEW=v}}catch(e){}

/* ================= Capacidades ================= */
const CAP={sample:null,db:null,user:null,downloads:null,uid:null,canWrite:null,isAdmin:false,ready:false};
let ROWS=[];let rowsLoaded=false;let dbError="";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ic=(n,c="")=>`<svg class="ico ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const stPill=k=>`<span class="st" data-s="${esc(k)}"><i></i>${esc(EST[k]||k)}</span>`;
function toast(msg,icon="check"){const t=$("#toast");t.innerHTML=ic(icon)+`<span>${esc(msg)}</span>`;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),3200)}
const fmtDate=ms=>new Date(ms).toLocaleDateString("es-PE",{day:"2-digit",month:"short"});
const fmtDT=ms=>new Date(ms).toLocaleString("es-PE",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const codeOf=id=>{id=String(id);return id.startsWith("demo-")?"NF-D"+id.slice(5):"NF-"+id.replace(/[^a-z0-9]/gi,"").slice(-6).toUpperCase()};

function setAI(){const el=$("#aiStatus");if(CAP.sample){el.classList.add("on");$("#aiText").textContent="IA activa"}else{el.classList.remove("on");$("#aiText").textContent=CAP.ready?"Motor de reglas activo":"Cargando…"}}

window.addEventListener("DOMContentLoaded",async()=>{
  CAP.sample=NexoStore.sample;CAP.db=NexoStore.db;CAP.user=NexoStore.user;CAP.downloads=NexoStore.downloads;
  CAP.uid=await CAP.user.id();CAP.canWrite=await CAP.user.can("data.write");CAP.isAdmin=!!(await CAP.user.canEdit());
  subscribeRows();CAP.ready=true;setAI();render();
});

let unsub=null;
function subscribeRows(){
  if(unsub)return;
  unsub=CAP.db.collection("solicitudes").orderBy("creado","desc").limit(1000).onSnapshot(snap=>{
    ROWS=snap.docs.map(d=>Object.assign({id:d.id},d.data()));rowsLoaded=true;dbError="";onRows();
  },e=>{dbError=e.code||"error";rowsLoaded=true;onRows()});
}
function onRows(){
  const nb=$("#navBadge");const n=ROWS.filter(r=>r.estado==="nueva").length;
  nb.hidden=!(CAP.isAdmin&&n);nb.textContent=n;
  if(VIEW==="panel")renderPanel();else if(S.step===4||S.step===5)renderPortal(true);
}

/* ================= Navegación ================= */
function setView(v){VIEW=v;try{localStorage.setItem("nexo2-view",v)}catch(e){}render();window.scrollTo({top:0});$("#main").focus({preventScroll:true})}
$$(".tab").forEach(b=>b.onclick=()=>setView(b.dataset.view));
function render(){
  $$(".tab").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.view===VIEW)));
  if(VIEW==="panel")renderPanel();else renderPortal();
}

/* ================= PORTAL ================= */
function go(i){S.step=i;S.maxStep=Math.max(S.maxStep,i);save();renderPortal();const w=$("#wizard");if(w)w.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})}
function renderPortal(soft){
  if(S.step>1&&!S.res){S.step=0;S.maxStep=0}
  const main=$("#main");
  if(soft&&$("#wizard")){paneFns[S.step]();return}
  main.innerHTML=`
  <section class="hero">
    <div>
      <p class="eyebrow">Para jóvenes de 15 a 29 años en Trujillo</p>
      <h1 style="margin-top:12px">Tu próximo paso <em>empieza aquí</em>.</h1>
      <p class="lead" style="margin-top:16px">Responde un diagnóstico de 3 minutos. Nuestra IA identifica tus fortalezas, arma una ruta de aprendizaje a tu medida y te conecta con becas, cursos gratuitos y empleos.</p>
      <div class="row" style="margin-top:22px"><button class="btn" id="startBtn">${S.maxStep>0?"Continuar mi ruta":"Comenzar diagnóstico"} ${ic("right")}</button><span class="muted" style="font-size:.88rem">Gratis · Sin crear contraseña</span></div>
      <div class="how">
        <div><b>1 · Diagnóstico</b>Intereses, habilidades y metas</div>
        <div><b>2 · Perfil IA</b>Fortalezas y brechas</div>
        <div><b>3 · Ruta</b>Plan de 12 semanas</div>
        <div><b>4 · Oportunidad</b>Postulas y te acompañamos</div>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <svg class="bg" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"><circle cx="330" cy="40" r="60"/><circle cx="330" cy="40" r="110"/><circle cx="330" cy="40" r="160"/></g><path d="M20 250 C 120 250, 150 120, 260 110 S 360 60, 390 30" stroke="#F2B632" stroke-width="3" fill="none" stroke-dasharray="2 9" stroke-linecap="round"/><circle cx="390" cy="30" r="6" fill="#F2B632"/></svg>
      <div class="card">
        <div class="row between"><span class="eyebrow">Ruta sugerida · ejemplo</span><span class="tag brand">${ic("spark","sm")} IA</span></div>
        <div class="mini-step"><span class="n">S1</span><span>CertiJoven y CV</span>${ic("check","sm")}</div>
        <div class="mini-step"><span class="n">S2</span><span>Excel para negocios</span>${ic("check","sm")}</div>
        <div class="mini-step"><span class="n">S7</span><span>Simulación de entrevista</span><span class="muted" style="font-size:.78rem">En curso</span></div>
        <div class="mini-step"><span class="n">S9</span><span>Postulación a empleo junior</span><span></span></div>
      </div>
    </div>
  </section>
  <section class="wizard" id="wizard" aria-label="Diagnóstico y ruta">
    <nav class="rail" aria-label="Pasos"><h4>Tu avance</h4><div id="rail" style="display:contents"></div></nav>
    <div class="pane" id="pane"></div>
  </section>`;
  $("#startBtn").onclick=()=>{$("#wizard").scrollIntoView({behavior:"smooth"});setTimeout(()=>{const f=$("#pane input,#pane button");f&&f.focus({preventScroll:true})},350)};
  paneFns[S.step]();
}
function drawRail(){
  $("#rail").innerHTML=STEPS.map((s,i)=>`<button class="rstep ${i<S.step||i<S.maxStep&&i!==S.step?"done":""} ${i===S.step?"now":""}" data-go="${i}" ${i>S.maxStep?'aria-disabled="true"':""} ${i===S.step?'aria-current="step"':""}><span class="n">${i<S.maxStep&&i!==S.step?`<svg class="ico sm" aria-hidden="true"><use href="#i-check"/></svg>`:i+1}</span><span class="lbl">${s}</span></button>`).join("");
  $$("#rail .rstep").forEach(b=>b.onclick=()=>{const i=+b.dataset.go;if(i<=S.maxStep)go(i)});
}
function pane(html){drawRail();$("#pane").innerHTML=html}
const paneFns=[pRegistro,pTest,pPerfil,pRuta,pOpps,pSeg];

function opt(list,v){return list.map(d=>`<option ${d===v?"selected":""}>${esc(d)}</option>`).join("")}
function pRegistro(){
  const p=S.p||EJEMPLO;
  pane(`<div class="pane-head"><p class="eyebrow">Paso 1 de 6</p><h2>Cuéntanos sobre ti</h2><p class="ink2">Con estos datos personalizamos tu ruta. Solo los ve el equipo de orientación de Nexo Futuro.</p></div>
  ${p.ejemplo?`<div class="note sun">${ic("book")}<div><b>Formulario con datos de ejemplo.</b> Muestra el caso de Luis para la demostración. Edítalo o <button class="btn ghost sm" id="clear" style="min-height:0;padding:0 4px;text-decoration:underline">empieza con el formulario vacío</button>.</div></div>`:""}
  <form id="f1" class="stack" novalidate>
   <div class="fgrid">
    <label class="f">Nombres <span class="sr">obligatorio</span><input type="text" id="nombre" autocomplete="given-name" value="${esc(p.nombre)}" required></label>
    <label class="f">Apellidos<input type="text" id="apellido" autocomplete="family-name" value="${esc(p.apellido||"")}"></label>
    <label class="f">Edad<input type="number" id="edad" inputmode="numeric" min="15" max="29" value="${esc(p.edad)}" required><span class="help">Programa para jóvenes de 15 a 29 años</span></label>
    <label class="f">Celular (WhatsApp)<input type="tel" id="celular" inputmode="tel" autocomplete="tel" placeholder="9XX XXX XXX" value="${esc(p.celular||"")}"><span class="help">Para avisarte cuando avance tu solicitud</span></label>
    <label class="f">Distrito<select id="distrito">${opt(DISTRITOS,p.distrito)}</select></label>
    <label class="f">Último nivel de estudios<select id="nivel">${opt(NIVELES,p.nivel)}</select></label>
    <label class="f">¿Qué buscas ahora?<select id="situacion">${opt(SITUACIONES,p.situacion)}</select></label>
    <label class="f">¿Cómo te conectas?<select id="acceso">${opt(ACCESOS,p.acceso)}</select></label>
    <label class="f">Horas libres por semana<input type="number" id="horas" inputmode="numeric" min="1" max="60" value="${esc(p.horas)}"></label>
   </div>
   <p class="field-err" id="e1" role="alert" hidden></p>
   <div class="pane-foot"><span class="muted" style="font-size:.85rem;align-self:center">${ic("lock","sm")} Tus datos no se comparten con empresas sin tu permiso.</span><button class="btn" type="submit">Continuar ${ic("right")}</button></div>
  </form>`);
  const c=$("#clear");if(c)c.onclick=e=>{e.preventDefault();S.p={nombre:"",apellido:"",edad:"",distrito:"Trujillo",nivel:"Secundaria completa",situacion:"Busco trabajo",acceso:"Solo celular",horas:8,celular:"",consent:false,intereses:[],hab:{},dif:[],meta:""};save();pRegistro()};
  $("#f1").onsubmit=e=>{e.preventDefault();const er=$("#e1");
    const nombre=$("#nombre").value.trim(),edad=+$("#edad").value;
    if(!nombre){er.hidden=false;er.textContent="Escribe tu nombre para continuar.";$("#nombre").focus();return}
    if(!(edad>=15&&edad<=29)){er.hidden=false;er.textContent="La edad debe estar entre 15 y 29 años.";$("#edad").focus();return}
    S.p=Object.assign({},S.p||EJEMPLO,{nombre,apellido:$("#apellido").value.trim(),edad,celular:$("#celular").value.trim(),distrito:$("#distrito").value,nivel:$("#nivel").value,situacion:$("#situacion").value,acceso:$("#acceso").value,horas:Math.max(1,+$("#horas").value||8)});
    save();go(1)};
}
function pTest(){
  const p=S.p;
  pane(`<div class="pane-head"><p class="eyebrow">Paso 2 de 6 · Diagnóstico</p><h2>¿Qué te interesa y qué sabes hacer, ${esc(p.nombre)}?</h2><p class="ink2">No hay respuestas buenas ni malas. Toma unos 3 minutos.</p></div>
  <form id="f2" class="stack" novalidate>
   <fieldset><legend>Temas que te interesan <span class="help">· elige hasta 3</span></legend><div class="chips">${INTERESES.map((x,i)=>`<label class="chip"><input type="checkbox" name="int" id="int${i}" value="${esc(x)}" ${p.intereses.includes(x)?"checked":""}><span>${esc(x)}</span></label>`).join("")}</div></fieldset>
   <fieldset><legend>¿Qué tan bien te va en…?</legend><div class="skills">${HAB.map((h,i)=>`<div class="skill"><span>${esc(h)}</span><div class="seg" role="radiogroup" aria-label="${esc(h)}">${["Poco","Regular","Bien"].map((o,j)=>`<label><input type="radio" name="h${i}" id="h${i}_${j}" value="${j+1}" ${(p.hab[h]||2)===j+1?"checked":""}><span>${o}</span></label>`).join("")}</div></div>`).join("")}</div></fieldset>
   <fieldset><legend>¿Qué se te hace difícil hoy? <span class="help">· opcional</span></legend><div class="chips">${DIF.map((x,i)=>`<label class="chip"><input type="checkbox" name="dif" id="dif${i}" value="${esc(x)}" ${p.dif.includes(x)?"checked":""}><span>${esc(x)}</span></label>`).join("")}</div></fieldset>
   <label class="f">¿Qué te gustaría lograr en los próximos 6 meses?<textarea id="meta">${esc(p.meta)}</textarea></label>
   <p class="field-err" id="e2" role="alert" hidden></p>
   <div class="pane-foot"><button class="btn sec" type="button" id="back">${ic("left")} Atrás</button><button class="btn" type="submit">${ic("spark")} Generar mi perfil con IA</button></div>
  </form>`);
  $$('input[name=int]').forEach(c=>c.onchange=()=>{if($$('input[name=int]:checked').length>3){c.checked=false;toast("Puedes elegir hasta 3 temas","alert")}});
  $("#back").onclick=()=>go(0);
  $("#f2").onsubmit=async e=>{e.preventDefault();
    const ints=$$('input[name=int]:checked').map(x=>x.value);
    if(!ints.length){const er=$("#e2");er.hidden=false;er.textContent="Elige al menos un tema que te interese.";$("#int0").focus();return}
    const hab={};HAB.forEach((h,i)=>hab[h]=+($(`input[name=h${i}]:checked`)?.value||2));
    Object.assign(S.p,{intereses:ints,hab,dif:$$('input[name=dif]:checked').map(x=>x.value),meta:$("#meta").value.trim()});save();
    await generar()};
}
async function generar(){
  drawRail();
  $("#pane").innerHTML=`<div class="pane-head"><p class="eyebrow">Analizando</p><h2>Estamos armando tu perfil</h2></div>
   <div class="loading">${CAP.sample?`<span class="spin"></span><span>La IA está analizando tus respuestas. Suele tardar entre 10 y 40 segundos.</span>`:`<span class="spin"></span><span>Calculando tu perfil…</span>`}</div>
   <div class="stack" style="gap:10px"><div class="skel" style="width:70%"></div><div class="skel" style="width:90%"></div><div class="skel" style="width:55%"></div></div>
   ${CAP.sample?"":""}`;
  let res=null;
  if(CAP.sample){
    try{res=await CAP.sample.json(promptPerfil(S.p));if(!validRes(res))res=null;else res.fuente="ia"}
    catch(e){if(["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"].includes(e.code)){CAP.sample=null;setAI()}res=null}
  }
  if(!res){await new Promise(r=>setTimeout(r,700));res=reglas(S.p);res.fuente="basico"}
  res.competencias=Object.fromEntries(Object.entries(res.competencias||{}).map(([k,v])=>[k,Math.max(0,Math.min(100,Math.round(+v||0)))]));
  S.res=res;S.done={};S.chat=[];save();go(2);
}
function promptPerfil(p){
  return `Eres el motor de orientación de "Nexo Futuro AI", una plataforma peruana que ayuda a jóvenes que ni estudian ni trabajan (NINI) en Trujillo, Perú. Escribe en español peruano claro, cálido y profesional, dirigido al joven (tú). Sé realista y concreto.

Perfil del joven (JSON):
${JSON.stringify({nombre:p.nombre,edad:p.edad,distrito:p.distrito,nivel_estudios:p.nivel,busca:p.situacion,acceso:p.acceso,horas_semana:p.horas,intereses:p.intereses,autoevaluacion_1a3:p.hab,dificultades:p.dif,meta_6_meses:p.meta})}

Catálogo de oportunidades disponibles (usa SOLO estos id):
${OPPS.map(o=>`- ${o.id}: ${o.t} (${o.tipo}) – ${o.d}`).join("\n")}

Responde SOLO con un objeto JSON con esta forma exacta:
{"titulo":"nombre corto del perfil, ej. 'Perfil comercial con base digital'","resumen":"2 frases sobre la persona","fortalezas":["3 fortalezas"],"mejorar":["3 habilidades a desarrollar"],"competencias":{"Digital":0-100,"Comunicación":0-100,"Numérica":0-100,"Técnica":0-100,"Empleabilidad":0-100},"ruta":[{"semana":"S1-2","titulo":"...","accion":"qué hacer concretamente","recurso":"curso o recurso gratuito sugerido"}],"oportunidades":[{"id":"id del catálogo","porque":"1 frase de por qué le conviene"}],"mensaje":"1 frase motivadora personal"}
La ruta debe tener 5 pasos que cubran unas 12 semanas y respeten sus horas libres y su acceso (si solo tiene celular, recursos que funcionen en celular). Elige entre 4 y 6 oportunidades.`;
}
function validRes(r){return r&&typeof r==="object"&&r.titulo&&Array.isArray(r.ruta)&&r.ruta.length&&Array.isArray(r.oportunidades)&&Array.isArray(r.fortalezas)&&Array.isArray(r.mejorar)}
const AREAS={
 "Negocios y ventas":{t:"Perfil comercial",skills:["Excel básico","Ventas y atención al cliente","Comunicación efectiva"],curso:"Excel para negocios (Conecta Empleo)"},
 "Tecnología y computación":{t:"Perfil digital",skills:["Ofimática","Soporte técnico básico","Pensamiento lógico"],curso:"Introducción a la computación (SENATI / Conecta Empleo)"},
 "Salud y cuidado":{t:"Perfil de cuidado",skills:["Primeros auxilios","Cuidado de personas","Empatía y comunicación"],curso:"Primeros auxilios básicos (CETPRO)"},
 "Gastronomía":{t:"Perfil gastronómico",skills:["Manipulación de alimentos","Cocina básica","Costeo de platos"],curso:"Manipulación de alimentos (CETPRO)"},
 "Oficios técnicos":{t:"Perfil técnico",skills:["Electricidad básica","Seguridad en el trabajo","Lectura de planos simples"],curso:"Electricidad domiciliaria (SENATI)"},
 "Diseño y redes sociales":{t:"Perfil creativo digital",skills:["Canva y diseño básico","Redes sociales para negocios","Edición de video en celular"],curso:"Marketing digital para mypes (Conecta Empleo)"},
 "Educación y niños":{t:"Perfil educativo",skills:["Comunicación con niños","Organización de actividades","Liderazgo"],curso:"Estimulación temprana (CETPRO)"},
 "Turismo y atención":{t:"Perfil de servicio",skills:["Atención al cliente","Inglés básico","Conocimiento turístico local"],curso:"Inglés básico para atención al cliente"},
};
function reglas(p){
  const a=AREAS[p.intereses[0]],b=AREAS[p.intereses[1]]||a,h=p.hab;
  const pct=v=>Math.round((v||2)/3*100);
  const fort=Object.entries(h).filter(([,v])=>v>=3).map(([k])=>k);
  const low=Object.entries(h).filter(([,v])=>v<=1).map(([k])=>k);
  const opps=OPPS.filter(o=>o.area.some(x=>p.intereses.includes(x))).slice(0,3).concat(OPPS.filter(o=>["certijoven","empleab","beca18"].includes(o.id)));
  return {titulo:a.t+(b!==a?" con base "+b.t.replace("Perfil ","").toLowerCase():""),
   resumen:`${p.nombre}, ${p.edad} años, de ${p.distrito}. Te interesan ${p.intereses.join(" y ").toLowerCase()} y tienes una meta clara: ${p.meta||"avanzar en estudios o trabajo"}.`,
   fortalezas:(fort.length?fort:["Motivación para empezar"]).concat(["Interés en "+p.intereses[0].toLowerCase()]).slice(0,3),
   mejorar:[...new Set([...a.skills.slice(0,2),...(low.length?low:[b.skills[0]])])].slice(0,3),
   competencias:{"Digital":pct(h["Uso de computadora"]),"Comunicación":pct(h["Comunicación"]),"Numérica":pct(h["Números y cálculo"]),"Técnica":pct(h["Trabajo manual / técnico"]),"Empleabilidad":Math.round((pct(h["Trabajo en equipo"])+pct(h["Comunicación"]))/2)},
   ruta:[
    {semana:"S1",titulo:"Documentos listos",accion:"Saca tu CertiJoven gratis y arma tu primer CV con ayuda del tutor IA.",recurso:"CertiJoven (MTPE)"},
    {semana:"S2-4",titulo:a.skills[0],accion:`Dedica ${Math.max(3,Math.round(p.horas/2))} horas por semana a este curso corto.`,recurso:a.curso},
    {semana:"S5-6",titulo:a.skills[1],accion:"Practica con ejercicios reales y comparte tu avance con tu orientador.",recurso:b.curso},
    {semana:"S7-8",titulo:"Simulación de entrevista",accion:"Practica 3 entrevistas con el tutor IA y mejora tus respuestas.",recurso:"Tutor IA de Nexo Futuro"},
    {semana:"S9-12",titulo:"Postulación",accion:"Postula a las oportunidades recomendadas y registra cada resultado.",recurso:"Empleos Perú + empresas aliadas"}],
   oportunidades:opps.slice(0,6).map(o=>({id:o.id,porque:o.area.includes("*")?"Gratuito y útil para cualquier perfil.":"Coincide con tu interés en "+o.area.find(x=>p.intereses.includes(x)).toLowerCase()+"."})),
   mensaje:"Cada semana que avanzas cuenta. Vamos paso a paso."};
}
function pPerfil(){
  const r=S.res,p=S.p;
  pane(`<div class="profile-hero"><p class="eyebrow">Paso 3 de 6 · Tu perfil</p><h2 style="color:#fff">${esc(r.titulo)}</h2><p>${esc(r.resumen)}</p><span class="src">${ic("spark","sm")} ${r.fuente==="ia"?"Generado con IA generativa a partir de tus respuestas":"Generado con el motor básico de reglas"}</span></div>
   <div class="grid2">
    <div class="card" style="display:grid;gap:12px"><h3>Tus fortalezas</h3><div class="tags">${r.fortalezas.map(x=>`<span class="tag ok">${ic("check","sm")}${esc(x)}</span>`).join("")}</div></div>
    <div class="card" style="display:grid;gap:12px"><h3>Habilidades a desarrollar</h3><div class="tags">${r.mejorar.map(x=>`<span class="tag sun">${ic("trend","sm")}${esc(x)}</span>`).join("")}</div></div>
   </div>
   <div class="card" style="display:grid;gap:12px"><div class="row between"><h3>Nivel estimado de competencias</h3><span class="muted" style="font-size:.8rem">Escala 0–100</span></div>${Object.entries(r.competencias).map(([k,v])=>`<div class="meter"><span>${esc(k)}</span><div class="track" role="img" aria-label="${esc(k)}: ${v} de 100"><div class="fill" style="width:${v}%"></div></div><span class="v">${v}</span></div>`).join("")}</div>
   <div class="pane-foot"><button class="btn sec" id="redo">${ic("left")} Repetir diagnóstico</button><button class="btn" id="nx">Ver mi ruta ${ic("right")}</button></div>`);
  $("#redo").onclick=()=>go(1);$("#nx").onclick=()=>go(3);
}
function pRuta(){
  const r=S.res;
  pane(`<div class="pane-head"><p class="eyebrow">Paso 4 de 6 · Ruta personalizada</p><h2>Tu plan de 12 semanas</h2><p class="ink2">Pensado para tus ${esc(S.p.horas)} horas libres por semana y tu acceso (${esc(S.p.acceso.toLowerCase())}).</p></div>
   <ol class="route">${r.ruta.map(s=>`<li><span class="wk">${esc(s.semana)}</span><div class="body"><h3>${esc(s.titulo)}</h3><p class="ink2">${esc(s.accion)}</p><p class="res">${ic("book","sm")} ${esc(s.recurso)}</p></div></li>`).join("")}</ol>
   <div class="card" style="display:grid;gap:14px;background:var(--surface-2)">
    <div class="row between"><div><h3>Tutor virtual</h3><p class="muted" style="font-size:.88rem">Te explica temas, te ayuda con tu CV o simula una entrevista.</p></div><span class="tag brand">${ic("spark","sm")} ${CAP.sample?"IA generativa":"Asistente guiado"}</span></div>
    <div class="chips" id="quick">${["Simula una entrevista de trabajo conmigo","Explícame Excel desde cero","Ayúdame a escribir mi CV"].map(q=>`<button class="btn sec sm" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>
    <div class="chat" id="chat" aria-live="polite"></div>
    <form class="composer" id="cf"><label class="sr" for="cin">Pregunta para el tutor IA</label><input type="text" id="cin" placeholder="Escribe tu pregunta…"><button class="btn" id="csend" aria-label="Enviar">${ic("send")}</button></form>
    <p class="muted" id="cst" style="font-size:.85rem"></p>
   </div>
   <div class="pane-foot"><button class="btn sec" id="bk">${ic("left")} Atrás</button><button class="btn" id="nx">Ver oportunidades ${ic("right")}</button></div>`);
  $("#bk").onclick=()=>go(2);$("#nx").onclick=()=>go(4);
  drawChat();
  $$("#quick button").forEach(b=>b.onclick=()=>ask(b.dataset.q));
  $("#cf").onsubmit=e=>{e.preventDefault();const v=$("#cin").value.trim();if(v){$("#cin").value="";ask(v)}};
}
function drawChat(live){
  const c=$("#chat");if(!c)return;
  c.innerHTML=(S.chat.length||live?"":`<p class="muted" style="font-size:.88rem">Elige una opción rápida o escribe tu pregunta.</p>`)+S.chat.map(m=>`<div class="msg ${m.role==="user"?"me":"bot"}">${esc(m.content)}</div>`).join("")+(live?`<div class="msg bot" id="live">${esc(live)}</div>`:"");
  c.scrollTop=c.scrollHeight;
}
let busy=false;
/* Tutor local (sin IA): respuestas guiadas para las 3 funciones principales */
const PREGUNTAS_ENTREVISTA=[
 "Cuéntame un poco sobre ti: ¿quién eres y qué te gustaría lograr?",
 "¿Por qué te interesa trabajar en esta empresa o puesto?",
 "Cuéntame una situación en la que resolviste un problema. ¿Qué hiciste?",
 "¿Cuál dirías que es tu mayor fortaleza y en qué necesitas mejorar?",
 "¿Qué disponibilidad de horario tienes y cómo llegarías al trabajo?"];
function tutorLocal(q){
  const t=q.toLowerCase();const p=S.p,r=S.res;
  const enEntrevista=S.chat.some(m=>m.role==="assistant"&&m.content.startsWith("Entrevistador ·"))||t.includes("entrevista");
  if(t.includes("entrevista")){S.entrevista=0;return `Entrevistador · Simulación de entrevista\nSoy el entrevistador. Responde como si fuera real; al final te doy recomendaciones.\n\nPregunta 1 de ${PREGUNTAS_ENTREVISTA.length}: ${PREGUNTAS_ENTREVISTA[0]}`}
  if(enEntrevista&&typeof S.entrevista==="number"&&S.entrevista<PREGUNTAS_ENTREVISTA.length){
    const fb=q.length<60?"Tu respuesta es muy corta. Agrega un ejemplo concreto de algo que hiciste.":q.length>500?"Buena idea, pero intenta resumir en 3 o 4 frases.":"¡Bien! Tu respuesta tiene un buen largo. Recuerda usar ejemplos concretos: situación, acción y resultado.";
    S.entrevista++;
    if(S.entrevista>=PREGUNTAS_ENTREVISTA.length){S.entrevista=null;return `Entrevistador · ${fb}\n\n¡Terminaste la simulación! Recomendaciones:\n• Llega 10 minutos antes y lleva tu CV y DNI.\n• Mira a los ojos y saluda con seguridad.\n• Relaciona tus respuestas con ${r.fortalezas[0]||"tus fortalezas"}.\n• Al final, pregunta: "¿Cuáles serían mis funciones en el primer mes?"`}
    return `Entrevistador · ${fb}\n\nPregunta ${S.entrevista+1} de ${PREGUNTAS_ENTREVISTA.length}: ${PREGUNTAS_ENTREVISTA[S.entrevista]}`;
  }
  if(t.includes("excel"))return "Excel desde cero, en 5 pasos:\n1. Celdas: cada casilla tiene una dirección, como A1 (columna A, fila 1).\n2. Escribe datos: nombres en la columna A y precios en la columna B.\n3. Suma: en B6 escribe =SUMA(B1:B5) y presiona Enter.\n4. Promedio: =PROMEDIO(B1:B5).\n5. Formato: selecciona los precios y elige el formato \"Moneda\" (S/).\n\nPráctica: arma la lista de gastos de una semana y calcula el total. Desde el celular puedes usar la app gratuita de Excel o Google Sheets.";
  if(t.includes("cv")||t.includes("curr")){
    return `Aquí tienes un borrador de CV. Complétalo y revísalo:\n\n${(p.nombre+" "+(p.apellido||"")).trim().toUpperCase()}\n${p.distrito}, Trujillo · Celular: ${p.celular||"(tu número)"} · Correo: (tu correo)\n\nPERFIL\nJoven de ${p.edad} años con interés en ${p.intereses.join(" y ").toLowerCase()}. ${r.fortalezas.slice(0,2).join(" y ")}. Busco ${p.situacion==="Quiero estudiar"?"oportunidades de estudio":"mi primera experiencia laboral"} para seguir creciendo.\n\nEDUCACIÓN\n${p.nivel} – (nombre del colegio o instituto), (año)\n\nCURSOS\n(Agrega aquí los cursos de tu ruta cuando los completes)\n\nHABILIDADES\n${r.fortalezas.join(" · ")}\n\nDISPONIBILIDAD\n${p.horas} horas por semana (ajústalo según el puesto)`;
  }
  return `Buena pregunta. Para consultas abiertas conecta un servicio de IA a la plataforma. Mientras tanto, te recomiendo:\n• Seguir el paso actual de tu ruta: ${(r.ruta.find((_,i)=>!S.done[i])||r.ruta[0]).titulo}.\n• Usar las opciones rápidas: simular una entrevista, aprender Excel o armar tu CV.\n• Solicitar acompañamiento en el paso 5: un orientador te escribirá por WhatsApp.`;
}

async function ask(q){
  if(busy)return;const st=$("#cst");
  S.chat.push({role:"user",content:q});drawChat("Pensando…");
  if(!CAP.sample){await new Promise(r=>setTimeout(r,500));S.chat.push({role:"assistant",content:tutorLocal(q)});save();drawChat();return}
  busy=true;$("#csend").disabled=true;st.textContent="";
  const p=S.p,r=S.res;
  const rules=`Eres el tutor virtual de "Nexo Futuro AI" (Perú). Hablas con ${p.nombre}, ${p.edad} años, de ${p.distrito}, Trujillo. Perfil: ${r.titulo}. Intereses: ${p.intereses.join(", ")}. Acceso: ${p.acceso}. Habilidades a desarrollar: ${r.mejorar.join(", ")}. Responde en español peruano sencillo, cálido y breve (máximo 150 palabras), con pasos concretos. Si piden simular una entrevista, actúa como entrevistador: haz UNA pregunta a la vez y, cuando el joven responda, da retroalimentación corta y la siguiente pregunta. Si piden un CV, pide los datos que falten y arma una versión en texto. No inventes ofertas reales ni sueldos exactos.`;
  try{const {text}=await CAP.sample([{role:"user",content:rules},...S.chat.slice(-12)],{cache:false,onText:({text})=>{const l=$("#live");if(l)l.textContent=text}});S.chat.push({role:"assistant",content:text})}
  catch(e){if(e.code==="not_granted"||e.code==="sampling_disabled"){CAP.sample=null;setAI();S.chat.push({role:"assistant",content:"No se dio permiso para usar la IA en esta vista."})}
   else if(e.code!=="cancelled"){if(e.text)S.chat.push({role:"assistant",content:e.text});st.textContent=e.code==="rate_limited"?"Demasiadas preguntas seguidas. Espera un momento e intenta de nuevo.":"No se pudo responder. Intenta de nuevo."}}
  busy=false;const b=$("#csend");if(b)b.disabled=false;save();drawChat();
}

/* ---------- envío de solicitudes ---------- */
function myRows(){return CAP.uid?ROWS.filter(r=>r.creadoPor===CAP.uid):ROWS.filter(r=>Object.values(S.sent).includes(r.id))}
function sentFor(key){const id=S.sent[key];return id?ROWS.find(r=>r.id===id)||{id,estado:"nueva",pending:true}:null}
async function enviar(tipo,oppId,btn){
  const p=S.p,r=S.res;
  if(!p.consent){const ok=await askConsent();if(!ok)return}
  if(!CAP.db){toast("No se pudo enviar: esta vista no tiene conexión con la base de datos.","alert");return}
  if(CAP.canWrite===false){toast("Tu acceso es de solo lectura. Pide acceso de colaborador para enviar solicitudes.","lock");return}
  btn.disabled=true;const old=btn.innerHTML;btn.innerHTML=`<span class="spin" style="width:16px;height:16px;border-width:2px"></span> Enviando…`;
  const o=oppId?OPP[oppId]:null;const now=Date.now();
  const doc={nombre:p.nombre,apellido:p.apellido||"",edad:p.edad,distrito:p.distrito,nivel:p.nivel,situacion:p.situacion,acceso:p.acceso,horas:p.horas,celular:p.celular||"",
    intereses:p.intereses,dificultades:p.dif,meta:p.meta,perfil:{titulo:r.titulo,competencias:r.competencias,mejorar:r.mejorar,fortalezas:r.fortalezas},
    tipo,oportunidad:o?{id:o.id,titulo:o.t,tipo:o.tipo}:null,estado:"nueva",creado:now,actualizado:now,
    historial:[{estado:"nueva",t:now,nota:tipo==="orientacion"?"Solicitud de acompañamiento enviada":"Postulación enviada desde el portal"}],notas:"",creadoPor:CAP.uid||null,demo:false,fuente:r.fuente,rutaAvance:0};
  try{const ref=CAP.db.collection("solicitudes").doc();await ref.set(doc);S.sent[oppId||"orientacion"]=ref.id;save();toast(tipo==="orientacion"?"Solicitud enviada. Un orientador te contactará.":"Postulación enviada a "+o.t);renderPortal(true)}
  catch(e){btn.disabled=false;btn.innerHTML=old;
    if(e.code==="invalid_argument"){CAP.canWrite=false;toast("Tu acceso es de solo lectura. Pide acceso de colaborador para enviar solicitudes.","lock")}
    else if(e.code==="quota_exceeded")toast("La base de datos está llena. Avisa al equipo de Nexo Futuro.","alert");
    else toast("No se pudo enviar. Revisa tu conexión e intenta de nuevo.","alert")}
}
function askConsent(){
  return new Promise(res=>{
    const root=$("#drawerRoot");
    root.innerHTML=`<div class="scrim on" id="cs"></div><div role="dialog" aria-modal="true" aria-labelledby="ct" style="position:fixed;inset:0;display:grid;place-items:center;z-index:62;padding:16px;pointer-events:none"><div class="card" style="max-width:460px;display:grid;gap:14px;pointer-events:auto;box-shadow:var(--shadow)">
      <h3 id="ct">Antes de enviar tu solicitud</h3>
      <p class="ink2" style="font-size:.92rem">Tu perfil y tus datos de contacto se enviarán al equipo de orientación de Nexo Futuro para darte seguimiento y conectarte con la oportunidad elegida.</p>
      <label class="consent"><input type="checkbox" id="cchk"><span>Autorizo el tratamiento de mis datos personales conforme a la Ley N.° 29733 para fines de orientación y empleabilidad.</span></label>
      <div class="row" style="justify-content:flex-end"><button class="btn sec" id="cno">Cancelar</button><button class="btn" id="cyes" disabled>Aceptar y enviar</button></div></div></div>`;
    const done=v=>{root.innerHTML="";res(v)};
    $("#cchk").onchange=e=>$("#cyes").disabled=!e.target.checked;
    $("#cno").onclick=()=>done(false);$("#cs").onclick=()=>done(false);
    $("#cyes").onclick=()=>{S.p.consent=true;save();done(true)};
    document.addEventListener("keydown",function k(e){if(e.key==="Escape"){document.removeEventListener("keydown",k);if($("#cno"))done(false)}});
    $("#cchk").focus();
  });
}
function sendBtn(key,label){
  const s=sentFor(key);
  if(s)return `<span class="btn done sm">${ic("check","sm")} Enviada</span>${stPill(s.estado)}`;
  return `<button class="btn sm" data-send="${esc(key)}">${ic("send","sm")} ${label}</button>`;
}
function pOpps(){
  const r=S.res;
  const list=r.oportunidades.map(o=>({o:OPP[o.id],porque:o.porque})).filter(x=>x.o);
  pane(`<div class="pane-head"><p class="eyebrow">Paso 5 de 6 · Matching</p><h2>Oportunidades para ti</h2><p class="ink2">Seleccionadas según tu perfil. Al postular, tu solicitud llega al panel del equipo de orientación y puedes seguir su estado.</p></div>
   ${CAP.canWrite===false?`<div class="note sun">${ic("lock")}<div>Estás en modo de solo lectura: puedes explorar, pero para enviar solicitudes necesitas acceso de colaborador.</div></div>`:""}
   <div class="opps">${list.map(({o,porque})=>`<article class="opp"><span class="type">${esc(o.tipo)}</span><h3>${esc(o.t)}</h3><p class="ink2" style="font-size:.9rem">${esc(o.d)}</p><p class="why">${ic("check","sm")}<span>${esc(porque)}</span></p><div class="acts">${sendBtn(o.id,"Postular")}${o.url?`<a href="${o.url}" target="_blank" rel="noopener">Sitio oficial ${ic("ext","sm")}</a>`:""}</div></article>`).join("")}</div>
   <div class="note">${ic("users")}<div style="display:grid;gap:8px"><div><b>¿Prefieres hablar con una persona?</b> Solicita acompañamiento y un orientador te escribirá por WhatsApp.</div><div class="row">${sendBtn("orientacion","Solicitar acompañamiento")}</div></div></div>
   <div class="pane-foot"><button class="btn sec" id="bk">${ic("left")} Atrás</button><button class="btn" id="nx">Ir a mi seguimiento ${ic("right")}</button></div>`);
  $("#bk").onclick=()=>go(3);$("#nx").onclick=()=>go(5);
  $$("[data-send]").forEach(b=>b.onclick=()=>{const k=b.dataset.send;enviar(k==="orientacion"?"orientacion":"postulacion",k==="orientacion"?null:k,b)});
}
function pSeg(){
  const r=S.res;const n=r.ruta.length;const d=r.ruta.filter((_,i)=>S.done[i]).length;const pc=Math.round(d/n*100);const C=2*Math.PI*36;
  const mine=myRows();
  pane(`<div class="pane-head"><p class="eyebrow">Paso 6 de 6 · Seguimiento</p><h2>Tu avance, ${esc(S.p.nombre)}</h2></div>
   <div class="grid2">
    <div class="card ring"><svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label="${pc}% de la ruta completada"><circle cx="44" cy="44" r="36" fill="none" stroke="var(--surface-2)" stroke-width="10"/><circle cx="44" cy="44" r="36" fill="none" stroke="var(--brand)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C*pc/100} ${C}" transform="rotate(-90 44 44)"/></svg>
     <div style="display:grid;gap:4px"><span class="big num">${pc}%</span><span class="muted">${d} de ${n} pasos completados</span></div></div>
    <div class="card" style="display:grid;gap:6px;align-content:start"><h3>Mis solicitudes</h3>
     ${mine.length?`<div class="mylist">${mine.map(m=>`<div class="myrow"><div class="who"><b>${esc(m.oportunidad?m.oportunidad.titulo:"Acompañamiento de orientador")}</b><span>${codeOf(m.id)} · ${fmtDate(m.creado)}</span></div>${stPill(m.estado)}</div>`).join("")}</div>`
      :`<p class="muted" style="font-size:.9rem">Aún no envías solicitudes. Postula desde el paso 5.</p>`}
    </div>
   </div>
   ${pc===0?`<div class="note sun">${ic("clock")}<div>Aún no marcas pasos. Si pasan 7 días sin avance, tu orientador te enviará un recordatorio por WhatsApp.</div></div>`:pc===100?`<div class="note ok">${ic("check")}<div>¡Completaste tu ruta! Tu perfil queda destacado para las empresas aliadas.</div></div>`:""}
   <div class="card"><h3 style="margin-bottom:6px">Marca lo que ya hiciste</h3>${r.ruta.map((s,i)=>`<label class="check ${S.done[i]?"done":""}"><input type="checkbox" id="c${i}" data-i="${i}" ${S.done[i]?"checked":""}><span><span class="t"><b>${esc(s.semana)}</b> · ${esc(s.titulo)}</span><br><span class="res">${esc(s.recurso)}</span></span></label>`).join("")}</div>
   <p class="ink2" style="font-style:italic">“${esc(r.mensaje)}”</p>
   <div class="pane-foot"><button class="btn sec" id="bk">${ic("left")} Atrás</button><button class="btn ghost" id="reset">Registrar a otro joven</button></div>`);
  $$(".check input").forEach(c=>c.onchange=async()=>{S.done[c.dataset.i]=c.checked;save();pSeg();syncAvance()});
  $("#bk").onclick=()=>go(4);
  $("#reset").onclick=()=>{S=FRESH();save();renderPortal();$("#wizard").scrollIntoView({behavior:"smooth"})};
}
async function syncAvance(){
  if(!CAP.db||CAP.canWrite===false)return;
  const r=S.res;const pc=Math.round(r.ruta.filter((_,i)=>S.done[i]).length/r.ruta.length*100);
  for(const m of myRows()){if(m.rutaAvance===pc)continue;try{await CAP.db.doc("solicitudes/"+m.id).update({rutaAvance:pc})}catch(e){}}
}
