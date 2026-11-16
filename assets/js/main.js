const CONTACT = Object.freeze({
  email: "fyrcatech@gmail.com",
  whatsapp: "5491130962275"
});

function initializeNavigation() {
  const menuToggle = document.querySelector("#menuToggle");
  const navLinks = document.querySelector("#navLinks");

  if (!menuToggle || !navLinks) return;

  function setMenuOpen(isOpen) {
    navLinks.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    menuToggle.textContent = isOpen ? "×" : "☰";
  }

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });
}

function initializeContactForm() {
  const form = document.querySelector("#contactForm");
  const formNote = document.querySelector("#formNote");

  if (!form || !formNote) return;

  const emailInput = form.elements.email;
  const emailConfirmation = form.elements.emailConfirm;

  function validateEmailConfirmation() {
    const email = emailInput.value.trim().toLowerCase();
    const confirmation = emailConfirmation.value.trim().toLowerCase();
    const mismatch = confirmation && email !== confirmation;

    emailConfirmation.setCustomValidity(
      mismatch ? "Los correos no coinciden. Revisá ambos campos." : ""
    );
  }

  emailInput.addEventListener("input", validateEmailConfirmation);
  emailConfirmation.addEventListener("input", validateEmailConfirmation);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    validateEmailConfirmation();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const mensaje = String(formData.get("mensaje") ?? "").trim();
    const texto = [
      "Hola, quiero hacer una consulta a FYRCA.",
      "",
      `Nombre: ${nombre}`,
      `Correo: ${email}`,
      "",
      "Consulta:",
      mensaje
    ].join("\n");

    if (event.submitter?.value === "email") {
      const asunto = encodeURIComponent(`Consulta para FYRCA de ${nombre}`);
      const cuerpo = encodeURIComponent(texto);
      window.location.href = `mailto:${CONTACT.email}?subject=${asunto}&body=${cuerpo}`;
      formNote.textContent =
        "Se abrió tu aplicación de correo con la consulta preparada. Revisala y enviá el email.";
      return;
    }

    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    formNote.textContent =
      "Se abrió WhatsApp con tu consulta. Revisala y tocá Enviar para compartirla.";
  });
}

function initializeCurrentYear() {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
}

initializeNavigation();
initializeContactForm();
initializeCurrentYear();


function initializeStoreCheckForm() {
  const form = document.querySelector("#storeCheckForm");
  const note = document.querySelector("#storeCheckNote");
  if (!form || !note) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const mensaje = [
      "Hola, quiero solicitar el análisis inicial de mi tienda con FYRCA Store Check.",
      "",
      `Nombre: ${String(data.get("nombre") ?? "").trim()}`,
      `Tienda: ${String(data.get("url") ?? "").trim()}`,
      `Plataforma: ${String(data.get("plataforma") ?? "").trim()}`,
      `Qué quiero mejorar: ${String(data.get("objetivo") ?? "").trim()}`
    ].join("\n");
    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    note.textContent = "Se abrió WhatsApp con tu solicitud preparada. Revisala y tocá Enviar para compartirla.";
  });
}


initializeStoreCheckForm();


function initializeMascotGuide() {
  const mascot = document.querySelector("#mascotGuide");
  const caption = document.querySelector("#mascotGuideCaption");
  if (!mascot || !caption || !("IntersectionObserver" in window)) return;

  const scenes = [
    { id: "inicio", label: "Conocé FYRCA" },
    { id: "servicios", label: "Calidad y soluciones" },
    { id: "plataformas", label: "E-commerce" },
    { id: "store-check", label: "Store Check" },
    { id: "portfolio", label: "Proyectos reales" },
    { id: "metodologia", label: "Construimos con método" },
    { id: "nosotros", label: "Quiénes somos" },
    { id: "contacto", label: "Hablemos de tu proyecto" }
  ];

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const scene = scenes.find((item) => item.id === visible.target.id);
    if (!scene) return;

    mascot.dataset.scene = scene.id;
    caption.textContent = scene.label;
    mascot.classList.toggle("is-hidden", scene.id === "contacto");
  }, { rootMargin: "-32% 0px -48% 0px", threshold: [0, 0.15, 0.35, 0.6] });

  scenes.forEach(({ id }) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

initializeMascotGuide();
