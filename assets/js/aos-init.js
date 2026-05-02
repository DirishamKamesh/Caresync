/* AOS Init — CareSync */
document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) {
    AOS.init({
      duration: 480,
      easing: 'ease-out-cubic',
      once: true,
      offset: 30,
      delay: 0,
    });
  }
});
