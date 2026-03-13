/* ── Admin Dashboard JS ── */

// Sidebar toggle (desktop collapse / mobile open)
const sidebar = document.getElementById('sidebar');
const mainWrap = document.querySelector('.main-wrap');
const toggleBtn = document.getElementById('sidebar-toggle');

toggleBtn?.addEventListener('click', () => {
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
    mainWrap.classList.toggle('expanded');
  }
});

// Close sidebar on mobile when clicking outside
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      e.target !== toggleBtn) {
    sidebar.classList.remove('open');
  }
});

// Nav link switching
const navMap = {
  'nav-dashboard':    { title: 'Dashboard',               sub: 'Overview of your platform',              view: 'view-dashboard' },
  'nav-companies':    { title: 'Companies',                sub: 'Manage registered companies',            view: 'view-placeholder' },
  'nav-subscriptions':{ title: 'Subscriptions',            sub: 'View and manage subscriptions',          view: 'view-placeholder' },
  'nav-transactions': { title: 'Transactions',             sub: 'All payment transactions',               view: 'view-placeholder' },
  'nav-offline':      { title: 'Offline Requests',         sub: 'Pending offline requests',               view: 'view-placeholder' },
  'nav-email':        { title: 'Email Queries',            sub: 'Email inquiries from users',             view: 'view-placeholder' },
  'nav-superadmin':   { title: 'Super Admin Management',   sub: 'Manage super admin accounts',            view: 'view-placeholder' },
  'nav-website':      { title: 'Website Settings',         sub: 'Configure your public website',          view: 'view-placeholder' },
  'nav-system':       { title: 'System Settings',          sub: 'Platform configuration & preferences',   view: 'view-placeholder' },
};

const pageTitle   = document.getElementById('page-title');
const allLinks    = document.querySelectorAll('.sidebar-link');
const dashView    = document.getElementById('view-dashboard');
const phView      = document.getElementById('view-placeholder');
const phTitle     = document.getElementById('placeholder-title');
const phSub       = document.getElementById('placeholder-sub');

allLinks.forEach(link => {
  if (link.id === 'nav-logout') return; // handled separately
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const map = navMap[link.id];
    if (!map) return;

    // Update active state
    allLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Update topbar
    pageTitle.textContent = map.title;

    // Swap views
    if (map.view === 'view-dashboard') {
      dashView.classList.remove('hidden');
      phView.classList.add('hidden');
    } else {
      dashView.classList.add('hidden');
      phView.classList.remove('hidden');
      phTitle.textContent = map.title;
      phSub.textContent   = map.sub;
    }

    // Auto-close sidebar on mobile
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
    }
  });
});
