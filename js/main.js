(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // The button stays in the layout; only a non-interactive copy travels.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.bathroom-prop').forEach(art => {
    const duck = art.classList.contains('bath-duck');
    const home = document.createElement('button');
    home.type = 'button';
    home.className = `${art.className} prop-trigger`;
    home.setAttribute('aria-label', duck ? 'Laat de eend zwemmen' : 'Laat de tandenborstels zweven');
    art.replaceWith(home);
    art.className = 'prop-art';
    home.append(art);
    let layer, flyer, frame, started, lastTime, lastBubble, returnAt;
    let x = 0, y = 0, angle = 0, width = 0, height = 0;
    let returning = false, touchTimer;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    function cleanUp() {
      cancelAnimationFrame(frame);
      clearTimeout(touchTimer);
      layer?.remove();
      layer = null;
      home.classList.remove('is-travelling');
    }
    function stop() {
      if (!layer || returning) return;
      returning = true;
      returnAt = performance.now();
    }
    function bubble(now) {
      if (!duck || now - lastBubble < 160) return;
      lastBubble = now;
      const dot = document.createElement('i');
      dot.className = 'prop-bubble';
      const size = 7 + Math.random() * 12;
      Object.assign(dot.style, { left: `${x + width * .75}px`, top: `${y + height * .75}px`, width: `${size}px`, height: `${size}px` });
      layer.append(dot);
      const animation = dot.animate([
        { transform: 'translate(0, 0) scale(.65)', opacity: .8 },
        { transform: 'translate(24px, -65px) scale(1.2)', opacity: 0 }
      ], { duration: 1100, easing: 'ease-out' });
      animation.onfinish = () => dot.remove();
    }
    function tick(now) {
      const rect = home.getBoundingClientRect();
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;
      const t = (now - started) / 1000;
      const pad = Math.max(width, height) * .22 + 12;
      const left = pad, right = Math.max(left, innerWidth - width - pad);
      const top = 80 + pad, bottom = Math.max(top, innerHeight - height - pad);
      // Start toward the opposite side, then loop with a gentle vertical wave.
      const origin = clamp(rect.left, left, right);
      const direction = origin > (left + right) / 2 ? -1 : 1;
      const travel = (1 - Math.cos(t * .72)) / 2;
      const targetX = returning ? rect.left : origin + ((direction < 0 ? left : right) - origin) * travel;
      const targetY = returning ? rect.top : clamp(rect.top - 75 * Math.sin(t * .72) + 28 * Math.sin(t * 2.1), top, bottom);
      const targetAngle = returning ? 0 : (duck ? -7 * Math.sin(t * 2.1) : 24 * Math.sin(t * 1.5));
      const blend = 1 - Math.exp(-dt / (returning ? 115 : 90));
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      angle += (targetAngle - angle) * blend;
      flyer.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
      if (!returning) bubble(now);
      if (returning && (Math.hypot(rect.left - x, rect.top - y) < .6 || now - returnAt > 1200)) {
        cleanUp();
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    function start() {
      if (reducedMotion.matches) return;
      if (layer) { returning = false; return; }
      const rect = home.getBoundingClientRect();
      width = rect.width; height = rect.height; x = rect.left; y = rect.top; angle = 0;
      layer = document.createElement('div');
      layer.className = 'prop-flight-layer';
      layer.setAttribute('aria-hidden', 'true');
      flyer = art.cloneNode();
      flyer.className = 'prop-flyer';
      flyer.style.width = `${width}px`;
      flyer.style.height = `${height}px`;
      flyer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      layer.append(flyer);
      document.body.append(layer);
      home.classList.add('is-travelling');
      returning = false;
      started = lastTime = lastBubble = performance.now();
      frame = requestAnimationFrame(tick);
    }
    home.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') start(); });
    home.addEventListener('pointerleave', stop);
    home.addEventListener('focus', () => { if (home.matches(':focus-visible')) start(); });
    home.addEventListener('blur', stop);
    home.addEventListener('click', () => {
      start();
      clearTimeout(touchTimer);
      touchTimer = setTimeout(stop, 8500);
    });
    home.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
    window.addEventListener('scroll', stop, { passive: true });
    window.addEventListener('resize', cleanUp);
    window.addEventListener('blur', cleanUp);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanUp(); });
    reducedMotion.addEventListener('change', cleanUp);
  });

  // Optional aftermovie: add the video element documented in README when ready.
  const video = document.querySelector('video.hero-media');
  if (video) {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const control = document.createElement('button');
    control.className = 'button button-white';
    control.textContent = 'AFTERMOVIE AFSPELEN ▶';
    document.querySelector('.hero-bottom').append(control);
    const play = () => video.play().catch(() => { /* Poster and manual play remain available. */ });
    const start = () => { if (!motion.matches) play(); };
    control.addEventListener('click', () => video.paused ? play() : video.pause());
    video.addEventListener('play', () => { control.textContent = 'AFTERMOVIE PAUZEREN Ⅱ'; });
    video.addEventListener('pause', () => { control.textContent = 'AFTERMOVIE AFSPELEN ▶'; });
    video.addEventListener('error', () => { control.hidden = true; });
    motion.addEventListener('change', () => { if (motion.matches) video.pause(); });
    document.addEventListener('drain:entered', start);
    window.addEventListener('load', () => { if (!document.getElementById('drainIntro')?.open) start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { if (!entries[0].isIntersecting) video.pause(); }).observe(video);
    }
  }

  // The collapsed menu leaves the tab order. Escape restores focus to the toggle.
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mainNav');
  const mobile = window.matchMedia('(max-width: 900px)');
  function setMenu(open, restoreFocus = false) {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? 'SLUITEN <span aria-hidden="true">×</span>' : 'MENU <span aria-hidden="true">＋</span>';
    if (restoreFocus) toggle.focus();
  }
  if (toggle && nav) {
    document.body.classList.add('nav-enhanced');
    function syncMenu() { toggle.hidden = !mobile.matches; setMenu(false); }
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link) return;
      setMenu(false);
      const section = document.querySelector(link.hash);
      if (section) { section.tabIndex = -1; section.focus({ preventScroll: true }); }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false, true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });
    document.querySelector('.site-header').addEventListener('focusout', event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setMenu(false);
    });
    mobile.addEventListener('change', syncMenu);
    syncMenu();
  }

  // Image links are the fallback when dialogs or JavaScript are unavailable.
  const lightbox = document.getElementById('lightbox');
  const photos = [...document.querySelectorAll('.gallery-item')];
  let current = 0;
  let opener;
  if (lightbox && typeof lightbox.showModal === 'function') {
    const image = document.getElementById('lightboxImage');
    function showPhoto(index) {
      current = (index + photos.length) % photos.length;
      const photo = photos[current];
      image.src = photo.href;
      image.alt = photo.querySelector('img').alt;
      document.getElementById('lightboxCaption').textContent = photo.dataset.caption;
      document.getElementById('photoCount').textContent = `${current + 1} / ${photos.length}`;
    }
    photos.forEach((photo, index) => photo.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = photo;
      showPhoto(index);
      lightbox.showModal();
    }));
    document.getElementById('closeLightbox').addEventListener('click', () => lightbox.close());
    document.getElementById('previousPhoto').addEventListener('click', () => showPhoto(current - 1));
    document.getElementById('nextPhoto').addEventListener('click', () => showPhoto(current + 1));
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    lightbox.addEventListener('click', event => {
      const rect = lightbox.getBoundingClientRect();
      if (event.target === lightbox && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) lightbox.close();
    });
    lightbox.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  }
})();
