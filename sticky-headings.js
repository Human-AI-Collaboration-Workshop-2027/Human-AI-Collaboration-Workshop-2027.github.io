(() => {
  const sections = document.querySelectorAll("main > section");
  const headings = [];

  const update = (heading) => {
    const height = heading.getBoundingClientRect().height;
    heading.parentElement.style.setProperty("--sticky-section-height", `${height}px`);
  };

  for (const section of sections) {
    const heading = Array.from(section.children).find((child) =>
      child.classList.contains("section-heading")
    );
    if (heading) {
      headings.push(heading);
      update(heading);
    }
  }

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) update(entry.target);
    });
    for (const heading of headings) observer.observe(heading);
  } else {
    window.addEventListener("resize", () => {
      for (const heading of headings) update(heading);
    });
  }
})();
