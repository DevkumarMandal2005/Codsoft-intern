// Smooth reveal on scroll
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = document.querySelectorAll('.service-info, .service-visual, .grid-item, .section-title');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});

// Parallax effect for hero visual
window.addEventListener('scroll', () => {
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        const scrollValue = window.scrollY;
        heroVisual.style.transform = `translateY(${scrollValue * 0.1}px)`;
    }
});
