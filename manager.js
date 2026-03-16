/* ── Manager Dashboard JS ── */

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
  'nav-dashboard':     { title: 'Dashboard',        sub: 'Overview of your team' },
  'nav-employees':     { title: 'Employees',        sub: 'Manage your direct reports' },
  'nav-attendance':    { title: 'Attendance',       sub: 'Track time and presence' },
  'nav-leaves':        { title: 'Leaves',           sub: 'Manage leave requests' },
  'nav-assets':        { title: 'Assets',           sub: 'Asset assignment and tracking' },
  'nav-payroll':       { title: 'Payroll',          sub: 'Salary and compensations' },
  'nav-appreciations': { title: 'Appreciations',    sub: 'Recognize team achievements' },
  'nav-policies':      { title: 'Company Policies', sub: 'Internal rules and guidelines' },
  'nav-offboardings':  { title: 'Offboardings',     sub: 'Employee exit management' },
  'nav-finance':       { title: 'Finance',          sub: 'Departmental budgets and expenses' },
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

  const emailDisplay = document.getElementById('manager-email-display');
  if (emailDisplay) emailDisplay.textContent = sessionStorage.getItem('shnoor_admin_email') || 'manager@shnoor.com';
});
