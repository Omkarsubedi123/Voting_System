// News section page logic

document.addEventListener('DOMContentLoaded', function () {
    // Example: Demo for Read More links
    document.querySelectorAll('.read-more').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Feature coming soon: Full article view!');
      });
    });
  });