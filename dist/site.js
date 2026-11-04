const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); }
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); } });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
const copy = document.querySelector('#copy-email');
copy?.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText(copy.dataset.email); status.textContent = 'E-mail copiado.'; }
  catch { status.textContent = 'Selecione e copie o endereço acima.'; }
});

// Motion: only when html.motion was set (visitor did not ask for reduced motion)
if (document.documentElement.classList.contains('motion')) {
  const typeUrl = el => {
    if (!el || el.dataset.typed) return;
    const full = el.textContent; el.dataset.typed = '1';
    el.textContent = ''; el.classList.add('typing');
    let i = 0;
    const timer = setInterval(() => {
      el.textContent = full.slice(0, ++i);
      if (i >= full.length) { clearInterval(timer); setTimeout(() => el.classList.remove('typing'), 900); }
    }, 48);
  };
  const scenes = document.querySelectorAll('.hero-stage, .project-art');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const el = entry.target;
    el.classList.toggle('is-live', entry.isIntersecting);
    if (entry.isIntersecting && !el.classList.contains('seen')) {
      el.classList.add('seen');
      el.closest('.project-card')?.classList.add('is-in');
      setTimeout(() => typeUrl(el.querySelector('.browser-bar span')), el.matches('.hero-stage') ? 250 : 350);
    }
  }), { threshold: 0.2 });
  scenes.forEach(el => observer.observe(el));

  // Curva rest timer: real countdown 1:30 → 0:00, ring drains in sync, then a new set is logged
  const REST = 90;
  const timers = [...document.querySelectorAll('.hero-phone, .screen-rest')].map(screen => ({
    scene: screen.closest('.hero-stage, .project-art'),
    digits: screen.querySelector('.timer-digits'),
    ring: screen.querySelector('.rest-ring circle'),
    left: REST, started: false
  })).filter(t => t.scene && t.digits && t.ring);
  const render = t => {
    t.digits.textContent = `${Math.floor(t.left / 60)}:${String(t.left % 60).padStart(2, '0')}`;
    t.ring.style.strokeDashoffset = ((REST - t.left) / REST * 100).toFixed(2);
  };
  const restart = t => {
    t.left = REST; render(t);
    if (t.scene.classList.contains('art-curva')) {
      t.scene.classList.remove('logged'); void t.scene.offsetWidth; t.scene.classList.add('logged');
    }
  };
  if (timers.length) setInterval(() => timers.forEach(t => {
    if (!t.scene.classList.contains('is-live')) return;
    if (!t.started) { t.started = true; restart(t); return; }
    if (--t.left < 0) { restart(t); return; }
    render(t);
  }), 1000);

  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  if (hero && stage && matchMedia('(pointer: fine)').matches) {
    let frame = 0;
    hero.addEventListener('pointermove', event => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const clamp = v => Math.max(-1, Math.min(1, v));
        stage.style.setProperty('--mx', clamp((event.clientX - r.left) / r.width * 2 - 1).toFixed(3));
        stage.style.setProperty('--my', clamp((event.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--mx', 0); stage.style.setProperty('--my', 0); });
  }
}
