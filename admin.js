/* ── Admin Dashboard JS ── */
console.log('admin.js loading... Time:', new Date().toLocaleTimeString());

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
  'nav-companies':    { title: 'Companies',                sub: 'Manage registered companies',            view: 'view-companies' },
  'nav-subscriptions':{ title: 'Subscriptions',            sub: 'View and manage subscriptions',          view: 'view-subscriptions' },
  'nav-transactions': { title: 'Transactions',             sub: 'All payment transactions',               view: 'view-transactions' },
  'nav-offline':      { title: 'Offline Requests',         sub: 'Pending offline requests',               view: 'view-offline' },
  'nav-superadmin':   { title: 'Super Admin Management',   sub: 'Manage super admin accounts',            view: 'view-superadmin' },
  'nav-chat-support': { title: 'Chat Support',             sub: 'Manage and respond to user messages',    view: 'view-chat-support' },
  'nav-website':      { title: 'Website Settings',         sub: 'Configure your public website',          view: 'view-website-settings' },
  'nav-system':       { title: 'System Settings',          sub: 'Platform configuration & preferences',   view: 'view-system' },
};

const pageTitle   = document.getElementById('page-title');
const allLinks    = document.querySelectorAll('.sidebar-link');

// --- Admin Chat Support View Integration ---
window.initAdminChat = function() {
  console.log('initAdminChat called - using 1000ms safety delay');
  setTimeout(() => {
    const container = document.getElementById('final-chat-support-inbox-unique');
    if (!container) {
      console.error('CRITICAL: #final-chat-support-inbox-unique not found in DOM');
      return;
    }
    
    if (!window.ReactDOM || !window.AdminChatPanel) {
      console.warn('ReactDOM or AdminChatPanel not ready, retrying...', {
        hasReactDOM: !!window.ReactDOM,
        hasAdminChatPanel: !!window.AdminChatPanel
      });
      setTimeout(window.initAdminChat, 500);
      return;
    }

    try {
      const token = sessionStorage.getItem('shnoor_token');
      if (!token) {
        console.error('No token found in sessionStorage');
        return;
      }

      if (!window.adminChatRoot) {
        console.log('Creating new React root on unique container');
        window.adminChatRoot = ReactDOM.createRoot(container);
      }
      
      window.adminChatRoot.render(
        React.createElement(window.AdminChatPanel, { 
          token: token, 
          onUpdated: () => console.log('Chat updated') 
        })
      );
      console.log('AdminChatPanel render successfully triggered');
    } catch (e) {
      console.error('Failed to render AdminChatPanel:', e);
    }
  }, 1000); // 1s delay
};

allLinks.forEach(link => {
  if (link.id === 'nav-logout') return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const map = navMap[link.id];
    if (!map) return;

    allLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    pageTitle.textContent = map.title;

    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    
    const targetView = document.getElementById(map.view);
    if (targetView) {
      targetView.classList.remove('hidden');
      if (map.view === 'view-superadmin') window.fetchAdmins();
      if (map.view === 'view-companies') window.fetchCompanies();
      if (map.view === 'view-transactions') { window.fetchCompaniesForTransactions(); window.fetchTransactions(); }
      if (map.view === 'view-system') window.fetchProfile();
      if (map.view === 'view-subscriptions') window.fetchSubscriptions();
      if (map.view === 'view-chat-support') window.initAdminChat();
    }

    if (window.innerWidth <= 900) sidebar.classList.remove('open');
  });
});

/* ── Backend API Integrations ── */
document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('shnoor_token');
  if (!token) {
    window.location.href = 'index.html#login';
    return;
  }

  const adminEmailDisplay = document.getElementById('admin-email-display');
  if (adminEmailDisplay) adminEmailDisplay.textContent = sessionStorage.getItem('shnoor_admin_email') || 'admin@shnoor.com';

  // Fetch Dashboard Stats
  window.fetchStats = async function() {
    try {
      const res = await fetch('/api/v1/companies', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.success) {
        const comps = data.data;
        document.getElementById('stat-companies').textContent = comps.length;
        document.getElementById('stat-active-companies').textContent = comps.filter(c => c.status === 'Active').length;
        document.getElementById('stat-inactive-companies').textContent = comps.filter(c => c.status === 'Inactive').length;
        document.getElementById('stat-pending-companies').textContent = comps.filter(c => c.status === 'Pending').length;
      }
    } catch (e) { console.error(e); }
  }
  window.fetchStats();

  // --- Real Companies Logic ---
  window.fetchCompanies = async function() {
    try {
      const res = await fetch('/api/v1/companies', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = document.getElementById('companies-list');
        list.innerHTML = data.data.map(comp => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:12px;"><strong>${comp.name}</strong><br/><small>${comp.email}</small></td>
              <td style="padding:12px;">${comp.location}</td>
              <td style="padding:12px;">${comp.subscriptionPlan || 'N/A'}</td>
              <td style="padding:12px;"><span style="color:${comp.status === 'Active' ? 'green' : (comp.status === 'Inactive' ? 'red' : 'orange')};">${comp.status}</span></td>
              <td style="padding:12px;">
                <button onclick="deleteCompany('${comp.id}')" style="background:none; border:none; color:var(--danger); cursor:pointer;">🗑️</button>
              </td>
            </tr>
          `).join('');
      }
    } catch (e) { console.error(e); }
  }

  window.deleteCompany = async (id) => {
    if (!confirm('Delete this company?')) return;
    try {
      const res = await fetch(`/api/v1/companies/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { window.fetchCompanies(); window.fetchStats(); }
    } catch (e) { console.error(e); }
  };

  // --- Notification System Logic ---
  const notifTrigger = document.getElementById('notification-trigger');
  const notifDropdown = document.getElementById('notification-dropdown');
  const notifCount = document.getElementById('notification-count');
  const notifList = document.getElementById('notification-list');
  const markAllReadBtn = document.getElementById('mark-all-read');

  notifTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown?.classList.toggle('hidden');
    if (!notifDropdown?.classList.contains('hidden')) window.fetchNotifications();
  });

  document.addEventListener('click', () => notifDropdown?.classList.add('hidden'));

  window.fetchNotifications = async function() {
    const email = sessionStorage.getItem('shnoor_admin_email');
    if (!email) return;
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(email)}&role=admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const unread = data.data.filter(n => !n.isRead);
        notifCount.textContent = unread.length;
        notifCount.style.display = unread.length > 0 ? 'block' : 'none';
        notifList.innerHTML = data.data.length > 0
          ? data.data.map(n => `<div class="notif-item ${n.isRead ? '' : 'unread'}" style="padding:10px; border-bottom:1px solid var(--border); font-size:0.9rem;">${n.message}<br/><small style="color:var(--text-light)">${new Date(n.timestamp).toLocaleString()}</small></div>`).join('')
          : '<p style="text-align:center; padding:10px;">No notifications</p>';
      }
    } catch (e) { console.error(e); }
  };

  markAllReadBtn?.addEventListener('click', async () => {
    const email = sessionStorage.getItem('shnoor_admin_email');
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId: email, role: 'admin' })
    });
    window.fetchNotifications();
  });

  window.fetchNotifications();
  setInterval(window.fetchNotifications, 30000);

  // --- Initial View Routing ---
  const chatView = document.getElementById('view-chat-support');
  if (chatView && !chatView.classList.contains('hidden')) {
    window.initAdminChat();
  }
});
