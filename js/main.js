import { initNavbar } from "./globaisJS/navbar.js";
import { BlurCircleEffect } from "./globaisJS/blurEffect.js";
import { initHeroSection } from "./globaisJS/hero.js";

// ===================================
// 🔹 CORREÇÃO AQUI 🔹
// TODO o código que mexe no DOM deve
// esperar o DOM ser carregado.
// ===================================
document.addEventListener("DOMContentLoaded", () => {


  initNavbar();


  if (document.querySelector(".hero")) {
    new BlurCircleEffect(".hero");
    initHeroSection();
  }


});