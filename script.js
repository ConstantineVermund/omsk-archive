// Typewriter
const text = "Movement detected in sector B-12. Signal unstable. Awaiting confirmation.";
const target = document.getElementById("type-text");

let index = 0;

function typeEffect() {
    if (index < text.length) {
        target.textContent += text[index];
        index++;
        setTimeout(typeEffect, 30);
    }
}

typeEffect();

// Toggle archive
function toggleArchive() {
    document.getElementById("archive").classList.toggle("hidden");
}