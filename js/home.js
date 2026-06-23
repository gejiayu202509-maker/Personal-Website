/* ================================================================
   home.js — Cinematic HKU Sunrise Hero interactions
   Image parallax + scroll effects + mobile nav
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- 1. IMAGE PARALLAX (subtle, cinematic) ----
  const bgImg = document.getElementById('heroBgImg');
  const bgLayer = document.getElementById('heroBgLayer');

  if (bgImg && bgLayer) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const lerpFactor = 0.045; // smooth follow
    const maxOffset = 18; // px movement

    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * maxOffset;
      targetY = ((e.clientY - cy) / cy) * maxOffset * 0.6; // less vertical
    });

    function animateParallax() {
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;

      // Apply subtle translate to image
      bgImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`;

      requestAnimationFrame(animateParallax);
    }
    requestAnimationFrame(animateParallax);
  }

  // ---- 2. NAV SCROLL EFFECT ----
  const navHome = document.getElementById('navHome');
  if (navHome) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navHome.classList.add('scrolled');
      } else {
        navHome.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ---- 3. MOBILE HAMBURGER ----
  const hamburger = document.getElementById('navHamburger');
  const mobileNav = document.getElementById('navMobile');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
      });
    });
  }

  // ---- 4. PRELOAD & FADE IN ----
  // Ensure image is loaded before showing content smoothly
  if (bgImg) {
    if (bgImg.complete) {
      document.body.style.opacity = '1';
    } else {
      bgImg.addEventListener('load', () => {
        document.body.style.opacity = '1';
      });
    }
  } else {
    document.body.style.opacity = '1';
  }

});
