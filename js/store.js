/* =====================================================================
   Nexo Futuro AI · Capa de datos (store.js)
   ---------------------------------------------------------------------
   Versión para GitHub Pages: guarda las solicitudes en el navegador
   (localStorage) y sincroniza en vivo entre pestañas abiertas.
   Imita la API de una base de datos de documentos (colección / doc /
   onSnapshot), así se puede cambiar por Firebase o Supabase sin tocar
   el resto de la aplicación: solo hay que reemplazar este archivo.
   ===================================================================== */
"use strict";
const NexoStore=(()=>{
  const KEY="nexo-db-v1";
  const subs=new Set();
  let cache=null;
  const read=()=>{if(cache)return cache;try{cache=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){cache={}}if(typeof cache!=="object"||!cache)cache={};return cache};
  const write=()=>{try{localStorage.setItem(KEY,JSON.stringify(cache))}catch(e){const err={code:"quota_exceeded",message:"Almacenamiento del navegador lleno"};throw err}};
  const clone=o=>JSON.parse(JSON.stringify(o));
  const snapshot=(col,order,dir,lim)=>{
    const all=Object.entries(read()[col]||{}).map(([id,d])=>({id,exists:true,data:()=>d,metadata:{fromCache:false,hasPendingWrites:false}}));
    if(order)all.sort((a,b)=>{const x=a.data()[order],y=b.data()[order];return (x>y?1:x<y?-1:0)*(dir==="desc"?-1:1)});
    const docs=lim?all.slice(0,lim):all;return {docs,size:docs.length,empty:!docs.length};
  };
  const notify=()=>setTimeout(()=>subs.forEach(s=>s()),0);
  window.addEventListener("storage",e=>{if(e.key===KEY){cache=null;notify()}});
  const docRef=(col,id)=>({id,path:col+"/"+id,
    async get(){const d=(read()[col]||{})[id];return {id,exists:!!d,data:()=>d}},
    async set(data){const db=read();db[col]=db[col]||{};db[col][id]=clone(data);write();notify()},
    async update(data){const db=read();const cur=(db[col]||{})[id];if(!cur)throw {code:"invalid_argument",message:"El documento no existe"};db[col][id]=Object.assign({},cur,clone(data));write();notify()},
    async delete(){const db=read();if(db[col])delete db[col][id];write();notify()}});
  const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const query=(col,order,dir,lim)=>({
    orderBy:(f,d="asc")=>query(col,f,d,lim),limit:n=>query(col,order,dir,n),
    async get(){return snapshot(col,order,dir,lim)},
    onSnapshot(next){const fn=()=>next(snapshot(col,order,dir,lim));subs.add(fn);setTimeout(fn,0);return()=>subs.delete(fn)},
    doc:id=>docRef(col,id||newId()),
    async add(data){const r=docRef(col,newId());await r.set(data);return r}});
  const db={collection:c=>query(c),doc:p=>{const [c,id]=p.split("/");return docRef(c,id)}};

  /* Identidad anónima del navegador (para "Mis solicitudes") */
  let uid;try{uid=localStorage.getItem("nexo-uid");if(!uid){uid="u_"+newId();localStorage.setItem("nexo-uid",uid)}}catch(e){uid="u_"+newId()}
  const user={id:async()=>uid,can:async()=>true,canEdit:async()=>true,isOwner:async()=>true};

  /* Descarga de archivos (CSV) */
  const downloads={async save({filename,data}){
    const blob=data instanceof Blob?data:new Blob([data],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);return {status:"saved"}}};

  /* IA: en GitHub Pages no hay servicio de IA conectado (null = se usa el motor de reglas).
     Para conectar una IA real, reemplaza null por una función async(prompt)->texto
     que llame a tu propio servidor (nunca pongas una API key en este archivo). */
  const sample=null;

  return {db,user,downloads,sample};
})();
