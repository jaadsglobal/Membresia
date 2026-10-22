(() => {
  function enhanceLinks(messages) {
    messages.querySelectorAll(".ab-msg.assistant").forEach((message) => {
      const links = message.querySelectorAll("a[href]");
      // The widget retains the original response while replacing streamed text.
      const originalText = message._abTexto || message.textContent;
      links.forEach((link) => {
        const destination = new URL(link.href);
        if (!["https:", "http:"].includes(destination.protocol)) return;

        const bookingLink = /reserv|booking|calendly|cal\.com|agendar/i.test(destination.href)
          || (links.length === 1 && /reserv|agend|cita/i.test(originalText));
        const label = bookingLink ? "Reservar ahora" : "Abrir enlace";
        link.classList.add("agent-link-button");
        link.title = destination.href;
        link.setAttribute("aria-label", `${label} (abre en otra pestaña)`);
        if (link.textContent !== label) link.textContent = label;
      });
    });
  }

  function connect() {
    const messages = document.getElementById("ab-widget-messages");
    if (!messages) return false;
    enhanceLinks(messages);
    new MutationObserver(() => enhanceLinks(messages)).observe(messages, {
      childList: true,
      subtree: true,
      characterData: true
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
