// Legger til tilt-effekt på kort, prosjekter, bilder og knapper
document.querySelectorAll('.Website_Card, .Project, .Tilt_Img, .tilt-btn').forEach(card => {
  // Når musen beveger seg over elementet
  card.addEventListener('mousemove', function(e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Beregner rotasjon basert på museposisjon
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((centerX - x) / centerX) * -10;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  // Tilbakestiller transformasjon når musen forlater elementet
  card.addEventListener('mouseleave', function() {
    card.style.transform = 'perspective(600px) scale(1)';
  });
});