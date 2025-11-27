class BlurCircleEffect {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.blurCircle = this.container.querySelector('.blur-circle');
    if (!this.blurCircle) return;

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.updatePosition(x, y);
    });

    this.container.addEventListener('mouseleave', () => {
      this.blurCircle.style.display = 'none';
    });
  }

  updatePosition(x, y) {
    this.blurCircle.style.display = 'block';
    this.blurCircle.style.left = `${x}px`;
    this.blurCircle.style.top = `${y}px`;
  }
}



document.addEventListener('DOMContentLoaded', () => {
  
  // =================================================================
  // 🔹 SEÇÃO 1: CONTROLES DA GALERIA (CÓDIGO CORRIGIDO)
  // =================================================================

  const galeriaContainer = document.getElementById('galeriaSobreNos');
  
  // Verifica se a galeria existe na página antes de executar o código
  if (galeriaContainer) {
    const blurCircle = galeriaContainer.querySelector('.blur-circle');

    /**
     * Atualiza a posição do círculo de blur.
     * @param {number} x - Posição X do mouse/toque dentro da galeria.
     * @param {number} y - Posição Y do mouse/toque dentro da galeria.
     */
    const updateBlurCirclePosition = (x, y) => {
      blurCircle.style.display = 'block';
      blurCircle.style.left = `${x}px`;
      blurCircle.style.top = `${y}px`;
    };

    // --- Evento para mouse no Desktop ---
    galeriaContainer.addEventListener('mousemove', (e) => {
      // Calcula a posição do mouse relativa à galeria
      const rect = galeriaContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateBlurCirclePosition(x, y);
    });

    // --- Evento para esconder o círculo quando o mouse sai ---
    galeriaContainer.addEventListener('mouseleave', () => {
      blurCircle.style.display = 'none';
    });

    // --- Eventos de Toque para Mobile ---
    galeriaContainer.addEventListener('touchmove', (e) => {
      // Verifica se há um toque na tela
      if (e.touches.length > 0) {
        const rect = galeriaContainer.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        updateBlurCirclePosition(x, y);
      }
    }, false);

    // --- Evento para esconder o círculo ao final do toque ---
    galeriaContainer.addEventListener('touchend', () => {
      blurCircle.style.display = 'none';
    });

  } else {
    console.warn("Elemento da galeria #galeriaSobreNos não foi encontrado.");
  }


  new BlurCircleEffect('.hero');


 // =================================================================
  // 🔹 SEÇÃO 2: Infinite Gallery
  // =================================================================
  class InfiniteScroller {
  constructor(selector, speed = 1) {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.track = this.container.querySelector('.sobre-nos-track');
    this.speed = speed;
    this.position = 0;
    this.items = Array.from(this.track.children);

    // Duplicar o conteúdo para criar o loop infinito
    this.items.forEach(item => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });

    this.loop();
  }

  loop() {
    this.position -= this.speed;
    const width = this.track.scrollWidth / 2;

    // Quando metade da faixa já passou, reseta
    if (Math.abs(this.position) >= width) {
      this.position = 0;
    }

    this.track.style.transform = `translate3d(${this.position}px, 0, 0)`;
    requestAnimationFrame(this.loop.bind(this));
  }
}
const galeria = new InfiniteScroller('#galeriaSobreNos', 0.6);




  // =================================================================
  // 🔹 SEÇÃO 4: PARALLAX CARDS CONTROLLER (CÓDIGO ORIGINAL)
  // =================================================================
  // Verifique se os elementos dos cards existem antes de instanciar a classe
  
  if (document.getElementById('cardsContainer')) {
    
    class ParallaxCards {
      constructor() {
        // ===== ELEMENTOS DO DOM =====
        this.container = document.getElementById('cardsContainer');
        this.cardLeft = document.getElementById('card1');
        this.cardCenter = document.getElementById('card2');
        this.cardRight = document.getElementById('card3');
        
        // Se algum card não existir, interrompe a inicialização
        if (!this.cardLeft || !this.cardCenter || !this.cardRight) {
            console.warn("Um ou mais cards para o efeito parallax não foram encontrados.");
            return;
        }

        // ===== CONFIGURAÇÕES =====
        this.scrollY = 0;
        this.maxOffset = 80; 
        this.easing = 1;

        // ===== ESTADOS DE ANIMAÇÃO =====
        this.currentOffsetLeft = 0;
        this.currentOffsetCenter = 0;
        this.currentOffsetRight = 0;
        this.targetOffsetLeft = 0;
        this.targetOffsetCenter = 0;
        this.targetOffsetRight = 0;

        // ===== INICIALIZAÇÃO =====
        this.init();
      }

      init() {
        this.bindEvents();
        this.animate();
      }

      bindEvents() {
        window.addEventListener('scroll', () => this.handleScroll());
      }

      handleScroll() {
        this.scrollY = window.scrollY;
      }
      
      updateCardPositions() {
        // Otimização: só calcula se o container estiver na tela
        const rect = this.container.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            return;
        }

        // Normaliza o scroll relativo à posição do container para maior precisão
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

        this.targetOffsetLeft = -scrollProgress * this.maxOffset;
        this.targetOffsetCenter = scrollProgress * this.maxOffset * 0.8;
        this.targetOffsetRight = -scrollProgress * this.maxOffset;
      }

      animate() {
        this.updateCardPositions();

        this.currentOffsetLeft += (this.targetOffsetLeft - this.currentOffsetLeft) * this.easing;
        this.currentOffsetCenter += (this.targetOffsetCenter - this.currentOffsetCenter) * this.easing;
        this.currentOffsetRight += (this.targetOffsetRight - this.currentOffsetRight) * this.easing;

        this.applyTransforms();
        requestAnimationFrame(() => this.animate());
      }

      applyTransforms() {
        this.cardLeft.style.transform = `translateY(calc(30px + ${this.currentOffsetLeft}px))`;
        this.cardCenter.style.transform = `translateY(calc(-20px + ${this.currentOffsetCenter}px))`;
        this.cardRight.style.transform = `translateY(calc(30px + ${this.currentOffsetRight}px))`;
      }
    }
    
    // Instancia a classe
    new ParallaxCards();
  }


});

  // =================================================================
  // 🔹 SEÇÃO 5: PARALLAX LOGO CONTROLLER (CÓDIGO ORIGINAL)
  // =================================================================
const discoverSection = document.querySelector(".discover-section");
const discoverImg = document.querySelector(".discover-img");

let offsetX = 0;
let lastScrollY = window.scrollY;

const speed = 6;        // 🔹 velocidade do movimento
const maxOffset = 200;  // 🔹 limite máximo de deslocamento
const disableWidth = 1220; // 🔹 largura máxima para ativar o efeito

window.addEventListener("scroll", () => {
  if (!discoverSection || !discoverImg) return;

  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const sectionTop = discoverSection.offsetTop;
  const sectionHeight = discoverSection.offsetHeight;
  const sectionBottom = sectionTop + sectionHeight;

  const inView =
    scrollY + viewportHeight > sectionTop && scrollY < sectionBottom;

  // ✅ Só aplica o movimento se for maior que 1220px e a seção estiver visível
  if (window.innerWidth > disableWidth && inView) {
    if (scrollY > lastScrollY) {
      // ⬇️ Scrolando para baixo → move para a esquerda até o limite
      offsetX = Math.max(offsetX - speed, -maxOffset);
    } else {
      // ⬆️ Scrolando para cima → retorna lentamente ao centro
      offsetX = Math.min(offsetX + speed, 0);
    }

    discoverImg.style.transform = `translateX(${offsetX}px)`;
    discoverImg.style.transition = "transform 0.4s ease-out";
  } else {
    // 🔹 Em telas menores ou fora da área, centraliza suavemente
    offsetX = 0;
    discoverImg.style.transform = "translateX(0)";
    discoverImg.style.transition = "transform 0.6s ease-out";
  }

  lastScrollY = scrollY;
});

// 🔹 Reseta o efeito ao redimensionar
window.addEventListener("resize", () => {
  if (window.innerWidth <= disableWidth) {
    offsetX = 0;
    discoverImg.style.transform = "translateX(0)";
    discoverImg.style.transition = "transform 0.6s ease-out";
  }
});
