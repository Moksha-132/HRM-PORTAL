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
  'nav-companies':    { title: 'Companies',                sub: 'Manage registered companies',            view: 'view-companies' },
  'nav-subscriptions':{ title: 'Subscriptions',            sub: 'View and manage subscriptions',          view: 'view-subscriptions' },
  'nav-transactions': { title: 'Transactions',             sub: 'All payment transactions',               view: 'view-transactions' },
  'nav-offline':      { title: 'Offline Requests',         sub: 'Pending offline requests',               view: 'view-offline' },
  'nav-email':        { title: 'Email Queries',            sub: 'Email inquiries from users',             view: 'view-email' },
  'nav-superadmin':   { title: 'Super Admin Management',   sub: 'Manage super admin accounts',            view: 'view-superadmin' },
  'nav-website':      { title: 'Website Settings',         sub: 'Configure your public website',          view: 'view-website-settings' },
  'nav-system':       { title: 'System Settings',          sub: 'Platform configuration & preferences',   view: 'view-system' },
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
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    
    const targetView = document.getElementById(map.view);
    if (targetView) {
      targetView.classList.remove('hidden');
      if (map.view === 'view-superadmin') fetchAdmins();
      if (map.view === 'view-companies') fetchCompanies();
    }

    // Auto-close sidebar on mobile
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
    }
  });
});

/* ── Backend API Integrations ── */
document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('shnoor_token');
  if (!token) {
    window.location.href = 'index.html#login';
    return;
  }

  // Set email display
  const adminEmailDisplay = document.getElementById('admin-email-display');
  if (adminEmailDisplay) adminEmailDisplay.textContent = sessionStorage.getItem('shnoor_admin_email') || 'admin@shnoor.com';

  // Fetch Dashboard Stats (Mock)
  async function fetchStats() {
    // In a real app, you'd fetch /api/v1/dashboard/stats
    document.getElementById('stat-companies').textContent = '12';
    document.getElementById('stat-subs').textContent = '8';
    document.getElementById('stat-revenue').textContent = '$4,250';
    document.getElementById('stat-queries').textContent = '3';
  }
  fetchStats();

  // Manage Admins
  async function fetchAdmins() {
    try {
      const res = await fetch('/api/v1/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = document.getElementById('admins-list');
        list.innerHTML = data.data.map(user => `
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:12px;">${user.name}<br/><small style="color:var(--text-light)">${user.email}</small></td>
            <td style="padding:12px;"><span class="admin-badge" style="background:var(--primary-light); color:var(--primary);">${user.role}</span></td>
            <td style="padding:12px;">
              <button onclick="deleteAdmin('${user._id}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1.1rem;" title="Delete">🗑️</button>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) { console.error(e); }
  }

  window.deleteAdmin = async (id) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      const res = await fetch(`/api/v1/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchAdmins();
    } catch (e) { console.error(e); }
  };

  const addAdminForm = document.getElementById('add-admin-form');
  addAdminForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      name: document.getElementById('admin-name-input').value,
      email: document.getElementById('admin-email-input').value,
      password: document.getElementById('admin-password-input').value,
      role: document.getElementById('admin-role-input').value
    };

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Admin created successfully!');
        addAdminForm.reset();
        fetchAdmins();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) { console.error(err); }
  });

  // --- Real Companies Logic ---
  async function fetchCompanies() {
    try {
      const res = await fetch('/api/v1/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = document.getElementById('companies-list');
        list.innerHTML = data.data.map(comp => {
          let statusColor = 'orange';
          if (comp.status === 'Active') statusColor = 'green';
          if (comp.status === 'Inactive') statusColor = 'red';

          return `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:12px;"><strong>${comp.name}</strong><br/><small style="color:var(--text-light)">${comp.email}</small></td>
              <td style="padding:12px;">${comp.location}</td>
              <td style="padding:12px;"><span style="color:${statusColor}; font-weight:600;">${comp.status}</span></td>
              <td style="padding:12px;">
                <button onclick="deleteCompany('${comp._id}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1.1rem;" title="Delete">🗑️</button>
              </td>
            </tr>
          `;
        }).join('');
        if (data.data.length === 0) {
          list.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:var(--text-light);">No companies found.</td></tr>';
        }
      }
    } catch (e) {
      console.error('Error fetching companies:', e);
    }
  }

  window.deleteCompany = async (id) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      const res = await fetch(`/api/v1/companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCompanies();
    } catch (e) { console.error(e); }
  };

  const addCompanyForm = document.getElementById('add-company-form');
  addCompanyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      name: document.getElementById('comp-name-input').value,
      email: document.getElementById('comp-email-input').value,
      location: document.getElementById('comp-loc-input').value,
      status: document.getElementById('comp-status-input').value
    };

    try {
      const res = await fetch('/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Company added successfully!');
        addCompanyForm.reset();
        fetchCompanies();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) { console.error(err); }
  });

  // Load Header Settings
  const headerForm = document.getElementById('header-settings-form');
  if (headerForm) {
    try {
      const res = await fetch('/api/v1/settings/header');
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const settings = data.data;
        document.getElementById('header-title').value = settings.title || '';
        document.getElementById('header-subtitle').value = settings.subtitle || '';
        document.getElementById('header-desc').value = settings.description || '';
        document.getElementById('header-btn-text').value = settings.buttonText || '';
        document.getElementById('header-btn-link').value = settings.buttonLink || '';
        document.getElementById('header-show-btn').checked = settings.showButton !== false;
        
        if (settings.backgroundImage) {
          const preview = document.getElementById('current-bg-preview');
          preview.innerHTML = `<img src="${settings.backgroundImage}" style="max-height: 100px; border-radius: 4px;" alt="Header BG"/>`;
        }
      }
    } catch (err) {
      console.error('Error loading header settings:', err);
    }
    
    // Save Header Settings
    headerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(headerForm);
      // Specifically handle checkbox value
      formData.set('showButton', document.getElementById('header-show-btn').checked);
      
      try {
        const res = await fetch('/api/v1/settings/header', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
          alert('Settings saved successfully!');
          if (data.data.backgroundImage) {
            document.getElementById('current-bg-preview').innerHTML = `<img src="${data.data.backgroundImage}" style="max-height: 100px; border-radius: 4px;" alt="Header BG"/>`;
          }
        } else {
          alert('Error saving settings: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Load About Settings
  const aboutForm = document.getElementById('about-settings-form');
  if (aboutForm) {
    try {
      const res = await fetch('/api/v1/settings/about');
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const a = data.data;
        document.getElementById('about-title-input').value = a.title || '';
        document.getElementById('about-desc-input').value = a.description || '';
        document.getElementById('about-mission-input').value = a.mission || '';
        document.getElementById('about-vision-input').value = a.vision || '';
      }
    } catch (e) {
      console.error('Error fetching about settings:', e);
    }

    aboutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        title: document.getElementById('about-title-input').value,
        description: document.getElementById('about-desc-input').value,
        mission: document.getElementById('about-mission-input').value,
        vision: document.getElementById('about-vision-input').value
      };

      try {
        const res = await fetch('/api/v1/settings/about', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok && data.success) alert('About Settings saved!');
        else alert('Error: ' + data.error);
      } catch (err) {
        console.error(err);
        alert('Network error.');
      }
    });
  }

  // Load Contact Info
  const contactForm = document.getElementById('contact-settings-form');
  if (contactForm) {
    try {
      const res = await fetch('/api/v1/settings/contact');
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const c = data.data;
        document.getElementById('contact-email-input').value = c.email || '';
        document.getElementById('contact-phone-input').value = c.phone || '';
        document.getElementById('contact-address-input').value = c.address || '';
        document.getElementById('contact-fb-input').value = c.facebook || '';
        document.getElementById('contact-tw-input').value = c.twitter || '';
        document.getElementById('contact-in-input').value = c.linkedin || '';
        document.getElementById('contact-ig-input').value = c.instagram || '';
      }
    } catch (e) {
      console.error('Error fetching contact:', e);
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        email: document.getElementById('contact-email-input').value,
        phone: document.getElementById('contact-phone-input').value,
        address: document.getElementById('contact-address-input').value,
        facebook: document.getElementById('contact-fb-input').value,
        twitter: document.getElementById('contact-tw-input').value,
        linkedin: document.getElementById('contact-in-input').value,
        instagram: document.getElementById('contact-ig-input').value
      };

      try {
        const res = await fetch('/api/v1/settings/contact', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok && data.success) alert('Contact saved!');
        else alert('Error: ' + data.error);
      } catch (err) {
        console.error(err);
        alert('Network error.');
      }
    });
  }

  // Load and Handle Features
  const featuresList = document.getElementById('admin-features-list');
  const addFeatureForm = document.getElementById('add-feature-form');
  
  const loadFeatures = async () => {
    if (!featuresList) return;
    try {
      const res = await fetch('/api/v1/settings/features');
      const data = await res.json();
      if (res.ok && data.success) {
        featuresList.innerHTML = data.data.map(f => `
          <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid var(--border); border-radius:4px;">
            <span>${f.icon} <strong>${f.title}</strong></span>
            <button onclick="deleteFeature('${f._id}')" class="btn btn-outline" style="border-color:#fca5a5; color:#b91c1c; padding:4px 8px; font-size:0.8rem;">Del</button>
          </li>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (addFeatureForm) {
    loadFeatures();
    addFeatureForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        icon: document.getElementById('feat-icon').value,
        title: document.getElementById('feat-title').value,
        description: document.getElementById('feat-desc').value
      };
      try {
        const res = await fetch('/api/v1/settings/features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          addFeatureForm.reset();
          loadFeatures();
        } else {
          const data = await res.json();
          alert('Error: ' + data.error);
        }
      } catch (e) { console.error(e); }
    });
  }

  // Load and Handle Pricing
  const pricingList = document.getElementById('admin-pricing-list');
  const addPricingForm = document.getElementById('add-pricing-form');

  const loadPricing = async () => {
    if (!pricingList) return;
    try {
      const res = await fetch('/api/v1/settings/pricing');
      const data = await res.json();
      if (res.ok && data.success) {
        pricingList.innerHTML = data.data.map(p => `
          <li style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid var(--border); border-radius:4px; ${p.isPopular ? 'border-color:var(--primary); background:#f3f4ff;' : ''}">
            <span><strong>${p.planName}</strong> - $${p.price}</span>
            <button onclick="deletePricing('${p._id}')" class="btn btn-outline" style="border-color:#fca5a5; color:#b91c1c; padding:4px 8px; font-size:0.8rem;">Del</button>
          </li>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (addPricingForm) {
    loadPricing();
    addPricingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        planName: document.getElementById('price-name').value,
        price: document.getElementById('price-amount').value,
        features: document.getElementById('price-features').value.split(',').map(s=>s.trim()),
        isPopular: document.getElementById('price-popular').checked
      };
      try {
        const res = await fetch('/api/v1/settings/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          addPricingForm.reset();
          loadPricing();
        } else {
          const data = await res.json();
          alert('Error: ' + data.error);
        }
      } catch (e) { console.error(e); }
    });
  }
});

// Global helpers purely for the admin list deletes
window.deleteFeature = async (id) => {
  if(!confirm('Delete this feature?')) return;
  const token = sessionStorage.getItem('shnoor_token');
  try {
    const res = await fetch('/api/v1/settings/features/'+id, { method: 'DELETE', headers:{'Authorization': `Bearer ${token}`} });
    if(res.ok) window.location.reload();
  } catch(e) { console.error(e); }
};

window.deletePricing = async (id) => {
  if(!confirm('Delete this plan?')) return;
  const token = sessionStorage.getItem('shnoor_token');
  try {
    const res = await fetch('/api/v1/settings/pricing/'+id, { method: 'DELETE', headers:{'Authorization': `Bearer ${token}`} });
    if(res.ok) window.location.reload();
  } catch(e) { console.error(e); }
};
