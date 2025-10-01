// Hovedfunksjon for katteanimasjon på nettsiden
(function() {
  // Konstanter for katte-canvas størrelse og hastighet
  const CAT_WIDTH = 180;
  const CAT_HEIGHT = 120;
  const SPEED_WALK = 3; // Gå-hastighet (sakte)
  const SPEED_MOONWALK = 3; // Moonwalk-hastighet

  // Returnerer alle hjørner på skjermen hvor katten kan hvile
  function getCorners() {
    return [
      { x: 0, y: 0, dir: 'right' }, // øverst til venstre
      { x: window.innerWidth - CAT_WIDTH, y: 0, dir: 'left' }, // øverst til høyre
      { x: 0, y: window.innerHeight - CAT_HEIGHT, dir: 'right' }, // nederst til venstre
      { x: window.innerWidth - CAT_WIDTH, y: window.innerHeight - CAT_HEIGHT, dir: 'left' } // nederst til høyre
    ];
  }

  // Velger et tilfeldig hjørne for katten å hvile i
  function pickCorner() {
    const corners = getCorners();
    const idx = Math.floor(Math.random() * corners.length);
    return corners[idx];
  }

  // Initialiserer canvas for katten
  const canvas = document.getElementById('PixelCatCanvas');
  if (!canvas) return;
  canvas.width = CAT_WIDTH;
  canvas.height = CAT_HEIGHT;
  canvas.style.position = "fixed";
  canvas.style.zIndex = "2147483647";
  canvas.style.pointerEvents = "auto";
  canvas.style.display = "none";
  canvas.style.cursor = "pointer";

  // Kontekst for tegning
  const ctx = canvas.getContext('2d');

  // Variabler for animasjonstilstand og katteposisjon
  let state = 'hidden'; // 'walking', 'resting', 'moonwalking'
  let drawX = 0, drawY = 0, t = 0, tailFlick = 0, walkFrame = 0;
  let inactivityTimer = null;
  let restCorner = pickCorner();
  let cameFrom = restCorner.dir;
  let flip = false;
  let moonwalkFlip = false;
  let lastRestTime = 0;
  let tailFlicking = false;
  let tailFlickPhase = 0;
  let hearts = [];

  // Tegner katten med riktig animasjon og posisjon
  function drawCat(resting = false, tailFlick = 0, walkFrame = 0, flip = false, breath = 1, moonwalk = false) {
    ctx.clearRect(0,0,CAT_WIDTH,CAT_HEIGHT);
    ctx.save();
    if (flip) {
      ctx.translate(CAT_WIDTH, 0);
      ctx.scale(-1, 1);
    }
    let scaleY = breath;
    let legBaseY = moonwalk ? 60 : 88; // moonwalk: bena lavere
    let scaleOffset = (1 - scaleY) * (legBaseY + 8);
    ctx.translate(drawX, drawY + scaleOffset);
    ctx.save();
    ctx.scale(1, scaleY);

    // Tegner halen
    ctx.save();
    ctx.translate(40, moonwalk ? 60 : 72);
    let tailAngle;
    if (moonwalk) {
      tailAngle = Math.PI/2 + Math.sin(walkFrame/4)*0.2; // subtil hale
    } else if (resting) {
      tailAngle = Math.PI/2 + Math.sin(t/32)*0.10;
      if (tailFlicking) {
        if (tailFlickPhase < Math.PI) {
          tailAngle += Math.sin(tailFlickPhase)*1.2;
        } else {
          tailAngle += Math.sin(tailFlickPhase)*0.3 * Math.exp(-(tailFlickPhase-Math.PI)/2);
        }
      }
    } else {
      tailAngle = Math.sin(tailFlick/12)*0.4;
      if (state === 'walking') tailAngle += Math.sin(walkFrame/4)*0.4;
    }
    ctx.rotate(tailAngle);
    ctx.fillStyle = "#444";
    ctx.fillRect(-24,0,24,8);
    ctx.restore();

    // Tegner kroppen
    ctx.fillStyle = "#444";
    if (moonwalk) {
      ctx.fillRect(40,60,60,24); // oppreist kropp
    } else if (resting) {
      ctx.fillRect(40,72,60,18);
    } else {
      ctx.fillRect(40,60,60,24);
    }

    // Tegner hodet
    ctx.save();
    if (moonwalk) {
      ctx.translate(92, 52);
      ctx.rotate(-Math.PI/8); // MJ moonwalk: hodet bakover
    } else {
      ctx.translate(92, resting ? 60 : 52);
    }
    ctx.fillRect(-12,-12,24,24);
    ctx.beginPath();
    ctx.moveTo(-8,-12); ctx.lineTo(-4,-20); ctx.lineTo(0,-12);
    ctx.moveTo(8,-12); ctx.lineTo(12,-20); ctx.lineTo(4,-12);
    ctx.fillStyle = "#444";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-2,0,4,4);
    ctx.fillRect(6,0,4,4);
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(2,6,4,2);
    ctx.restore();

    // Tegner bena
    ctx.save();
    ctx.fillStyle = "#444";
    if (moonwalk) {
      // MJ moonwalk: rette ben, glir, animasjon på føtter
      let moonLegY = Math.sin(walkFrame/2)*4;
      ctx.fillRect(54,84+moonLegY,12,24);
      ctx.fillRect(74,84-moonLegY,12,24);
      ctx.fillRect(94,84+moonLegY,12,24);
      ctx.fillRect(114,84-moonLegY,12,24);
    } else if (resting) {
      ctx.fillRect(54,88,12,8);
      ctx.fillRect(74,88,12,8);
      ctx.fillRect(94,88,12,8);
      ctx.fillRect(114,88,12,8);
    } else {
      let legY = (state === 'walking') ? Math.sin(walkFrame/4)*6 : 0;
      let legY2 = (state === 'walking') ? Math.cos(walkFrame/4)*6 : 0;
      ctx.fillRect(52,84+legY,8,20);
      ctx.fillRect(80,84-legY,8,20);
      ctx.fillRect(60,84+legY2,8,20);
      ctx.fillRect(88,84-legY2,8,20);
    }
    ctx.restore();

    // Tegner hjerter når katten blir klappet
    hearts.forEach(h => {
      ctx.save();
      let progress = h.age / 20;
      let yOffset = -progress * 32;
      let scale = 1 + 0.2 * Math.sin(Math.PI * Math.min(progress, 0.5));
      ctx.globalAlpha = Math.max(0, 1-progress);
      ctx.font = `bold ${24*scale}px monospace`;
      ctx.fillStyle = "#ff0055";
      ctx.fillText("♥", 92, 38 + yOffset);
      ctx.restore();
    });

    ctx.restore();
    ctx.restore();
  }

  // Hoved animasjonsloop for katten
  function animate() {
    t++;
    let breath = state === 'resting' ? 1 + Math.sin(t/64)*0.03 : 1;
    if (state === 'walking') {
      // Katten går inn fra riktig side
      if (cameFrom === 'right') {
        drawX += SPEED_WALK;
        if (drawX >= 0) {
          drawX = 0;
          state = 'resting';
          canvas.style.pointerEvents = 'auto';
          lastRestTime = t;
          tailFlicking = false;
          tailFlickPhase = 0;
        }
      } else { // cameFrom === 'left'
        drawX -= SPEED_WALK;
        if (drawX <= 0) {
          drawX = 0;
          state = 'resting';
          canvas.style.pointerEvents = 'auto';
          lastRestTime = t;
          tailFlicking = false;
          tailFlickPhase = 0;
        }
      }
      walkFrame++;
      drawCat(false, tailFlick, walkFrame, flip, breath, false);
      tailFlick++;
    }
    if (state === 'resting') {
      // Tilfeldig halevifting når katten hviler
      if (!tailFlicking && t - lastRestTime > 120 && Math.random() < 0.005) {
        tailFlicking = true;
        tailFlickPhase = 0;
      }
      if (tailFlicking) {
        tailFlickPhase += 0.25;
        if (tailFlickPhase > Math.PI*1.5) {
          tailFlicking = false;
          lastRestTime = t;
        }
      }
      drawCat(true, tailFlick, walkFrame, flip, breath, false);
      tailFlick++;
    }
    if (state === 'moonwalking') {
      // Moonwalk: glir ut, snur så katten ser mot hjørnet (MJ stil)
      if (cameFrom === 'right') {
        drawX -= SPEED_MOONWALK; // glir ut til venstre
        if (drawX < -CAT_WIDTH) {
          state = 'hidden';
          canvas.style.display = 'none';
          canvas.style.pointerEvents = 'none';
          drawX = 0;
          resetInactivity();
        }
      } else { // cameFrom === 'left'
        drawX += SPEED_MOONWALK; // glir ut til høyre
        if (drawX > CAT_WIDTH) {
          state = 'hidden';
          canvas.style.display = 'none';
          canvas.style.pointerEvents = 'none';
          drawX = 0;
          resetInactivity();
        }
      }
      walkFrame++;
      drawCat(false, tailFlick, walkFrame, !flip, breath, true); // moonwalk pose
      tailFlick++;
    }
    // Oppdaterer alder på hjerter og fjerner gamle
    hearts.forEach(h => h.age++);
    hearts = hearts.filter(h => h.age < 20);

    // Fortsetter animasjonen så lenge katten ikke er skjult
    if (state !== 'hidden') requestAnimationFrame(animate);
  }

  // Viser katten og starter animasjonen
  function showCat() {
    if (state !== 'hidden') return;
    restCorner = pickCorner();
    cameFrom = restCorner.dir;
    flip = (cameFrom === 'left');
    canvas.style.display = 'block';
    canvas.style.left = restCorner.x + "px";
    canvas.style.top = restCorner.y + "px";
    drawY = 0;
    t = 0; tailFlick = 0; walkFrame = 0;
    hearts = [];
    // Setter startposisjon basert på retning
    drawX = (cameFrom === 'right') ? -CAT_WIDTH : CAT_WIDTH;
    state = 'walking';
    animate();
  }

  // Starter moonwalk ut av skjermen
  function hideCatMoonwalk() {
    if (state === 'resting') {
      state = 'moonwalking';
      canvas.style.pointerEvents = 'none';
      moonwalkFlip = (cameFrom === 'right');
    }
  }

  // Håndterer klikk for å "klappe" katten
  function petCat(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (mx >= -40 && mx <= canvas.width + 40 && my >= -40 && my <= canvas.height + 40) {
      if (state === 'resting') {
        hearts.push({ age: 0 });
        e.stopPropagation();
      }
    }
  }

  // Håndterer klikk utenfor katte-sonen for å få den til å moonwalke ut
  function handleClickAway(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (
      mx < -40 || mx > canvas.width + 40 ||
      my < -40 || my > canvas.height + 40
    ) {
      hideCatMoonwalk();
    }
  }

  // Starter inaktivitetstimer for å vise katten igjen
  function resetInactivity() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showCat, 10000);
  }

  // Event listeners for interaksjon
  window.addEventListener('mousedown', handleClickAway, true);
  window.addEventListener('touchstart', handleClickAway, true);

  canvas.addEventListener('mousedown', petCat);
  canvas.addEventListener('touchstart', petCat);

  // Oppdaterer hjørner ved endring av vindusstørrelse
  window.addEventListener('resize', () => {
    if (state === 'resting') {
      restCorner = pickCorner();
      canvas.style.left = restCorner.x + "px";
      canvas.style.top = restCorner.y + "px";
      drawCat(true, tailFlick, walkFrame, flip);
    }
  });

  // Starter timer for å vise katten
  resetInactivity();
})();