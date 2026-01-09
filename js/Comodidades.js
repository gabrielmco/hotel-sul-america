







// =================================================================
// 🔹 SEÇÃO 4: PARALLAX CARDS CONTROLLER (COM DESATIVAÇÃO EM BREAKPOINT - LÓGICA ORIGINAL)
// =================================================================
if (document.getElementById("cardsContainer")) {
  class ParallaxCards {
    constructor() {
      this.container = document.getElementById("cardsContainer");
      this.cards = [
        document.getElementById("card1"),
        document.getElementById("card2"),
        document.getElementById("card3"),
        document.getElementById("card4"),
      ].filter(Boolean);

      if (this.cards.length === 0) {
        console.warn("Nenhum card encontrado para o efeito parallax.");
        return;
      }

      // --- CONFIGURAÇÕES DO EFEITO (COMO AS SUAS) ---
      this.maxOffset = 40;
      this.easing = 0.09;
      this.velocityFactor = 0.09;

      // --- CONTROLE DE ESTADO ---
      this.breakpoint = 1220; // Breakpoint MD para desativar
      this.isEnabled = window.innerWidth > this.breakpoint; // Estado inicial

      // --- VARIÁVEIS DE MOVIMENTO (COMO AS SUAS) ---
      this.lastScrollY = window.scrollY;
      this.scrollVelocity = 0;
      this.currentOffsets = new Array(this.cards.length).fill(0);
      this.targetOffsets = new Array(this.cards.length).fill(0);

      this.animationFrameId = null; // Para controlar o rAF

      this.init();
    }

    // --- MÉTODOS DE CONTROLE DO BREAKPOINT ---
    checkBreakpoint() {
      const shouldBeEnabled = window.innerWidth > this.breakpoint;
      if (shouldBeEnabled !== this.isEnabled) {
        this.isEnabled = shouldBeEnabled;
        if (!this.isEnabled) {
          this.resetStyles(); // Remove transforms se desativado
        }
        // Quando reativado, a animação vai pegar os valores zerados
      }
    }

    resetStyles() {
      cancelAnimationFrame(this.animationFrameId); // Para o loop se estiver desativado
      this.cards.forEach((card, index) => {
        card.style.transform = 'translateY(0px)';
        this.currentOffsets[index] = 0;
        this.targetOffsets[index] = 0;
        this.scrollVelocity = 0; // Zera a velocidade também
      });
      // Reinicia o loop apenas se for reativado
      if (this.isEnabled) {
        this.animate();
      }
    }

    // --- INICIALIZAÇÃO ---
    init() {
      // Listener de Scroll (COMO O SEU)
      window.addEventListener("scroll", () => {
        // Calcula velocidade apenas se habilitado
        if (this.isEnabled) {
          const currentScroll = window.scrollY;
          this.scrollVelocity = currentScroll - this.lastScrollY;
          this.lastScrollY = currentScroll;
          // A atualização dos offsets acontecerá dentro do loop animate
        }
      }, { passive: true });

      // Listener de Resize para checar breakpoint
      window.addEventListener('resize', () => this.checkBreakpoint());

      // Checa o breakpoint inicial
      this.checkBreakpoint();

      // Inicia o loop de animação
      this.animate();
    }

    // --- ATUALIZAÇÃO DOS ALVOS (LÓGICA ORIGINAL) ---
    updateCardPositions() {
      // Roda apenas se habilitado e container visível
      if (!this.isEnabled) return;

      const rect = this.container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      this.cards.forEach((_, index) => {
        const direction = index % 2 === 0 ? -1 : 1;
        const offsetChange = this.scrollVelocity * this.velocityFactor * direction;

        // Limita o deslocamento (LÓGICA ORIGINAL)
        this.targetOffsets[index] = Math.max(
          -this.maxOffset,
          Math.min(this.maxOffset, this.targetOffsets[index] + offsetChange)
        );
      });

      // Importante: Reseta a velocidade DEPOIS de usá-la para calcular os alvos
      // para que o próximo frame não acumule velocidade antiga.
      this.scrollVelocity = 0;
    }

    // --- LOOP DE ANIMAÇÃO (LÓGICA ORIGINAL + CHECAGEM) ---
    animate() {
      // Atualiza os alvos com base na velocidade de scroll mais recente
      this.updateCardPositions();

      // Aplica suavização e transform APENAS se habilitado
      if (this.isEnabled) {
        this.cards.forEach((card, index) => {
          // Suaviza (LÓGICA ORIGINAL)
          this.currentOffsets[index] +=
            (this.targetOffsets[index] - this.currentOffsets[index]) * this.easing;

          // Aplica o transform
          card.style.transform = `translateY(${this.currentOffsets[index]}px)`;
        });
      } else {
        // Se estiver desabilitado, garante que os estilos estão resetados
        // (Pode ser redundante se o resetStyles já foi chamado, mas seguro)
        this.resetStyles();
        return; // Para o loop se desabilitado
      }

      // Continua o loop
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  // Instancia a classe
  new ParallaxCards();
}



// =================================================================
// 🔹 SEÇÃO 5: MUDANÇA DE EMNU CARDS
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
  const dadosInstalacoes = [
    {
      id: "spa",
      imagemSrc: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=900&q=80",
      categoria: "Resort - Spa",
      titulo: "Rejuvenesça seu sentido interior com uma massagem de spa.",
      descricao: "Desfrute de uma massagem revigorante em um ambiente sereno e exclusivo, com essências naturais e atendimento personalizado.",
      destaques: [
        "Terapias corporais e faciais exclusivas",
        "Ambiente climatizado com música relaxante",
      ],
    },
    {
      id: "fitness",
      imagemSrc: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80",
      categoria: "Resort - Fitness",
      titulo: "Energia e bem-estar a cada treino",
      descricao: "Nosso centro fitness conta com equipamentos modernos e vista panorâmica para as montanhas, promovendo vitalidade e equilíbrio.",
      destaques: [
        "Equipamentos de última geração",
        "Personal trainers disponíveis",
      ],
    },
    {
      id: "piscina",
      imagemSrc: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=900&q=80",
      categoria: "Resort - Piscina",
      titulo: "Atividade saudável que você pode continuar por toda a vida.",
      descricao: "Piscinas modernas com água climatizada, perfeitas para relaxar ou praticar a natação em qualquer hora do dia.",
      destaques: [
        "Área exclusiva com espreguiçadeiras",
        "Serviço de bar molhado disponível",
      ],
    },
    {
      id: "restaurante",
      imagemSrc: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80",
      categoria: "Resort - Restaurante",
      titulo: "Sabores locais sob o céu estrelado",
      descricao: "Deguste pratos regionais preparados com ingredientes frescos, em um ambiente ao ar livre com atmosfera acolhedora.",
      destaques: [
        "Menu sazonal com ingredientes locais",
        "Vista panorâmica durante o jantar",
      ],
    },
    {
      id: "praia",
      imagemSrc: "https://images.unsplash.com/photo-1544945582-793393b43dbd?w=900&q=80",
      categoria: "Resort - Praia Privada",
      titulo: "Refúgio exclusivo à beira-mar",
      descricao: "Aproveite a tranquilidade de uma praia reservada, com atendimento personalizado e conforto de alto padrão.",
      destaques: [
        "Espreguiçadeiras e cabanas privativas",
        "Serviço de bar exclusivo na areia",
      ],

    },
  ];

  // elementos do DOM (adicione seloImg)
  const imagem = document.getElementById("imagemInstalacao");
  const categoria = document.getElementById("categoriaInstalacao");
  const titulo = document.getElementById("tituloAba");
  const descricao = document.getElementById("descricaoAba");
  const lista = document.getElementById("listaDestaques");
  const colunaTexto = document.getElementById("conteudoTexto");
  const abas = document.querySelectorAll(".navegacao-abas button");
  const seloImg = document.querySelector(".selo-experiencia img"); // pode ser null se não existir


  // Atualiza o conteúdo conforme o ID da aba
  function atualizarConteudo(id) {
    const item = dadosInstalacoes.find((i) => i.id === id);
    if (!item) return;

    // animação de saída
    colunaTexto.classList.add("fade-out");
    imagem.style.opacity = 0;

    // limpa timeout anterior se necessário
    clearTimeout(atualizarConteudo._timeout);
    atualizarConteudo._timeout = setTimeout(() => {
      // atualiza imagem principal
      imagem.src = item.imagemSrc;

      // atualiza selo se existir e se o dado tiver seloSrc
      if (seloImg && item.seloSrc) {
        seloImg.src = item.seloSrc;
        // opcional: seloImg.alt = item.seloAlt || 'selo';
      }

      // textos
      categoria.textContent = item.categoria || "";
      titulo.textContent = item.titulo || "";
      descricao.textContent = item.descricao || "";

      // lista de destaques: colocar o <i> com FontAwesome antes do texto
      // ESCAPAR/VALIDAR se os dados vierem do usuário em produção — aqui assumimos conteúdo seguro
      lista.innerHTML = item.destaques
        .map((d, index, arr) => `
    <li>
      <i class="fa-solid fa-check" aria-hidden="true"></i>
      <span>${d}</span>
    </li>
    ${index < arr.length - 1 ? '<hr class="linha-destaque">' : ''}
  `)
        .join("");


      // animação de entrada
      colunaTexto.classList.remove("fade-out");
      imagem.style.opacity = 1;
    }, 380); // 380ms para casar com sua transição (400ms anterior)
  }


  // Evento de clique nas abas
  document
    .querySelector(".navegacao-abas")
    .addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        abas.forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        atualizarConteudo(e.target.dataset.tab);
      }
    });

  // Estado inicial
  const abaAtiva = document.querySelector(".navegacao-abas button.active");
  if (abaAtiva) atualizarConteudo(abaAtiva.dataset.tab);
});





// =================================================================
// 🔹 PARALLAX DA IMAGEM PEQUENA
// =================================================================
class ParallaxOverlay {
  constructor() {
    this.smallImage = document.getElementById('smallImage');
    this.container = document.querySelector('.about-gallery');

    if (!this.smallImage || !this.container) {
      console.warn('ParallaxOverlay: um ou mais elementos não foram encontrados.');
      return;
    }

    this.easing = 0.1;
    this.maxSmallUp = 180;
    this.maxSmallDown = 25;
    this.currentSmall = 0;
    this.targetSmall = 0;

    // Adicione esta linha para controle de breakpoint
    this.breakpoint = 992;
    this.isEnabled = window.innerWidth > this.breakpoint;

    this.bind();
    requestAnimationFrame(() => this.animate());
  }

  bind() {
    window.addEventListener('scroll', () => {
      if (this.isEnabled) this.onScroll();
    });

    // Adicione listener de resize
    window.addEventListener('resize', () => {
      this.isEnabled = window.innerWidth > this.breakpoint;
      if (!this.isEnabled) {
        this.smallImage.style.transform = 'translateY(0)';
        this.currentSmall = 0;
        this.targetSmall = 0;
      }
    });
  }

  onScroll() {
    const rect = this.container.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
    this.targetSmall = this.maxSmallDown - (this.maxSmallUp + this.maxSmallDown) * progress;
  }

  animate() {
    if (this.isEnabled) {
      this.currentSmall += (this.targetSmall - this.currentSmall) * this.easing;
      this.smallImage.style.transform = `translateY(${this.currentSmall.toFixed(2)}px)`;
    }
    requestAnimationFrame(() => this.animate());
  }
}

// =================================================================
// 🔹 MEMÓRIA DE POSIÇÃO DO SCROLL
// =================================================================

// 1. Salva a posição do scroll antes da página recarregar
window.addEventListener('beforeunload', () => {
  localStorage.setItem('scrollPosition', window.scrollY);
});

// 2. Restaura a posição e inicializa a animação quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  // Pega a posição salva no localStorage
  const savedPosition = localStorage.getItem('scrollPosition');

  // Se existir uma posição, rola a página até ela
  if (savedPosition !== null) {
    window.scrollTo(0, parseInt(savedPosition, 10));
  }

  // Inicializa a classe da animação (apenas uma vez)
  if (!window.__parallaxOverlayInstance) {
    window.__parallaxOverlayInstance = new ParallaxOverlay();
  }
});