let flashTriggered = false;
let tapCount = 0;
let tapTimer = null;

window.addEventListener('keydown', function(e) {
  // Secret combo: Shift + F
  if (e.shiftKey && (e.code === 'KeyF' || e.key.toLowerCase() === 'f') && !flashTriggered) {
    triggerFlash();
  }
});

// Touch gesture: triple tap on WallyAnim area
const wallyAnim = document.getElementById('WallyAnim');
if (wallyAnim) {
  wallyAnim.addEventListener('touchstart', function() {
    tapCount++;
    if (tapCount === 3 && !flashTriggered) {
      triggerFlash();
    }
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 600);
  });
}

function triggerFlash() {
  flashTriggered = true;
  wallyAnim.style.display = 'flex';

  // Create or reuse a canvas for the flash effect
  let flashCanvas = document.getElementById('FlashImplodeCanvas');
  if (!flashCanvas) {
    flashCanvas = document.createElement('canvas');
    flashCanvas.id = 'FlashImplodeCanvas';
    flashCanvas.style.position = 'fixed';
    flashCanvas.style.left = '0';
    flashCanvas.style.top = '0';
    flashCanvas.style.width = '100vw';
    flashCanvas.style.height = '100vh';
    flashCanvas.style.zIndex = '100002';
    flashCanvas.style.pointerEvents = 'none';
    document.body.appendChild(flashCanvas);
  }
  flashCanvas.width = window.innerWidth;
  flashCanvas.height = window.innerHeight;
  flashCanvas.style.display = 'block';

  // Animate the supernova implode/explode
  let t = 0;
  const duration = 38; // frames for implode
  const explodeDuration = 32; // frames for explode
  function animateSupernova() {
    const ctx = flashCanvas.getContext('2d');
    ctx.clearRect(0, 0, flashCanvas.width, flashCanvas.height);
    let centerX = flashCanvas.width / 2;
    let centerY = flashCanvas.height / 2;
    let shake = Math.sin(t * 0.6) * 10 + Math.random() * 8 - 4;
    let shakeY = Math.cos(t * 0.7) * 10 + Math.random() * 8 - 4;
    let r, alpha, x, y;

    if (t < duration) {
      // Implode: circle shrinks all the way to a point
      r = Math.max(flashCanvas.width, flashCanvas.height) * (0.13 * (1 - t / duration) + 0.13 * Math.pow(1 - t / duration, 2));
      r = Math.max(r, 2); // never less than 2px
      alpha = 0.97 * (1 - t / duration) + 0.2;
      x = centerX + shake * (1 - t / duration);
      y = centerY + shakeY * (1 - t / duration);

      // Draw a glowing core as it collapses
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 100;
      ctx.fill();
      ctx.restore();

      // Draw a faint ring as it collapses
      ctx.save();
      ctx.globalAlpha = 0.2 * (1 - t / duration);
      ctx.beginPath();
      ctx.arc(x, y, r + 40, 0, 2 * Math.PI);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 40;
      ctx.stroke();
      ctx.restore();
    } else {
      // Explode: burst outward from a tiny point
      let explodeT = t - duration;
      let progress = explodeT / explodeDuration;
      r = Math.max(flashCanvas.width, flashCanvas.height) * (0.13 + progress * 0.87);
      alpha = 0.97 * (1 - progress) + 0.2 * Math.random();
      x = centerX + shake * (1 + progress * 2);
      y = centerY + shakeY * (1 + progress * 2);

      // Draw the expanding burst
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 120;
      ctx.fill();
      ctx.restore();

      // Draw epic radial streaks for the explosion
      let streaks = 24;
      for (let i = 0; i < streaks; i++) {
        let angle = (i / streaks) * Math.PI * 2 + Math.random() * 0.2;
        let length = r + 80 + explodeT * 18 + Math.random() * 40;
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.18 * Math.random();
        ctx.strokeStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 60;
        ctx.lineWidth = 10 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
        ctx.restore();
      }
    }

    t++;
    if (t < duration + explodeDuration) {
      requestAnimationFrame(animateSupernova);
    } else {
      flashCanvas.style.display = 'none';
      window.location.href = 'Games.html';
    }
  }

  // Wait for gif to finish, then supernova effect
  setTimeout(() => {
    animateSupernova();
  }, 1100); // gif duration, adjust as needed
}