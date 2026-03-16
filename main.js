/* ── main.js – shnoor Landing Page Logic ── */

// ── Bind Header Settings dynamically ──
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/v1/settings/header');
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      const s = data.data;

      const badge = document.getElementById('hero-subtitle');
      if (badge) {
        if (s.subtitle) { badge.textContent = s.subtitle; badge.style.display = 'inline-block'; }
        else { badge.style.display = 'none'; }
      }

      const title = document.getElementById('hero-title');
      if (title) title.textContent = s.title || 'Welcome';

      const desc = document.getElementById('hero-desc');
      if (desc) {
        if (s.description) { desc.textContent = s.description; desc.style.display = 'block'; }
        else { desc.style.display = 'none'; }
      }

      const btnRow = document.getElementById('hero-btn-row');
      const primBtn = document.getElementById('hero-btn');
      if (btnRow && primBtn) {
        if (s.showButton !== false) {
          btnRow.style.display = 'flex';
          primBtn.textContent = s.buttonText || 'Discover More';
          primBtn.href = s.buttonLink || '#features';
        } else {
          // If the primary button is disabled, just hide the button row entirely or hide just the button.
          primBtn.style.display = 'none';
          btnRow.style.display = 'flex'; // secondary button stays
        }
      }

      const visual = document.getElementById('hero-bg-container');
      if (visual && s.backgroundImage) {
        visual.style.backgroundImage = `url('${s.backgroundImage}')`;
      }
    }
  } catch (e) {
    console.error('Failed fetching settings:', e);
  }

  // --- Fetch About Settings ---
  try {
    const res = await fetch('/api/v1/settings/about');
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      const a = data.data;
      const titleEl = document.getElementById('about-title');
      if (titleEl && a.title) titleEl.textContent = a.title;
      
      const descEl = document.getElementById('about-desc');
      if (descEl && a.description) { descEl.textContent = a.description; descEl.style.display = 'block'; }
      else if (descEl) descEl.style.display = 'none';

      const missionEl = document.getElementById('about-mission');
      if (missionEl && a.mission) missionEl.textContent = a.mission;

      const visionEl = document.getElementById('about-vision');
      if (visionEl && a.vision) visionEl.textContent = a.vision;
    }
  } catch (e) {
    console.error('Failed fetching about settings:', e);
  }

  // --- Fetch Contact and Social Media Settings ---
  try {
    const res = await fetch('/api/v1/settings/contact');
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      const c = data.data;

      // Contact Info
      if (c.address) {
        document.getElementById('contact-address-row').style.display = 'flex';
        document.getElementById('contact-address').textContent = c.address;
      }
      if (c.email) {
        document.getElementById('contact-email-row').style.display = 'flex';
        document.getElementById('contact-email').textContent = c.email;
      }
      if (c.phone) {
        document.getElementById('contact-phone-row').style.display = 'flex';
        document.getElementById('contact-phone').textContent = c.phone;
      }

      // Social Media
      const socialRow = document.getElementById('footer-social-row');
      if (socialRow) {
        socialRow.innerHTML = '';
        if (c.facebook && c.facebook !== '#') socialRow.innerHTML += `<a href="${c.facebook}" target="_blank" class="social-icon" title="Facebook"><i class="fab fa-facebook-f"></i></a>`;
        if (c.twitter && c.twitter !== '#') socialRow.innerHTML += `<a href="${c.twitter}" target="_blank" class="social-icon" title="Twitter"><i class="fab fa-twitter"></i></a>`;
        if (c.linkedin && c.linkedin !== '#') socialRow.innerHTML += `<a href="${c.linkedin}" target="_blank" class="social-icon" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>`;
        if (c.instagram && c.instagram !== '#') socialRow.innerHTML += `<a href="${c.instagram}" target="_blank" class="social-icon" title="Instagram"><i class="fab fa-instagram"></i></a>`;
      }
    }
  } catch (e) {
    console.error('Failed fetching contact:', e);
  }

  // --- Fetch Features ---
  try {
    const res = await fetch('/api/v1/settings/features');
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      const featureGrid = document.getElementById('features-grid');
      if (featureGrid) {
        featureGrid.innerHTML = data.data.map(f => `
          <div class="card">
            <div class="card-icon" style="font-size: 2rem; margin-bottom: 12px;">${f.icon || '✨'}</div>
            <h3 class="card-title" style="font-size: 1.15rem; font-weight: 700; color: var(--text); margin-bottom: 6px;">${f.title}</h3>
            <p class="card-text" style="font-size: 0.95rem; color: var(--text-light); line-height: 1.5;">${f.description}</p>
          </div>
        `).join('');
      }
    }
  } catch (e) {
    console.error('Failed fetching features:', e);
  }

  // --- Fetch Pricing ---
  try {
    const res = await fetch('/api/v1/settings/pricing');
    const data = await res.json();
    if (res.ok && data.success && data.data) {
      const pricingGrid = document.getElementById('pricing-grid');
      if (pricingGrid) {
        pricingGrid.innerHTML = data.data.map(p => `
          <div class="card ${p.isPopular ? 'card-featured' : ''}">
            <h3 class="pricing-name" style="font-size: 1.25rem; font-weight: 700; color: var(--text);">${p.planName}</h3>
            <div class="pricing-price" style="font-size: 2.5rem; font-weight: 800; color: var(--text); margin: 12px 0;">$${p.price}<span style="font-size:1rem; font-weight:500; color:var(--text-light)">/mo</span></div>
            <hr class="divider" style="margin: 20px 0;"/>
            <ul class="pricing-features" style="list-style: none; padding: 0; display:flex; flex-direction:column; gap:12px;">
              ${p.features.map(f => `<li style="font-size: 0.95rem; color: var(--text); display:flex; gap:8px;">✅ <span>${f}</span></li>`).join('')}
            </ul>
            <a href="#register" class="btn ${p.isPopular ? 'btn-solid' : 'btn-outline'} btn-block" style="margin-top:auto">Choose Plan</a>
          </div>
        `).join('');
      }
    }
  } catch (e) {
    console.error('Failed fetching pricing:', e);
  }
});

// ── Admin Credentials (hardcoded, single admin) ──
const ADMIN_EMAIL    = 'admin@shnoor.com';
const ADMIN_PASSWORD = 'Admin@1234';

// ── Login form handler ──
const loginForm   = document.getElementById('login-form');
const loginError  = document.getElementById('login-error');

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      sessionStorage.setItem('shnoor_admin', 'true');
      sessionStorage.setItem('shnoor_token', data.token);
      sessionStorage.setItem('shnoor_admin_email', data.user.email);
      
      if (data.user.role === 'Manager') {
        window.location.href = 'manager-dashboard.html';
      } else {
        window.location.href = 'admin-dashboard.html';
      }
    } else {
      loginError.textContent = data.error || 'Invalid email or password.';
      loginError.style.display = 'block';
      document.getElementById('login-password').value = '';
      document.getElementById('login-password').focus();
    }
  } catch (error) {
    loginError.textContent = 'Network error. Please try again.';
    loginError.style.display = 'block';
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

