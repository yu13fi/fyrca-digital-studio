const CONTACT = Object.freeze({ email: "fyrcatech@gmail.com", whatsapp: "5491130962275" });

function initializeNavigation() {
  const button = document.getElementById("menuToggle");
  const menu = document.getElementById("navLinks");
  if (!button || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Abrir menú");
    button.textContent = "☰";
  };
  const toggleMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const open = button.getAttribute("aria-expanded") !== "true";
    menu.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    button.textContent = open ? "×" : "☰";
  };

  button.addEventListener("click", toggleMenu);
  button.addEventListener("touchend", (event) => {
    if (event.cancelable) event.preventDefault();
    toggleMenu(event);
  }, { passive: false });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !button.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

function initializeContactForm() {
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (!form || !note) return;
  const email = form.elements.email;
  const confirm = form.elements.emailConfirm;
  const validate = () => confirm.setCustomValidity(
    confirm.value.trim().toLowerCase() && email.value.trim().toLowerCase() !== confirm.value.trim().toLowerCase()
      ? "Los correos no coinciden. Revisá ambos campos." : ""
  );
  email.addEventListener("input", validate);
  confirm.addEventListener("input", validate);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    validate();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const message = ["Hola, quiero hacer una consulta a FYRCA.", "", `Nombre: ${data.get("nombre")}`, `Correo: ${data.get("email")}`, "", "Consulta:", data.get("mensaje")].join("\n");
    if (event.submitter?.value === "email") {
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Consulta para FYRCA")}&body=${encodeURIComponent(message)}`;
      note.textContent = "Se abrió tu aplicación de correo con la consulta preparada.";
    } else {
      window.location.href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
      note.textContent = "Se abrió WhatsApp con tu consulta preparada.";
    }
  });
}

function initializeStoreCheckForm() {
  const form = document.getElementById("storeCheckForm");
  const note = document.getElementById("storeCheckNote");
  if (!form || !note) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const message = ["Hola, quiero solicitar el análisis inicial de mi tienda con FYRCA Store Check.", "", `Nombre: ${data.get("nombre")}`, `Tienda: ${data.get("url")}`, `Plataforma: ${data.get("plataforma")}`, `Qué quiero mejorar: ${data.get("objetivo")}`].join("\n");
    window.location.href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
    note.textContent = "Se abrió WhatsApp con tu solicitud preparada.";
  });
}

function initializeCurrentYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

function initializeFyrcaMascot() {
  const image = document.getElementById("fyrcaMascot");
  const status = document.getElementById("fyrcaMascotStatus");
  const targets = document.querySelectorAll("[data-mascot-pose]");
  if (!image || !targets.length || !("IntersectionObserver" in window)) return;
  const poses = {
    inicio: ["approved-inicio.webp", "bienvenida"],
    qa: ["approved-qa.webp", "control de calidad QA"],
    programacion: ["approved-programacion.webp", "programación"],
    ecommerce: ["approved-ecommerce.webp", "e-commerce"]
  };
  let current = "inicio";
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio);
    if (!visible.length) return;
    const poseName = visible[0].target.dataset.mascotPose;
    if (!poses[poseName] || poseName === current) return;
    current = poseName;
    const [file, label] = poses[poseName];
    const src = `/fyrca-digital-studio/assets/images/mascota/${file}`;
    const preload = new Image();
    preload.onload = () => {
      image.src = src;
      image.alt = `Mascota FYRCA: ${label}`;
      if (status) status.textContent = image.alt;
    };
    preload.src = src;
  }, { rootMargin: "-34% 0px -42% 0px", threshold: [0, .1, .25, .5, .75] });
  targets.forEach(target => observer.observe(target));
}

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeContactForm();
  initializeStoreCheckForm();
  initializeCurrentYear();
  initializeFyrcaMascot();
});
