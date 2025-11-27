
document.addEventListener("DOMContentLoaded", () => {
  const carrosseis = document.querySelectorAll(".quarto-imagem.carrossel");

  carrosseis.forEach(carrossel => {
    const container = carrossel.querySelector(".carrossel-container");
    const imgs = container.querySelectorAll("img");
    const indicatorsContainer = carrossel.querySelector(".indicators");
    const arrowLeft = carrossel.querySelector(".arrow-left");
    const arrowRight = carrossel.querySelector(".arrow-right");

    // Cria indicadores
    imgs.forEach((_, i) => {
      const span = document.createElement("span");
      if (i === 0) span.classList.add("active");
      span.addEventListener("click", () => {
        stopAutoplay();
        updateCarousel(i);
        startAutoplay();
      });
      indicatorsContainer.appendChild(span);
    });
    
    const indicators = indicatorsContainer.querySelectorAll("span");
    let index = 0;
    let startX = 0;
    let dragging = false;
    let timer;

    function updateCarousel(newIndex) {
      imgs.forEach(img => img.classList.remove("active"));
      indicators.forEach(dot => dot.classList.remove("active"));

      imgs[newIndex].classList.add("active");
      indicators[newIndex].classList.add("active");

      index = newIndex;
    }

    function nextImage() {
      const newIndex = (index + 1) % imgs.length;
      updateCarousel(newIndex);
    }

    function prevImage() {
      const newIndex = (index - 1 + imgs.length) % imgs.length;
      updateCarousel(newIndex);
    }

    function startAutoplay() {
      timer = setInterval(nextImage, 3000);
    }

    function stopAutoplay() {
      clearInterval(timer);
    }

    startAutoplay();

    // Setas de navegação
    arrowLeft.addEventListener("click", (e) => {
      e.stopPropagation();
      stopAutoplay();
      prevImage();
      startAutoplay();
    });

    arrowRight.addEventListener("click", (e) => {
      e.stopPropagation();
      stopAutoplay();
      nextImage();
      startAutoplay();
    });

    // Drag com mouse (melhorado para lidar com mouse saindo da área)
    const handleMouseMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
    };

    const handleMouseUp = (e) => {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.style.cursor = "grab";
      
      const endX = e.clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextImage();
        } else {
          prevImage();
        }
      }
      
      startAutoplay();
    };

    container.addEventListener("mousedown", (e) => {
      dragging = true;
      startX = e.clientX;
      container.style.cursor = "grabbing";
      stopAutoplay();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });

    container.addEventListener("mouseleave", () => {
      if (dragging) {
        dragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        startAutoplay();
      }
    });

    // Touch para mobile
    container.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });

    container.addEventListener("touchmove", (e) => {
      if (startX) {
        e.preventDefault();
      }
    }, { passive: false });

    container.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextImage();
        } else {
          prevImage();
        }
      }
      
      startAutoplay();
    });
  });
});
