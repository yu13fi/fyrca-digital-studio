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
  const DEFAULT_PLANS = [
    {name:"FYRCA BASE",price_ars:160000,description:"Optimización para tiendas que ya están online y necesitan una puesta a punto. Hasta 10 productos.",features:["Revisión general de la tienda","Organización de categorías","Configuración y optimización de productos","Revisión de navegación y experiencia móvil","Verificación funcional básica"]},
    {name:"FYRCA FULL",price_ars:220000,description:"Creación desde cero de una tienda online configurada y con identidad visual. Hasta 25 productos · 3 banners personalizados.",features:["Creación y configuración inicial","Diseño visual personalizado","Organización del catálogo","Configuración inicial de pagos y envíos","Revisión de navegación y compra"]},
    {name:"FYRCA PREMIUM",price_ars:280000,description:"Creación avanzada: una tienda online más completa, con personalización y optimización de contenido. Hasta 50 productos · 5 banners personalizados.",features:["Todo lo incluido en FULL","Diseño integral personalizado","SEO de productos y categorías","Optimización de títulos y metadescripciones","Pruebas funcionales e informe final"]},
    {name:"FYRCA PREMIUM 360",price_ars:320000,description:"Solución multicanal: tienda online y Mercado Libre como parte de una misma estrategia. Hasta 50 productos en tienda · 5 banners.",features:["Creación/configuración de tienda online","Configuración de Mercado Libre","Optimización de catálogo y contenidos","Evaluación de sincronización de stock, si es compatible","Pruebas funcionales en ambos canales"]}
  ];
  async function seedDefaultPlans() {
    const {data,error}=await client.from("fyrca_plans").select("name");
    if(error) throw error;
    const existing=new Set((data||[]).map(row=>row.name));
    const missing=DEFAULT_PLANS.filter(plan=>!existing.has(plan.name));
    if(missing.length){const {error:insertError}=await client.from("fyrca_plans").insert(missing);if(insertError)throw insertError;}
  }
  async function fillProposalSelectors() {
    const [plans,extras]=await Promise.all([
      client.from("fyrca_plans").select("id,name,price_ars,description").eq("active",true).order("created_at"),
      client.from("fyrca_extras").select("id,name,price_ars,description").eq("active",true).order("created_at")
    ]);
    if(plans.error) throw plans.error;if(extras.error) throw extras.error;
    const planSelect=$("#proposalPlan"),extraSelect=$("#proposalExtra");
    planSelect.innerHTML='<option value="">Seleccionar un plan (opcional)</option>'+plans.data.map(p=>'<option value="'+safe(p.id)+'" data-name="'+safe(p.name)+'" data-price="'+Number(p.price_ars)+'" data-description="'+safe(p.description||"")+'">'+safe(p.name)+' · '+ars(p.price_ars)+'</option>').join("");
    extraSelect.innerHTML='<option value="">Seleccionar adicional (opcional)</option>'+extras.data.map(p=>'<option value="'+safe(p.id)+'" data-name="'+safe(p.name)+'" data-price="'+Number(p.price_ars)+'" data-description="'+safe(p.description||"")+'">'+safe(p.name)+' · '+ars(p.price_ars)+'</option>').join("");
  }
  function appendSelectedItem(select) {
    const option=select.options[select.selectedIndex];if(!option?.value)return;
    const list=$("#proposalItems"),row=document.createElement("div");row.className="proposal-item-row";
    row.innerHTML='<input class="item-title" aria-label="Servicio" required><input class="item-description" aria-label="Detalle"><input class="item-quantity" aria-label="Cantidad" type="number" min="1" step="1" value="1"><input class="item-price" aria-label="Precio unitario en ARS" type="number" min="0" step="1" required><button class="remove-item" type="button" aria-label="Quitar ítem">×</button>';
    row.querySelector(".item-title").value=option.dataset.name;row.querySelector(".item-description").value=option.dataset.description;row.querySelector(".item-price").value=option.dataset.price;
    row.querySelector(".remove-item").addEventListener("click",()=>row.remove());list.append(row);select.value="";
  }
  $("#proposalPlan").addEventListener("change",event=>appendSelectedItem(event.currentTarget));
  $("#proposalExtra").addEventListener("change",event=>appendSelectedItem(event.currentTarget));

  async function refreshAll() {
    try {
      await seedDefaultPlans();
      await loadRows("fyrca_plans",$("#plansList"),row => `<article class="data-card"><div><h3>${safe(row.name)}</h3><p>${safe(row.description || "Sin descripción")}</p><p>${(row.features || []).map(safe).join(" · ")}</p></div><span class="price">${ars(row.price_ars)}</span></article>`);
      await fillProposalSelectors();
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