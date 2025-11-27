/**
 * Otimizador de Scroll (Throttle)
 */
function throttle(func) {
  let ticking = false;
  return function () {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        func();
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Função de Interpolação (Lerp)
 */
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Listener Principal
 */
document.addEventListener("DOMContentLoaded", () => {
  
  // ===================================

  // ===================================
  // 2. INICIALIZAÇÃO DOS OBSERVADORES DE ANIMAÇÃO (APENAS P/ ABOUT-RESORT)
  // ===================================
  function initIntersectionObservers() {
    // CORREÇÃO: Agora procura APENAS pelos seletores do "About Resort"
    const elementsToAnimate = document.querySelectorAll(
      ".about-text, .image-big, .image-small"
    );
    if (elementsToAnimate.length === 0) return;

    const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, appearOptions);

    elementsToAnimate.forEach((el) => appearOnScroll.observe(el));
  }

  // ===================================
  // 3. INICIALIZAÇÃO DO SLIDER DE ACOMODAÇÕES
  // ===================================
  function initAccommodationSlider() {
    const wrapper = document.querySelector(".accommodation-wrapper");
    if (!wrapper) return; 

    const listItems = wrapper.querySelectorAll(".accommodation-list .list-item");
    const roomTitle = document.getElementById("room-title");
    const roomSubtitle = document.getElementById("room-subtitle");
    const roomDesc = document.getElementById("room-description");
    const roomPrice = document.getElementById("room-price");
    const roomImg = document.getElementById("room-image");
    const roomFeatures = document.getElementById("room-features");

    if (!listItems.length || !roomTitle || !roomImg || !roomFeatures) return;

    const rooms = {
      1: {
        title: "Chalé Premium",
        subtitle: "Vista fenomenal",
        description: "Descubra uma casa particular no pomar, com três quartos e banheiros, piscina privativa e serviço, além de vista para três lados da cama king size.",
        price: "$60.00",
        image: "img/academia/Gemini_Generated_Image_4u24gf4u24gf4u24.png",
        features: [
          { iconClass: "fa-solid fa-utensils", text: "Café da manhã incluso" },
          { iconClass: "fa-solid fa-shirt", text: "Lavanderia" },
          { iconClass: "fa-solid fa-car-side", text: "Recolha e entrega" },
        ],
      },
      2: {
        title: "Estúdios com terraço",
        subtitle: "Conforto e praticidade",
        description: "Ambiente moderno e acolhedor, com terraço privativo para relaxar e aproveitar a vista.",
        price: "$70.00",
        image: "img/comodações/bedroom-8242523.jpg",
        features: [
          { iconClass: "fa-solid fa-house-flag", text: "Terraço privativo" },
          { iconClass: "fa-solid fa-wifi", text: "Wi-Fi grátis" },
          { iconClass: "fa-solid fa-concierge-bell", text: "Serviço de quarto" },
        ],
      },
      3: {
        title: "Pavilhões Premium",
        subtitle: "Luxo e Natureza",
        description: "Integrado à natureza, com janelas amplas e design sofisticado.",
        price: "$85.00",
        image: "img/vista/vista (3).jpg",
        features: [
          { iconClass: "fa-solid fa-tree", text: "Vista para a mata" },
          { iconClass: "fa-solid fa-wifi", text: "Wi-Fi grátis" },
          { iconClass: "fa-solid fa-bell-concierge", text: "Serviço de quarto" },
        ],
      },
      4: {
        title: "A vila de luxo",
        subtitle: "Exclusividade total",
        description: "Uma vila inteira para você, com piscina, chef particular e mordomo.",
        price: "$220.00",
        image: "img/vista/vista (1).jpeg",
        features: [
          { iconClass: "fa-solid fa-person-swimming", text: "Piscina Privativa" },
          { iconClass: "fa-solid fa-bell-concierge", text: "Mordomo" },
          { iconClass: "fa-solid fa-car", text: "Garagem" },
        ],
      },
      5: {
        title: "Quarto Grand Deluxe",
        subtitle: "Espaço e Conforto",
        description: "Quarto amplo com cama king-size, banheira de hidromassagem e vista.",
        price: "$90.00",
        image: "img/quartos/quarto (1).jpg",
        features: [
          { iconClass: "fa-solid fa-bath", text: "Hidromassagem" },
          { iconClass: "fa-solid fa-wifi", text: "Wi-Fi grátis" },
          { iconClass: "fa-solid fa-tv", text: "Smart TV 55\"" },
        ],
      },
    };

    function loadRoom(roomId) {
      const room = rooms[roomId];
      if (!room) return;
      roomTitle.textContent = room.title;
      roomSubtitle.textContent = room.subtitle;
      roomDesc.textContent = room.description;
      roomPrice.textContent = room.price;
      roomImg.src = room.image;
      roomImg.alt = room.title;
      roomFeatures.innerHTML = "";
      room.features.forEach((f) => {
        const div = document.createElement("div");
        div.className = "feature";
        const icon = document.createElement("i");
        icon.className = f.iconClass + " feature-icon";
        const span = document.createElement("span");
        span.textContent = f.text;
        div.appendChild(icon);
        div.appendChild(span);
        roomFeatures.appendChild(div);
      });
    }

    listItems.forEach((item) => {
      item.addEventListener("click", () => {
        listItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        const roomId = item.getAttribute("data-room");
        loadRoom(roomId);
      });
    });

    loadRoom(1);
  }

  // ===================================
  // 4. INICIALIZAÇÃO DO MODAL DE EVENTOS
  // ===================================
  function initEventModal() {
    const modal = document.getElementById("cardModal");
    if (!modal) return; 

    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const modalClose = modal.querySelector(".modal-close");
    const cards = document.querySelectorAll(".evento-card");

    if (!cards.length || !modalImg || !modalTitle || !modalDesc || !modalClose) return;

    const openModal = (card) => {
      modalImg.src = card.dataset.img || "";
      modalTitle.textContent = card.dataset.title || "Evento";
      modalDesc.textContent = card.dataset.desc || "Mais detalhes em breve.";
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    cards.forEach((card) => {
      const triggers = card.querySelectorAll(".btn-evento, .circle"); 
      triggers.forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          openModal(card);
        });
      });
    });

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // ===================================
  // 5. HANDLER DE SCROLL (APENAS PARALLAX)
  // ===================================
  
  const facilityCards = document.querySelectorAll(".facility-card");
  const facilitiesSection = document.querySelector(".facilities");
  let currentProgress = 0; 

  function animateFacilityCards(lastScrollY) {
    if (!facilitiesSection || facilityCards.length === 0) return;

    // Desativa o parallax em telas 'xl' (1220px) ou menores
    if (window.innerWidth <= 1220) {
      facilityCards.forEach((card) => {
        card.style.transform = "translateY(0px)";
      });
      return;
    }

    const sectionTop = facilitiesSection.offsetTop;
    const sectionHeight = facilitiesSection.offsetHeight;
    const offsetStart = 200;

    const targetProgress = Math.min(
      1,
      Math.max(
        0,
        (lastScrollY - sectionTop + offsetStart) / sectionHeight
      )
    );
    currentProgress = lerp(currentProgress, targetProgress, 0.08);

    facilityCards.forEach((card) => {
      // CORREÇÃO: Removida a dependência do '.visible'
      // O parallax agora funciona sem o IntersectionObserver
      let offset = 0;
      
      if (card.classList.contains("middle")) {
        offset = currentProgress * 100;
      } else {
        offset = currentProgress * -150;
      }
      
      card.style.transform = `translateY(${offset}px)`;
    });
  }

  // Função única que roda no scroll
  const handleScroll = () => {
    const lastScrollY = window.scrollY;

    // --- A. Lógica do Navbar Shrink (REMOVIDA) ---
    // if (navbar) { ... }

    // --- B. Lógica do Parallax "Facilities" (MANTIDA) ---
    animateFacilityCards(lastScrollY);
  };
  
  // Prepara os cards para a animação
  if (facilityCards.length > 0) {
    facilityCards.forEach((c) => (c.style.willChange = "transform"));
    
    window.addEventListener("scroll", throttle(handleScroll));
    handleScroll();
  }
  
  // ===================================
  // --- CHAMADA DE TODAS AS FUNÇÕES ---
  // ===================================
  // initMobileMenu(); // <-- REMOVIDO
  initIntersectionObservers(); // Mantido (agora só para .about-resort)
  initAccommodationSlider();
  initEventModal();
  
});