// ==============================================================================
// 🔹 HERO BLUR EFFECT
// ==============================================================================
export class BlurCircleEffect {
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
