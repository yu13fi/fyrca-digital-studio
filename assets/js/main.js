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
