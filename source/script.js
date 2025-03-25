// Add mobile navigation toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // This could be expanded to add a mobile menu toggle button
    // For now, we'll just add some scroll animation

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return; // Skip if href is just "#"

            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Account for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to nav links on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Simple animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    featureCards.forEach(card => {
        observer.observe(card);
    });
});
