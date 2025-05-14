document.addEventListener('DOMContentLoaded', function() {
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
      const btn = card.querySelector('.read-more-btn');
      const more = card.querySelector('.read-more-content');
      if (btn && more) {
        btn.addEventListener('click', function() {
          card.classList.toggle('expanded');
          if (card.classList.contains('expanded')) {
            btn.textContent = 'Read less';
          } else {
            btn.textContent = 'Read more';
          }
        });
      }
    });
  });
  