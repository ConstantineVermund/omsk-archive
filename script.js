let translations = {};
let currentLang = "en";
const defaultLang = "en";
let typewriterTimeout = null;

fetch("translations.json")
  .then((res) => res.json())
  .then((data) => {
    translations = data;
    initLanguage();
  })
  .catch((error) => {
    console.error("Failed to load translations:", error);
  });

function getTranslation(lang, key) {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }

  if (translations[defaultLang] && translations[defaultLang][key]) {
    return translations[defaultLang][key];
  }

  console.warn(`Missing translation: ${key} for lang: ${lang}`);
  return null;
}

function translatePage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = getTranslation(lang, key);

    if (value !== null) {
      el.textContent = value;
    }
  });

  const pageTitle = getTranslation(lang, "meta.title");
  if (pageTitle) {
    document.title = pageTitle;
  }

  document.documentElement.lang = lang;
  currentLang = lang;
  localStorage.setItem("lang", lang);

  updateLanguageButtons(lang);
  runTypewriter(lang);
}

function setLang(lang) {
  if (!translations[lang]) {
    lang = defaultLang;
  }

  translatePage(lang);
}

function initLanguage() {
  const savedLang = localStorage.getItem("lang");
  const browserLang = navigator.language.slice(0, 2);
const bootDone = localStorage.getItem("bootDone");

if (!bootDone) {
  runBootSequence(currentLang);
  localStorage.setItem("bootDone", "true");
} else {
  document.getElementById("boot-screen")?.classList.add("hidden");
}
  if (savedLang && translations[savedLang]) {
    translatePage(savedLang);
    return;
  }

  if (translations[browserLang]) {
    translatePage(browserLang);
    return;
  }

  translatePage(defaultLang);
  
}

function updateLanguageButtons(lang) {
  document.getElementById("lang-en")?.classList.toggle("active", lang === "en");
  document.getElementById("lang-ru")?.classList.toggle("active", lang === "ru");
}

function runTypewriter(lang) {
  const target = document.getElementById("type-text");
  if (!target) return;

  const text = getTranslation(lang, "logs.typewriter") || "";
  target.textContent = "";

  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
  }

  let index = 0;

  function typeEffect() {
    if (index < text.length) {
      target.textContent += text[index];
      index++;
      typewriterTimeout = setTimeout(typeEffect, 30);
    }
  }

  typeEffect();
}

function toggleArchive() {
  const archive = document.getElementById("archive");
  const button = document.getElementById("archive-btn");
  const hint = document.getElementById("archive-hint");

  if (!archive || !button || button.disabled) return;

  lockButton(button, 700);

  const willOpen = !archive.classList.contains("open");

  archive.classList.toggle("open");
  updateArchiveButton();

  if (hint) {
    hint.style.display = willOpen ? "none" : "block";
  }

  if (willOpen) {
    playTerminalBeep();
    showSystemStatus("status.archive.open", "success");

    archive.classList.remove("flash");
    archive.classList.remove("scan-active");

    void archive.offsetWidth;

    archive.classList.add("flash");
    archive.classList.add("scan-active");

    setTimeout(() => {
      archive.classList.remove("scan-active");
    }, 750);

    setTimeout(() => {
      archive.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 120);
  } else {
    playTerminalCloseBeep();
    showSystemStatus("status.archive.close", "off");
  }
}

function updateArchiveButton() {
  const archive = document.getElementById("archive");
  const button = document.getElementById("archive-btn");

  if (!archive || !button) return;

  const isOpen = archive.classList.contains("open");

  const key = isOpen
    ? "button.archive.close"
    : "button.archive.open";

  const text = getTranslation(currentLang, key);

  if (text) {
    button.textContent = text;
  }

  button.classList.toggle("btn-active", isOpen);
  button.classList.toggle("btn-danger", !isOpen);
}

function playTerminalBeep() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audioCtx = new AudioContextClass();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.12);
  
}
function playTerminalCloseBeep() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const audioCtx = new AudioContextClass();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(520, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.018, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.09);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.09);
}

let statusTimeout = null;

function showSystemStatus(key, mode = "success") {
  const status = document.getElementById("system-status");
  if (!status) return;

  const text = getTranslation(currentLang, key) || "";

  status.textContent = text;
  status.classList.remove("success", "off", "show");
  status.classList.add(mode);

  void status.offsetWidth;
  status.classList.add("show");

  if (statusTimeout) {
    clearTimeout(statusTimeout);
  }

  statusTimeout = setTimeout(() => {
    status.classList.remove("show");
  }, 1800);
}
function lockButton(button, duration = 900) {
  if (!button) return;

  button.disabled = true;

  setTimeout(() => {
    button.disabled = false;
  }, duration);
}
function runBootSequence(lang) {
  const bootScreen = document.getElementById("boot-screen");
  const lineEl = document.getElementById("boot-line");

  if (!bootScreen || !lineEl) return;

  const lines = getTranslation(lang, "boot.lines") || [];

  let lineIndex = 0;
  let charIndex = 0;

  function typeLine() {
    if (lineIndex >= lines.length) {
      setTimeout(() => {
        bootScreen.classList.add("hidden");
      }, 400);
      return;
    }

    const currentLine = lines[lineIndex];

    if (charIndex < currentLine.length) {
      lineEl.textContent += currentLine[charIndex];
      charIndex++;
      setTimeout(typeLine, 25);
    } else {
      lineEl.textContent += "\n";
      lineIndex++;
      charIndex = 0;
      setTimeout(typeLine, 300);
    }
  }

  lineEl.textContent = "";
  typeLine();
}

