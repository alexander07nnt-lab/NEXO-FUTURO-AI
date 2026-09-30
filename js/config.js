/* =====================================================================
   Nexo Futuro · CONFIGURACIÓN
   Completa los valores entre comillas. Los que dejes vacíos se ocultan.
   ===================================================================== */
window.NEXO_CONFIG = {

  /* --- Asistente inteligente (Google Gemini) ---
     Clave gratuita en https://aistudio.google.com/apikey  → "Copiar clave" */
  IA_PROVEEDOR: "gemini",
  IA_CLAVE: "",                        // <-- pega aquí tu clave
  IA_MODELO: "gemini-3.5-flash",

  /* --- Base de datos en la nube (Supabase, opcional) ---
     Sin esto, las solicitudes se guardan en el navegador del equipo.
     Con esto, llegan al panel desde cualquier celular. Ver README. */
  SUPABASE_URL: "",                    // ej. https://abcd1234.supabase.co
  SUPABASE_CLAVE: "",                  // "anon public key" del proyecto

  /* --- Acceso al panel de instituciones --- */
  PANEL_CLAVE: "nexo2026",             // contraseña para entrar al panel

  /* --- Datos de contacto de la empresa (se muestran en la web) --- */
  EMPRESA_CORREO: "",                  // ej. contacto@nexofuturo.pe
  EMPRESA_WHATSAPP: "",                // solo números con código de país, ej. 51987654321
  EMPRESA_DIRECCION: "Trujillo, La Libertad, Perú"
};
