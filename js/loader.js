(function() {
  
  // 1. LÓGICA "SÓ UMA VEZ"
  if (sessionStorage.getItem('hsaLoaderShown')) {
    const loaderContainer = document.getElementById('loader-container');
    if (loaderContainer) {
      loaderContainer.style.display = 'none';
    }
    return; // Para o script
  }

  // 2. Trava o Scroll
  document.body.classList.add('loader-active');
  document.documentElement.classList.add('loader-active');

  // 3. Seleciona Elementos
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');
  const loaderContainer = document.getElementById('loader-container');
  const hotelLogo = document.getElementById('hotel-logo');

  if (!loaderContainer || !progressBar || !progressPercent) {
    console.warn("Loader não encontrado. Página carregada.");
    if (document.body.classList.contains('loader-active')) {
      document.documentElement.classList.remove('loader-active');
      document.body.classList.remove('loader-active');
    }
    return;
  }

  let progress = 0;
  let loadInterval = null;
  let finished = false; 

  function hideLoader() {
    if (finished) return; 
    finished = true;
    
    clearInterval(loadInterval); 
    
    progressBar.style.width = '100%';
    progressPercent.textContent = '100%';

    // Define a flag
    try {
      sessionStorage.setItem('hsaLoaderShown', 'true');
    } catch (e) {
      console.warn("Não foi possível salvar sessionStorage.");
    }

    setTimeout(() => {
      loaderContainer.classList.add('fade-out');
      
      // Libera o Scroll
      document.documentElement.classList.remove('loader-active');
      document.body.classList.remove('loader-active');
      
      setTimeout(() => {
        if (loaderContainer) {
          loaderContainer.style.display = 'none';
        }
      }, 1000); 
      
    }, 800); 
  }

  // 4. SIMULADOR (Rápido)
  loadInterval = setInterval(() => {
    progress += Math.random() * 15; 
    if (progress >= 100) {
      progress = 100;
      hideLoader(); 
    }
    if (!finished) {
      progressBar.style.width = progress + '%';
      progressPercent.textContent = Math.floor(progress) + '%';
    }
  }, 100);

  // 5. EVENTO REAL (Plano A)
  window.addEventListener('load', () => {
    progress = 100;
    hideLoader();
  });

  // 6. Troca a logo
  if (hotelLogo) {
    hotelLogo.src = './logo/logo(branca).png'; 
    hotelLogo.onerror = function() {
      this.src = 'data:image/svg+xml,...'; // Fallback
    };
  }
  
})();