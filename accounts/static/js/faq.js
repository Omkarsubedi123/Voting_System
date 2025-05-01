
document.addEventListener('DOMContentLoaded', function() {
  // Toggle FAQ questions
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');

      question.addEventListener('click', () => {
          // Close other items
          faqItems.forEach(otherItem => {
              if (otherItem !== item && otherItem.classList.contains('active')) {
                  otherItem.classList.remove('active');
                  const toggle = otherItem.querySelector('.faq-toggle i');
                  toggle.className = 'fas fa-plus';
              }
          });

          // Toggle current item
          item.classList.toggle('active');

          // Toggle icon
          const toggle = item.querySelector('.faq-toggle i');
          if (item.classList.contains('active')) {
              toggle.className = 'fas fa-times';
          } else {
              toggle.className = 'fas fa-plus';
          }
      });
  });

  // Category switching
  const categoryButtons = document.querySelectorAll('.category-btn');
  const faqCategories = document.querySelectorAll('.faq-items');

  categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Remove active class from all buttons
          categoryButtons.forEach(btn => {
              btn.classList.remove('active');
          });

          // Add active class to clicked button
          button.classList.add('active');

          // Hide all FAQ categories
          faqCategories.forEach(category => {
              category.style.display = 'none';
          });

          // Show selected category
          const categoryToShow = button.getAttribute('data-category');
          document.getElementById(categoryToShow).style.display = 'block';

          // Close all open FAQ items
          faqItems.forEach(item => {
              item.classList.remove('active');
              const toggle = item.querySelector('.faq-toggle i');
              toggle.className = 'fas fa-plus';
          });
      });
  });
});
