export function initNavbar() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  // --- Lógica do Menu Mobile (Sem alteração) ---
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });

    document.querySelectorAll(".mobile-menu a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
      });
    });

    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
      }
    });
  }

  // --- Lógica do Shrink (Sem alteração) ---
  const onScroll = () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;
    if (window.scrollY > 80) navbar.classList.add("shrink");
    else navbar.classList.remove("shrink");
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // ===================================
  // 🔹 NOVA FUNÇÃO: MARCAR PÁGINA ATIVA 🔹
  // ===================================
  function setActiveLink() {
    // Pega o nome do arquivo da URL atual (ex: "contato.html")
    const currentPage = window.location.pathname.split('/').pop();
    
    // Se for a página principal (ex: "/" ou "index.html"), mude para "home.html"
    const activePage = (currentPage === "" || currentPage === "index.html") ? "home.html" : currentPage;

    // Seleciona todos os links no desktop e no mobile
    const navLinks = document.querySelectorAll('.nav-center a, .mobile-menu a');

    navLinks.forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop();

      // Remove a classe 'active' de todos os links
      link.classList.remove('active');

      // Adiciona a classe 'active' se o link corresponder à página atual
      if (linkPage === activePage) {
        link.classList.add('active');
      }
    });
  }
  
  setActiveLink(); // Roda a função quando a página carrega
  // ===================================
  // 🔹 FIM DA NOVA FUNÇÃO 🔹
  // ===================================
}