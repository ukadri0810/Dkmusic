/* ------------------------------
   Dhruvit Kakkad portfolio demo
   ------------------------------ */

/*
  Before going live:
  1. Replace the placeholder WhatsApp number below.
  2. Add a real endpoint to FORM_ENDPOINT if enquiries should be stored online.
     It can be a Formspree endpoint, serverless function or your own API.
*/

const WHATSAPP_NUMBER = "919999999999";
const FORM_ENDPOINT = "";

const body = document.body;
const preloader = document.getElementById("preloader");
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

window.addEventListener("load", () => {
  window.setTimeout(() => preloader.classList.add("is-finished"), 850);
});

window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 30);
}, { passive: true });

function setMobileMenu(open) {
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  body.classList.toggle("menu-open", open);
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
  rootMargin: "0px 0px -45px 0px"
});

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
  revealObserver.observe(element);
});

/* Instagram carousel
   Instagram embeds are cross-origin. The site can load/unload the active embed,
   but Instagram and the browser decide whether autoplay actually begins.
*/

const reelCarousel = document.getElementById("reelCarousel");
const reelCards = [...document.querySelectorAll(".reel-card")];
const reelDots = [...document.querySelectorAll("#reelPagination button")];
const reelPrev = document.getElementById("reelPrev");
const reelNext = document.getElementById("reelNext");
let activeReel = 0;
let reelsSectionVisible = false;

function unloadEmbed(card) {
  const iframe = card.querySelector("iframe");
  iframe.removeAttribute("src");
  card.classList.remove("embed-loaded");
}

function loadEmbed(card) {
  const iframe = card.querySelector("iframe");
  if (iframe.src) return;

  const source = card.dataset.embed;
  iframe.src = `${source}?utm_source=ig_embed&autoplay=1&muted=1`;
  iframe.addEventListener("load", () => {
    card.classList.add("embed-loaded");
  }, { once: true });
}

function renderReelCarousel({ scrollMobile = true } = {}) {
  const total = reelCards.length;

  reelCards.forEach((card, index) => {
    const relative = (index - activeReel + total) % total;
    card.classList.remove("is-active", "is-before", "is-after");

    // Reorder cards so the previous and next previews stay beside the active card.
    let order;
    if (relative === 0) {
      order = 2;
      card.classList.add("is-active");
    } else if (relative === total - 1) {
      order = 1;
      card.classList.add("is-before");
    } else if (relative === 1) {
      order = 3;
      card.classList.add("is-after");
    } else {
      order = 4 + relative;
    }
    card.style.order = order;

    if (index === activeReel && reelsSectionVisible) {
      loadEmbed(card);
    } else {
      unloadEmbed(card);
    }
  });

  reelDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeReel);
  });

  if (window.matchMedia("(max-width: 760px)").matches && scrollMobile) {
    reelCards[activeReel].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }
}

function changeReel(direction) {
  activeReel = (activeReel + direction + reelCards.length) % reelCards.length;
  renderReelCarousel();
}

reelPrev.addEventListener("click", () => changeReel(-1));
reelNext.addEventListener("click", () => changeReel(1));

reelDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    activeReel = Number(dot.dataset.slide);
    renderReelCarousel();
  });
});

reelCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a") || event.target.closest("iframe")) return;
    activeReel = Number(card.dataset.index);
    renderReelCarousel();
  });
});

const reelsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    reelsSectionVisible = entry.isIntersecting;
    if (entry.isIntersecting) {
      loadEmbed(reelCards[activeReel]);
    } else {
      reelCards.forEach(unloadEmbed);
    }
  });
}, {
  threshold: 0.28
});

reelsObserver.observe(document.getElementById("performances"));

let scrollTimer;
reelCarousel.addEventListener("scroll", () => {
  if (!window.matchMedia("(max-width: 760px)").matches) return;

  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
    const carouselRect = reelCarousel.getBoundingClientRect();
    const carouselCenter = carouselRect.left + carouselRect.width / 2;

    let closestIndex = activeReel;
    let closestDistance = Infinity;

    reelCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(center - carouselCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeReel) {
      activeReel = closestIndex;
      renderReelCarousel({ scrollMobile: false });
    }
  }, 120);
}, { passive: true });

renderReelCarousel({ scrollMobile: false });

/* Enquiry flow */

const enquiryModal = document.getElementById("enquiryModal");
const enquiryPanel = enquiryModal.querySelector(".enquiry-panel");
const enquiryForm = document.getElementById("enquiryForm");
const formSteps = [...document.querySelectorAll(".form-step")];
const progressBar = document.getElementById("progressBar");
const stepLabel = document.getElementById("stepLabel");
const backStepButton = document.getElementById("backStep");
const nextStepButton = document.getElementById("nextStep");
const submitButton = document.getElementById("submitEnquiry");
const formError = document.getElementById("formError");
const successState = document.getElementById("successState");
const whatsappLink = document.getElementById("whatsappLink");
const newEnquiry = document.getElementById("newEnquiry");
let currentStep = 0;

function openEnquiry() {
  enquiryModal.classList.add("is-open");
  enquiryModal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
  window.setTimeout(() => enquiryPanel.focus?.(), 300);
}

function closeEnquiry() {
  enquiryModal.classList.remove("is-open");
  enquiryModal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");
}

document.querySelectorAll(".js-open-enquiry").forEach((button) => {
  button.addEventListener("click", openEnquiry);
});

document.querySelectorAll("[data-close-enquiry]").forEach((element) => {
  element.addEventListener("click", closeEnquiry);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && enquiryModal.classList.contains("is-open")) {
    closeEnquiry();
  }
});

function showStep(index) {
  currentStep = index;

  formSteps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === currentStep);
  });

  const percentage = ((currentStep + 1) / formSteps.length) * 100;
  progressBar.style.width = `${percentage}%`;
  stepLabel.textContent = `Step ${currentStep + 1} of ${formSteps.length}`;

  backStepButton.classList.toggle("is-visible", currentStep > 0);
  nextStepButton.style.display = currentStep === formSteps.length - 1 ? "none" : "inline-flex";
  submitButton.classList.toggle("is-visible", currentStep === formSteps.length - 1);
  formError.textContent = "";

  enquiryPanel.scrollTo({ top: 0, behavior: "smooth" });
}

function validateStep(index) {
  const step = formSteps[index];
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
      return "Please enter valid information before continuing.";
    }
  }

  return "";
}

nextStepButton.addEventListener("click", () => {
  const error = validateStep(currentStep);
  if (error) {
    formError.textContent = error;
    return;
  }
  showStep(Math.min(currentStep + 1, formSteps.length - 1));
});

backStepButton.addEventListener("click", () => {
  showStep(Math.max(currentStep - 1, 0));
});

function buildWhatsAppMessage(data) {
  return [
    "Hi Dhruvit, I would like to check availability for an event.",
    "",
    `Event: ${data.eventType || "-"}`,
    `Date: ${data.eventDate || "-"}`,
    `City: ${data.city || "-"}`,
    `Venue: ${data.venue || "Not finalised"}`,
    `Performance format: ${data.format || "-"}`,
    `Guests: ${data.guests || "-"}`,
    `Duration: ${data.duration || "-"}`,
    `Name: ${data.name || "-"}`,
    `Phone: ${data.phone || "-"}`,
    `Email: ${data.email || "Not provided"}`,
    `Notes: ${data.notes || "None"}`,
    "",
    "Sent from the portfolio website."
  ].join("\n");
}

function saveLocally(payload) {
  const key = "dhruvit_kakkad_demo_enquiries";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push(payload);
  localStorage.setItem(key, JSON.stringify(existing));
}

async function sendToEndpoint(payload) {
  if (!FORM_ENDPOINT) return;

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("The enquiry endpoint did not accept the submission.");
  }
}

enquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const error = validateStep(currentStep);
  if (error) {
    formError.textContent = error;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Preparing enquiry…";
  formError.textContent = "";

  const formData = new FormData(enquiryForm);
  const payload = Object.fromEntries(formData.entries());
  payload.createdAt = new Date().toISOString();

  try {
    saveLocally(payload);
    await sendToEndpoint(payload);

    const message = buildWhatsAppMessage(payload);
    whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    enquiryForm.hidden = true;
    successState.hidden = false;
  } catch (submissionError) {
    formError.textContent = submissionError.message || "Something went wrong. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send enquiry";
  }
});

newEnquiry.addEventListener("click", () => {
  enquiryForm.reset();
  enquiryForm.hidden = false;
  successState.hidden = true;
  showStep(0);
});

showStep(0);
