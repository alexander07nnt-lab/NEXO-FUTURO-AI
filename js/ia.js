/* =====================================================================
   Nexo Futuro · Asistente inteligente (ia.js)
   ---------------------------------------------------------------------
   Proveedores:
     - Google Gemini (tiene nivel gratuito)
     - Anthropic Claude (de pago)
   La clave se configura en js/config.js. Si falta o falla, la
   plataforma usa automáticamente el motor de reglas.
   ===================================================================== */
"use strict";
const NexoIA=(()=>{
  const KEY="nexo-ia-config";
  const PROVIDERS={
    gemini:{name:"Google Gemini",model:"gemini-3.5-flash",keyUrl:"https://aistudio.google.com/apikey",note:"Tiene nivel gratuito. Crea tu clave en Google AI Studio."},
    claude:{name:"Anthropic Claude",model:"claude-haiku-4-5-20251001",keyUrl:"https://platform.claude.com/",note:"De pago por uso. Crea tu clave en la consola de Claude."}
  };
  let cfg=null;
  const fileCfg=(()=>{const c=window.NEXO_CONFIG||{};const k=String(c.IA_CLAVE||"").trim();if(!k)return null;const prov=c.IA_PROVEEDOR==="claude"?"claude":"gemini";return {provider:prov,key:k,model:String(c.IA_MODELO||"").trim()||PROVIDERS[prov].model,fromFile:true}})();
  const getConfig=()=>cfg||fileCfg;
  const setConfig=c=>{cfg=c};

  /* Une turnos consecutivos del mismo rol (ambas APIs piden alternancia) */
  function toTurns(input){
    const list=typeof input==="string"?[{role:"user",content:input}]:input;
    const out=[];for(const m of list){const last=out[out.length-1];if(last&&last.role===m.role)last.content+="\n\n"+m.content;else out.push({role:m.role,content:String(m.content)})}
    return out;
  }
  function fail(code,message){const e={code,message};throw e}
  function httpError(status,body){
    const msg=(body&&(body.error?.message||body.message))||"";
    if(status===400&&/api key|API_KEY/i.test(msg))return fail("auth","La clave de API no es válida.");
    if(status===401||status===403)return fail("auth","La clave de API no es válida o no tiene permisos.");
    if(status===404)return fail("model","El modelo indicado no existe o tu clave no tiene acceso a él.");
    if(status===429)return fail("rate_limited","Se alcanzó el límite de uso de la IA. Espera un minuto e intenta de nuevo.");
    return fail("upstream_error","El servicio de IA respondió con un error ("+status+"). "+msg.slice(0,140));
  }
  async function callGemini(c,turns,json,signal){
    const url="https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(c.model)+":generateContent";
    const body={contents:turns.map(t=>({role:t.role==="assistant"?"model":"user",parts:[{text:t.content}]})),generationConfig:{temperature:.7,maxOutputTokens:4096}};
    if(json)body.generationConfig.responseMimeType="application/json";
    let r;try{r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":c.key},body:JSON.stringify(body),signal})}catch(e){fail(e.name==="AbortError"?"cancelled":"network","No se pudo conectar con Google Gemini. Revisa tu conexión a internet.")}
    const data=await r.json().catch(()=>null);
    if(!r.ok)httpError(r.status,data);
    const cand=data?.candidates?.[0];
    const text=(cand?.content?.parts||[]).map(p=>p.text||"").join("").trim();
    if(!text)fail(cand?.finishReason==="SAFETY"?"refused":"empty_completion","La IA no devolvió una respuesta. Intenta reformular.");
    return {text,truncated:cand?.finishReason==="MAX_TOKENS"};
  }
  async function callClaude(c,turns,json,signal){
    if(turns[0]?.role!=="user")turns=[{role:"user",content:"Hola"}].concat(turns);
    const body={model:c.model,max_tokens:4096,messages:turns};
    if(json)body.system="Responde únicamente con JSON válido, sin texto adicional ni bloques de código.";
    let r;try{r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":c.key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify(body),signal})}catch(e){fail(e.name==="AbortError"?"cancelled":"network","No se pudo conectar con Anthropic. Revisa tu conexión a internet.")}
    const data=await r.json().catch(()=>null);
    if(!r.ok)httpError(r.status,data);
    const text=(data?.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").trim();
    if(!text)fail("empty_completion","La IA no devolvió una respuesta. Intenta reformular.");
    return {text,truncated:data?.stop_reason==="max_tokens"};
  }
  function parseJSON(text){
    const tryP=s=>{try{return JSON.parse(s)}catch(e){return undefined}};
    let v=tryP(text);if(v!==undefined)return v;
    const f=text.match(/```(?:json)?\s*([\s\S]*?)```/);if(f){v=tryP(f[1]);if(v!==undefined)return v}
    const a=text.search(/[\[{]/),b=Math.max(text.lastIndexOf("}"),text.lastIndexOf("]"));
    if(a>=0&&b>a){v=tryP(text.slice(a,b+1));if(v!==undefined)return v}
    const e={code:"invalid_json",message:"La IA respondió en un formato inesperado.",text};throw e;
  }
  function report(e){if(e&&e.code!=="cancelled")console.warn("[Nexo] Asistente no disponible:",e.message||e)}

  /* Misma interfaz que usa la app: sample(input, opts) y sample.json(input, opts) */
  function makeSample(c){
    const run=async(input,opts={},json)=>{
      const turns=toTurns(input);
      try{
        const res=await (c.provider==="claude"?callClaude:callGemini)(c,turns,json,opts.signal);
        if(opts.onText)try{opts.onText({text:res.text,delta:res.text})}catch(e){}
        return res;
      }catch(e){report(e);throw e}
    };
    const sample=(input,opts)=>run(input,opts,false);
    sample.json=async(input,opts)=>{const r=await run(input,opts,true);try{return parseJSON(r.text)}catch(e){report(e);throw e}};
    return sample;
  }
  const getSample=()=>{const c=getConfig();return c&&c.key?makeSample(c):null};
  async function test(c){const s=makeSample(c);const r=await s("Responde solo con la palabra: listo");return r.text}
  return {PROVIDERS,getConfig,setConfig,getSample,test};
})();

