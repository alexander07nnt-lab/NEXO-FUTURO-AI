/* Nexo Futuro · Página de inicio */
"use strict";
function renderLanding(){
  const main=$("#main");
  main.innerHTML=`
  <section class="lx-hero">
    <div class="lx-hero-copy">
      <p class="lx-kicker"><span class="dot"></span>Empleabilidad juvenil · Trujillo, Perú</p>
      <h1>Tu primera oportunidad <span class="hl">está más cerca</span> de lo que crees.</h1>
      <p class="lx-lead">Nexo Futuro orienta a jóvenes que hoy no estudian ni trabajan: descubre sus fortalezas, les arma un plan de 12 semanas y los conecta con becas, cursos gratuitos y empleo. Las instituciones siguen cada caso hasta lograr resultados.</p>
      <div class="row" style="gap:12px;margin-top:28px">
        <button class="btn lx-cta" data-goto="portal">Empieza tu diagnóstico gratis ${ic("right")}</button>
        <button class="btn lx-ghost" data-goto="panel">${ic("users")} Soy una institución</button>
      </div>
      <ul class="lx-proof">
        <li>${ic("check","sm")} 100 % gratis para jóvenes</li>
        <li>${ic("check","sm")} Solo 3 minutos</li>
        <li>${ic("check","sm")} Desde tu celular</li>
      </ul>
    </div>
    <div class="lx-mock" aria-hidden="true">
      <div class="mk-panel">
        <div class="mk-bar"><i></i><i></i><i></i><span>Panel de instituciones</span></div>
        <div class="mk-kpis">
          <div><small>Solicitudes</small><b>312</b><em class="up">▲ 18%</em></div>
          <div><small>Inserción</small><b>27%</b><em class="up">▲ 4 pts</em></div>
          <div><small>Respuesta</small><b>31 h</b><em>meta 48 h</em></div>
        </div>
        <svg viewBox="0 0 300 80" class="mk-spark" preserveAspectRatio="none"><defs><linearGradient id="mkg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7394FF" stop-opacity=".45"/><stop offset="1" stop-color="#7394FF" stop-opacity="0"/></linearGradient></defs><path d="M0 62 L25 55 L50 58 L75 44 L100 48 L125 36 L150 40 L175 28 L200 32 L225 20 L250 24 L275 14 L300 10 L300 80 L0 80Z" fill="url(#mkg)"/><path d="M0 62 L25 55 L50 58 L75 44 L100 48 L125 36 L150 40 L175 28 L200 32 L225 20 L250 24 L275 14 L300 10" fill="none" stroke="#9DB3FF" stroke-width="2.5" stroke-linejoin="round"/><circle cx="300" cy="10" r="4" fill="#F2B632"/></svg>
        <div class="mk-pipe"><span style="flex:3;background:#3987e5"></span><span style="flex:2;background:#c98500"></span><span style="flex:4;background:#9085e9"></span><span style="flex:3;background:#0ca30c"></span></div>
      </div>
      <div class="mk-phone">
        <div class="mk-ph-head"><span class="mk-av">L</span><div><b>Luis, 20 años</b><small>La Esperanza</small></div></div>
        <div class="mk-tag">${ic("spark","sm")} Perfil comercial digital</div>
        <div class="mk-step done"><span>S1</span>CertiJoven y CV</div>
        <div class="mk-step done"><span>S2</span>Excel para negocios</div>
        <div class="mk-step now"><span>S7</span>Simulación de entrevista</div>
        <div class="mk-step"><span>S9</span>Postulación</div>
        <div class="mk-ok">${ic("check","sm")} Derivado a empleo</div>
      </div>
    </div>
  </section>

  <section class="lx-sec" id="problema">
    <div class="lx-head"><p class="eyebrow">El problema</p><h2>Más de un millón de jóvenes peruanos no estudian ni trabajan</h2><p class="ink2">No es falta de talento. Es falta de orientación, de experiencia y de un puente hacia la oportunidad correcta.</p></div>
    <div class="lx-stats">
      <div class="lx-stat"><b>1,3 M</b><span>jóvenes de 15 a 29 años no estudian ni trabajan: el <strong>15,6 %</strong> de ese grupo.</span><small>CCL, con datos ENAHO 2024</small></div>
      <div class="lx-stat"><b>2×</b><span>La tasa en mujeres jóvenes (<strong>23,3 %</strong>) duplica la de los hombres (11,6 %).</span><small>CEPLAN, 2024</small></div>
      <div class="lx-stat"><b>2.º</b><span>La Libertad es el segundo departamento con más jóvenes en esta situación (<strong>6,9 %</strong> del total).</span><small>CCL, con datos ENAHO 2024</small></div>
      <div class="lx-stat accent"><b>96,7 %</b><span>de estos jóvenes tiene acceso a internet. Podemos llegar a ellos donde ya están.</span><small>CCL, con datos ENAHO 2024</small></div>
    </div>
    <div class="lx-causes">
      <h3>Por qué pasa</h3>
      <div class="cz">
        ${[["Falta de orientación vocacional","No sabe qué estudiar o aprender"],["Sin experiencia laboral","No accede al primer empleo"],["Brecha de habilidades digitales","Menor competitividad"],["Desconoce oportunidades","No encuentra becas, cursos ni empleos"],["Limitaciones económicas","Abandona o no inicia estudios"],["Falta de acompañamiento","Se desmotiva y no avanza"]].map(([c,e])=>`<div class="cz-row"><span class="cz-c">${c}</span><span class="cz-arrow">${ic("right","sm")}</span><span class="cz-e">${e}</span></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="lx-sec" id="como-funciona">
    <div class="lx-head"><p class="eyebrow">Cómo funciona</p><h2>Del diagnóstico a la oportunidad, con seguimiento en cada paso</h2></div>
    <ol class="lx-flow">
      ${[["user","Regístrate","Tus datos básicos en 1 minuto, con total privacidad."],["spark","Descubre tu perfil","Un diagnóstico identifica tus fortalezas y lo que te falta."],["book","Sigue tu plan","12 semanas de cursos gratuitos, con un tutor virtual siempre disponible."],["brief","Postula","Becas, capacitación y empleos que encajan contigo."],["trend","Te acompañamos","Un orientador sigue tu caso hasta que logres tu meta."]].map(([i,t,d],n)=>`<li><span class="lx-flow-ic">${ic(i)}</span><span class="lx-flow-n">Paso ${n+1}</span><h3>${t}</h3><p>${d}</p></li>`).join("")}
    </ol>
    <div class="row"><button class="btn" data-goto="portal">Empezar ahora ${ic("right")}</button></div>
  </section>

  <section class="lx-sec" id="tecnologia">
    <div class="lx-head"><p class="eyebrow">Nuestra plataforma</p><h2>Una arquitectura que conecta al joven con todo el ecosistema</h2></div>
    <div class="arch">
      ${[["Canales","Cómo llega el usuario",["Web y celular","WhatsApp","Panel de instituciones"]],
         ["Servicios","Qué hace la plataforma",["Registro y perfil","Diagnóstico","Plan de 12 semanas","Tutor virtual","Matching","Seguimiento"]],
         ["Inteligencia","Cómo decide",["IA generativa (Google Gemini)","Reglas de orientación","Analítica y alertas"]],
         ["Datos","Qué se gestiona",["Solicitudes y estados","Catálogo de oportunidades","Indicadores de impacto"]],
         ["Aliados","Con quién trabajamos",["MTPE · PRONABEC","SENATI · SENCICO · CETPRO","Empresas de la región","Municipalidades · ONG"]]]
        .map(([t,sub,items],i)=>`<div class="arch-row l${i}"><div class="arch-lab"><b>${t}</b><small>${sub}</small></div><div class="arch-items">${items.map(x=>`<span>${x}</span>`).join("")}</div></div>`).join("")}
    </div>
    <div class="lx-ai">
      <article class="ai-card main"><div class="ai-top"><span class="ai-ic">${ic("spark")}</span><div><h3>Inteligencia artificial generativa</h3><small>Google Gemini</small></div></div>
        <p>Convierte las respuestas de cada joven en un perfil claro, redacta su plan de 12 semanas, responde sus dudas como tutor y resume los indicadores para las instituciones.</p>
        <p class="muted" style="font-size:.86rem">El Critical Technology Tracker de ASPI incluye la IA generativa entre las 74 tecnologías críticas que monitorea (actualización de diciembre de 2025).</p></article>
      <article class="ai-card"><div class="ai-top"><span class="ai-ic">${ic("layout")}</span><div><h3>Reglas de orientación</h3><small>Criterios verificables</small></div></div>
        <p>Criterios definidos por orientadores que garantizan recomendaciones coherentes y un servicio que nunca se detiene.</p></article>
      <article class="ai-card"><div class="ai-top"><span class="ai-ic">${ic("trend")}</span><div><h3>Analítica en tiempo real</h3><small>Gestión por resultados</small></div></div>
        <p>Indicadores, embudo de atención y alertas automáticas para decidir con evidencia y medir el impacto.</p></article>
      <article class="ai-card"><div class="ai-top"><span class="ai-ic">${ic("lock")}</span><div><h3>Privacidad</h3><small>Ley N.° 29733</small></div></div>
        <p>El joven autoriza el uso de sus datos antes de postular, y solo el equipo de orientación los ve.</p></article>
    </div>
  </section>

  <section class="lx-sec" id="instituciones">
    <div class="lx-head"><p class="eyebrow">Para instituciones</p><h2>El joven no paga. Trabajamos con quienes buscan resultados.</h2></div>
    <div class="lx-biz">
      ${[["Municipalidades","Programas de empleabilidad juvenil por cohorte, con reportes de avance.","Por joven atendido"],["Empresas","Acceso a talento joven con competencias verificadas.","Suscripción de reclutamiento"],["ONG y cooperación","Gestión y medición de programas sociales.","Licencia por programa"],["Institutos y universidades","Orientación vocacional y captación de estudiantes.","Suscripción institucional"],["Empresas con RSE","Becas y cursos para jóvenes de su zona de influencia.","Patrocinio con reporte de impacto"]].map(([t,d,p])=>`<div class="biz"><h3>${t}</h3><p>${d}</p><span class="tag brand">${p}</span></div>`).join("")}
      <div class="biz free"><h3>Jóvenes</h3><p>Diagnóstico, plan, tutor y postulaciones.</p><span class="tag ok">Gratis</span></div>
    </div>
  </section>

  <section class="lx-sec" id="hoja-de-ruta">
    <div class="lx-head"><p class="eyebrow">Hoja de ruta</p><h2>De Trujillo al resto del país en 12 meses</h2></div>
    <ol class="lx-plan">
      ${[["M1","Diagnóstico","Caracterización de los jóvenes de Trujillo con datos ENAHO y entrevistas."],["M2","Diseño","Pruebas de usabilidad con 20 jóvenes."],["M3","Asistente","Diagnóstico, planes y tutor en funcionamiento."],["M4","Contenidos","Catálogo de cursos gratuitos y oportunidades."],["M4–5","Alianzas","Convenios con la municipalidad, SENATI, SENCICO, CETPRO y 10 empresas."],["M6–8","Lanzamiento","500 jóvenes de La Esperanza, El Porvenir y Alto Trujillo."],["M9","Evaluación","Medición de indicadores y mejoras."],["M10–12","Expansión","Chiclayo y Piura, con licencias municipales."]].map(([m,t,d])=>`<li><span class="pm">${m}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join("")}
    </ol>
  </section>

  <section class="lx-sec" id="impacto">
    <div class="lx-head"><p class="eyebrow">Impacto</p><h2>Nuestras metas para el primer año</h2><p class="ink2">Cada meta se mide en vivo en el panel de instituciones.</p></div>
    <div class="lx-kpi">
      ${[["500","jóvenes registrados"],["70 %","completan el diagnóstico"],["40 %","inician un curso de su plan"],["20 %","logran estudiar o trabajar en 6 meses"],["< 48 h","tiempo de primera respuesta"],["4,3 / 5","satisfacción de los usuarios"]].map(([v,t])=>`<div><b>${v}</b><span>${t}</span></div>`).join("")}
    </div>
  </section>

  <section class="lx-final">
    <div><h2>La tecnología no reemplaza las oportunidades. Las conecta con quienes las necesitan.</h2><p>Empieza hoy. Es gratis y toma solo 3 minutos.</p></div>
    <div class="row" style="gap:12px"><button class="btn lx-cta" data-goto="portal">Empezar mi diagnóstico ${ic("right")}</button><button class="btn lx-ghost" data-goto="panel">Soy una institución</button></div>
  </section>

  <section class="lx-sources"><h3>Fuentes de los datos</h3><ul>
    <li><a href="https://lacamara.pe/uno-de-cada-seis-jovenes-en-el-peru-ni-estudia-ni-trabaja/" target="_blank" rel="noopener">Cámara de Comercio de Lima (2025). Uno de cada seis jóvenes en el Perú ni estudia ni trabaja.</a></li>
    <li><a href="https://www.elperuano.pe/noticia/294768-dia-del-trabajo-ceplan-advierte-brechas-persistentes-en-empleo-juvenil-y-calidad-laboral-en-el-peru" target="_blank" rel="noopener">El Peruano (2026). CEPLAN advierte brechas persistentes en empleo juvenil.</a></li>
    <li><a href="https://www.aspistrategist.org.au/aspis-critical-technology-tracker-2025-updates-and-10-new-technologies/" target="_blank" rel="noopener">ASPI (2025). Critical Technology Tracker: 2025 updates and 10 new technologies.</a></li>
  </ul></section>`;
  $$("[data-goto]").forEach(b=>b.onclick=()=>setView(b.dataset.goto));
}
