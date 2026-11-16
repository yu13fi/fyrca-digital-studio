(() => {
  "use strict";
  const SUPABASE_URL = "https://glnsntcjwhdemfnvcpop.supabase.co";
  // Publishable key: diseñada para frontend. El acceso a los datos lo controlan Auth + RLS.
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MZOJUkg5lhOaDUAy5PsTBg_dg6lBzRb";
  const ADMIN_UID = "19332d06-7d82-48e0-ba7b-7438245d854c";
  const $ = (selector) => document.querySelector(selector);
  const loginView = $("#loginView"), adminView = $("#adminView");
  const loginMessage = $("#loginMessage"), adminMessage = $("#adminMessage");
  let client;

  function message(target, text, isError = false) {
    target.textContent = text;
    target.style.color = isError ? "#A33D32" : "";
  }
  function ars(value) {
    return new Intl.NumberFormat("es-AR", {style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(value || 0));
  }
  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function showLogin(text = "") {
    loginView.hidden = false; adminView.hidden = true;
    message(loginMessage, text);
  }
  function showAdmin() { loginView.hidden = true; adminView.hidden = false; }

  async function verifySession() {
    const {data:{session},error} = await client.auth.getSession();
    if (error || !session) { showLogin(); return false; }
    if (session.user.id !== ADMIN_UID) {
      await client.auth.signOut();
      showLogin("Esta cuenta no está autorizada para administrar FYRCA.");
      return false;
    }
    showAdmin();
    await refreshAll();
    return true;
  }

  async function loadRows(table, target, renderer) {
    const {data,error} = await client.from(table).select("*").order("created_at",{ascending:false});
    if (error) throw error;
    target.innerHTML = data.length ? data.map(renderer).join("") : '<p class="muted">Todavía no hay registros.</p>';
  }
  async function refreshAll() {
    try {
      await loadRows("fyrca_plans",$("#plansList"),row => `<article class="data-card"><div><h3>${safe(row.name)}</h3><p>${safe(row.description || "Sin descripción")}</p><p>${(row.features || []).map(safe).join(" · ")}</p></div><span class="price">${ars(row.price_ars)}</span></article>`);
      await loadRows("fyrca_extras",$("#extrasList"),row => `<article class="data-card"><div><h3>${safe(row.name)}</h3><p>${safe(row.description || "Sin descripción")}</p></div><span class="price">${ars(row.price_ars)}</span></article>`);
      await loadRows("fyrca_proposals",$("#proposalsList"),row => `<article class="data-card"><div><h3>${safe(row.client_name)} · ${safe(row.business_name || "Sin negocio")}</h3><p>${safe(row.email || "Sin correo")} · ${safe(row.whatsapp || "Sin WhatsApp")}</p><p>Estado: ${safe(row.status)} · Vigencia: ${safe(row.valid_until || "Sin fecha")}</p><p>${safe(row.notes || "")}</p></div></article>`);
      message(adminMessage,"Datos actualizados.");
    } catch (error) {
      message(adminMessage,"No se pudieron cargar los datos. Verificá la conexión y las políticas RLS. "+error.message,true);
    }
  }

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = event.currentTarget.querySelector("button");
    button.disabled = true; message(loginMessage,"Verificando acceso…");
    try {
      const {data,error} = await client.auth.signInWithPassword({email:String(form.get("email")).trim(),password:String(form.get("password"))});
      if (error) throw error;
      if (data.user.id !== ADMIN_UID) {
        await client.auth.signOut();
        throw new Error("Esta cuenta no está autorizada para administrar FYRCA.");
      }
      await verifySession();
    } catch(error) { message(loginMessage,error.message,true); }
    finally { button.disabled = false; }
  });

  $("#logoutButton").addEventListener("click", async () => {
    await client.auth.signOut(); showLogin("Sesión cerrada correctamente.");
  });

  document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active",tab === button));
    ["plans","extras","proposals"].forEach(name => $("#"+name+"Panel").hidden = name !== button.dataset.tab);
  }));

  $("#planForm").addEventListener("submit", async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const record = {name:String(form.get("name")).trim(),price_ars:Number(form.get("price")),description:String(form.get("description")).trim(),features:String(form.get("features")).split("\n").map(x=>x.trim()).filter(Boolean)};
    try { const {error}=await client.from("fyrca_plans").insert(record); if(error)throw error; event.currentTarget.reset(); await refreshAll(); }
    catch(error){message(adminMessage,"No se pudo guardar el plan: "+error.message,true);}
  });
  $("#extraForm").addEventListener("submit", async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const record = {name:String(form.get("name")).trim(),price_ars:Number(form.get("price")),description:String(form.get("description")).trim()};
    try { const {error}=await client.from("fyrca_extras").insert(record); if(error)throw error; event.currentTarget.reset(); await refreshAll(); }
    catch(error){message(adminMessage,"No se pudo guardar el adicional: "+error.message,true);}
  });
  $("#proposalForm").addEventListener("submit", async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const record = {client_name:String(form.get("client_name")).trim(),business_name:String(form.get("business_name")).trim()||null,email:String(form.get("email")).trim()||null,whatsapp:String(form.get("whatsapp")).trim()||null,valid_until:String(form.get("valid_until"))||null,notes:String(form.get("notes")).trim()||null};
    try { const {error}=await client.from("fyrca_proposals").insert(record); if(error)throw error; event.currentTarget.reset(); await refreshAll(); }
    catch(error){message(adminMessage,"No se pudo crear la propuesta: "+error.message,true);}
  });

  window.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabase?.createClient) { showLogin("No se pudo cargar el cliente de Supabase. Revisá tu conexión."); return; }
    client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    await verifySession();
  });
})();