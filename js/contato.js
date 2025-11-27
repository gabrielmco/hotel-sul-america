






/**
 * @file forms.js
 * - Gerencia a inicialização e envio dos formulários de Contato e Reserva via EmailJS.
 * - Deve ser carregado após o SDK do EmailJS.
 */
document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================================
  // 🔹 INICIALIZAÇÃO GERAL DO EMAILJS
  // ==========================================================
  
  // --- Configuração Principal ---
  // (Você encontra na sua conta EmailJS > Account > API Keys)
  const EMAILJS_PUBLIC_KEY = "SUA_PUBLIC_KEY_AQUI";
  
  // (Você encontra em Email Services)
  const EMAILJS_SERVICE_ID = "SEU_SERVICE_ID_AQUI"; 
  
  // (Você encontra em Email Templates)
  const CONTACT_TEMPLATE_ID = "SEU_TEMPLATE_ID_CONTATO_AQUI"; 
  const BOOKING_TEMPLATE_ID = "SEU_TEMPLATE_ID_RESERVA_AQUI"; 

  // --- Inicializa o SDK (só precisa ser feito uma vez) ---
  try {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  } catch (e) {
    console.error("Falha ao inicializar o EmailJS. Verifique sua Public Key.", e);
    return; // Para a execução se o init falhar
  }

  // ==========================================================
  // 🔹 MÓDULO: Formulário de Contato (Esquerda)
  // ==========================================================
  (function initContactForm() {
    
    const form = document.getElementById("contact-form");
    if (!form) return; // Se o formulário não estiver na página, não faz nada.

    const btn = form.querySelector(".btn");
    if (!btn) return;

    form.addEventListener("submit", function(event) {
      event.preventDefault();
      
      const btnOriginalText = btn.textContent;
      btn.textContent = "Enviando...";
      btn.disabled = true;

      emailjs.sendForm(EMAILJS_SERVICE_ID, CONTACT_TEMPLATE_ID, this)
        .then(() => {
          btn.textContent = "Enviado!";
          alert("Mensagem enviada com sucesso! Responderemos em breve.");
          form.reset();
          setTimeout(() => {
            btn.textContent = btnOriginalText;
            btn.disabled = false;
          }, 3000);

        }, (err) => {
          btn.textContent = "Erro ao Enviar";
          alert("Erro ao enviar a mensagem: " + JSON.stringify(err));
          setTimeout(() => {
            btn.textContent = btnOriginalText;
            btn.disabled = false;
          }, 3000);
        });
    });
    
  })(); // Fim do módulo de Contato

  
  // ==========================================================
  // 🔹 MÓDULO: Formulário de Reserva (Direita)
  // ==========================================================
  (function initBookingForm() {

    const form = document.getElementById("booking-form");
    if (!form) return; // Se o formulário não estiver na página, não faz nada.
    
    const btn = form.querySelector(".btn");
    if (!btn) return;

    form.addEventListener("submit", function(event) {
      event.preventDefault();

      const btnOriginalText = btn.textContent;
      btn.textContent = "Verificando...";
      btn.disabled = true;

      emailjs.sendForm(EMAILJS_SERVICE_ID, BOOKING_TEMPLATE_ID, this)
        .then(() => {
          btn.textContent = "Enviado!";
          alert("Solicitação de reserva enviada! Aguarde nosso contato para confirmação.");
          form.reset();
          setTimeout(() => {
            btn.textContent = btnOriginalText;
            btn.disabled = false;
          }, 3000);

        }, (err) => {
          btn.textContent = "Erro ao Enviar";
          alert("Erro ao enviar a solicitação: " + JSON.stringify(err));
          setTimeout(() => {
            btn.textContent = btnOriginalText;
            btn.disabled = false;
          }, 3000);
        });
    });
    
  })(); // Fim do módulo de Reserva

}); // Fim do DOMContentLoaded