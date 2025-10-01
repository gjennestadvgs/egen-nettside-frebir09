// Typewriter-effekt for overskrifter og tekst
function typeWriterEffect(text, targetId, speed = 80) {
    const target = document.getElementById(targetId);
    let i = 0;
    function type() {
        if (i <= text.length) {
            target.textContent = text.slice(0, i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}