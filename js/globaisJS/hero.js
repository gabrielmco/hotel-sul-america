// ===================================
// ARQUIVO: js/globaisJS/hero.js
// Lógica específica do componente Hero
// (versão enxuta: mantém somente PARALLAX + SCROLL INDICATOR)
// ===================================

/**
 * Otimizador de Scroll (Throttle)
 * Garante que a função de scroll não rode mais de uma vez por frame.
 */
function throttle(func) {
  let ticking = false;
  return function () {
    const context = this, args = arguments;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        func.apply(context, args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

// --- PARALLAX DO BACKGROUND ---
function initHeroParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  function handleScroll() {
    const scrolled = window.scrollY;
    const parallaxSpeed = 0.5;

    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(1.1)`;
    } else {
      // keep bounded when scrolled past viewport (optional safety)
      heroBg.style.transform = `translateY(${window.innerHeight * parallaxSpeed}px) scale(1.1)`;
    }
  }

  // Usa o throttle local
  const throttled = throttle(handleScroll);
  window.addEventListener('scroll', throttled, { passive: true });

  // run once to set initial position (in case page loaded not at top)
  handleScroll();
}

// --- SCROLL INDICATOR (click para rolar) ---
function initScrollIndicator() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (!scrollIndicator) return;

  scrollIndicator.addEventListener('click', () => {
    window.scrollTo({
      top: window.innerHeight * 0.9, // Rola 90% da tela
      behavior: 'smooth'
    });
  });
}

// --- FUNÇÃO PRINCIPAL DE EXPORTAÇÃO ---
// Esta é a única função que o main.js precisa chamar
export function initHeroSection() {
  initHeroParallax();
  initScrollIndicator();
}
