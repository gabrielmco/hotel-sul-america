
// ==============================================================================
// 🔹 SEÇÃO: UTILITÁRIOS (helpers reutilizáveis)
// - debounce: evita execução repetida em eventos rápidos (resize, etc.)
// - rafThrottle: throttle que executa a função atualizada uma vez por rAF
// - imagesReady: retorna Promise que resolve quando todas as imagens dos itens
//   estiverem carregadas (ajuda a evitar problemas de layout inicial).
// ==============================================================================
/**
 * Debounce simples
 * @param {Function} fn
 * @param {number} wait ms
 */
function debounce(fn, wait = 120) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Throttle via requestAnimationFrame (executa a mais recente por frame)
 * @param {Function} fn
 */
function rafThrottle(fn) {
  let scheduled = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn(...lastArgs);
    });
  };
}

/**
 * imagesReady(items)
 * - Recebe array de elementos (masonry-item) e retorna Promise que resolve
 *   quando todas as imagens internas estiverem carregadas (load/error).
 * - Útil para garantir medições corretas antes de calcular layout.
 * @param {HTMLElement[]} items
 * @returns {Promise}
 */
function imagesReady(items) {
  const imgs = items
    .map(it => Array.from(it.querySelectorAll('img')))
    .flat()
    .filter(Boolean);

  if (imgs.length === 0) return Promise.resolve();

  return Promise.all(
    imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => {
        const done = () => {
          img.removeEventListener('load', done);
          img.removeEventListener('error', done);
          res();
        };
        img.addEventListener('load', done);
        img.addEventListener('error', done);
      });
    })
  );
}



// ==============================================================================
// 🔹 SEÇÃO: NAVBAR / HAMBURGUER
// - controla toggle do menu mobile (hamburger), fecha ao clicar fora, e efeito
//   shrink da navbar quando a página é rolada.
// - usa event.stopPropagation em clique do hambúrguer e passive listener em scroll.
// ==============================================================================
(function initNavbar() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    // Toggle do menu ao clicar no hamburguer
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });

    // Fecha o menu quando clica em um link dentro do mobile menu
    document.querySelectorAll(".mobile-menu a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
      });
    });

    // Fecha o menu ao clicar fora (document)
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
      }
    });
  } else {
    console.warn("Hamburguer ou menu mobile não encontrados no DOM");
  }

  // Efeito shrink da navbar ao scroll (passive para melhor performance)
  const onScroll = () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    if (window.scrollY > 80) navbar.classList.add("shrink");
    else navbar.classList.remove("shrink");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
})();



// ==============================================================================
// 🔹 SEÇÃO: GALLERY MODULE (masonry, controladores, filtros, arrastar handle)
// - Mantém a lógica original: DESKTOP_STAGES, COMPACT_STAGES, building por col.
// - Melhorias de organização: DocumentFragment para criação de colunas, rAF para
//   batch reads/writes, debounce no resize, imagesReady para inicialização.
// - Comentários explicativos em PT-BR em cada função.
// ==============================================================================
(function GalleryModule() {
  // -----------------------------
  // Configurações / constantes
  // -----------------------------
  const BREAKPOINT_MD = 868;
  const DESKTOP_STAGES = [
    { name: 'small',  cols: 6, pattern: [239, 376, 249, 239, 376, 249], defaultH: 239 },
    { name: 'medium', cols: 4, pattern: [376, 562, 249, 376, 562, 249], defaultH: 376 },
    { name: 'large',  cols: 3, pattern: [511, 376, 249, 511, 376, 249], defaultH: 511 }
  ];
  const COMPACT_STAGES = [
    { name: 'less', cols: 2, pattern: [239, 376, 249, 239], defaultH: 239 },
    { name: 'more', cols: 1, pattern: [376, 562, 376, 562], defaultH: 376 }
  ];

  // -----------------------------
  // Seletores (cache de DOM)
  // -----------------------------
  const masonry = document.querySelector('.masonry');
  if (!masonry) {
    console.error('[gallery] .masonry não encontrado');
    return;
  }
  const allItemsSource = Array.from(document.querySelectorAll('.masonry-item'));
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const sizeControl = document.querySelector('.size-control');
  const decreaseBtn = document.querySelector('.size-dec') || document.querySelector('.size-btn.size-dec') || document.querySelector('.size-btn.size-decrease');
  const increaseBtn = document.querySelector('.size-inc') || document.querySelector('.size-btn.size-inc') || document.querySelector('.size-btn.size-increase');
  const handle = document.querySelector('.size-handle');

  // -----------------------------
  // Estado local do módulo
  // -----------------------------
  let currentStage = 1;      // índice no array de stages atual
  let filter = 'all';        // filtro ativo (categoria)
  let lastStagesLen = getStagesArray().length; // para detectar mudança em resize

  // rAF-throttled wrapper (não altera semântica, evita flood)
  const setStageRaf = rafThrottle((idx, opts) => setStage(idx, opts));

  // -----------------------------
  // Funções utilitárias internas
  // -----------------------------
  /**
   * getStagesArray()
   * - Retorna COMPACT_STAGES ou DESKTOP_STAGES de acordo com largura da janela.
   */
  function getStagesArray() {
    return window.innerWidth <= BREAKPOINT_MD ? COMPACT_STAGES : DESKTOP_STAGES;
  }

  /**
   * setColumnCountCSS(count)
   * - Atualiza propriedades CSS relacionadas ao número de colunas
   * - Mantém compatibilidade com regras que leem column-count
   */
  function setColumnCountCSS(count) {
    masonry.style.setProperty('--cols', String(count));
    masonry.style.columnCount = String(count);
    masonry.style.webkitColumnCount = String(count);
    masonry.style.MozColumnCount = String(count);
  }

  /**
   * updateBodyStageClass()
   * - Atualiza classe no <body> para indicar stage atual (body.stage-X)
   * - Isso permite estilos CSS dependentes do estágio.
   */
  function updateBodyStageClass() {
    const stages = getStagesArray();
    if (currentStage > stages.length - 1) currentStage = stages.length - 1;
    document.body.classList.remove('stage-0', 'stage-1', 'stage-2');
    document.body.classList.add(`stage-${currentStage}`);
  }

  /**
   * positionHandle(idx, animate)
   * - Posiciona a alça (handle) do controle de tamanho de acordo com índice.
   * - Usa transição condicional (animate true/false).
   */
  function positionHandle(idx, animate = true) {
    if (!handle) return;
    const stages = getStagesArray();
    const maxIndex = Math.max(0, stages.length - 1);
    const pct = maxIndex === 0 ? 100 : (idx / maxIndex) * 100;
    handle.style.transition = animate ? 'left 200ms cubic-bezier(.25,.8,.25,1)' : 'none';
    handle.style.left = `calc(${pct}% )`;
  }

  // -----------------------------
  // buildColumns(cols)
  // - Reconstrói as colunas e distribui os itens visíveis
  // - Algoritmo: shortest-column-first (usa estimativa de altura pelo pattern)
  // - Usa DocumentFragment para reduzir reflows
  // -----------------------------
  function buildColumns(cols) {
    // Cria colunas em DocumentFragment
    const frag = document.createDocumentFragment();
    const columns = [];
    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div');
      col.className = 'masonry-col';
      col.style.minHeight = '0';
      col._height = 0;
      columns.push(col);
      frag.appendChild(col);
    }

    // Substitui conteúdo do container de uma vez
    masonry.innerHTML = '';
    masonry.appendChild(frag);

    // Filtra itens visíveis segundo o filtro atual (preserva ordem original)
    const visibleItems = allItemsSource.filter(it => {
      const cat = it.dataset.category || '';
      return (filter === 'all' || cat === filter);
    });

    // Estimativa de pattern para fallback de alturas
    const stages = getStagesArray();
    const pattern = (stages[currentStage] && stages[currentStage].pattern) || [stages[currentStage].defaultH];

    // Distribui cada item na coluna atualmente mais curta (pela propriedade _height)
    visibleItems.forEach((it, idx) => {
      if (it.parentNode) it.parentNode.removeChild(it);

      // encontra a coluna mais curta
      let shortest = columns[0];
      let shortestH = shortest._height;
      for (let c of columns) {
        if (c._height < shortestH) {
          shortest = c;
          shortestH = c._height;
        }
      }

      shortest.appendChild(it);

      // define altura estimada para o algoritmo de distribuição (pattern fallback)
      const patternHeight = pattern[idx % pattern.length] || (stages[currentStage] && stages[currentStage].defaultH) || 300;
      const img = it.querySelector('img');
      if (img) img.dataset.forcedHeight = patternHeight;
      shortest._height += (patternHeight + 32); // soma gap estimada
    });
  }

  // -----------------------------
  // applyHeights()
  // - Depois de buildColumns, aplica a altura real (inline) em cada imagem
  // - Isso garante que object-fit/contain funcionem e que o layout seja coerente
  // -----------------------------
  function applyHeights() {
    const stages = getStagesArray();
    const pat = stages[currentStage] && stages[currentStage].pattern ? stages[currentStage].pattern : [stages[currentStage].defaultH];
    const placed = Array.from(masonry.querySelectorAll('.masonry-item')).filter(it => !it.classList.contains('is-hidden'));
    placed.forEach((it, i) => {
      const h = pat[i % pat.length] || (stages[currentStage] && stages[currentStage].defaultH) || 376;
      it.style.setProperty('--img-h', `${h}px`);
      const img = it.querySelector('img');
      if (img) {
        img.style.height = `${h}px`;
        img.dataset.forcedHeight = h;
      }
    });
  }

  /**
   * remapStageIndex(oldIndex, oldCount, newCount)
   * - Quando muda o conjunto de stages (por exemplo resize que troca compact/desktop),
   *   recalcula um index coerente para o novo array, preservando proporção.
   */
  function remapStageIndex(oldIndex, oldCount, newCount) {
    if (oldCount === newCount) return oldIndex;
    const ratio = oldIndex / Math.max(1, (oldCount - 1));
    const newIndex = Math.round(ratio * (newCount - 1));
    return Math.max(0, Math.min(newCount - 1, newIndex));
  }

  // -----------------------------
  // setStage(idx, opts)
  // - Função principal para definir o 'stage' atual
  // - Atualiza CSS, classes, posicionado handle e rebuild das colunas
  // - Usa requestAnimationFrame para agrupar operações DOM
  // -----------------------------
  function setStage(idx, opts = { animate: true }) {
    const stages = getStagesArray();
    const newIdx = Math.max(0, Math.min(stages.length - 1, Math.round(idx)));
    currentStage = newIdx;

    setColumnCountCSS(stages[currentStage].cols);
    updateBodyStageClass();
    positionHandle(currentStage, opts.animate);

    // Rebuild + apply heights em rAF para evitar repaints/desalinhamentos
    requestAnimationFrame(() => {
      buildColumns(stages[currentStage].cols);
      requestAnimationFrame(() => {
        applyHeights();
      });
    });
  }

  /**
   * applyFilter()
   * - Recalcula colunas e alturas considerando o filtro atual
   */
  function applyFilter() {
    const cols = getStagesArray()[currentStage].cols;
    requestAnimationFrame(() => {
      buildColumns(cols);
      requestAnimationFrame(applyHeights);
    });
  }

  // -----------------------------
  // BIND CONTROLES (eventos)
  // - filtros, botões +/- e drag do handle (pointer events)
  // -----------------------------
  // Filtros: adiciona classe is-active e aplica filtro
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filter = btn.dataset.filter || 'all';
      applyFilter();
    });
  });

  // Botões de aumentar/diminuir (se existirem)
  if (decreaseBtn) decreaseBtn.addEventListener('click', () => setStage(currentStage - 1));
  if (increaseBtn) increaseBtn.addEventListener('click', () => setStage(currentStage + 1));

  // -----------------------------
  // Dragging handle (controle de tamanho)
  // - Usa pointer events
  // - Throttle de pointermove com rAF para performance
  // -----------------------------
  (function enableHandleDrag() {
    if (!sizeControl || !handle) return;
    let dragging = false;
    let pointerId = null;
    let rect = null;

    // Converte clientX em índice de stage, baseado na largura da trilha
    function toStageFromClientX(x) {
      rect = rect || sizeControl.querySelector('.size-track').getBoundingClientRect();
      const left = rect.left + 12;
      const right = rect.right - 12;
      const clampedX = Math.max(left, Math.min(right, x));
      const frac = (clampedX - left) / (right - left);
      const stageCount = getStagesArray().length;
      return Math.round(frac * (stageCount - 1));
    }

    sizeControl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.size-btn')) return; // ignore clicks nos botões +/- 
      dragging = true;
      pointerId = e.pointerId;
      rect = sizeControl.querySelector('.size-track').getBoundingClientRect();
      handle.classList.add('dragging');
      try { sizeControl.setPointerCapture(pointerId); } catch (err) { /* ignore */ }
      const stage = toStageFromClientX(e.clientX);
      setStage(stage, { animate: false });
      e.preventDefault();
    });

    // pointermove throttled
    const onPointerMove = rafThrottle((e) => {
      if (!dragging) return;
      const stage = toStageFromClientX(e.clientX);
      setStage(stage, { animate: false });
    });

    sizeControl.addEventListener('pointermove', onPointerMove);

    function up(e) {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      try { sizeControl.releasePointerCapture(pointerId); } catch (err) { /* ignore */ }
      const stage = toStageFromClientX((e && e.clientX) || (rect && rect.left));
      setStage(stage, { animate: true });
      rect = null;
    }

    sizeControl.addEventListener('pointerup', up);
    sizeControl.addEventListener('pointercancel', up);
    sizeControl.addEventListener('pointerleave', up);
  })();



  // -----------------------------
  // Resize handling (debounced)
  // - Quando troca entre compact/desktop, remapeia índice para evitar pulo brusco
  // -----------------------------
  const onResize = debounce(() => {
    const newLen = getStagesArray().length;
    if (newLen !== lastStagesLen) {
      currentStage = remapStageIndex(currentStage, lastStagesLen, newLen);
      lastStagesLen = newLen;
    }
    setStage(currentStage, { animate: false });
  }, 120);
  window.addEventListener('resize', onResize, { passive: true });



  // -----------------------------
  // Inicialização controlada: initAfterImages()
  // - Espera imagens (imagesReady) para evitar o problema da "primeira coluna vazia"
  // - Renderiza ticks do controle de tamanho e faz o primeiro build
  // -----------------------------
  function initAfterImages() {
    // garante display / width básicos nos itens
    allItemsSource.forEach(it => {
      if (!it.style.display) it.style.display = 'block';
      it.style.width = '100%';
    });

    lastStagesLen = getStagesArray().length;
    if (currentStage > lastStagesLen - 1) currentStage = lastStagesLen - 1;

    // rendeiza ticks (bolinhas) do size-control, se existir
    const ticksContainer = sizeControl ? sizeControl.querySelector('.size-ticks') : null;
    if (ticksContainer) {
      ticksContainer.innerHTML = '';
      const stages = getStagesArray();
      for (let i = 0; i < stages.length; i++) {
        const s = document.createElement('span');
        s.className = 'tick';
        ticksContainer.appendChild(s);
      }
    }

    // render inicial
    setStage(currentStage, { animate: false });
    applyFilter();
    console.info('[gallery] iniciado — cols:', getStagesArray()[currentStage].cols, 'stages:', getStagesArray().length);
  }

  // Usa imagesReady para agilizar (espera apenas as imagens dos itens)
  imagesReady(allItemsSource).then(() => {
    // pequeno rAF para garantir pintura inicial do navegador
    requestAnimationFrame(() => {
      initAfterImages();
    });
  }).catch(() => {
    // fallback: caso ocorra algum erro, garante inicialização em window.load
    window.addEventListener('load', () => {
      requestAnimationFrame(initAfterImages);
    }, { passive: true });
  });

  // expose para debug
  window.__gallerySetStage = setStage;



  // ========================================================================
  // 🔹 SEÇÃO: LIGHTBOX / CARROSSEL
  // - Mantém a mesma lógica de abertura/fechamento, next/prev, keyboard,
  //   fechar ao clicar fora do "inner". Adicionei pequenos comentários e
  //   melhorias de acessibilidade (aria-labels).
  // ========================================================================
  (function enableLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;

    // seleciona imagem dentro do lightbox (compatível com id/class)
    const lightboxImg = lightbox.querySelector('.lightbox-view img') || lightbox.querySelector('#lightbox-img');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const btnClose = lightbox.querySelector('.lightbox-close');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;

    // lista estática de itens (o filtro resolve via visibleItems)
    const items = Array.from(document.querySelectorAll('.masonry-item'));
    const visibleItems = () => items.filter(it => !it.classList.contains('is-hidden'));

    /**
     * openLightbox(index)
     * - abre o lightbox com a imagem do índice fornecido (considera apenas visíveis)
     * - aplica transição: remove is-visible -> troca src -> adiciona is-visible
     */
    function openLightbox(index) {
      const vis = visibleItems();
      if (!vis || vis.length === 0) return;
      if (!vis[index]) return;
      currentIndex = index;
      const img = vis[index].querySelector('img');
      if (!img) return;
      lightboxImg.classList.remove('is-visible');
      // pequena timeout para efeito de transição (fade)
      setTimeout(() => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        if (lightboxTitle) lightboxTitle.textContent = img.alt || '';
        lightbox.classList.add('is-open');
        requestAnimationFrame(() => lightboxImg.classList.add('is-visible'));
      }, 40);
      document.body.style.overflow = 'hidden';
      // acessibilidade
      lightbox.setAttribute('aria-hidden', 'false');
      if (lightboxImg.tabIndex < 0) lightboxImg.tabIndex = 0;
      lightboxImg.focus && lightboxImg.focus();
    }

    /**
     * closeLightbox()
     * - fecha o lightbox e remove classes/estilos aplicados
     */
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.classList.remove('is-visible');
    }

    // próxima/imediata e anterior
    function next() {
      const vis = visibleItems();
      if (!vis || vis.length === 0) return;
      currentIndex = (currentIndex + 1) % vis.length;
      update();
    }
    function prev() {
      const vis = visibleItems();
      if (!vis || vis.length === 0) return;
      currentIndex = (currentIndex - 1 + vis.length) % vis.length;
      update();
    }

    // update(): troca a src com transição
    function update() {
      const vis = visibleItems();
      if (!vis || vis.length === 0) return;
      const img = vis[currentIndex].querySelector('img');
      if (!img) return;
      lightboxImg.classList.remove('is-visible');
      setTimeout(() => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        if (lightboxTitle) lightboxTitle.textContent = img.alt || '';
        lightboxImg.classList.add('is-visible');
      }, 180);
    }

    // Eventos: botões, click em item, click fora do inner, teclado
    btnClose && btnClose.addEventListener('click', closeLightbox);
    btnNext && btnNext.addEventListener('click', next);
    btnPrev && btnPrev.addEventListener('click', prev);

    // abre lightbox ao clicar na imagem do grid
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const vis = visibleItems();
        const visibleIdx = vis.indexOf(item);
        openLightbox(visibleIdx >= 0 ? visibleIdx : Array.from(items).indexOf(item));
      });
    });

    // fechar ao clicar fora do conteúdo (queremos que clicar no overlay feche)
    lightbox.addEventListener('click', (e) => {
      const inner = lightbox.querySelector('.lightbox-inner');
      if (!inner || !inner.contains(e.target)) {
        closeLightbox();
      }
    });

    // teclado: Escape = fechar, setas = navegar
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // acessibilidade: labels úteis nos botões
    btnClose && btnClose.setAttribute('aria-label', btnClose.getAttribute('aria-label') || 'Fechar');
    btnNext && btnNext.setAttribute('aria-label', btnNext.getAttribute('aria-label') || 'Próxima');
    btnPrev && btnPrev.setAttribute('aria-label', btnPrev.getAttribute('aria-label') || 'Anterior');
  })();



})(); // fim GalleryModule
