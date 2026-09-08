(() => {
  const intro = document.getElementById('drainIntro');
  const button = document.getElementById('drainLogoButton');
  const spinner = document.querySelector('.drain-logo-spinner');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!intro || !button || typeof intro.showModal !== 'function') return;

  // One intro per tab/session; deep links go straight to their section.
  try { if (sessionStorage.getItem('drain-entered') === 'yes') return; } catch { /* Storage is optional. */ }
  if (location.hash) return;

  let frame;
  let angle = 0;
  let last = performance.now();
  let started = null;
  let fallback;
  function finish() {
    cancelAnimationFrame(frame);
    clearTimeout(fallback);
    if (!intro.open) return;
    intro.close();
    try { sessionStorage.setItem('drain-entered', 'yes'); } catch { /* Private browsing remains usable. */ }
    document.getElementById('heroTitle')?.focus({ preventScroll: true });
    document.dispatchEvent(new Event('drain:entered'));
  }
  function animate(now) {
    if (!intro.open || reducedMotion.matches) return;
    const progress = started === null ? 0 : Math.min((now - started) / 1050, 1);
    angle += Math.min((now - last) / 1000, .05) * (22 + 850 * progress * progress);
    last = now;
    spinner.style.transform = `rotate(${angle}deg) scale(${1 + 9 * progress ** 3})`;
    intro.style.opacity = String(1 - Math.max(0, (progress - .55) / .45));
    if (progress >= 1) return finish();
    frame = requestAnimationFrame(animate);
  }
  function enter() {
    if (reducedMotion.matches) return finish();
    if (started !== null) return;
    started = performance.now();
    // Still finish if a background tab or low-power browser suspends frames.
    fallback = setTimeout(finish, 1400);
  }
  button.addEventListener('click', enter);
  document.getElementById('skipIntro').addEventListener('click', finish);
  intro.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  reducedMotion.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    if (reducedMotion.matches) {
      if (started !== null) finish();
      spinner.style.transform = 'none';
    } else if (intro.open) { last = performance.now(); frame = requestAnimationFrame(animate); }
  });
  intro.showModal();
  if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
})();
