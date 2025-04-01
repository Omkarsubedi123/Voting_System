document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded');
    
    // Basic theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle-btn');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('light-theme');
        });
    }
});
