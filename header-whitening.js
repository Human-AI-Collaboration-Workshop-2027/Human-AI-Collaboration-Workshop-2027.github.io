(() => {
  const header = document.querySelector(".workshop-header");
  const targets = Array.from(header?.querySelectorAll("h1, .event-details") || []);
  if (!header || !targets.length) return;
  const mobile = window.matchMedia("(max-width: 600px)");
  let pending = false;

  const update = () => {
    pending = false;
    const bounds = header.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    // Match the original SVG background's cover/contain sizing and position.
    const sourceWidth = mobile.matches ? 1076.63 : 3200;
    const scale = (mobile.matches ? Math.min : Math.max)(bounds.width / sourceWidth, bounds.height / 640);
    const width = sourceWidth * scale;
    const height = 640 * scale;
    const left = bounds.left + (bounds.width - width) / 2;
    const top = bounds.top + (mobile.matches ? 0 : (bounds.height - height) / 2);

    for (const target of targets) {
      const rect = target.getBoundingClientRect();
      const halo = getComputedStyle(target, "::before");
      target.style.setProperty("--whitening-mask-width", `${width}px`);
      target.style.setProperty("--whitening-mask-height", `${height}px`);
      target.style.setProperty("--whitening-mask-x", `${left - rect.left - parseFloat(halo.left)}px`);
      target.style.setProperty("--whitening-mask-y", `${top - rect.top - parseFloat(halo.top)}px`);
    }
    header.style.setProperty("--active-whitening-mask", "var(--whitening-mask)");
  };

  const schedule = () => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  };
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(header);
    targets.forEach((target) => observer.observe(target));
  }
  window.addEventListener("resize", schedule);
  document.fonts?.ready.then(schedule);
  update();
})();
