// Setter opp portal-animasjon når nese-knappen trykkes
export function setupPortalAnimation(noseSelector, canvasSelector, redirectUrl = "Games.html") {
    // Henter nese-knapp og portal-canvas
    const noseBtn = document.querySelector(noseSelector);
    const portalCanvas = document.querySelector(canvasSelector);
    const ctx = portalCanvas.getContext('2d');

    // Tilpasser canvas til vindusstørrelse
    function resizePortalCanvas() {
        portalCanvas.width = window.innerWidth;
        portalCanvas.height = window.innerHeight;
    }
    resizePortalCanvas();
    window.addEventListener('resize', resizePortalCanvas);

    let portalAnimating = false;

    // Starter animasjon når nese-knappen trykkes
    noseBtn.onclick = () => {
        if (portalAnimating) return;
        portalAnimating = true;
        portalCanvas.style.display = 'block';
        animatePortal();
    };

    // Hovedfunksjon for portal-animasjon
    function animatePortal() {
        // Sentrerer koordinater og setter startverdier
        let centerX = portalCanvas.width / 2;
        let centerY = portalCanvas.height / 2;
        let redX = 100, blueX = portalCanvas.width - 100;
        let y = centerY;
        let redTarget = centerX - 60;
        let blueTarget = centerX + 60;
        let slideSteps = 60;
        let spinSteps = 120;
        let combineSteps = 40;
        let count = 0;
        let angle = 0;
        let trailPoints = [];
        let shakeAmount = 0;
        let pulse = 1;
        let pulseDir = 1;
        let flashAlpha = 0;

        // Første fase: røde og blå sirkler glir inn mot midten
        function slideIn() {
            ctx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
            redX += (redTarget - redX) / (slideSteps - count + 1);
            blueX += (blueTarget - blueX) / (slideSteps - count + 1);

            // Tegner rød sirkel
            ctx.save();
            ctx.beginPath();
            ctx.arc(redX, y, 40, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 40;
            ctx.globalAlpha = 0.9;
            ctx.fill();
            ctx.restore();

            // Tegner blå sirkel
            ctx.save();
            ctx.beginPath();
            ctx.arc(blueX, y, 40, 0, 2 * Math.PI);
            ctx.fillStyle = '#0066ff';
            ctx.shadowColor = '#0066ff';
            ctx.shadowBlur = 40;
            ctx.globalAlpha = 0.9;
            ctx.fill();
            ctx.restore();

            count++;
            if (count < slideSteps) {
                requestAnimationFrame(slideIn);
            } else {
                count = 0;
                spinCircles();
            }
        }

        // Andre fase: sirkler spinner rundt hverandre med spor
        function spinCircles() {
            ctx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
            let spinRadius = 80;
            let redAngle = angle;
            let blueAngle = angle + Math.PI;
            let redPx = centerX + Math.cos(redAngle) * spinRadius;
            let redPy = centerY + Math.sin(redAngle) * spinRadius;
            let bluePx = centerX + Math.cos(blueAngle) * spinRadius;
            let bluePy = centerY + Math.sin(blueAngle) * spinRadius;

            // Legger til spor for animasjon
            trailPoints.push({ x: redPx, y: redPy, color: '#ff0033' });
            trailPoints.push({ x: bluePx, y: bluePy, color: '#0066ff' });
            if (trailPoints.length > 80) trailPoints.splice(0, trailPoints.length - 80);

            // Tegner sporene
            for (let i = 0; i < trailPoints.length; i++) {
                ctx.beginPath();
                ctx.arc(trailPoints[i].x, trailPoints[i].y, 10, 0, 2 * Math.PI);
                ctx.fillStyle = trailPoints[i].color;
                ctx.globalAlpha = Math.max(0.2, i / trailPoints.length);
                ctx.shadowColor = trailPoints[i].color;
                ctx.shadowBlur = 16;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Tegner sirkler
            ctx.save();
            ctx.beginPath();
            ctx.arc(redPx, redPy, 40, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 40;
            ctx.globalAlpha = 0.9;
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(bluePx, bluePy, 40, 0, 2 * Math.PI);
            ctx.fillStyle = '#0066ff';
            ctx.shadowColor = '#0066ff';
            ctx.shadowBlur = 40;
            ctx.globalAlpha = 0.9;
            ctx.fill();
            ctx.restore();

            // Puls-effekt på ringen rundt
            if (trailPoints.length >= 80) {
                pulse += pulseDir * 0.05;
                if (pulse > 1.2) pulseDir = -1;
                if (pulse < 0.8) pulseDir = 1;
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, spinRadius * pulse, 0, 2 * Math.PI);
                ctx.strokeStyle = '#9812a4';
                ctx.lineWidth = 18 + Math.sin(angle * 2) * 6;
                ctx.globalAlpha = 0.7 + Math.sin(angle * 3) * 0.2;
                ctx.shadowColor = '#9812a4';
                ctx.shadowBlur = 60 + Math.sin(angle * 2) * 20;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            angle += Math.PI / 20;
            count++;
            if (count < spinSteps) {
                requestAnimationFrame(spinCircles);
            } else {
                count = 0;
                shakeAmount = 0;
                combineCircles();
            }
        }

        // Tredje fase: sirkler kombineres og lager portal
        function combineCircles() {
            shakeAmount = Math.max(0, 20 - count / 2);
            let shakeX = centerX + (Math.random() - 0.5) * shakeAmount;
            let shakeY = centerY + (Math.random() - 0.5) * shakeAmount;
            ctx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
            let shrinkRadius = 80 - (count * 2);
            if (shrinkRadius < 0) shrinkRadius = 0;
            let pulseR = shrinkRadius + 40 + Math.sin(count * 0.3) * 8;

            // Tegner portal med puls og shake
            ctx.save();
            ctx.beginPath();
            ctx.arc(shakeX, shakeY, pulseR, 0, 2 * Math.PI);
            ctx.fillStyle = '#9812a4';
            ctx.shadowColor = '#9812a4';
            ctx.shadowBlur = 100 + Math.sin(count * 0.3) * 30;
            ctx.globalAlpha = 0.9 + Math.sin(count * 0.2) * 0.1;
            ctx.fill();
            ctx.restore();

            count++;
            if (count < combineSteps) {
                requestAnimationFrame(combineCircles);
            } else {
                flashAlpha = 1;
                explodePortal(centerX, centerY);
            }
        }

        // Siste fase: portal eksploderer og siden redirectes
        function explodePortal(cx, cy) {
            let r = 60;
            let maxR = Math.max(portalCanvas.width, portalCanvas.height) * 1.2;
            let alpha = 1;
            let shake = 30;
            function explode() {
                let shakeX = cx + (Math.random() - 0.5) * shake;
                let shakeY = cy + (Math.random() - 0.5) * shake;
                ctx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(shakeX, shakeY, r, 0, 2 * Math.PI);
                ctx.fillStyle = '#9812a4';
                ctx.shadowColor = '#9812a4';
                ctx.shadowBlur = 180;
                ctx.fill();
                ctx.restore();

                // Hvit flash-effekt
                if (flashAlpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = flashAlpha;
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, portalCanvas.width, portalCanvas.height);
                    ctx.restore();
                    flashAlpha -= 0.08;
                }

                r += 60;
                alpha = Math.max(0, alpha - 0.04);
                shake = Math.max(0, shake - 2);

                if (r < maxR) {
                    requestAnimationFrame(explode);
                } else {
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = '#9812a4';
                    ctx.fillRect(0, 0, portalCanvas.width, portalCanvas.height);
                    setTimeout(() => {
                        portalCanvas.style.display = 'none';
                        portalAnimating = false;
                        window.location.href = redirectUrl;
                    }, 700);
                }
            }
            explode();
        }
        slideIn();
    }
};