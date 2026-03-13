/**
 * main.js – Section loader + GSAP orchestrator
 * Loads HTML sections into index.html containers
 */

(function () {
  const sections = [
    { id: 'navbar-container', path: 'sections/navbar.html' },
    { id: 'hero-container', path: 'sections/hero.html' },
    { id: 'about-container', path: 'sections/about.html' },
    { id: 'pillars-container', path: 'sections/pillars.html' },
    { id: 'services-container', path: 'sections/services.html' },
    { id: 'process-container', path: 'sections/process.html' },
    { id: 'work-container', path: 'sections/work.html' },
    { id: 'testimonials-container', path: 'sections/testimonials.html' },
    { id: 'cta-container', path: 'sections/cta.html' },
    { id: 'footer-container', path: 'sections/footer.html' }
  ];

  /** Execute inline scripts in loaded HTML (they don't run when set via innerHTML) */
  function runScriptsInContainer(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      if (oldScript.src) newScript.src = oldScript.src;
      else newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  async function loadSection(containerId, path) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
      const res = await fetch(path);
      if (res.ok) {
        container.innerHTML = await res.text();
        runScriptsInContainer(container);
      }
    } catch (e) {
      console.warn('Section load failed:', path, e);
    }
  }

  async function loadAll() {
    await Promise.all(sections.map(({ id, path }) => loadSection(id, path)));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
