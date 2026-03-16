/* ── Employee Dashboard JS ── */

// Sidebar toggle
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
  'nav-dashboard':      { title: 'Dashboard',               sub: 'Your personal summary' },
  'nav-assets':         { title: 'Asset Management',        sub: 'My assigned equipment' },
  'nav-calendar':       { title: 'Holiday Calendar',        sub: 'Company holidays' },
  'nav-appreciations':  { title: 'Appreciation System',     sub: 'Peer & manager recognition' },
  'nav-leaves':         { title: 'Leave Management',        sub: 'Apply and track status' },
  'nav-attendance':     { title: 'Attendance Tracking',     sub: 'My work history' },
  'nav-offboarding':    { title: 'Offboarding Requests',    sub: 'Exit formalities' },
  'nav-letterheads':    { title: 'Letter Head Downloads',   sub: 'Company documents' },
  'nav-expenses':       { title: 'Expense Management',      sub: 'Claim reimbursements' },
  'nav-payroll':        { title: 'Payroll Access',          sub: 'Payslips and tax details' },
  'nav-policies':       { title: 'Company Policy Viewer',   sub: 'Internal guidelines' },
  'nav-custom-fields':  { title: 'Custom Fields',           sub: 'Additional information' },
  'nav-profile':        { title: 'Profile Management',      sub: 'Personal settings' },
};

const pageTitle   = document.getElementById('page-title');
const allLinks    = document.querySelectorAll('.sidebar-link');
const dashView    = document.getElementById('view-dashboard');
const phView      = document.getElementById('view-placeholder');
const phTitle     = document.getElementById('placeholder-title');
const phSub       = document.getElementById('placeholder-sub');

allLinks.forEach(link => {
  if (link.id === 'nav-logout') return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const map = navMap[link.id];
    if (!map) return;

    allLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    pageTitle.textContent = map.title;

    if (link.id === 'nav-dashboard') {
      dashView.classList.remove('hidden');
      phView.classList.add('hidden');
    } else {
      dashView.classList.add('hidden');
      phView.classList.remove('hidden');
      phTitle.textContent = map.title;
      phSub.textContent   = map.sub;
    }

    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('shnoor_token');
  if (!token) {
    window.location.href = 'index.html#login';
    return;
  }

  const emailDisplay = document.getElementById('employee-email-display');
  if (emailDisplay) emailDisplay.textContent = sessionStorage.getItem('shnoor_admin_email') || 'emp@shnoor.com';
});
