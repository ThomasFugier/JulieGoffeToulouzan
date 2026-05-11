const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px 120px 0px", threshold: 0.08 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const stickyCta = document.querySelector("[data-sticky-cta]");
const paperStack = document.querySelector("[data-parallax]");
const contactForm = document.querySelector("[data-contact-form]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateScrollDetails = () => {
  if (stickyCta) {
    stickyCta.classList.toggle("is-visible", window.scrollY > 420);
  }

  if (paperStack && !reducedMotion) {
    const offset = Math.min(window.scrollY * 0.035, 22);
    paperStack.style.setProperty("--scroll-y", `${offset}px`);
  }
};

updateScrollDetails();
window.addEventListener("scroll", updateScrollDetails, { passive: true });

if (contactForm) {
  const submitButton = contactForm.querySelector("[data-submit-button]");
  const statusMessage = contactForm.querySelector("[data-form-status]");
  const defaultButtonLabel = submitButton?.textContent.trim() || "Envoyer ma demande";
  const formspreeEndpoint = contactForm.action;
  const hasPlaceholderEndpoint = /VOTRE_ID_FORMSPREE|YOUR_FORM_ID|\{form_id\}/i.test(
    formspreeEndpoint
  );

  const updateStatus = (message, state = "idle") => {
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.dataset.status = state;
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    if (hasPlaceholderEndpoint) {
      updateStatus("Ajoutez votre endpoint Formspree dans l'attribut action du formulaire.", "error");
      return;
    }

    contactForm.setAttribute("aria-busy", "true");
    contactForm.classList.add("is-sending");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Envoi en cours...";
    }
    updateStatus("Envoi de votre message...", "pending");

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMessage =
          payload?.errors?.map((error) => error.message).join(" ") ||
          "Le message n'a pas pu être envoyé. Vous pouvez aussi me contacter par email.";

        throw new Error(errorMessage);
      }

      contactForm.reset();
      updateStatus("Merci, votre message a bien été envoyé.", "success");
    } catch (error) {
      updateStatus(
        error.message || "Le message n'a pas pu être envoyé. Vous pouvez aussi me contacter par email.",
        "error"
      );
    } finally {
      contactForm.removeAttribute("aria-busy");
      contactForm.classList.remove("is-sending");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
      }
    }
  });
}
