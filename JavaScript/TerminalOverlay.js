// Setter opp terminal-overlay når høyre øye-knappen trykkes
export function setupTerminalOverlay(rightEyeSelector, overlaySelector, textSelector) {
    // Henter høyre øye-knapp, overlay og tekstområde
    const rightEyeBtn = document.querySelector(rightEyeSelector);
    const terminalOverlay = document.querySelector(overlaySelector);
    const terminalText = document.querySelector(textSelector);

    // Starter animasjonen når knappen trykkes
    rightEyeBtn.onclick = () => {
        terminalOverlay.style.display = 'flex';
        // Stegvis tekst for terminalen
        let steps = [
            "ACCESS GRANTED\nAccessing user files...",
            "Gathering private info...",
            "Uploading to dark web...",
            "Selling to highest bidder...",
            "Sold for $" + Math.floor(Math.random() * 1000 + 1) + "!",
            "Thank you for your \"willing\" donation.",
            "Bare tuller ;)"
        ];
        let i = 0;
        terminalText.textContent = '';

        // Skriver ut hvert steg med typewriter-effekt
        function typeStep(stepIdx) {
            let msg = steps[stepIdx];
            let j = 0;
            function typeChar() {
                if (j <= msg.length) {
                    terminalText.textContent = msg.slice(0, j);
                    j++;
                    setTimeout(typeChar, 40);
                } else {
                    // Viser spinner for steg 2-4
                    if (stepIdx === 1 || stepIdx === 2 || stepIdx === 3) {
                        let spinner = ['|', '/', '-', '\\'];
                        let spinIdx = 0;
                        let spinCount = 0;
                        function spin() {
                            terminalText.textContent = msg + " " + spinner[spinIdx % spinner.length];
                            spinIdx++;
                            spinCount++;
                            if (spinCount < 20) {
                                setTimeout(spin, 60);
                            } else {
                                typeStep(stepIdx + 1);
                            }
                        }
                        spin();
                    } else if (stepIdx + 1 < steps.length) {
                        setTimeout(() => typeStep(stepIdx + 1), 700);
                    } else {
                        // Skjuler overlay til slutt
                        setTimeout(() => {
                            terminalOverlay.style.display = 'none';
                            terminalText.textContent = '';
                        }, 2000);
                    }
                }
            }
            typeChar();
        }
        typeStep(0);
    };
};