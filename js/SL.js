// =================================================================
  // 🔹 SEÇÃO 3: CARDS 3D
  // =================================================================

document.addEventListener('DOMContentLoaded', () => {
  const cardWraps = document.querySelectorAll('.card-wrap');
  let isMobile = window.innerWidth <= 768;

  // Detecta mudança de viewport
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
  });

  cardWraps.forEach((cardWrap, index) => {
    const card = cardWrap.querySelector('.card');
    const cardBg = cardWrap.querySelector('.card-bg');

    let width = cardWrap.offsetWidth;
    let height = cardWrap.offsetHeight;
    let mouseX = 0;
    let mouseY = 0;
    let mouseLeaveDelay = null;

    // Atualiza dimensões no resize
    window.addEventListener('resize', () => {
      width = cardWrap.offsetWidth;
      height = cardWrap.offsetHeight;
    });

    // Animação de entrada sequencial
    setTimeout(() => {
      cardWrap.style.opacity = '0';
      cardWrap.style.transform = 'translateY(30px)';
      cardWrap.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
      
      setTimeout(() => {
        cardWrap.style.opacity = '1';
        cardWrap.style.transform = 'translateY(0)';
      }, 100);
    }, 200 * index);

    // Eventos de mouse (apenas desktop)
    if (!isMobile) {
      cardWrap.addEventListener('mousemove', (e) => {
        const rect = cardWrap.getBoundingClientRect();
        mouseX = e.clientX - rect.left - width / 2;
        mouseY = e.clientY - rect.top - height / 2;
        updateTransforms();
      });

      cardWrap.addEventListener('mouseenter', () => {
        clearTimeout(mouseLeaveDelay);
      });

      cardWrap.addEventListener('mouseleave', () => {
        mouseLeaveDelay = setTimeout(() => {
          mouseX = 0;
          mouseY = 0;
          updateTransforms();
        }, 800);
      });
    }

    function updateTransforms() {
      if (isMobile) return;

      const mousePX = mouseX / width;
      const mousePY = mouseY / height;

      // Rotação 3D do card
      const rX = mousePY * -15; // Reduzido para efeito mais suave
      const rY = mousePX * 15;
      card.style.transform = `rotateY(${rY}deg) rotateX(${rX}deg)`;

      // Parallax da imagem
      const tX = mousePX * -30;
      const tY = mousePY * -30;
      cardBg.style.transform = `translateX(${tX}px) translateY(${tY}px) scale(1.1)`;
    }
  });

  // Parallax suave no scroll
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    cardWraps.forEach((wrap, index) => {
      const rect = wrap.getBoundingClientRect();

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Esta lógica de parallax no scroll conflita com a animação de entrada.
        // Recomendo revisar, mas mantive como estava no original.
        // const offset = (scrolled - wrap.offsetTop) * 0.1;
        // wrap.style.transform = `translateY(${offset}px)`;
      }
    });
  });
});


 // =================================================================
  // 🔹 SEÇÃO 3: Carousel
  // =================================================================
(function () {
  const track = document.querySelector('.carousel-track');
  const cards = Array.from(document.querySelectorAll('.card'));
  const prevBtn = document.querySelector('.carousel-controls .carousel-prev');
  const nextBtn = document.querySelector('.carousel-controls .carousel-next');

  const modal = document.getElementById('cardModal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalClose = document.querySelector('.modal-close');

  if (!track || cards.length === 0) return;

  // -------- CONFIG --------
  const CLICK_DRAG_THRESHOLD = 6;   // <= treated as tap
  const MIN_ADVANCE_PX = 40;        // drag magnitude to force next/prev
  // ------------------------

  // state
  let isDown = false;
  let pointerId = null;
  let startX = 0;
  let startScroll = 0;
  let moved = 0;
  let startCenteredIndex = 0;

  // Helpers (use track-local geometry -> stable)
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const getMaxScroll = () => Math.max(track.scrollWidth - track.clientWidth, 0);
  const getViewportCenterInScrollSpace = () => track.scrollLeft + track.clientWidth / 2;

  // compute index whose card center is closest to track viewport center
  function getClosestIndexToCenterFromScroll() {
    const vc = getViewportCenterInScrollSpace();
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const cCenter = c.offsetLeft + c.clientWidth / 2; // offsetLeft is relative to track
      const d = Math.abs(cCenter - vc);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  // center card `index` by setting track.scrollLeft (clamped)
  function centerCardAt(index, smooth = true) {
    const idx = clamp(index, 0, cards.length - 1);
    const card = cards[idx];
    if (!card) return;
    // targetLeft relative to scrollLeft (we want card center in the middle of viewport)
    const targetLeft = card.offsetLeft - Math.round((track.clientWidth - card.clientWidth) / 2);
    const max = getMaxScroll();
    const left = clamp(targetLeft, 0, max);
    // if behavior smooth causes race, we still call it — but we compute using scroll metrics only
    track.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  }

  // scroll one card step
  function scrollByCard(step) {
    const current = getClosestIndexToCenterFromScroll();
    const target = clamp(current + step, 0, cards.length - 1);
    centerCardAt(target);
  }

  // ---------- EVENTS ----------

  // Buttons
  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));

  // Pointer down
  track.addEventListener('pointerdown', (e) => {
    // only primary button
    if ((e.pointerType === 'mouse' || e.pointerType === 'pen') && e.button !== 0) return;
    isDown = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    moved = 0;
    // memorize center at start (stable using scrollLeft)
    startCenteredIndex = getClosestIndexToCenterFromScroll();
    track.classList.add('is-dragging');
    try { track.setPointerCapture(pointerId); } catch (err) {}
  }, { passive: false });

  // Pointer move
  track.addEventListener('pointermove', (e) => {
    if (!isDown || (pointerId !== null && e.pointerId !== pointerId)) return;
    const dx = startX - e.clientX; // positive: user dragged left (content moved right)
    moved = Math.abs(dx);
    track.scrollLeft = startScroll + dx;
  }, { passive: false });

  // Pointer up / cancel / leave
  function handlePointerUp(e) {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
    try { if (pointerId !== null) track.releasePointerCapture(pointerId); } catch (err) {}
    pointerId = null;

    // Tap (open modal) vs drag (snap decision)
    if (moved <= CLICK_DRAG_THRESHOLD) {
      // tap: find element under pointer (use coordinates from event; fallback to center if not available)
      const clientX = (typeof e.clientX === 'number') ? e.clientX : (track.getBoundingClientRect().left + track.clientWidth/2);
      const el = document.elementFromPoint(clientX, (typeof e.clientY === 'number') ? e.clientY : (track.getBoundingClientRect().top + track.clientHeight/2));
      const cardEl = el ? el.closest('.card') : null;
      if (cardEl) openModalForCard(cardEl);
      // snap back to nearest to keep stable centered state
      centerCardAt(getClosestIndexToCenterFromScroll());
      moved = 0;
      return;
    }

    // Was a drag: determine proper target:
    // - compute dx signed (positive => dragged left => go to next)
    const dxSigned = startX - (typeof e.clientX === 'number' ? e.clientX : startX);
    const direction = dxSigned > 0 ? 1 : -1; // 1 => next, -1 => prev

    // nearest by center after scroll
    const nearest = getClosestIndexToCenterFromScroll();
    let target = nearest;

    // if user dragged enough from start (magnitude threshold), prefer step in direction from startCenteredIndex
    if (Math.abs(dxSigned) >= MIN_ADVANCE_PX) {
      const candidate = clamp((startCenteredIndex ?? nearest) + direction, 0, cards.length - 1);
      // choose candidate if candidate is different OR candidate is closer than nearest
      const center = getViewportCenterInScrollSpace();
      const distNearest = Math.abs((cards[nearest].offsetLeft + cards[nearest].clientWidth/2) - center);
      const distCandidate = Math.abs((cards[candidate].offsetLeft + cards[candidate].clientWidth/2) - center);
      if (candidate !== nearest && distCandidate <= distNearest) target = candidate;
      else if (candidate !== nearest && nearest === startCenteredIndex) target = candidate; // user intended move
    } else {
      // small drag -> use nearest
      target = nearest;
    }

    // final snap
    centerCardAt(target);

    // reset moved
    moved = 0;
  }

  track.addEventListener('pointerup', handlePointerUp, { passive: false });
  track.addEventListener('pointercancel', handlePointerUp, { passive: false });
  track.addEventListener('pointerleave', (e) => { if (isDown) handlePointerUp(e); }, { passive: false });

  // prevent native image drag
  cards.forEach(c => {
    const img = c.querySelector('img');
    if (img) img.addEventListener('dragstart', e => e.preventDefault());
  });

  // Highlight center with rAF throttle
  let rafPending = false;
  function highlightCenter() {
    const idx = getClosestIndexToCenterFromScroll();
    cards.forEach((c, i) => c.classList.toggle('centered', i === idx));
  }
  track.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => { highlightCenter(); rafPending = false; });
    }
  });

  // Modal open/close (robust)
  function openModalForCard(card) {
    const src = card.querySelector('img')?.src || '';
    const title = card.dataset.title || 'Passeio';
    const desc = card.dataset.desc || 'Descrição não informada.';
    if (modalImg) modalImg.src = src;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modal) {
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-close')?.focus();
    }
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // keyboard accessibility
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', ev => { if (ev.key === 'Enter') openModalForCard(card); });
  });

  // initial center
  setTimeout(() => {
    centerCardAt(Math.floor(cards.length / 2), false);
    highlightCenter();
  }, 60);

  // debugging helper (uncomment to log)
  // window._carousel_debug = { getClosestIndexToCenterFromScroll, centerCardAt, getMaxScroll };
})();






document.addEventListener("DOMContentLoaded", () => {
  // --- ANIMAÇÃO DE ENTRADA (LOAD) ---
  function initLoadAnimation() {
    // Usando as classes do seu SCSS
    const cards = document.querySelectorAll(".card-stack-item");
    const textContent = document.querySelector(".text-content");

    // Verifica se os elementos existem antes de rodar
    if (!textContent || cards.length === 0) return;

    // Anima os cards sequencialmente
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(50px) scale(0.9)";

      setTimeout(() => {
        card.style.transition = "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)";
        card.style.opacity = "1";

        // Retorna à posição original definida no SCSS
        if (card.classList.contains("card-1")) {
          card.style.transform = "translate(-10%, -10%) rotateZ(-8deg)";
        } else if (card.classList.contains("card-2")) {
          card.style.transform = "translate(0, 0) rotateZ(-4deg)";
        } else if (card.classList.contains("card-3")) {
          card.style.transform = "translate(10%, 10%) rotateZ(0deg)";
        }
      }, 300 * (index + 1));
    });

    // Anima o texto
    textContent.style.opacity = "0";
    textContent.style.transform = "translateX(-30px)";

    setTimeout(() => {
      textContent.style.transition = "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)";
      textContent.style.opacity = "1";
      textContent.style.transform = "translateX(0)";
    }, 600);
  }

  // --- EFEITO PARALLAX NO MOUSE (HOVER) ---
  //
  // A função initMouseParallax() foi REMOVIDA daqui
  // para permitir que o :hover do SCSS funcione sem conflitos.
  //

  // Inicializa as funções
  initLoadAnimation();
  // initMouseParallax(); // Chamada removida
});