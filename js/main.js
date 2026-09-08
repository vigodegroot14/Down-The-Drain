(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

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
