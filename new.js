// Theme and navigation for news.html
let currentTheme = "light";
document.addEventListener('DOMContentLoaded', function () {
  // Theme toggle functionality
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const htmlElement = document.documentElement;
      const themeIcon = themeToggle.querySelector('i');
      if (currentTheme === "light") {
        htmlElement.setAttribute("data-theme", "dark");
        currentTheme = "dark";
        if (themeIcon) themeIcon.className = "fas fa-sun";
      } else {
        htmlElement.setAttribute("data-theme", "light");
        currentTheme = "light";
        if (themeIcon) themeIcon.className = "fas fa-moon";
      }
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
});
