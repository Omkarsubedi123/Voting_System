// Theme and navigation for news.html
let currentTheme = localStorage.getItem('theme') || "light";

document.addEventListener('DOMContentLoaded', function () {
  const htmlElement = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle?.querySelector('i');
  const modal = document.getElementById('news-modal');
  const modalImage = document.getElementById('modal-image');
  const modalHeadline = document.getElementById('modal-headline');
  const modalDate = document.getElementById('modal-date');
  const modalContent = document.getElementById('modal-content');
  const modalAuthor = document.getElementById('modal-author');
  const closeModal = document.querySelector('.close-modal');

  // Apply saved theme on page load
  htmlElement.setAttribute("data-theme", currentTheme);
  if (themeIcon) {
    themeIcon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
  }

  // Theme toggle functionality
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      if (currentTheme === "light") {
        htmlElement.setAttribute("data-theme", "dark");
        currentTheme = "dark";
        if (themeIcon) themeIcon.className = "fas fa-sun";
      } else {
        htmlElement.setAttribute("data-theme", "light");
        currentTheme = "light";
        if (themeIcon) themeIcon.className = "fas fa-moon";
      }
      localStorage.setItem('theme', currentTheme); // Save theme preference
    });
  }

  // Sidebar navigation active state
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      // Only highlight if same-page navigation
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
    // Open modal when "Read more" is clicked
    document.querySelectorAll('.read-more').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const card = this.closest('.news-card');
        const image = card.querySelector('.news-image img')?.src; 
        const headline = card.querySelector('.news-headline').textContent;
        const date = card.querySelector('.news-date').textContent;
        const content = card.querySelector('.news-excerpt').textContent;
        const author = card.querySelector('.author-name').textContent;
  
        if (image) {
          modalImage.innerHTML = `<img src="${image}" alt="News Image" style="width: 100%; height: 300px; border-radius: 8px;" />`; // Set the image
        } else {
          modalImage.innerHTML = ''; // Clear the image if not available
        }
        modalHeadline.textContent = headline;
        modalDate.textContent = date;
        modalContent.textContent = content;
        modalAuthor.textContent = author;
  
        modal.style.display = 'block';
      });
    });
  
    // Close modal when "X" is clicked
    closeModal.addEventListener('click', function () {
      modal.style.display = 'none';
    });
  
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
});
