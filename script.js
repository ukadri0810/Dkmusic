const WHATSAPP_NUMBER = "919999999999";

const body = document.body;
const loader = document.getElementById("loader");
const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loaderStartedAt = performance.now();
let loaderFinished = false;

function finishLoader() {
  if (loaderFinished) return;
  loaderFinished = true;

  body.classList.add("is-ready");
  loader.classList.add("is-exiting");

  const exitDuration = prefersReducedMotion ? 40 : 760;

  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    body.classList.remove("is-loading");
  }, exitDuration);
}

window.addEventListener("load", () => {
  const minimumDuration = prefersReducedMotion ? 0 : 1680;
  const elapsed = performance.now() - loaderStartedAt;
  window.setTimeout(finishLoader, Math.max(0, minimumDuration - elapsed));
});

// Safety fallback so the opening can never remain stuck.
window.setTimeout(finishLoader, 4200);

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}, { passive: true });

function setMobileMenu(open) {
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  body.classList.toggle("is-locked", open);
}

menuToggle.addEventListener("click", () => {
  setMobileMenu(!mobileMenu.classList.contains("is-open"));
});

mobileMenu.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("click", () => setMobileMenu(false));
});

/* Scroll reveals */
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.13,
  rootMargin: "0px 0px -35px 0px"
});

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 3) * 65, 130)}ms`;
  revealObserver.observe(element);
});

/* Active navigation */
const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${entry.target.id}`
      );
    });
  });
}, {
  rootMargin: "-35% 0px -55% 0px",
  threshold: 0
});

trackedSections.forEach((section) => sectionObserver.observe(section));


/* Enquiry drawer */
const enquiry = document.getElementById("enquiry");
const enquiryForm = document.getElementById("enquiryForm");
const steps = [...document.querySelectorAll(".step")];
const stepCounter = document.getElementById("stepCounter");
const progressBar = document.getElementById("progressBar");
const nextButton = document.getElementById("nextButton");
const backButton = document.getElementById("backButton");
const submitButton = document.getElementById("submitButton");
const formError = document.getElementById("formError");
const success = document.getElementById("success");
const whatsappLink = document.getElementById("whatsappLink");

let activeStep = 0;

function openEnquiry() {
  setMobileMenu(false);
  enquiry.classList.add("is-open");
  enquiry.setAttribute("aria-hidden", "false");
  body.classList.add("is-locked");
}

function closeEnquiry() {
  enquiry.classList.remove("is-open");
  enquiry.setAttribute("aria-hidden", "true");
  body.classList.remove("is-locked");
}

document.querySelectorAll(".js-open-enquiry").forEach((button) => {
  button.addEventListener("click", openEnquiry);
});

document.querySelectorAll("[data-close-enquiry]").forEach((button) => {
  button.addEventListener("click", closeEnquiry);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && enquiry.classList.contains("is-open")) {
    closeEnquiry();
  }
});

function showStep(index) {
  activeStep = index;

  steps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === activeStep);
  });

  stepCounter.textContent = `0${activeStep + 1} / 0${steps.length}`;
  progressBar.style.width = `${((activeStep + 1) / steps.length) * 100}%`;
  backButton.classList.toggle("is-visible", activeStep > 0);
  nextButton.style.display = activeStep === steps.length - 1 ? "none" : "inline-flex";
  submitButton.classList.toggle("is-visible", activeStep === steps.length - 1);
  formError.textContent = "";
}

function validateStep(index) {
  const step = steps[index];
  const requiredFields = [...step.querySelectorAll("[required]")];

  for (const field of requiredFields) {
    if (field.type === "radio") {
      const checked = step.querySelector(`input[name="${field.name}"]:checked`);
      if (!checked) {
        return "Please select one option before continuing.";
      }
    } else if (!field.value.trim()) {
      field.focus();
      return "Please complete the required fields before continuing.";
    } else if (!field.checkValidity()) {
      field.focus();
      return "Please enter valid information.";
    }
  }

  return "";
}

nextButton.addEventListener("click", () => {
  const error = validateStep(activeStep);

  if (error) {
    formError.textContent = error;
    return;
  }

  showStep(Math.min(activeStep + 1, steps.length - 1));
});

backButton.addEventListener("click", () => {
  showStep(Math.max(activeStep - 1, 0));
});

function buildWhatsAppMessage(data) {
  return [
    "Hi Dhruvit, I would like to check availability for an event.",
    "",
    `Event: ${data.eventType || "-"}`,
    `Date: ${data.eventDate || "-"}`,
    `City: ${data.city || "-"}`,
    `Performance: ${data.format || "-"}`,
    `Name: ${data.name || "-"}`,
    `Phone: ${data.phone || "-"}`,
    `Message: ${data.note || "None"}`,
    "",
    "Sent from the portfolio website."
  ].join("\n");
}

enquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const error = validateStep(activeStep);

  if (error) {
    formError.textContent = error;
    return;
  }

  const data = Object.fromEntries(new FormData(enquiryForm).entries());
  const message = buildWhatsAppMessage(data);

  whatsappLink.href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  enquiryForm.hidden = true;
  success.hidden = false;
});

showStep(0);
