// Lógica simples para o menu mobile
const toggleBtn = document.getElementById('mobile-menu-toggle');
const navLinks = document.getElementById('nav-links');

if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        toggleBtn.classList.toggle('active');
    });
}
