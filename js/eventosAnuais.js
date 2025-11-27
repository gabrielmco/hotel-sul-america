// scripts.js
(function () {
  // ========== CONFIG ===========
  const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';
  // opções antigas do observer removidas porque não usamos mais observer para "revelar" cards

  // Seleções
  const cards = document.querySelectorAll('.evento-card');
  const heroBg = document.querySelector('.hero-bg');
  let eventImgs = Array.from(document.querySelectorAll('.evento-image img'));

  // Garante lazy-loading das imagens (mantém comportamento anterior)
  cards.forEach(card => {
    const img = card.querySelector('.evento-image img');
    if (img && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');

    // Remove qualquer estilo inline de "revelação" aplicado anteriormente (se existir)
    // Isso evita que cards permaneçam com opacity:0 ou transform translateY(40px)
    card.style.opacity = '';
    card.style.transform = '';
    card.style.transition = '';
  });

  // Atualiza array de imagens se DOM mudar (simples fallback)
  function refreshEventImgs() {
    eventImgs = Array.from(document.querySelectorAll('.evento-image img'));
  }

  // ========== PARALLAX (requestAnimationFrame) ===========
  let latestScrollY = window.scrollY || window.pageYOffset;
  let ticking = false;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function updateParallax() {
    // HERO PARALLAX - calcula deslocamento baseado na posição do hero na viewport
    if (heroBg) {
      const heroRect = heroBg.getBoundingClientRect();
      // quando hero estiver parcialmente fora do topo, heroRect.top será negativo
      // deslocamento proporcional à distância do topo (ajuste o multiplicador se quiser mais/menos efeito)
      const shift = clamp(-heroRect.top * 0.18, -40, 40);
      heroBg.style.transform = `translateY(${shift}px) scale(1.03)`;
      heroBg.style.willChange = 'transform';
      heroBg.style.transition = 'transform 220ms linear';
    }

    // IMAGENS DOS CARDS - parallax relativo à posição do elemento na viewport
    const viewportHeight = window.innerHeight;
    eventImgs.forEach(img => {
      const rect = img.getBoundingClientRect();
      const imgCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = imgCenter - viewportCenter; // px
      const maxShift = 18;
      const shift = clamp(-distanceFromCenter * 0.03, -maxShift, maxShift);
      // preserva escala suave
      img.style.transform = `translateY(${shift}px) scale(1.02)`;
      img.style.transition = 'transform 600ms ease-out';
      img.style.willChange = 'transform';
    });

    ticking = false;
  }

  function onScroll() {
    latestScrollY = window.scrollY || window.pageYOffset;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  // Roda uma vez para setar valores iniciais
  refreshEventImgs();
  updateParallax();

  // Listeners
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    refreshEventImgs();
    requestAnimationFrame(updateParallax);
  });

  // ========== Acessibilidade para botões ===========
  const buttons = document.querySelectorAll('.evento-btn, .cta-btn');
  buttons.forEach(btn => {
    btn.setAttribute('role', btn.tagName.toLowerCase() === 'a' ? 'link' : 'button');
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // evita comportamento padrão do espaço em <a> que dá scroll em alguns navegadores
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ========== CLEANUP (opcional) ===========
  // Se você quiser limpar os listeners em SPA, exponha a função abaixo:
  // window.__destroyEventosScripts = () => {
  //   window.removeEventListener('scroll', onScroll);
  //   window.removeEventListener('resize', ...);
  // };
})();
