/**
 * Função de utilidade (Throttle)
 * Limita a frequência com que uma função pode ser executada.
 * Essencial para eventos de 'scroll' e 'resize' para alta performance.
 */
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Espera o HTML ser totalmente carregado antes de executar
 * qualquer script, evitando erros de "elemento não encontrado".
 */
document.addEventListener("DOMContentLoaded", () => {
  
  // --- 1. GALERIA RESTAURANTE (EFEITO BLUR) ---
  function initGalleryBlur() {
    const galeria = document.querySelector(".galeria-restaurante");
    if (!galeria) return; // Só executa se a galeria existir

    const blurCircleGaleria = galeria.querySelector(".blur-circle");
    if (!blurCircleGaleria) return;

    galeria.addEventListener("mousemove", (e) => {
      const rect = galeria.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      blurCircleGaleria.style.display = "block";
      blurCircleGaleria.style.left = `${x}px`;
      blurCircleGaleria.style.top = `${y}px`;
    });

    galeria.addEventListener("mouseleave", () => {
      blurCircleGaleria.style.display = "none";
    });
  }

  // --- 2. GALERIA RESTAURANTE (CARROSSEL INFINITO) ---
  function initGalleryCarousel() {
    const track = document.querySelector(".galeria-track");
    if (!track) return; // Só executa se o carrossel existir

    const items = track.querySelectorAll(".galeria-item");
    if (items.length === 0) return;

    // Duplicar itens para loop infinito
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
    });

    let index = 0;
    const itemWidth = items[0].offsetWidth + 20; // largura + gap

    function slideGaleria() {
      index++;
      track.style.transition = "transform 1s ease";
      track.style.transform = `translateX(-${itemWidth * index}px)`;

      // Reset no final
      if (index >= items.length) {
        setTimeout(() => {
          track.style.transition = "none";
          track.style.transform = "translateX(0)";
          index = 0;
        }, 1000);
      }
    }
    setInterval(slideGaleria, 4000);
  }

  // --- 3. MENU (TOGGLE ALMOÇO/JANTAR E ACCORDION) ---
  function initMenuToggle() {
    const toggle = document.getElementById("input");
    const labelAlmoco = document.getElementById("label-almoco");
    const labelJantar = document.getElementById("label-jantar");
    const periodoTitulo = document.getElementById("periodo-titulo");
    const menuSection = document.getElementById("menu-section");

    // Só executa se os componentes do menu existirem
    if (!toggle || !menuSection) return;

    const menuDias = menuSection.querySelectorAll(".menu-dia");
    const accordionItems = menuSection.querySelectorAll(".accordion-item");

    let periodoAtual = "almoco";
    let diaAtual = "segunda"; // Assumindo que segunda é o padrão

    // Atualiza menu baseado em período e dia
    function atualizarMenu() {
      menuDias.forEach((menu) => {
        menu.classList.remove("active");
        if (
          menu.dataset.periodo === periodoAtual &&
          menu.dataset.dia === diaAtual
        ) {
          menu.classList.add("active");
        }
      });
    }

    // Toggle Almoço/Jantar
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
        // JANTAR
        periodoAtual = "jantar";
        periodoTitulo.textContent = "Jantar";
        labelAlmoco.classList.remove("active");
        labelJantar.classList.add("active");
      } else {
        // ALMOÇO
        periodoAtual = "almoco";
        periodoTitulo.textContent = "Almoço";
        labelJantar.classList.remove("active");
        labelAlmoco.classList.add("active");
      }
      atualizarMenu();
    });

    // Accordion de dias
    accordionItems.forEach((item) => {
      item.addEventListener("click", () => {
        accordionItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        diaAtual = item.dataset.dia;
        atualizarMenu();
      });
    });

    // Inicializa o menu
    atualizarMenu();
  }

  // --- 4. EFEITOS DE SCROLL (NAVBAR E PARALLAX) ---
  function initScrollEffects() {
    const navbar = document.querySelector(".navbar");
    const circles = document.querySelectorAll(".floating-circle");

    function handleScroll() {
      const scrollY = window.scrollY;

      // 4a. Navbar Shrink
      if (navbar) {
        if (scrollY > 50) {
          navbar.classList.add("shrink");
        } else {
          navbar.classList.remove("shrink");
        }
      }

      // 4b. Parallax dos Círculos Flutuantes
      if (circles.length > 0) {
        circles.forEach((circle, index) => {
          const speed = (index + 1) * 0.3;
          // Usamos 'scrollY' que já pegamos, em vez de 'window.pageYOffset'
          circle.style.transform = `translateY(${scrollY * speed}px)`;
        });
      }
    }

    // Chama o handleScroll uma vez no carregamento
    handleScroll();
    
    // Adiciona o listener ÚNICO e OTIMIZADO (throttle)
    window.addEventListener("scroll", throttle(handleScroll, 100));
  }

  // --- 5. ANIMAÇÃO DE ENTRADA (FADE-IN) ---
  function initPageLoadAnimation() {
    const section = document.querySelector(".breakfast-section");
    if (!section) return; // Só executa se a seção existir

    section.style.opacity = "0";
    setTimeout(() => {
      section.style.transition = "opacity 1s ease";
      section.style.opacity = "1";
    }, 100);
  }

  // ======================================================
  // 🚀 INICIALIZAÇÃO DE TODOS OS COMPONENTES
  // ======================================================
  
  initGalleryBlur();
  initGalleryCarousel();
  initMenuToggle();
  initScrollEffects();
  initPageLoadAnimation();
  
});