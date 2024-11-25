// Add interactivity (optional)
// Smooth scroll for anchor links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
function open_signup() {
    window.location.href = 'login.html';
}