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
  contactForm.addEventListener("submit", (event) => {
    if (!contactForm.checkValidity()) return;

    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get("name")?.toString().trim() || "Non renseigné";
    const email = formData.get("email")?.toString().trim() || "Non renseigné";
    const message = formData.get("message")?.toString().trim() || "";

    const subject = encodeURIComponent("Demande de devis administratif");
    const body = encodeURIComponent(
      `Bonjour Julie,\n\n${message}\n\nNom : ${name}\nEmail : ${email}`
    );

    window.location.href = `mailto:juliegoffetoulouzan@gmail.com?subject=${subject}&body=${body}`;
  });
}
