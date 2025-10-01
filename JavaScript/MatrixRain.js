// Setter opp Matrix Rain-effekten på canvas når venstre øye-knappen trykkes
export function setupMatrixRain(leftEyeSelector, canvasSelector) {
    // Henter venstre øye-knapp og Matrix-canvas
    const leftEyeBtn = document.querySelector(leftEyeSelector);
    const matrixCanvas = document.querySelector(canvasSelector);
    const mtxCtx = matrixCanvas.getContext('2d');

    // Starter Matrix Rain når knappen trykkes
    leftEyeBtn.onclick = () => {
        // Tilpasser canvas til vindusstørrelse
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        matrixCanvas.style.display = 'block';

        // Beregner antall kolonner og initialiserer "drops" for regneffekt
        let columns = Math.floor(matrixCanvas.width / 18);
        let drops = Array(columns).fill(1);

        // Tegnene som brukes i Matrix-effekten
        let chars = 'abcdefghijklmnopqrstuvwxyz0123456789@#$%&';

        // Variabler for animasjonstilstand
        let running = true;
        let errorPhase = false;
        let errorBlink = true;
        let crumblePhase = false;
        let crumbleLetters = [];

        // Hoved-tegnefunksjon for Matrix-effekten
        function drawMatrix() {
            // Tegner bakgrunn med svak gjennomsiktighet for "regn"-effekt
            mtxCtx.fillStyle = 'rgba(0,0,0,0.18)';
            mtxCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            // Vanlig Matrix-regn (før error/crumble)
            if (!errorPhase && !crumblePhase) {
                for (let i = 0; i < drops.length; i++) {
                    // Velger tilfeldig tegn og fontstørrelse
                    let text = chars[Math.floor(Math.random() * chars.length)];
                    let fontSize = 18 + Math.floor(Math.random() * 8);
                    mtxCtx.font = `${fontSize}px Fira Mono, monospace`;
                    mtxCtx.shadowColor = '#00ff99';
                    mtxCtx.shadowBlur = 12;
                    mtxCtx.fillStyle = '#00ff99';
                    mtxCtx.fillText(text, i * 18, drops[i] * fontSize);
                    mtxCtx.shadowBlur = 0;
                    // Tilfeldig restart av regndråpe
                    if (Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
            }

            // Error-fase: Blinker "ERROR" i midten
            if (errorPhase && !crumblePhase) {
                if (errorBlink) {
                    mtxCtx.save();
                    mtxCtx.font = "bold 64px Fira Mono, monospace";
                    mtxCtx.fillStyle = "#ff0033";
                    mtxCtx.textAlign = "center";
                    mtxCtx.shadowColor = "#ff0033";
                    mtxCtx.shadowBlur = 30;
                    mtxCtx.fillText("ERROR", matrixCanvas.width / 2, matrixCanvas.height / 2);
                    mtxCtx.restore();
                }
            }

            // Crumble-fase: Bokstaver faller og spinner ut
            if (crumblePhase) {
                for (let i = 0; i < crumbleLetters.length; i++) {
                    let letter = crumbleLetters[i];
                    mtxCtx.save();
                    mtxCtx.font = `${letter.fontSize}px Fira Mono, monospace`;
                    mtxCtx.translate(letter.x, letter.y);
                    mtxCtx.rotate(letter.angle);
                    mtxCtx.globalAlpha = letter.alpha;
                    mtxCtx.fillStyle = letter.color;
                    mtxCtx.shadowColor = letter.color;
                    mtxCtx.shadowBlur = 8;
                    mtxCtx.fillText(letter.char, 0, 0);
                    mtxCtx.restore();
                    // Oppdaterer posisjon og utseende for hver bokstav
                    letter.y += letter.speedY;
                    letter.x += letter.speedX;
                    letter.angle += letter.spin;
                    letter.alpha -= 0.01;
                }
                // Spesialeffekt for "ERROR"-bokstaver
                for (let i = 0; i < 5; i++) {
                    let letter = crumbleLetters[crumbleLetters.length - 5 + i];
                    if (letter) {
                        mtxCtx.save();
                        mtxCtx.font = "bold 64px Fira Mono, monospace";
                        mtxCtx.translate(letter.x, letter.y);
                        mtxCtx.rotate(letter.angle);
                        mtxCtx.globalAlpha = letter.alpha;
                        mtxCtx.fillStyle = "#ff0033";
                        mtxCtx.shadowColor = "#ff0033";
                        mtxCtx.shadowBlur = 30;
                        mtxCtx.fillText(letter.char, 0, 0);
                        mtxCtx.restore();
                        letter.y += letter.speedY;
                        letter.x += letter.speedX;
                        letter.angle += letter.spin;
                        letter.alpha -= 0.01;
                    }
                }
            }

            // Fortsetter animasjonen så lenge effekten kjører
            if (running || errorPhase || crumblePhase) requestAnimationFrame(drawMatrix);
        }

        // Starter Matrix-animasjonen
        drawMatrix();

        // Etter 3 sekunder: starter error-fase
        setTimeout(() => {
            errorPhase = true;
            let blinkCount = 0;
            // Blinker "ERROR" 7 ganger
            let blinkInterval = setInterval(() => {
                errorBlink = !errorBlink;
                blinkCount++;
                if (blinkCount > 7) {
                    clearInterval(blinkInterval);
                    errorBlink = true;
                    crumblePhase = true;
                    errorPhase = false;
                    running = false;
                    crumbleLetters = [];
                    // Lager bokstaver som skal "crumble" ut
                    for (let i = 0; i < columns; i++) {
                        let text = chars[Math.floor(Math.random() * chars.length)];
                        let fontSize = 18 + Math.floor(Math.random() * 8);
                        crumbleLetters.push({
                            char: text,
                            x: i * 18,
                            y: drops[i] * fontSize,
                            fontSize: fontSize,
                            color: "#00ff99",
                            speedY: 2 + Math.random() * 2,
                            speedX: (Math.random() - 0.5) * 2,
                            angle: (Math.random() - 0.5) * 0.2,
                            spin: (Math.random() - 0.5) * 0.04,
                            alpha: 1
                        });
                    }
                    // Legger til "ERROR"-bokstaver som crumbles
                    let errorText = "ERROR";
                    let errorX = matrixCanvas.width / 2 - 120;
                    let errorY = matrixCanvas.height / 2;
                    for (let i = 0; i < errorText.length; i++) {
                        crumbleLetters.push({
                            char: errorText[i],
                            x: errorX + i * 48,
                            y: errorY,
                            fontSize: 64,
                            color: "#ff0033",
                            speedY: 3 + Math.random() * 2,
                            speedX: (Math.random() - 0.5) * 4,
                            angle: (Math.random() - 0.5) * 0.2,
                            spin: (Math.random() - 0.5) * 0.06,
                            alpha: 1
                        });
                    }
                    // Skjuler canvas etter crumble-effekt
                    setTimeout(() => {
                        matrixCanvas.style.display = 'none';
                        mtxCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
                    }, 1800);
                }
            }, 170);
        }, 3000);
    };
};