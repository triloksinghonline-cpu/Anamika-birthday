const loader = document.querySelector(".loader");
const progress = document.querySelector(".scroll-progress");
const cursor = document.querySelector(".cursor-glow");
const themeToggle = document.querySelector("#themeToggle");
const musicToggle = document.querySelector("#musicToggle");
const openGift = document.querySelector("#openGift");
const letter = document.querySelector("#typedLetter");
const ambientCanvas = document.querySelector("#ambientCanvas");
const confettiCanvas = document.querySelector("#confettiCanvas");
const fireworksCanvas = document.querySelector("#fireworksCanvas");

const message =
  "On your special day, I simply want to wish you happiness, success, good health, and countless beautiful memories. May this year bring you closer to your dreams and fill your life with joy. Keep smiling, keep shining, and always believe in yourself. Happy Birthday, Anamika.";

let audioContext;
let masterGain;
let musicTimer;
let letterStarted = false;

function hideLoader() {
  setTimeout(() => loader.classList.add("hidden"), 650);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hideLoader, { once: true });
} else {
  hideLoader();
}

setTimeout(() => loader.classList.add("hidden"), 2500);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.setAttribute(
    "aria-label",
    document.body.classList.contains("light") ? "Toggle dark mode" : "Toggle light mode"
  );
});

openGift.addEventListener("click", () => {
  document.querySelector("#birthday").scrollIntoView({ behavior: "smooth" });
  burstConfetti();
  startMusic();
});

musicToggle.addEventListener("click", () => {
  if (document.body.classList.contains("music-playing")) {
    stopMusic();
  } else {
    startMusic();
  }
});

document.addEventListener("pointermove", (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

document.addEventListener("pointerdown", () => cursor.classList.add("active"));
document.addEventListener("pointerup", () => cursor.classList.remove("active"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      if (entry.target.id === "typedLetter" || entry.target.classList.contains("letter")) {
        typeLetter();
      }
      if (entry.target.id === "birthday" || entry.target.closest("#birthday")) {
        burstConfetti();
      }
      if (entry.target.id === "celebration" || entry.target.closest("#celebration")) {
        launchFireworks();
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal, .reveal-card, .letter, #birthday, #celebration").forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 45, 360)}ms`;
  revealObserver.observe(el);
});

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${percent}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

function typeLetter() {
  if (letterStarted) return;
  letterStarted = true;
  let index = 0;
  const tick = () => {
    letter.textContent = message.slice(0, index);
    index += 1;
    if (index <= message.length) {
      setTimeout(tick, index % 7 === 0 ? 44 : 24);
    }
  };
  tick();
}

function startMusic() {
  if (audioContext) {
    audioContext.resume();
    document.body.classList.add("music-playing");
    return;
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.045;
  masterGain.connect(audioContext.destination);

  const notes = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66];
  let step = 0;

  musicTimer = setInterval(() => {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[step % notes.length];
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    osc.connect(gain).connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.35);
    step += 1;
  }, 850);

  document.body.classList.add("music-playing");
}

function stopMusic() {
  clearInterval(musicTimer);
  if (masterGain) {
    masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.06);
  }
  document.body.classList.remove("music-playing");
}

function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  return ctx;
}

const ambientCtx = setupCanvas(ambientCanvas);
const confettiCtx = setupCanvas(confettiCanvas);
const fireworksCtx = setupCanvas(fireworksCanvas);

const particles = Array.from({ length: 95 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 1.8 + 0.4,
  vx: (Math.random() - 0.5) * 0.18,
  vy: Math.random() * 0.16 + 0.04,
  a: Math.random() * 0.7 + 0.2,
}));

function drawAmbient() {
  ambientCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y > window.innerHeight + 20) p.y = -20;
    if (p.x < -20) p.x = window.innerWidth + 20;
    if (p.x > window.innerWidth + 20) p.x = -20;
    ambientCtx.beginPath();
    ambientCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ambientCtx.fillStyle = `rgba(255, 248, 241, ${p.a})`;
    ambientCtx.shadowBlur = 12;
    ambientCtx.shadowColor = "rgba(245, 201, 124, 0.7)";
    ambientCtx.fill();
  });
  requestAnimationFrame(drawAmbient);
}

drawAmbient();

let confetti = [];
function burstConfetti() {
  const colors = ["#f6a6bd", "#f5c97c", "#92f0dc", "#b8a2ff", "#fff8f1"];
  confetti = confetti.concat(
    Array.from({ length: 140 }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 180,
      y: window.innerHeight * 0.28,
      w: Math.random() * 8 + 5,
      h: Math.random() * 14 + 6,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -7 - 3,
      g: Math.random() * 0.15 + 0.08,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.24,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 180,
    }))
  );
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confetti = confetti.filter((p) => p.life > 0);
  confetti.forEach((p) => {
    p.life -= 1;
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.spin;
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  });
  requestAnimationFrame(drawConfetti);
}

drawConfetti();

let fireworks = [];
function launchFireworks() {
  for (let i = 0; i < 4; i += 1) {
    setTimeout(() => {
      const x = window.innerWidth * (0.18 + Math.random() * 0.64);
      const y = window.innerHeight * (0.18 + Math.random() * 0.35);
      const colors = ["#f6a6bd", "#f5c97c", "#92f0dc", "#ffffff"];
      for (let j = 0; j < 70; j += 1) {
        const angle = (Math.PI * 2 * j) / 70;
        const speed = Math.random() * 4 + 1.6;
        fireworks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 80,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }, i * 430);
  }
}

function drawFireworks() {
  fireworksCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  fireworks = fireworks.filter((p) => p.life > 0);
  fireworks.forEach((p) => {
    p.life -= 1;
    p.vy += 0.025;
    p.x += p.vx;
    p.y += p.vy;
    fireworksCtx.globalAlpha = Math.max(p.life / 80, 0);
    fireworksCtx.beginPath();
    fireworksCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    fireworksCtx.fillStyle = p.color;
    fireworksCtx.shadowBlur = 18;
    fireworksCtx.shadowColor = p.color;
    fireworksCtx.fill();
    fireworksCtx.globalAlpha = 1;
  });
  requestAnimationFrame(drawFireworks);
}

drawFireworks();
