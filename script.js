const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => scope.querySelectorAll(selector);

const root = document.documentElement;
const body = document.body;
const brightnessSlider = $('#brightnessSlider');
const brightnessValue = $('#brightnessValue');
const pullCord = $('#pullCord');
const lampHint = $('#lightHint');
const menuToggle = $('#menuToggle');
const siteNav = $('#siteNav');
const chatWidget = $('#chatWidget');
const chatMessages = $('#chatMessages');
const chatForm = $('#chatForm');
const chatInput = $('#chatInput');
const toastContainer = $('#toastContainer');

const storageKeys = {
  brightness: 'abhishek_portfolio_brightness',
  theme: 'abhishek_portfolio_theme',
};
const themes = {
  warm: { rgb: '242, 191, 123' },
  daylight: { rgb: '159, 216, 255' },
  neon: { rgb: '216, 162, 255' },
};

let intensity = 70;
let currentTheme = 'warm';
let particles = [];
let animationFrame = 0;
let resizeTimer = 0;

function readSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Could not read the saved portfolio setting.', error);
    return null;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Could not save the portfolio setting.', error);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  toastContainer.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function updateBrightness(value) {
  intensity = Math.min(100, Math.max(0, Number(value) || 0));
  root.style.setProperty('--intensity', intensity / 100);
  brightnessSlider.value = String(Math.round(intensity));
  brightnessValue.textContent = `${Math.round(intensity)}%`;
  lampHint.style.opacity = String(Math.max(0.55, intensity / 100));
  saveSetting(storageKeys.brightness, String(Math.round(intensity)));
}

function setTheme(theme) {
  currentTheme = themes[theme] ? theme : 'warm';
  root.dataset.lightTheme = currentTheme;
  root.style.setProperty('--accent-rgb', themes[currentTheme].rgb);
  saveSetting(storageKeys.theme, currentTheme);
  $$('.theme-dot').forEach((button) => {
    const active = button.dataset.theme === currentTheme;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function toggleLamp() {
  const nextBrightness = intensity > 15 ? 0 : 70;
  pullCord.classList.remove('pulled');
  void pullCord.offsetWidth;
  pullCord.classList.add('pulled');
  window.setTimeout(() => pullCord.classList.remove('pulled'), 280);
  updateBrightness(nextBrightness);
}

function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  siteNav.classList.toggle('open', open);
}

function closeMenuAfterNavigation() {
  setMenuOpen(false);
}

function openChat() {
  chatWidget.hidden = false;
  chatInput.focus();
}

function closeChat() {
  chatWidget.hidden = true;
  $$('[data-open-chat]').forEach((button) => button.focus());
}

function addChatMessage(message, type) {
  const bubble = document.createElement('div');
  bubble.className = `message message-${type}`;
  bubble.textContent = message;
  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getChatReply(message) {
  const text = message.toLowerCase();
  if (text.includes('react') || text.includes('node') || text.includes('next') || text.includes('tech') || text.includes('learn')) {
    return 'Abhishek is currently learning React, Node.js and Next.js as part of his web development journey.';
  }
  if (text.includes('chat') || text.includes('project')) {
    return 'He is building a chatbot project through his program. This sample chat is scripted in the browser, not connected to an AI.';
  }
  if (text.includes('bca') || text.includes('study') || text.includes('about')) {
    return 'Abhishek is pursuing a BCA and enjoys learning by experimenting with web projects.';
  }
  return 'This is a small scripted demo. Try asking about Abhishek’s BCA, what he is learning, or his chatbot project.';
}

brightnessSlider.addEventListener('input', () => updateBrightness(brightnessSlider.value));
pullCord.addEventListener('click', toggleLamp);

$$('.theme-dot').forEach((button) => {
  button.addEventListener('click', () => setTheme(button.dataset.theme));
});

menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

$$('.nav-link, .site-header .brand').forEach((link) => {
  link.addEventListener('click', closeMenuAfterNavigation);
});

$$('[data-open-chat]').forEach((button) => {
  button.addEventListener('click', openChat);
});

$('#chatClose').addEventListener('click', closeChat);

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  chatInput.value = '';
  chatInput.focus();
  window.setTimeout(() => addChatMessage(getChatReply(message), 'bot'), 380);
});

$('#contactForm').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  event.currentTarget.reset();
  showToast('Thanks for reaching out! This demo does not send or store messages yet.');
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

  if (!isTyping && event.key.toLowerCase() === 'l') toggleLamp();
  if (event.key === 'Escape') {
    setMenuOpen(false);
    if (!chatWidget.hidden) closeChat();
  }
});

function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  $('#scrollProgress').style.width = `${Math.min(100, progress)}%`;
}

function setupRevealAnimations() {
  const revealItems = $$('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    return;
  }

  body.classList.add('js-motion');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  revealItems.forEach((item) => observer.observe(item));
}

function setupActiveNavigation() {
  if (!('IntersectionObserver' in window)) return;
  const sections = $$('main section[id]');
  const links = $$('.nav-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach((section) => observer.observe(section));
}

function resizeCanvas() {
  const canvas = $('#dustCanvas');
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(42, Math.floor(window.innerWidth / 25)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.4 + 0.3,
    speed: Math.random() * 0.24 + 0.06,
    opacity: Math.random() * 0.35 + 0.12,
  }));
}

function drawDust() {
  const context = $('#dustCanvas').getContext('2d');
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (intensity > 12) {
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      if (particle.y < -2) {
        particle.y = window.innerHeight + 2;
        particle.x = Math.random() * window.innerWidth;
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${themes[currentTheme].rgb}, ${particle.opacity * intensity / 100})`;
      context.fill();
    });
  }
  animationFrame = window.requestAnimationFrame(drawDust);
}

function initialize() {
  const savedTheme = readSetting(storageKeys.theme);
  const savedBrightness = readSetting(storageKeys.brightness);
  const parsedBrightness = savedBrightness === null ? 70 : Number(savedBrightness);

  setTheme(savedTheme || 'warm');
  updateBrightness(Number.isFinite(parsedBrightness) ? parsedBrightness : 70);
  $('#currentYear').textContent = String(new Date().getFullYear());
  setupRevealAnimations();
  setupActiveNavigation();
  updateScrollUI();
  resizeCanvas();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animationFrame = window.requestAnimationFrame(drawDust);
  }
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(resizeCanvas, 120);
});
window.addEventListener('beforeunload', () => {
  if (animationFrame) window.cancelAnimationFrame(animationFrame);
});

initialize();
