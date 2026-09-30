/* =====================================================================
   Nexo Futuro · Capa de datos (store.js)
   ---------------------------------------------------------------------
   Dos modos, elegidos automáticamente según js/config.js:
   1) Supabase (nube): si SUPABASE_URL y SUPABASE_CLAVE están completos.
      Las solicitudes llegan al panel desde cualquier dispositivo.
   2) Local: guarda en el navegador y sincroniza entre pestañas.
   Ambos exponen la misma API (collection / doc / onSnapshot).
   ===================================================================== */
"use strict";
const NexoStore=(()=>{
  const CFG=window.NEXO_CONFIG||{};
  const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const clone=o=>JSON.parse(JSON.stringify(o));
  const subs=new Set();
  const notify=()=>setTimeout(()=>subs.forEach(s=>s()),0);
  const sortSlice=(rows,order,dir,lim)=>{
    const all=rows.map(([id,d])=>({id,exists:true,data:()=>d,metadata:{fromCache:false,hasPendingWrites:false}}));
    if(order)all.sort((a,b)=>{const x=a.data()[order],y=b.data()[order];return (x>y?1:x<y?-1:0)*(dir==="desc"?-1:1)});
    const docs=lim?all.slice(0,lim):all;return {docs,size:docs.length,empty:!docs.length};
  };
  let db,mode;

  const SB_URL=String(CFG.SUPABASE_URL||"").trim().replace(/\/+$/,""),SB_KEY=String(CFG.SUPABASE_CLAVE||"").trim();
  if(SB_URL&&SB_KEY){
    /* ---------- Supabase ---------- */
    mode="nube";
    const H={"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json"};
    const T=c=>SB_URL+"/rest/v1/"+encodeURIComponent(c);
    let rowsByCol={};
    const err=async r=>{let m="";try{m=(await r.json()).message||""}catch(e){}return {code:r.status===401||r.status===403?"invalid_argument":"unavailable",message:m||("Error "+r.status)}};
    async function pull(col){
      const r=await fetch(T(col)+"?select=id,data&order=creado.desc&limit=1000",{headers:H});
      if(!r.ok)throw await err(r);
      rowsByCol[col]=(await r.json()).map(x=>[x.id,x.data]);
    }
    async function refresh(col){try{await pull(col);notify()}catch(e){console.warn("[Nexo] Supabase:",e.message)}}
    const docRef=(col,id)=>({id,path:col+"/"+id,
      async get(){const r=await fetch(T(col)+"?select=data&id=eq."+encodeURIComponent(id),{headers:H});if(!r.ok)throw await err(r);const j=await r.json();return {id,exists:!!j[0],data:()=>j[0]?.data}},
      async set(data){const r=await fetch(T(col),{method:"POST",headers:{...H,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id,data:clone(data),creado:data.creado||Date.now()})});if(!r.ok)throw await err(r);await refresh(col)},
      async update(patch){const cur=await this.get();if(!cur.exists)throw {code:"invalid_argument",message:"El registro no existe"};
        const data=Object.assign({},cur.data(),clone(patch));const r=await fetch(T(col)+"?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{...H,"Prefer":"return=minimal"},body:JSON.stringify({data})});if(!r.ok)throw await err(r);await refresh(col)},
      async delete(){const r=await fetch(T(col)+"?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:H});if(!r.ok)throw await err(r);await refresh(col)}});
    const query=(col,order,dir,lim)=>({
      orderBy:(f,d="asc")=>query(col,f,d,lim),limit:n=>query(col,order,dir,n),
      async get(){await pull(col);return sortSlice(rowsByCol[col],order,dir,lim)},
      onSnapshot(next,onErr){
        const fn=()=>next(sortSlice(rowsByCol[col]||[],order,dir,lim));subs.add(fn);
        let failed=false;
        const tick=async()=>{try{await pull(col);failed=false;fn()}catch(e){if(!failed&&onErr)onErr(e);failed=true}};
        tick();const t=setInterval(()=>{if(!document.hidden)tick()},5000);
        return()=>{subs.delete(fn);clearInterval(t)}},
      doc:id=>docRef(col,id||newId()),
      async add(data){const r=docRef(col,newId());await r.set(data);return r}});
    db={collection:c=>query(c),doc:p=>{const [c,id]=p.split("/");return docRef(c,id)}};
  }else{
    /* ---------- Local (navegador) ---------- */
    mode="local";
    const KEY="nexo-db-v1";let cache=null;
    const read=()=>{if(cache)return cache;try{cache=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){cache={}}if(typeof cache!=="object"||!cache)cache={};return cache};
    const write=()=>{try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){throw {code:"quota_exceeded",message:"Almacenamiento lleno"}}};
    window.addEventListener("storage",e=>{if(e.key===KEY){cache=null;notify()}});
    const docRef=(col,id)=>({id,path:col+"/"+id,
      async get(){const d=(read()[col]||{})[id];return {id,exists:!!d,data:()=>d}},
      async set(data){const d=read();d[col]=d[col]||{};d[col][id]=clone(data);write();notify()},
      async update(data){const d=read();const cur=(d[col]||{})[id];if(!cur)throw {code:"invalid_argument",message:"El registro no existe"};d[col][id]=Object.assign({},cur,clone(data));write();notify()},
      async delete(){const d=read();if(d[col])delete d[col][id];write();notify()}});
    const query=(col,order,dir,lim)=>({
      orderBy:(f,d="asc")=>query(col,f,d,lim),limit:n=>query(col,order,dir,n),
      async get(){return sortSlice(Object.entries(read()[col]||{}),order,dir,lim)},
      onSnapshot(next){const fn=()=>next(sortSlice(Object.entries(read()[col]||{}),order,dir,lim));subs.add(fn);setTimeout(fn,0);return()=>subs.delete(fn)},
      doc:id=>docRef(col,id||newId()),
      async add(data){const r=docRef(col,newId());await r.set(data);return r}});
    db={collection:c=>query(c),doc:p=>{const [c,id]=p.split("/");return docRef(c,id)}};
  }

  /* Identificador anónimo del dispositivo (para "Mis solicitudes") */
  let uid;try{uid=localStorage.getItem("nexo-uid");if(!uid){uid="u_"+newId();localStorage.setItem("nexo-uid",uid)}}catch(e){uid="u_"+newId()}
  const user={id:async()=>uid,can:async()=>true,canEdit:async()=>true,isOwner:async()=>true};

  /* Descarga de archivos (CSV) */
  const downloads={async save({filename,data}){
    const blob=data instanceof Blob?data:new Blob([data],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);return {status:"saved"}}};

  return {db,user,downloads,mode};
})();
