/* ── main.js – shnoor Landing Page Logic ── */

// ── Admin Credentials (hardcoded, single admin) ──
const ADMIN_EMAIL    = 'admin@shnoor.com';
const ADMIN_PASSWORD = 'Admin@1234';

// ── Login form handler ──
const loginForm   = document.getElementById('login-form');
const loginError  = document.getElementById('login-error');

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Store session flag
    sessionStorage.setItem('shnoor_admin', 'true');
    // Redirect to admin dashboard
    window.location.href = 'admin-dashboard.html';
  } else {
    loginError.style.display = 'block';
    document.getElementById('login-password').value = '';
    document.getElementById('login-password').focus();
  }
});

// Hide error as user starts typing
document.getElementById('login-email')?.addEventListener('input',    () => { if (loginError) loginError.style.display = 'none'; });
document.getElementById('login-password')?.addEventListener('input', () => { if (loginError) loginError.style.display = 'none'; });

// ── Sticky navbar shadow on scroll ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.style.boxShadow = window.scrollY > 10 ? '0 2px 12px rgba(0,0,0,0.08)' : 'none';
});

// ── Hamburger (mobile) ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  const open = navLinks.dataset.open === 'true';
  if (open) {
    navLinks.removeAttribute('style');
    navLinks.dataset.open = 'false';
  } else {
    Object.assign(navLinks.style, {
      display:       'flex',
      flexDirection: 'column',
      position:      'absolute',
      top:           '62px',
      left:          '0',
      right:         '0',
      background:    '#fff',
      padding:       '12px 24px',
      borderBottom:  '1px solid #e5e7eb',
      zIndex:        '49',
    });
    navLinks.dataset.open = 'true';
  }
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) current = s.id; });
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
});

