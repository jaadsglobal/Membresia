(() => {
  let pendingFrame;
  function updateViewport() {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => {
      const viewport = window.visualViewport;
      const height = viewport ? viewport.height : window.innerHeight;
      const bottom = viewport
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0;
      document.documentElement.style.setProperty("--agent-viewport-height", `${height}px`);
      document.documentElement.style.setProperty("--agent-viewport-bottom", `${bottom}px`);
      document.body.classList.toggle("agent-compact-viewport", height < 440);

      // Keep the closed launcher above the page's fixed checkout action.
      const checkout = document.querySelector(".checkout-bar");
      const aboveCheckout = checkout && document.body.classList.contains("has-sticky-checkout")
        && !document.body.classList.contains("agent-chat-open");
      const offset = aboveCheckout
        ? Math.max(0, checkout.offsetHeight + (parseFloat(getComputedStyle(checkout).bottom) || 0) - bottom)
        : 0;
      document.documentElement.style.setProperty("--agent-launcher-offset", `${offset}px`);
    });
  }

  updateViewport();
  window.addEventListener("resize", updateViewport, { passive: true });
  window.addEventListener("scroll", updateViewport, { passive: true });
  window.visualViewport?.addEventListener("resize", updateViewport, { passive: true });
  window.visualViewport?.addEventListener("scroll", updateViewport, { passive: true });
  const checkout = document.querySelector(".checkout-bar");
  if (checkout && window.ResizeObserver) new ResizeObserver(updateViewport).observe(checkout);
  new MutationObserver(updateViewport).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  function connect() {
    const panel = document.getElementById("ab-widget-panel");
    const launcher = document.getElementById("ab-widget-btn");
    const close = document.getElementById("ab-widget-close");
    if (!panel || !launcher || !close) return false;

    panel.setAttribute("aria-labelledby", "ab-widget-header-name");
    launcher.setAttribute("aria-controls", panel.id);
    function syncOpenState() {
      const open = panel.classList.contains("open");
      document.body.classList.toggle("agent-chat-open", open);
      launcher.setAttribute("aria-expanded", String(open));
      updateViewport();
    }
    syncOpenState();
    new MutationObserver(syncOpenState).observe(panel, {
      attributes: true,
      attributeFilter: ["class"]
    });
    close.addEventListener("click", () => {
      syncOpenState();
      launcher.focus({ preventScroll: true });
    });
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close.click();
    });
    return true;
  }

  if (!connect()) {
    const loader = new MutationObserver(() => {
      if (connect()) loader.disconnect();
    });
    loader.observe(document.body, { childList: true });
  }
})();
