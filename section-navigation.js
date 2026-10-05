(() => {
  const contents = document.querySelector(".contents");
  const navigation = contents?.querySelector(".contents-nav");
  if (!contents || !navigation) return;

  const entries = Array.from(navigation.querySelectorAll('a[href^="#"]')).map((link) => ({
    link,
    section: document.getElementById(link.hash.slice(1)),
  })).filter(({ section }) => section);
  if (!entries.length) return;

  const mobile = window.matchMedia("(max-width: 900px)");
  const menu = navigation.cloneNode(true);
  menu.id = "mobile-section-navigation";
  menu.className = "mobile-section-menu";
  menu.hidden = true;
  document.body.append(menu);

  let openButton = null;
  let framePending = false;

  const close = () => {
    menu.hidden = true;
    openButton?.setAttribute("aria-expanded", "false");
    openButton = null;
  };

  const positionMenu = (heading) => {
    const rect = heading.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const openAbove = below < 240 && above > below;
    menu.style.left = `${rect.left}px`;
    menu.style.width = `${rect.width}px`;
    menu.style.top = openAbove ? "auto" : `${rect.bottom}px`;
    menu.style.bottom = openAbove ? `${window.innerHeight - rect.top}px` : "auto";
    menu.style.maxHeight = `${Math.max(0, openAbove ? above : below)}px`;
  };

  for (const entry of entries) {
    const heading = entry.section.querySelector(".section-heading");
    if (!heading) continue;
    const title = document.createElement("span");
    title.className = "section-title";
    title.textContent = heading.textContent;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "section-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", menu.id);
    const label = document.createElement("span");
    label.textContent = title.textContent;
    const arrow = document.createElement("span");
    arrow.className = "contents-chevron";
    arrow.setAttribute("aria-hidden", "true");
    button.append(label, arrow);
    heading.replaceChildren(title, button);
    heading.classList.add("is-navigable");
    entry.button = button;

    button.addEventListener("click", () => {
      if (!mobile.matches) return;
      const wasOpen = openButton === button;
      close();
      if (wasOpen) return;
      openButton = button;
      button.setAttribute("aria-expanded", "true");
      positionMenu(heading);
      menu.hidden = false;
      menu.querySelector(`a[href="${entry.link.hash}"]`)?.focus({ preventScroll: true });
    });
  }

  const links = [...navigation.querySelectorAll("a"), ...menu.querySelectorAll("a")];
  const updateActive = () => {
    framePending = false;
    let current = entries[0];
    for (const entry of entries) {
      if (entry.section.getBoundingClientRect().top <= 24) current = entry;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = entries[entries.length - 1];
    }
    for (const link of links) {
      if (link.hash === current.link.hash) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  const scheduleUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateActive);
  };

  for (const link of links) {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      close();
      const entry = entries.find(({ section }) => section.id === link.hash.slice(1));
      const target = mobile.matches ? entry?.button : entry?.section;
      if (target) {
        if (target === entry.section) target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
      scheduleUpdate();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && openButton) {
      const button = openButton;
      close();
      button.focus({ preventScroll: true });
    }
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !openButton?.contains(event.target)) close();
  });
  document.addEventListener("focusin", (event) => {
    if (openButton && !menu.contains(event.target) && !openButton.contains(event.target)) close();
  });
  window.addEventListener("scroll", () => { close(); scheduleUpdate(); }, { passive: true });
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("resize", () => { close(); scheduleUpdate(); });
  contents.classList.add("is-enhanced");
  document.documentElement.style.setProperty("--navigation-offset", "0px");
  scheduleUpdate();
})();
