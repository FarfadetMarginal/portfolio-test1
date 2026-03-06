/* ═══════════════════════════════════════════════════════
   PORTFOLIO II — SCRIPT.JS
   Effets visuels expérimentaux
   ═══════════════════════════════════════════════════════

   1.  Grain canvas (texture de bruit animée)
   2.  Curseur magnétique avec étiquette
   3.  Animation des mots du hero (stagger)
   4.  Compteurs animés
   5.  Scroll Reveal (IntersectionObserver)
   6.  Couleur de fond des lignes de projets
   7.  Header scroll
   8.  Formulaire de contact
   9.  Effet de distorsion texte au hover (hero title)
═══════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────
   1. GRAIN CANVAS
   Texture de bruit animée tirée aléatoirement toutes
   les N frames pour simuler du grain photographique.
   ──────────────────────────────────────────────────── */
(function initGrain() {
  const canvas  = document.getElementById('grain');
  const ctx     = canvas.getContext('2d');
  let   frame   = 0;
  const FPS_DIV = 3; // rafraîchit le grain 1 frame sur 3

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function paintGrain() {
    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);
    const data      = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val  = (Math.random() * 255) | 0;
      data[i]    = val;   // R
      data[i+1]  = val;   // G
      data[i+2]  = val;   // B
      data[i+3]  = 255;   // A
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function loop() {
    frame++;
    if (frame % FPS_DIV === 0) paintGrain();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  loop();
})();


/* ─────────────────────────────────────────────────────
   2. CURSEUR MAGNÉTIQUE
   ──────────────────────────────────────────────────── */
(function initCursor() {
  const dot     = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');
  const label   = document.getElementById('cursor-label');
  if (!dot) return;

  let mx = 0, my = 0;
  let ox = 0, oy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    label.style.left = (mx + 20) + 'px';
    label.style.top  = (my - 10) + 'px';
  });

  /* Outline avec inertie */
  (function lerp() {
    ox += (mx - ox) * 0.10;
    oy += (my - oy) * 0.10;
    outline.style.left = ox + 'px';
    outline.style.top  = oy + 'px';
    requestAnimationFrame(lerp);
  })();

  /* Survol général */
  document.querySelectorAll('a, button, .bento-card, .project-row').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* Survol nav — affiche l'étiquette */
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      label.textContent = el.dataset.cursor;
      document.body.classList.add('cursor-nav');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-nav');
    });
  });

  /* Survol liens externes */
  document.querySelectorAll('.project-arrow, .about-link, .contact-email').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-link'));
  });
})();


/* ─────────────────────────────────────────────────────
   3. ANIMATION STAGGER DES MOTS DU HERO
   ──────────────────────────────────────────────────── */
(function initHeroWords() {
  const words = document.querySelectorAll('.hero-title .word');
  words.forEach((w, i) => {
    w.style.animation = `wordReveal 0.8s cubic-bezier(0.34,1.2,0.64,1) ${0.4 + i * 0.10}s both`;
  });
})();

/* Keyframe injectée dynamiquement */
(function injectWordKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes wordReveal {
      from { opacity: 0; transform: translateY(60px) skewY(4deg); }
      to   { opacity: 1; transform: translateY(0)    skewY(0deg); }
    }
  `;
  document.head.appendChild(style);
})();


/* ─────────────────────────────────────────────────────
   4. COMPTEURS ANIMÉS
   ──────────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.counter-num');
  if (!counters.length) return;

  const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // easeInOut

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(ease(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Déclenche quand les compteurs entrent dans le viewport */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ─────────────────────────────────────────────────────
   5. SCROLL REVEAL
   ──────────────────────────────────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────────────
   6. COULEUR DE SURVOL DES LIGNES DE PROJETS
   Applique la couleur définie dans data-color comme
   variable CSS --row-color pour l'effet de fond.
   ──────────────────────────────────────────────────── */
(function initProjectColors() {
  document.querySelectorAll('.project-row').forEach(row => {
    const color = row.dataset.color;
    if (color) row.style.setProperty('--row-color', color);
  });
})();


/* ─────────────────────────────────────────────────────
   7. HEADER — STYLE AU SCROLL
   ──────────────────────────────────────────────────── */
(function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


/* ─────────────────────────────────────────────────────
   8. FORMULAIRE DE CONTACT
   ──────────────────────────────────────────────────── */
(function initForm() {
  const btn = document.getElementById('formBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const name    = document.getElementById('fName')?.value.trim();
    const email   = document.getElementById('fEmail')?.value.trim();
    const subject = document.getElementById('fSubject')?.value.trim();
    const msg     = document.getElementById('fMsg')?.value.trim();

    if (!name || !email || !msg) {
      /* Vibration visuelle légère si champs vides */
      btn.style.animation = 'shake 0.4s ease';
      btn.addEventListener('animationend', () => btn.style.animation = '', { once: true });
      return;
    }

    /* Ici, branchez votre fetch() / API d'envoi d'email */
    const textEl = btn.querySelector('.form-btn-text');
    const iconEl = btn.querySelector('.form-btn-icon');
    textEl.textContent = 'Envoyé !';
    iconEl.textContent = '✓';
    btn.style.background = '#34C759';
    btn.disabled = true;

    setTimeout(() => {
      textEl.textContent = 'Envoyer';
      iconEl.textContent = '→';
      btn.style.background = '';
      btn.disabled = false;
    }, 3500);
  });

  /* Keyframe shake */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();


/* ─────────────────────────────────────────────────────
   9. GLITCH TEXTE — EFFET DE DISTORSION ALÉATOIRE
   Le titre hero subit une légère distorsion de
   caractères aléatoires au survol (ASCII scramble).
   ──────────────────────────────────────────────────── */
(function initGlitchHover() {
  const CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  const target = document.getElementById('heroTitle');
  if (!target) return;

  const originalText = target.innerText.replace(/\s+/g, ' ').trim();
  let   interval     = null;
  let   iteration    = 0;

  function scramble() {
    target.querySelectorAll('.word').forEach(word => {
      const orig = word.dataset.text || word.textContent;
      word.dataset.text = orig; // mémorise le texte original

      const scrambled = orig.split('').map((char, idx) => {
        if (char === ' ') return ' ';
        if (idx < iteration) return orig[idx];
        return CHARS[Math.floor(Math.random() * CHARS.length)].toLowerCase();
      }).join('');

      word.textContent = scrambled;
    });

    iteration += 0.6;

    /* Arrêt quand toutes les lettres sont revenues */
    const maxLen = Math.max(...[...target.querySelectorAll('.word')].map(w => (w.dataset.text || '').length));
    if (iteration >= maxLen) {
      clearInterval(interval);
      /* Restaure le texte original */
      target.querySelectorAll('.word').forEach(word => {
        word.textContent = word.dataset.text || word.textContent;
      });
      iteration = 0;
    }
  }

  target.addEventListener('mouseenter', () => {
    clearInterval(interval);
    iteration = 0;
    interval  = setInterval(scramble, 40);
  });
})();