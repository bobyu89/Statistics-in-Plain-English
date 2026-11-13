    // BlockFrame's inline navigation, plus #chN / #N deep links.
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const counter = document.getElementById('slideCounter');
    const totalSlides = slides.length;

    function updateSlide() {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
      });
      const ch = slides[currentSlide].dataset.ch;
      counter.textContent = (ch ? 'CH ' + ch.padStart(2, '0') + ' · ' : '') + String(currentSlide + 1).padStart(2, '0') + ' / ' + String(totalSlides).padStart(2, '0');
      document.querySelectorAll('#chMenu a').forEach(a => a.classList.toggle('on', !!ch && a.getAttribute('href') === '#ch' + ch));
      try { history.replaceState(null, '', '#' + (currentSlide + 1)); } catch (e) {}
      window.scrollTo(0, 0);
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

    // Jump a whole chapter: dir = +1 next chapter start, -1 start of this / previous chapter
    function jumpChapter(dir) {
      const starts = [...slides].map((s, i) => (s.dataset.ch && (i === 0 || slides[i - 1].dataset.ch !== s.dataset.ch)) ? i : -1).filter(i => i >= 0);
      const t = dir > 0 ? starts.find(i => i > currentSlide) : [...starts].reverse().find(i => i < currentSlide);
      if (t !== undefined) { currentSlide = t; updateSlide(); }
    }
    const chBtn = document.getElementById('chBtn'), chMenu = document.getElementById('chMenu');
    function toggleMenu(open) { chMenu.hidden = !open; chBtn.setAttribute('aria-expanded', String(open)); }
    chBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(chMenu.hidden); });
    chMenu.addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });
    document.addEventListener('click', (e) => { if (!chMenu.hidden && !e.target.closest('#chMenu')) toggleMenu(false); });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        jumpChapter(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        jumpChapter(-1);
      } else if (e.key === 'Escape') {
        toggleMenu(false);
      }
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (Math.abs(e.changedTouches[0].screenY - touchStartY) > Math.abs(touchEndX - touchStartX)) return;
      if (e.target.closest('#chMenu')) return;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
      }
    });

    window.addEventListener('hashchange', () => { fromHash(); updateSlide(); });
    fromHash();
    updateSlide();
