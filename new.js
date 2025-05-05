// Theme and navigation for news.html
let currentTheme = localStorage.getItem('theme') || "light";

document.addEventListener('DOMContentLoaded', function () {
  const htmlElement = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle?.querySelector('i');

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
});
