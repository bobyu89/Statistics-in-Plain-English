    // BlockFrame's inline navigation, plus #chN / #N deep links.
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const counter = document.getElementById('slideCounter');
    const totalSlides = slides.length;

    function updateSlide() {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
      });
      counter.textContent = String(currentSlide + 1).padStart(2, '0') + ' / ' + String(totalSlides).padStart(2, '0');
      try { history.replaceState(null, '', '#' + (currentSlide + 1)); } catch (e) {}
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateSlide();
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateSlide();
    }

    function fromHash() {
      const ch = location.hash.match(/^#ch(\d+)$/), num = location.hash.match(/^#(\d+)$/);
      if (ch) {
        const i = [...slides].findIndex(s => s.dataset.ch === ch[1]);
        if (i >= 0) currentSlide = i;
      } else if (num) {
        currentSlide = Math.min(totalSlides - 1, Math.max(0, +num[1] - 1));
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
      }
    });

    window.addEventListener('hashchange', () => { fromHash(); updateSlide(); });
    fromHash();
    updateSlide();
