/**
 * Portfolio – Main JavaScript
 * Felipe Santana · Full-Stack Developer
 * Pure vanilla JS · ES6+ · No dependencies
 */

(() => {
  'use strict';

  /* ============================
   * 0. Utility Helpers
   * ============================ */

  /** Throttle – limits fn to once per `delay` ms using rAF */
  const throttle = (fn, delay = 100) => {
    let last = 0;
    let raf = null;
    return (...args) => {
      const now = performance.now();
      if (now - last >= delay) {
        last = now;
        fn(...args);
      } else if (!raf) {
        raf = requestAnimationFrame(() => {
          last = performance.now();
          raf = null;
          fn(...args);
        });
      }
    };
  };

  /** Lerp – linear interpolation */
  const lerp = (start, end, factor) => start + (end - start) * factor;

  /** Check if touch device */
  const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ============================
   * 1. Splash Screen Controller
   * ============================ */

  const initSplash = () => {
    const MIN_DELAY = 2800; // ms
    const TRANSITION = 800; // matches CSS transition duration
    const start = performance.now();

    const hideSplash = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_DELAY - elapsed);

      setTimeout(() => {
        document.body.classList.add('loaded');

        // After the CSS fade-out transition, remove the splash entirely
        setTimeout(() => {
          const splash = document.getElementById('splash');
          if (splash) {
            splash.style.display = 'none';
            splash.remove();
          }
          // Trigger hero stagger animations once splash is gone
          triggerHeroAnimations();
        }, TRANSITION);
      }, remaining);
    };

    // Wait for DOM + minimum delay
    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash);
    }
  };

  /* ============================
   * 2. Theme Toggle (Light / Dark)
   * ============================ */

  const initTheme = () => {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    const applyTheme = (theme) => {
      html.setAttribute('data-theme', theme);

      // Update theme-color meta tag
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#0b0b0f' : '#f4f3f0');
      }

      if (toggle) {
        toggle.setAttribute('aria-label', `Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`);
      }
    };

    // Determine initial theme: localStorage → prefers-color-scheme → default dark
    const saved = localStorage.getItem('theme');
    if (saved) {
      applyTheme(saved);
    } else {
      const preferLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(preferLight ? 'light' : 'dark');
    }

    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);

        // Rotate animation on the toggle
        toggle.style.transform = 'scale(0.9) rotate(180deg)';
        setTimeout(() => {
          toggle.style.transform = '';
        }, 300);
      });
    }
  };

  /* ============================
   * 3. Scroll Reveal Animations
   * ============================ */

  const initRevealAnimations = () => {
    const elements = document.querySelectorAll('.reveal-up');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // one-time reveal
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  };

  /* ============================
   * 4. Active Navigation Highlighting
   * ============================ */

  const initActiveNav = () => {
    const sectionIds = ['about', 'skills', 'projects', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const navLinks = document.querySelectorAll('.nav__link[data-section]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('data-section') === id);
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '-70px 0px -30% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  };

  /* ============================
   * 5. Mobile Navigation
   * ============================ */

  const initMobileNav = () => {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    const openMenu = () => {
      toggle.classList.add('active');
      menu.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    };

    const closeMenu = () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    };

    // Toggle on hamburger click
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('active');
      isOpen ? closeMenu() : openMenu();
    });

    // Close when a nav link is clicked
    menu.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close when clicking outside the menu
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        closeMenu();
        toggle.focus();
      }
    });
  };

  /* ============================
   * 6. Smooth Scroll for Anchors
   * ============================ */

  const initSmoothScroll = () => {
    const HEADER_OFFSET = 70; // fixed header height in px

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  /* ============================
   * 7. Header Background on Scroll
   * ============================ */

  const initHeaderScroll = () => {
    const header = document.getElementById('header');
    if (!header) return;

    const SCROLL_THRESHOLD = 50;

    const onScroll = throttle(() => {
      header.classList.toggle('header--scrolled', window.scrollY > SCROLL_THRESHOLD);
    }, 50);

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load in case page is already scrolled
    onScroll();
  };

  /* ============================
   * 8. Contact Form Handler
   * ============================ */

  const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather required fields
      const fields = form.querySelectorAll('[required]');
      let valid = true;

      fields.forEach((field) => {
        const value = field.value.trim();
        if (!value) {
          valid = false;
          field.classList.add('input--error');
        } else if (field.type === 'email' && !EMAIL_RE.test(value)) {
          valid = false;
          field.classList.add('input--error');
        } else {
          field.classList.remove('input--error');
        }
      });

      if (!valid) {
        showToast('Por favor, preencha todos os campos corretamente.', 'error');
        return;
      }

      // Success
      showToast('Mensagem enviada com sucesso! ✨', 'success');
      form.reset();
    });

    // Remove error styling on input
    form.addEventListener('input', (e) => {
      e.target.classList.remove('input--error');
    });
  };

  /* ============================
   * 9. Hero Title Stagger Animation
   * ============================ */

  const triggerHeroAnimations = () => {
    const heroElements = document.querySelectorAll('.hero .reveal-up');
    heroElements.forEach((el) => {
      const delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
      // Each data-delay step = 150ms for a nice stagger
      setTimeout(() => el.classList.add('revealed'), delay * 150);
    });
  };

  /* ============================
   * 10. Toast Notification System
   * ============================ */

  /** Injects the toast container once */
  const getToastContainer = () => {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.setAttribute('aria-live', 'polite');
      container.style.cssText =
        'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;';
      document.body.appendChild(container);
    }
    return container;
  };

  /**
   * Show a small toast notification.
   * @param {string} message – Text to display
   * @param {'success'|'error'} type – Visual style
   */
  const showToast = (message, type = 'success') => {
    const container = getToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      pointer-events:auto;padding:.85rem 1.5rem;border-radius:.6rem;
      font-size:.875rem;font-weight:500;color:#fff;
      background:${type === 'success' ? '#28c840' : '#ff5f57'};
      box-shadow:0 8px 24px rgba(0,0,0,.2);
      opacity:0;transform:translateY(.75rem);
      transition:opacity .4s ease,transform .4s ease;
    `;

    container.appendChild(toast);

    // Trigger entrance
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto-dismiss after 3.5s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(.75rem)';
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3500);
  };

  /* ============================
   * 11. Custom Cursor (Desktop)
   * ============================ */

  const initCustomCursor = () => {
    if (isTouchDevice()) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        dot.style.opacity = '1';
        ring.style.opacity = '0.4';
        isVisible = true;
      }
    };

    const hideCursor = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      isVisible = false;
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', hideCursor);

    // Smooth ring follow using rAF
    const animateRing = () => {
      ringX = lerp(ringX, mouseX, 0.15);
      ringY = lerp(ringY, mouseY, 0.15);

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      requestAnimationFrame(animateRing);
    };
    animateRing();

    // Hover state for interactive elements
    const interactiveElements = 'a, button, input, textarea, .project-card, .skill-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        dot.classList.add('cursor--hover');
        ring.classList.add('cursor--hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements)) {
        dot.classList.remove('cursor--hover');
        ring.classList.remove('cursor--hover');
      }
    });
  };

  /* ============================
   * 12. Particles Background
   * ============================ */

  const initParticles = () => {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId;
    const PARTICLE_COUNT = Math.min(50, Math.floor(window.innerWidth / 25));
    const CONNECTION_DISTANCE = 120;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    });

    const initParticleArray = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    };

    const getParticleColor = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      return theme === 'light' ? '154, 123, 62' : '200, 165, 92';
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const colorRGB = getParticleColor();

      particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRGB}, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${colorRGB}, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    resize();
    initParticleArray();
    animate();

    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        initParticleArray();
      }, 250);
    });

    // Cleanup on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  };

  /* ============================
   * 13. Scroll Progress Bar
   * ============================ */

  const initScrollProgress = () => {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    const updateProgress = throttle(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }, 16);

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  };

  /* ============================
   * 14. Parallax Subtle Effect
   * ============================ */

  const initParallax = () => {
    if (isTouchDevice()) return;

    const codeWindow = document.querySelector('.hero__code-window');
    if (!codeWindow) return;

    const onMouseMove = throttle((e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      codeWindow.style.transform = `
        perspective(1000px)
        rotateY(${x * 2}deg)
        rotateX(${-y * 2}deg)
        translateY(${-y * 4}px)
      `;
    }, 16);

    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mousemove', onMouseMove);
      hero.addEventListener('mouseleave', () => {
        codeWindow.style.transform = '';
      });
    }
  };

  /* ============================
   * 15. Magnetic Button Effect
   * ============================ */

  const initMagneticButtons = () => {
    if (isTouchDevice()) return;

    const buttons = document.querySelectorAll('.btn--primary');

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  };

  /* ============================
   * Boot – Wire everything up
   * ============================ */

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSplash();
    initMobileNav();
    initSmoothScroll();
    initHeaderScroll();
    initRevealAnimations();
    initActiveNav();
    initContactForm();
    initCustomCursor();
    initParticles();
    initScrollProgress();
    initParallax();
    initMagneticButtons();
  });
})();
