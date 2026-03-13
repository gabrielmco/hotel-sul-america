import re

path = "restaurante.html"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Buffet 
old_buffet = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="120">
            <img src="https://images.unsplash.com/photo-1555507036-ab1e4006aa07?w=500&q=80" alt="Buffet Completo Frios e Queijos" class="fic-bg">
            <div class="fic-overlay">
              <span class="fic-icon">🥐</span>
              <div class="fic-text">"""
new_buffet = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="120">
            <img src="https://images.unsplash.com/photo-1533143708019-ea5cfa80213e?w=500&q=80" alt="Buffet Completo Frios e Queijos" class="fic-bg">
            <div class="fic-overlay">
              <div class="fic-text">"""
text = text.replace(old_buffet, new_buffet)

# 2. Cafés
old_cafes = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="180">
            <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80" alt="Latte Art" class="fic-bg">
            <div class="fic-overlay">
              <span class="fic-icon">☕</span>
              <div class="fic-text">"""
new_cafes = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="180">
            <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80" alt="Latte Art" class="fic-bg">
            <div class="fic-overlay">
              <div class="fic-text">"""
text = text.replace(old_cafes, new_cafes)

# 3. Ovos 
old_ovos = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="240">
            <img src="https://images.unsplash.com/photo-1628172772520-2c7009477b5a?w=500&q=80" alt="Ovos Pochê" class="fic-bg">
            <div class="fic-overlay">
              <span class="fic-icon">🍳</span>
              <div class="fic-text">"""
new_ovos = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="240">
            <img src="https://images.unsplash.com/photo-1628172772520-2c7009477b5a?w=500&q=80" alt="Ovos Pochê" class="fic-bg">
            <div class="fic-overlay">
              <div class="fic-text">"""
text = text.replace(old_ovos, new_ovos)

# 4. Saudáveis
old_saudaveis = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="300">
            <img src="https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=500&q=80" alt="Frutas Frescas" class="fic-bg">
            <div class="fic-overlay">
              <span class="fic-icon">🥗</span>
              <div class="fic-text">"""
new_saudaveis = """<div class="feature-image-card" data-aos="fade-up" data-aos-duration="700" data-aos-delay="300">
            <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80" alt="Frutas Frescas" class="fic-bg">
            <div class="fic-overlay">
              <div class="fic-text">"""
text = text.replace(old_saudaveis, new_saudaveis)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("html updated")
