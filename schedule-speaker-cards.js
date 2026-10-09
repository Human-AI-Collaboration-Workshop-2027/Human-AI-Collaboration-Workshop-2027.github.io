(() => {
  const profiles = new Map();
  for (const person of document.querySelectorAll("#speakers .person")) {
    const link = person.querySelector("h3 a");
    const portrait = person.querySelector(".portrait-frame");
    if (link && portrait) profiles.set(link.href, {
      name: link.textContent.trim(),
      portrait,
      affiliation: person.querySelector(".affiliation")?.textContent.trim() || "",
    });
  }
  const links = [...document.querySelectorAll("#schedule .schedule-speaker")]
    .filter((link) => profiles.has(link.href));
  if (!links.length) return;

  const card = document.createElement("div");
  card.className = "schedule-speaker-card";
  card.setAttribute("aria-hidden", "true");
  card.hidden = true;
  document.body.append(card);

  let active = null;
  let pointer = null;
  let frame = null;
  const hover = window.matchMedia("(any-hover: hover)");

  const position = (x, y) => {
    const gap = 18;
    const margin = 12;
    const { width, height } = card.getBoundingClientRect();
    let left = x + gap;
    let top = y + gap;
    if (left + width + margin > window.innerWidth) left = x - width - gap;
    if (top + height + margin > window.innerHeight) top = y - height - gap;
    card.style.left = `${Math.max(margin, Math.min(left, window.innerWidth - width - margin))}px`;
    card.style.top = `${Math.max(margin, Math.min(top, window.innerHeight - height - margin))}px`;
  };

  const hide = () => {
    card.hidden = true;
    active = null;
    pointer = null;
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
  };

  const show = (link, point) => {
    if (active !== link) {
      const profile = profiles.get(link.href);
      const portrait = profile.portrait.cloneNode(true);
      portrait.querySelector("img").loading = "eager";
      const name = document.createElement("p");
      name.className = "card-name";
      name.textContent = profile.name;
      const affiliation = document.createElement("p");
      affiliation.className = "card-affiliation";
      affiliation.textContent = profile.affiliation;
      card.replaceChildren(portrait, name, affiliation);
    }
    active = link;
    pointer = point;
    card.hidden = false;
    const rect = link.getBoundingClientRect();
    position(point?.x ?? rect.right, point?.y ?? rect.top);
  };

  for (const link of links) {
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch" && hover.matches) {
        show(link, { x: event.clientX, y: event.clientY });
      }
    });
    link.addEventListener("pointermove", (event) => {
      if (active !== link || !pointer || event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        if (pointer) position(pointer.x, pointer.y);
      });
    });
    link.addEventListener("pointerleave", () => {
      if (active !== link) return;
      if (link.matches(":focus-visible")) show(link, null);
      else hide();
    });
    link.addEventListener("pointercancel", hide);
    link.addEventListener("focus", () => {
      if (link.matches(":focus-visible")) show(link, null);
    });
    link.addEventListener("blur", () => { if (active === link) hide(); });
    link.addEventListener("click", hide);
  }
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") hide(); });
  window.addEventListener("scroll", hide, { passive: true, capture: true });
  window.addEventListener("resize", hide);
  window.addEventListener("blur", hide);
})();
