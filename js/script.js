const header = document.getElementById("siteHeader");
const heroSection = document.getElementById("inicio");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const backToTop = document.getElementById("backToTop");
const currentYear = document.getElementById("currentYear");
const counters = document.querySelectorAll("[data-counter]");
const leadForm = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");
const cookieBanner = document.getElementById("cookieBanner");
const acceptCookies = document.getElementById("acceptCookies");
const associationToggle = document.getElementById("associationToggle");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutAddon = document.querySelector(".checkout-addon");
const checkoutAddonLabel = document.getElementById("checkoutAddonLabel");
const checkoutAddonButton = document.getElementById("checkoutAddonButton");
const checkoutAddonIcon = document.getElementById("checkoutAddonIcon");
const pricingSection = document.getElementById("planes");
const registrationSection = document.getElementById("registro");
const heroVideos = Array.from(document.querySelectorAll(".hero-video"));
const internalSectionLinks = document.querySelectorAll('a[href^="#"]');

const scrollToSection = (sectionId) => {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  const headerHeight = header?.offsetHeight || 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth"
  });
};

if (window.location.hash) {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

internalSectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const sectionId = link.getAttribute("href")?.slice(1);

    if (!sectionId) {
      return;
    }

    event.preventDefault();
    scrollToSection(sectionId);
  });
});

if (window.AOS) {
  AOS.init({
    duration: 720,
    easing: "ease-out-cubic",
    once: true,
    offset: 80
  });
}

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (heroVideos.length) {
  const markHeroVideoReady = () => {
    document.body.classList.add("hero-video-ready");
  };

  heroVideos.forEach((video) => {
    video.loop = false;
    video.addEventListener("playing", markHeroVideoReady, { once: true });
  });

  if (heroVideos.length > 1) {
    let activeIndex = 0;
    let isSwitching = false;

    const activateHeroVideo = () => {
      const activeVideo = heroVideos[activeIndex];
      const nextIndex = (activeIndex + 1) % heroVideos.length;
      const nextVideo = heroVideos[nextIndex];

      if (!activeVideo.duration || isSwitching) {
        return;
      }

      const secondsRemaining = activeVideo.duration - activeVideo.currentTime;

      if (secondsRemaining <= 1.85) {
        isSwitching = true;
        nextVideo.currentTime = 0;
        nextVideo.play().catch(() => {});
        nextVideo.classList.add("is-active");
        activeVideo.classList.remove("is-active");

        window.setTimeout(() => {
          activeVideo.pause();
          activeVideo.currentTime = 0;
          activeIndex = nextIndex;
          isSwitching = false;
        }, 1650);
      }
    };

    heroVideos[activeIndex].play().catch(() => {});
    window.setInterval(activateHeroVideo, 140);
  } else {
    heroVideos[0].loop = true;
    heroVideos[0].play().catch(() => {});
  }
}

const updateScrollState = () => {
  const headerHeight = header?.offsetHeight || 78;
  const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 40;
  const isScrolled = window.scrollY > heroBottom - headerHeight - 12;
  header?.classList.toggle("scrolled", isScrolled);
  backToTop?.classList.toggle("visible", window.scrollY > 540);

  if (pricingSection && registrationSection) {
    const showAfterPricing = window.scrollY >= pricingSection.offsetTop - window.innerHeight * 0.35;
    const hideNearForm = window.scrollY >= registrationSection.offsetTop - window.innerHeight * 0.7;
    const isVisible = showAfterPricing && !hideNearForm;

    document.body.classList.toggle("has-sticky-checkout", isVisible);
  }
};

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const panel = item.querySelector(".faq-panel");
    const isActive = item.classList.toggle("active");

    button.setAttribute("aria-expanded", String(isActive));
    panel.style.maxHeight = isActive ? `${panel.scrollHeight}px` : "0";
  });
});

const formatCounter = (value, element) => {
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";

  if (element.dataset.format === "compact") {
    if (value >= 1000) {
      return `${prefix}${Math.round(value / 1000)}K+${suffix}`;
    }
  }

  return `${prefix}${new Intl.NumberFormat("es-ES").format(value)}${suffix}`;
};

const animateCounter = (element) => {
  const target = Number(element.dataset.counter);
  const duration = 1500;
  const start = performance.now();

  element.textContent = formatCounter(0, element);

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    element.textContent = formatCounter(value, element);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = formatCounter(target, element);
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.35 });

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

const updateCheckoutTotal = () => {
  if (!associationToggle || !checkoutTotal) {
    return;
  }

  const hasAssociation = associationToggle.checked;
  checkoutTotal.textContent = hasAssociation ? "$369.90" : "$269.95";
  if (checkoutAddonLabel) {
    checkoutAddonLabel.textContent = hasAssociation ? "+ Asociación $99.95/año" : "Añadir asociación $99.95/año";
  }
  checkoutAddon?.classList.toggle("is-off", !associationToggle.checked);
  checkoutAddonButton?.classList.toggle("is-off", !hasAssociation);
  checkoutAddonButton?.setAttribute("aria-pressed", String(hasAssociation));
  checkoutAddonButton?.setAttribute("aria-label", hasAssociation ? "Quitar asociación opcional" : "Añadir asociación opcional");

  if (checkoutAddonIcon) {
    checkoutAddonIcon.className = hasAssociation ? "fa-solid fa-square-check" : "fa-regular fa-square";
  }
};

associationToggle?.addEventListener("change", updateCheckoutTotal);
checkoutAddonButton?.addEventListener("click", (event) => {
  if (!associationToggle) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const scrollPosition = {
    left: window.scrollX,
    top: window.scrollY
  };

  associationToggle.checked = !associationToggle.checked;
  updateCheckoutTotal();

  requestAnimationFrame(() => {
    window.scrollTo(scrollPosition.left, scrollPosition.top);
  });
});
updateCheckoutTotal();

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = leadForm.querySelector('button[type="submit"]');
  const formData = new FormData(leadForm);

  submitButton?.setAttribute("disabled", "true");

  if (formMessage) {
    formMessage.textContent = "Enviando solicitud...";
  }

  try {
    const response = await fetch("https://formsubmit.co/ajax/guillermomp.info@gmail.com", {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error("No se pudo enviar la solicitud.");
    }

    window.location.href = "/gracias";
  } catch (error) {
    if (formMessage) {
      formMessage.textContent = "No se pudo enviar ahora. Escríbeme a guillermomp.info@gmail.com.";
    }
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});

if (cookieBanner && localStorage.getItem("guillermoMarquezCookiesNotice") !== "accepted") {
  cookieBanner.classList.add("visible");
}

acceptCookies?.addEventListener("click", () => {
  localStorage.setItem("guillermoMarquezCookiesNotice", "accepted");
  cookieBanner?.classList.remove("visible");
});
