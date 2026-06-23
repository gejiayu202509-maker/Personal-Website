/* ========== main.js — Cinematic page transition system ========== */

// ---- 1. Preload all background images immediately ----
(function preloadBgs() {
  const bgImages = ['assets/inner-bg.webp', 'assets/hero-bg.webp'];
  bgImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
})();

// ---- 2. Mark page loaded after backgrounds are ready ----
(function initPageLoad() {
  const bgSrc = 'assets/inner-bg.webp';
  const img = new Image();
  img.onload = function() { markLoaded(); };
  img.onerror = function() { markLoaded(); }; // proceed even if image fails
  img.src = bgSrc;

  // Fallback: show page after max 1.5s regardless
  setTimeout(markLoaded, 1500);

  function markLoaded() {
    if (!document.body.classList.contains('page-loaded')) {
      // Use rAF to sync with next paint cycle — prevents flicker
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.classList.add('page-loaded');
        });
      });
    }
  }
})();

// ---- 3. Cinematic page transition system ----
(function initTransition() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.documentElement.appendChild(overlay);

  let isTransitioning = false;

  // Intercept all internal navigation links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    // Only intercept local page links (not external, not anchors, not #)
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('javascript')) return;

    e.preventDefault();

    if (isTransitioning) return;
    isTransitioning = true;

    // Phase 1: Fade out current page
    overlay.classList.add('active');

    // Phase 2: Navigate after fade-out completes
    setTimeout(() => {
      window.location.href = href;
    }, 450);
  });

  // Handle browser back/forward — clear overlay
  window.addEventListener('pageshow', (e) => {
    overlay.classList.remove('active');
    isTransitioning = false;
  });
})();

// ---- DOM Ready: rest of functionality ----
document.addEventListener('DOMContentLoaded', () => {

  // ---- Scroll reveal ----
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // ---- Nav: scroll shadow ----
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ---- Nav: highlight current page ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Mobile hamburger ----
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---- Cursor glow (desktop only) ----
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  // ---- Typing effect ----
  const typingEl = document.querySelector('.typing');
  if (typingEl) {
    const text = typingEl.getAttribute('data-text') || typingEl.textContent;
    typingEl.textContent = '';
    typingEl.style.borderRight = '2px solid var(--primary)';
    let i = 0;
    const typeChar = () => {
      if (i < text.length) {
        typingEl.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, 60 + Math.random() * 40);
      } else {
        setTimeout(() => {
          typingEl.style.borderRight = 'none';
        }, 1500);
      }
    };
    setTimeout(typeChar, 600);
  }

  // ---- Counter animation ----
  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'));
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1500;
          const startTime = performance.now();

          const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target + suffix;
            }
          };
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
