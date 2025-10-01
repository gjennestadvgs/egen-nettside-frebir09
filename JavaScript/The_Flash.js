let flashTriggered = false;
let tapCount = 0;
let tapTimer = null;

// Lytter etter hemmelig tastaturkombinasjon: Shift + F
window.addEventListener('keydown', function(e) {
  if (e.shiftKey && (e.code === 'KeyF' || e.key.toLowerCase() === 'f') && !flashTriggered) {
    triggerFlash();
  }
});

// Touch gesture: triple tap på WallyAnim-området
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

// Funksjon for å trigge Flash/Wally West-effekten
function triggerFlash() {
  flashTriggered = true;
  wallyAnim.style.display = 'flex';

  // Henter Wally West-gif
  const wallyImg = wallyAnim.querySelector('.wally-center');
  wallyImg.style.position = 'absolute';
  wallyImg.style.top = '50%';
  wallyImg.style.transform = 'translateY(-50%)';
  wallyImg.style.transition = 'none';

  // Startposisjon: langt til venstre
  let imgWidth = wallyImg.width || 300; // fallback hvis width ikke er satt
  let startLeft = -imgWidth;
  let rightOffscreen = window.innerWidth + imgWidth;
  let centerLeft = (window.innerWidth - imgWidth) / 2;

  // Faser: 1 = fra venstre til høyre (offscreen), 2 = teleporter til venstre og slowdown til midten
  let phase = 1;
  let duration1 = 300; // ms, rask løp over skjermen
  let duration2 = 500; // ms, slowdown til midten
  let start = null;

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function animateWally(ts) {
    if (!start) start = ts;
    let elapsed = ts - start;

    if (phase === 1) {
      // Fase 1: løper fra venstre til høyre, helt ut av skjermen
      let progress = Math.min(elapsed / duration1, 1);
      let leftPos = startLeft + (rightOffscreen - startLeft) * progress;
      wallyImg.style.left = `${leftPos}px`;
      if (progress < 1) {
        requestAnimationFrame(animateWally);
      } else {
        // Teleporterer Wally tilbake til venstre side for fase 2
        phase = 2;
        start = null;
        // Skjul Wally et øyeblikk for teleport-effekt
        wallyImg.style.visibility = 'hidden';
        setTimeout(() => {
          wallyImg.style.left = `${startLeft}px`; // Reset til venstre
          wallyImg.style.visibility = 'visible';
          requestAnimationFrame(animateWally);
        }, 80); // kort pause for effekt
      }
    } else if (phase === 2) {
      // Fase 2: fra venstre (offscreen) til midten, med slowdown
      let progress = Math.min(elapsed / duration2, 1);
      let eased = easeOutQuad(progress);
      let leftPos = startLeft + (centerLeft - startLeft) * eased;
      wallyImg.style.left = `${leftPos}px`;
      if (progress < 1) {
        requestAnimationFrame(animateWally);
      } else {
        // Plasserer nøyaktig i midten
        wallyImg.style.left = '50%';
        wallyImg.style.transform = 'translate(-50%, -50%)';
      }
    }
  }
  requestAnimationFrame(animateWally);

  // Lager eller gjenbruker canvas for supernova-effekt
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

  // Implode/explode supernova-effekt
  let t = 0;
  const implodeFrames = 38;
  const explodeFrames = 32;
  function animateSupernova() {
    const ctx = flashCanvas.getContext('2d');
    ctx.clearRect(0, 0, flashCanvas.width, flashCanvas.height);
    let centerX = flashCanvas.width / 2;
    let centerY = flashCanvas.height / 2;
    let shake = Math.sin(t * 0.6) * 10 + Math.random() * 8 - 4;
    let shakeY = Math.cos(t * 0.7) * 10 + Math.random() * 8 - 4;
    let r, alpha, x, y;

    if (t < implodeFrames) {
      // Imploderer: sirkel krymper til et punkt
      r = Math.max(flashCanvas.width, flashCanvas.height) * (0.13 * (1 - t / implodeFrames) + 0.13 * Math.pow(1 - t / implodeFrames, 2));
      r = Math.max(r, 2);
      alpha = 0.97 * (1 - t / implodeFrames) + 0.2;
      x = centerX + shake * (1 - t / implodeFrames);
      y = centerY + shakeY * (1 - t / implodeFrames);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 100;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2 * (1 - t / implodeFrames);
      ctx.beginPath();
      ctx.arc(x, y, r + 40, 0, 2 * Math.PI);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 40;
      ctx.stroke();
      ctx.restore();
    } else {
      // Eksploderer: burst ut fra midten
      let explodeT = t - implodeFrames;
      let progress = explodeT / explodeFrames;
      r = Math.max(flashCanvas.width, flashCanvas.height) * (0.13 + progress * 0.87);
      alpha = 0.97 * (1 - progress) + 0.2 * Math.random();
      x = centerX + shake * (1 + progress * 2);
      y = centerY + shakeY * (1 + progress * 2);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 120;
      ctx.fill();
      ctx.restore();

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
    if (t < implodeFrames + explodeFrames) {
      requestAnimationFrame(animateSupernova);
    } else {
      flashCanvas.style.display = 'none';
      window.location.href = 'Games.html';
    }
  }

  // Venter til gif-animasjonen er ferdig før supernova-effekt
  setTimeout(() => {
    animateSupernova();
  }, duration1 + duration2);
}