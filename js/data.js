/* Nexo Futuro AI · Catálogos y datos base */
"use strict";
/* ================= Datos base ================= */
const STEPS=["Registro","Diagnóstico","Perfil","Ruta","Oportunidades","Seguimiento"];
const DISTRITOS=["Trujillo","La Esperanza","El Porvenir","Florencia de Mora","Alto Trujillo","Víctor Larco","Huanchaco","Moche","Laredo","Salaverry"];
const INTERESES=["Negocios y ventas","Tecnología y computación","Salud y cuidado","Gastronomía","Oficios técnicos","Diseño y redes sociales","Educación y niños","Turismo y atención"];
const HAB=["Uso de computadora","Comunicación","Números y cálculo","Trabajo en equipo","Trabajo manual / técnico"];
const DIF=["No sé qué estudiar","No tengo experiencia","Falta de dinero","Cuido a un familiar","Internet inestable","Me desmotivo rápido"];
const NIVELES=["Primaria","Secundaria incompleta","Secundaria completa","Técnico incompleto","Universidad incompleta"];
const SITUACIONES=["Busco trabajo","Quiero estudiar","Quiero emprender","No sé qué hacer"];
const ACCESOS=["Solo celular","Celular y computadora","Cabina / computadora prestada"];
const ESTADOS=[
 {k:"nueva",t:"Nueva"},{k:"revision",t:"En revisión"},{k:"derivada",t:"Derivada"},{k:"insertada",t:"Insertada"},{k:"descartada",t:"Descartada"}];
const EST=Object.fromEntries(ESTADOS.map(e=>[e.k,e.t]));
const OPPS=[
 {id:"beca18",tipo:"Beca",t:"Beca 18 – PRONABEC",d:"Financia estudios superiores a jóvenes con alto rendimiento y bajos recursos.",area:["*"],url:"https://www.pronabec.gob.pe/"},
 {id:"senati",tipo:"Estudios técnicos",t:"SENATI – La Libertad",d:"Carreras técnicas y cursos cortos en mecánica, electricidad, computación y más.",area:["Oficios técnicos","Tecnología y computación"],url:"https://www.senati.edu.pe/"},
 {id:"empleab",tipo:"Capacitación gratuita",t:"Programa Nacional para la Empleabilidad",d:"Cursos gratuitos del MTPE y certificación de competencias laborales.",area:["*"],url:"https://www.gob.pe/empleabilidad"},
 {id:"certijoven",tipo:"Trámite gratuito",t:"CertiJoven – MTPE",d:"Certificado único laboral para postular a tu primer empleo.",area:["*"],url:"https://www.empleosperu.gob.pe/"},
 {id:"empleosperu",tipo:"Bolsa de trabajo",t:"Empleos Perú",d:"Bolsa de trabajo del Estado con ofertas en Trujillo y todo el país.",area:["*"],url:"https://www.empleosperu.gob.pe/"},
 {id:"conecta",tipo:"Cursos online",t:"Conecta Empleo – Fundación Telefónica",d:"Cursos digitales gratuitos: Excel, marketing digital, programación.",area:["Tecnología y computación","Negocios y ventas","Diseño y redes sociales"],url:"https://conectaempleo.fundaciontelefonica.com.pe/"},
 {id:"cetpro",tipo:"Estudios técnicos",t:"CETPRO de tu distrito",d:"Formación técnico-productiva corta: cocina, cosmetología, confección, electricidad.",area:["Gastronomía","Oficios técnicos","Salud y cuidado"],url:"https://www.gob.pe/minedu"},
 {id:"emp-retail",tipo:"Empleo junior · aliada",t:"Asesor(a) de ventas",d:"Tienda retail en Trujillo. Sin experiencia, capacitación incluida. Medio tiempo.",area:["Negocios y ventas","Turismo y atención"],url:""},
 {id:"emp-soporte",tipo:"Práctica · aliada",t:"Practicante de soporte técnico",d:"Instalación de equipos y atención a usuarios. Horario flexible.",area:["Tecnología y computación","Oficios técnicos"],url:""},
 {id:"emp-cocina",tipo:"Empleo junior · aliada",t:"Ayudante de cocina",d:"Restaurante en Huanchaco. Turno mañana. Aprendes en el puesto.",area:["Gastronomía","Turismo y atención"],url:""},
 {id:"emp-cm",tipo:"Freelance · aliada",t:"Apoyo en redes sociales para mypes",d:"Contenido para Instagram y TikTok de pequeños negocios. Pago por proyecto.",area:["Diseño y redes sociales","Negocios y ventas"],url:""},
 {id:"emp-cuidado",tipo:"Capacitación + empleo · aliada",t:"Asistente de cuidado",d:"Formación en cuidado de adultos mayores con colocación laboral (ONG aliada).",area:["Salud y cuidado","Educación y niños"],url:""},
];
const OPP=Object.fromEntries(OPPS.map(o=>[o.id,o]));
const EJEMPLO={nombre:"Luis",apellido:"Mendoza",edad:20,distrito:"La Esperanza",nivel:"Secundaria completa",situacion:"Busco trabajo",acceso:"Solo celular",horas:10,celular:"",consent:false,
 intereses:["Negocios y ventas","Tecnología y computación"],hab:{"Uso de computadora":1,"Comunicación":2,"Números y cálculo":2,"Trabajo en equipo":3,"Trabajo manual / técnico":1},
 dif:["No tengo experiencia","Falta de dinero"],meta:"Conseguir mi primer trabajo en una empresa y ahorrar para estudiar Administración.",ejemplo:true};

