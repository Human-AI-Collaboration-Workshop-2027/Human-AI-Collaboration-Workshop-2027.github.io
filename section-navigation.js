(() => {
  const contents = document.querySelector(".contents");
  const toggle = contents?.querySelector(".contents-toggle");
  const links = Array.from(contents?.querySelectorAll('a[href^="#"]') || []);
  const entries = links.map((link) => ({
    link,
    section: document.getElementById(link.hash.slice(1)),
  })).filter(({ section }) => section);
  if (!contents || !toggle || !entries.length) return;

  const mobile = window.matchMedia("(max-width: 900px)");
  let navigationHeight = 0;
  let framePending = false;

  const close = () => {
    contents.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const updateActive = () => {
    framePending = false;
    let current = entries[0];
    for (const entry of entries) {
      const parentHeading = entry.section.classList.contains("subsection")
        ? entry.section.closest("main > section")?.querySelector(".section-heading")
        : null;
      const offset = navigationHeight + (parentHeading?.getBoundingClientRect().height || 0);
      if (entry.section.getBoundingClientRect().top <= offset + 24) current = entry;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = entries[entries.length - 1];
    }
    for (const entry of entries) {
      if (entry === current) entry.link.setAttribute("aria-current", "location");
      else entry.link.removeAttribute("aria-current");
    }
  };

  const scheduleUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateActive);
  };

  const measure = () => {
    navigationHeight = mobile.matches ? contents.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty("--navigation-offset", `${navigationHeight}px`);
    scheduleUpdate();
  };

  contents.classList.add("is-enhanced");
  toggle.addEventListener("click", () => {
    const open = contents.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  for (const { link, section } of entries) {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      close();
      section.tabIndex = -1;
      section.focus({ preventScroll: true });
      scheduleUpdate();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contents.classList.contains("is-open")) {
      close();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!contents.contains(event.target)) close();
  });
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("resize", () => {
    if (!mobile.matches) close();
    measure();
  });
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(toggle);
  measure();
})();
