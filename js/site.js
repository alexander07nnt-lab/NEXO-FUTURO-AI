/* Nexo Futuro · Elementos generales del sitio (pie de página, textos legales) */
"use strict";
(function(){
  const C=window.NEXO_CONFIG||{};
  $("#yr").textContent=new Date().getFullYear();
  $$("[data-view-go]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.viewGo)));
  $(".brand").addEventListener("click",e=>{e.preventDefault();setView("inicio")});
  const wa=String(C.EMPRESA_WHATSAPP||"").replace(/\D/g,"");
  const box=$("#sfContact");
  const items=[];
  if(C.EMPRESA_CORREO)items.push(`<a href="mailto:${esc(C.EMPRESA_CORREO)}">${esc(C.EMPRESA_CORREO)}</a>`);
  if(wa)items.push(`<a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp +${esc(wa)}</a>`);
  items.push(`<span>${esc(C.EMPRESA_DIRECCION||"Trujillo, Perú")}</span>`);
  box.insertAdjacentHTML("beforeend",items.join(""));

  function legal(title,html){
    const root=$("#drawerRoot");
    root.innerHTML=`<div class="scrim on" id="lgS"></div><div role="dialog" aria-modal="true" aria-labelledby="lgT" class="lg-wrap"><div class="card lg-card">
      <div class="row between"><h2 id="lgT" style="font-size:1.4rem">${title}</h2><button class="btn ghost sm" id="lgX" aria-label="Cerrar">${ic("x")}</button></div>
      <div class="lg-body">${html}</div></div></div>`;
    const close=()=>{root.innerHTML="";document.removeEventListener("keydown",k)};
    const k=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",k);
    $("#lgX").onclick=close;$("#lgS").onclick=close;$("#lgX").focus();
  }
  const contacto=C.EMPRESA_CORREO?` escribiendo a <b>${esc(C.EMPRESA_CORREO)}</b>`:" a través de nuestros canales de contacto";
  $("#privBtn").onclick=()=>legal("Política de privacidad",`
    <p>Nexo Futuro trata los datos personales conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento.</p>
    <h3>Qué datos recopilamos</h3><p>Nombres, edad, distrito, nivel educativo, celular, intereses, habilidades autoevaluadas, dificultades y metas que el usuario registra voluntariamente.</p>
    <h3>Para qué los usamos</h3><p>Para elaborar tu perfil y tu plan, recomendarte oportunidades, darte seguimiento y generar estadísticas agregadas sin datos personales.</p>
    <h3>Quién los ve</h3><p>Solo el equipo de orientación de Nexo Futuro y la institución a la que postulas. No vendemos ni cedemos tus datos a terceros.</p>
    <h3>Servicios de terceros</h3><p>Para generar tu perfil y las respuestas del tutor, el texto de tus respuestas puede procesarse mediante el servicio de Google Gemini.</p>
    <h3>Tus derechos</h3><p>Puedes solicitar el acceso, la rectificación, la cancelación o la oposición al uso de tus datos (derechos ARCO)${contacto}.</p>`);
  $("#termBtn").onclick=()=>legal("Términos de uso",`
    <p>Nexo Futuro es un servicio gratuito de orientación para jóvenes. Las recomendaciones son referenciales y no garantizan la obtención de una beca o un empleo.</p>
    <p>Las oportunidades de terceros (PRONABEC, MTPE, SENATI, SENCICO, CETPRO y otras) se rigen por sus propias bases y requisitos. Verifica siempre la información en el sitio oficial de cada institución.</p>
    <p>El usuario se compromete a registrar información veraz. El panel de instituciones es de uso exclusivo del personal autorizado.</p>`);
})();
