/* ── Admin Dashboard JS ── */
console.log('admin.js loading... (Session-based Support Version)');

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

/* ── DOM Content Loaded Logic ── */
document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('shnoor_token');
    console.log('Admin JS DOMContentLoaded - Token present:', !!token);

    if (!token) {
        window.location.href = 'index.html#login';
        return;
    }

    // Nav link switching
    const navMap = {
        'nav-dashboard':    { title: 'Dashboard',               sub: 'Overview of your platform',              view: 'view-dashboard' },
        'nav-companies':    { title: 'Companies',                sub: 'Manage registered companies',            view: 'view-companies' },
        'nav-subscriptions':{ title: 'Subscriptions',            sub: 'View and manage subscriptions',          view: 'view-subscriptions' },
        'nav-transactions': { title: 'Transactions',             sub: 'All payment transactions',               view: 'view-transactions' },
        'nav-offline':      { title: 'Offline Requests',         sub: 'Pending manual approvals',               view: 'view-offline' },
        'nav-website':      { title: 'Website Settings',         sub: 'Configure your public website',          view: 'view-website-settings' },
        'nav-system':       { title: 'System Settings',          sub: 'Platform configuration & preferences',   view: 'view-system' },
        'nav-chat':         { title: 'Chat Support',             sub: 'Manage active user queries',             view: 'view-chat' },
        'nav-superadmin':   { title: 'Super Admin Management',   sub: 'Manage platform administrators',         view: 'view-superadmin' },
    };

    const pageTitle   = document.getElementById('page-title');
    const allLinks    = document.querySelectorAll('.sidebar-link');

    allLinks.forEach(link => {
        if (link.id === 'nav-logout') {
            link.addEventListener('click', () => {
                sessionStorage.clear();
            });
            return;
        }
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const map = navMap[link.id];
            if (!map) return;
            allLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (pageTitle) pageTitle.textContent = map.title;
            
            document.querySelectorAll('.view').forEach(v => {
                v.classList.add('hidden');
                v.style.display = 'none';
            });
            const targetView = document.getElementById(map.view);
            if (targetView) {
                targetView.classList.remove('hidden');
                targetView.style.display = 'block';
                
                const notifTrigger = document.getElementById('notification-trigger');
                if (notifTrigger) {
                    notifTrigger.style.display = 'block';
                }

                const topbar = document.querySelector('.topbar');
                if (topbar) {
                    if (map.view === 'view-chat') {
                        topbar.classList.add('large');
                    } else {
                        topbar.classList.remove('large');
                    }
                }
                
                if (map.view === 'view-chat') window.fetchChatSessions?.();
                if (map.view === 'view-companies') window.fetchStats?.();
                if (map.view === 'view-subscriptions') window.fetchSubscriptions?.();
                if (map.view === 'view-transactions') window.fetchTransactions?.();
                if (map.view === 'view-superadmin') window.fetchAdmins?.();
                if (map.view === 'view-website-settings') window.fetchWebsiteSettings?.();
            }
        });
    });

    // Set email display
    const adminEmailDisplay = document.getElementById('admin-email-display');
    if (adminEmailDisplay) adminEmailDisplay.textContent = sessionStorage.getItem('shnoor_admin_email') || 'admin@shnoor.com';

    // Fetch Dashboard Stats + Recent Activities + Companies List
    window.fetchStats = async function() {
        try {
            const res = await fetch('/api/v1/companies', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const comps = data.data;
                document.getElementById('stat-companies').textContent = comps.length;
                document.getElementById('stat-active-companies').textContent = comps.filter(c => c.status === 'Active').length;
                document.getElementById('stat-inactive-companies').textContent = comps.filter(c => c.status === 'Inactive').length;
                document.getElementById('stat-pending-companies').textContent = comps.filter(c => c.status === 'Pending').length;

                // Recent activities
                const recentBody = document.getElementById('recent-activities-body');
                if (recentBody) {
                    const recent = [...comps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                    recentBody.innerHTML = recent.length ? recent.map(c => `
                        <tr style="border-bottom:1px solid var(--border);">
                            <td style="padding:12px;"><strong>${c.name}</strong><br><small style="color:var(--text-light);">${c.email || ''}</small></td>
                            <td style="padding:12px;">${c.location || '—'}</td>
                            <td style="padding:12px;"><span style="background:${c.status==='Active'?'#dcfce7':c.status==='Pending'?'#fef9c3':'#fee2e2'}; color:${c.status==='Active'?'#166534':c.status==='Pending'?'#854d0e':'#991b1b'}; padding:3px 10px; border-radius:4px; font-size:12px;">${c.status}</span></td>
                        </tr>`).join('') : '<tr><td colspan="3" style="padding:20px; text-align:center; color:var(--text-light);">No companies yet</td></tr>';
                }

                // Companies list table
                const compList = document.getElementById('companies-list');
                if (compList) {
                    compList.innerHTML = comps.length ? comps.map(c => `
                        <tr style="border-bottom:1px solid var(--border);">
                            <td style="padding:12px;"><strong>${c.name}</strong><br><small style="color:var(--text-light);">${c.email || ''}</small></td>
                            <td style="padding:12px;">${c.location || '—'}</td>
                            <td style="padding:12px;">${c.subscriptionPlan || '—'}</td>
                            <td style="padding:12px;"><span style="background:${c.status==='Active'?'#dcfce7':c.status==='Pending'?'#fef9c3':'#fee2e2'}; color:${c.status==='Active'?'#166534':c.status==='Pending'?'#854d0e':'#991b1b'}; padding:3px 10px; border-radius:4px; font-size:12px;">${c.status}</span></td>
                            <td style="padding:12px;">
                                <button onclick="deleteCompany(${c.id})" class="btn btn-outline" style="font-size:12px; padding:4px 10px; color:var(--danger); border-color:var(--danger);">Delete</button>
                            </td>
                        </tr>`).join('') : '<tr><td colspan="5" style="padding:20px; text-align:center; color:var(--text-light);">No companies found</td></tr>';
                }
            }
        } catch (e) { console.error('Error fetching companies:', e); }
    };
    window.fetchStats();

    // Add Company Form
    document.getElementById('add-company-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('comp-name-input')?.value?.trim();
        const email = document.getElementById('comp-email-input')?.value?.trim();
        const location = document.getElementById('comp-loc-input')?.value?.trim();
        const subscriptionPlan = document.getElementById('comp-plan-input')?.value?.trim();
        const status = document.getElementById('comp-status-input')?.value;
        if (!name || !email) return alert('Name and email are required');
        try {
            const res = await fetch('/api/v1/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, email, location, subscriptionPlan, status })
            });
            const data = await res.json();
            if (res.ok) { e.target.reset(); window.fetchStats(); }
            else alert(data.error || 'Failed to add company');
        } catch (err) { console.error(err); }
    });

    window.deleteCompany = async function(id) {
        if (!confirm('Delete this company?')) return;
        try {
            await fetch(`/api/v1/companies/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            window.fetchStats();
        } catch (e) { console.error(e); }
    };

    // Subscriptions
    window.fetchSubscriptions = async function() {
        const tbody = document.getElementById('subscriptions-list');
        if (!tbody) return;
        try {
            const res = await fetch('/api/v1/companies', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok && data.success) {
                tbody.innerHTML = data.data.length ? data.data.map(c => `
                    <tr style="border-bottom:1px solid var(--border);">
                        <td style="padding:12px;">${c.name}</td>
                        <td style="padding:12px;">${c.email || '—'}</td>
                        <td style="padding:12px;">${c.subscriptionPlan || '—'}</td>
                        <td style="padding:12px;"><span style="background:${c.status==='Active'?'#dcfce7':'#fee2e2'}; color:${c.status==='Active'?'#166534':'#991b1b'}; padding:3px 10px; border-radius:4px; font-size:12px;">${c.status}</span></td>
                    </tr>`).join('') : '<tr><td colspan="4" style="padding:20px; text-align:center; color:var(--text-light);">No subscriptions</td></tr>';
            }
        } catch (e) { console.error(e); }
    };

    // Transactions
    window.fetchTransactions = async function() {
        const tbody = document.getElementById('transactions-list');
        if (!tbody) return;
        try {
            const res = await fetch('/api/v1/transactions', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok && data.success) {
                const compRes = await fetch('/api/v1/companies', { headers: { 'Authorization': `Bearer ${token}` } });
                const compData = await compRes.json();
                const compMap = {};
                if (compData.success) compData.data.forEach(c => compMap[c.id] = c.name);

                // Populate company dropdown
                const select = document.getElementById('trans-company-input');
                if (select && compData.success) {
                    select.innerHTML = compData.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
                }

                tbody.innerHTML = data.data.length ? data.data.map(t => `
                    <tr style="border-bottom:1px solid var(--border);">
                        <td style="padding:12px;">${t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : '—'}</td>
                        <td style="padding:12px;">${compMap[t.companyId] || t.companyId || '—'}</td>
                        <td style="padding:12px;">$${parseFloat(t.amount || 0).toFixed(2)}</td>
                        <td style="padding:12px;">${t.nextPaymentDate ? new Date(t.nextPaymentDate).toLocaleDateString() : '—'}</td>
                        <td style="padding:12px;">${t.paymentMethod || '—'}</td>
                        <td style="padding:12px;"><span style="background:${t.status==='Success'?'#dcfce7':t.status==='Pending'?'#fef9c3':'#fee2e2'}; color:${t.status==='Success'?'#166534':t.status==='Pending'?'#854d0e':'#991b1b'}; padding:3px 10px; border-radius:4px; font-size:12px;">${t.status}</span></td>
                        <td style="padding:12px;">
                            <button onclick="editTransaction(${t.id})" class="btn btn-outline" style="font-size:12px; padding:4px 8px;">Edit</button>
                            <button onclick="deleteTransaction(${t.id})" class="btn btn-outline" style="font-size:12px; padding:4px 8px; color:var(--danger); border-color:var(--danger);">Del</button>
                        </td>
                    </tr>`).join('') : '<tr><td colspan="7" style="padding:20px; text-align:center; color:var(--text-light);">No transactions</td></tr>';
            }
        } catch (e) { console.error(e); }
    };

    document.getElementById('add-transaction-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('trans-id-input')?.value;
        const payload = {
            companyId: document.getElementById('trans-company-input')?.value,
            amount: document.getElementById('trans-amount-input')?.value,
            transactionDate: document.getElementById('trans-date-input')?.value,
            nextPaymentDate: document.getElementById('trans-next-date-input')?.value,
            paymentMethod: document.getElementById('trans-method-input')?.value,
            status: document.getElementById('trans-status-input')?.value,
        };
        try {
            const url = id ? `/api/v1/transactions/${id}` : '/api/v1/transactions';
            const method = id ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (res.ok) { e.target.reset(); document.getElementById('trans-id-input').value = ''; document.getElementById('trans-cancel-btn')?.classList.add('hidden'); document.getElementById('trans-submit-btn').textContent = 'Save Transaction'; window.fetchTransactions(); }
        } catch (err) { console.error(err); }
    });

    document.getElementById('trans-cancel-btn')?.addEventListener('click', () => {
        document.getElementById('add-transaction-form')?.reset();
        document.getElementById('trans-id-input').value = '';
        document.getElementById('trans-cancel-btn')?.classList.add('hidden');
        document.getElementById('trans-submit-btn').textContent = 'Save Transaction';
    });

    // Website Settings
    window.fetchWebsiteSettings = async function() {
        try {
            // Header Settings
            let res = await fetch('/api/v1/settings/header');
            let data = await res.json();
            if (res.ok && data.success && data.data) {
                document.getElementById('header-title').value = data.data.title || '';
                document.getElementById('header-subtitle').value = data.data.subtitle || '';
                document.getElementById('header-desc').value = data.data.description || '';
                document.getElementById('header-btn-text').value = data.data.buttonText || '';
                document.getElementById('header-btn-link').value = data.data.buttonLink || '';
                document.getElementById('header-show-btn').checked = data.data.showButton !== false;
                if (data.data.backgroundImage) {
                    document.getElementById('current-bg-preview').innerHTML = `<img src="${data.data.backgroundImage}" style="max-width:200px; border-radius:4px; margin-top:5px;">`;
                }
            }

            // About Settings
            res = await fetch('/api/v1/settings/about');
            data = await res.json();
            if (res.ok && data.success && data.data) {
                document.getElementById('about-title-input').value = data.data.title || '';
                document.getElementById('about-desc-input').value = data.data.description || '';
                document.getElementById('about-mission-input').value = data.data.mission || '';
                document.getElementById('about-vision-input').value = data.data.vision || '';
            }

            // Contact Settings
            res = await fetch('/api/v1/settings/contact');
            data = await res.json();
            if (res.ok && data.success && data.data) {
                document.getElementById('contact-email-input').value = data.data.email || '';
                document.getElementById('contact-phone-input').value = data.data.phone || '';
                document.getElementById('contact-address-input').value = data.data.address || '';
                document.getElementById('contact-fb-input').value = data.data.facebook || '';
                document.getElementById('contact-tw-input').value = data.data.twitter || '';
                document.getElementById('contact-in-input').value = data.data.linkedin || '';
                document.getElementById('contact-ig-input').value = data.data.instagram || '';
            }

            // Features List
            window.fetchFeaturesList();

            // Pricing Plans List
            window.fetchPricingList();

        } catch (e) {
            console.error('Error fetching website settings:', e);
        }
    };

    window.fetchFeaturesList = async function() {
        try {
            const res = await fetch('/api/v1/settings/features');
            const data = await res.json();
            const list = document.getElementById('admin-features-list');
            if (!list) return;
            if (res.ok && data.success && data.data) {
                list.innerHTML = data.data.map(f => `
                    <li style="padding:10px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong>${f.icon || '✨'} ${f.title}</strong>
                            <p style="font-size:12px; color:var(--text-light); margin-top:4px;">${f.description}</p>
                        </div>
                        <button onclick="deleteFeature(${f.id})" class="btn btn-outline" style="padding:4px 8px; font-size:12px; border-color:var(--danger); color:var(--danger);">Delete</button>
                    </li>
                `).join('');
            } else { list.innerHTML = ''; }
        } catch (e) { console.error(e); }
    };

    window.fetchPricingList = async function() {
        try {
            const res = await fetch('/api/v1/settings/pricing');
            const data = await res.json();
            const list = document.getElementById('admin-pricing-list');
            if (!list) return;
            if (res.ok && data.success && data.data) {
                list.innerHTML = data.data.map(p => `
                    <li style="padding:10px; border:1px solid var(--border); border-radius:6px; background:#f9fafb; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong>${p.planName}</strong> - $${p.price} ${p.isPopular ? '<span style="color:#d97706; font-size:12px; font-weight:bold;">★ Popular</span>' : ''}
                            <p style="font-size:12px; color:var(--text-light); margin-top:4px;">${p.features.join(', ')}</p>
                        </div>
                        <button onclick="deletePricing(${p.id})" class="btn btn-outline" style="padding:4px 8px; font-size:12px; border-color:var(--danger); color:var(--danger);">Delete</button>
                    </li>
                `).join('');
            } else { list.innerHTML = ''; }
        } catch (e) { console.error(e); }
    };

    // Save Handlers for Settings
    document.getElementById('header-settings-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', document.getElementById('header-title').value);
        formData.append('subtitle', document.getElementById('header-subtitle').value);
        formData.append('description', document.getElementById('header-desc').value);
        formData.append('buttonText', document.getElementById('header-btn-text').value);
        formData.append('buttonLink', document.getElementById('header-btn-link').value);
        formData.append('showButton', document.getElementById('header-show-btn').checked);
        const fileInput = document.getElementById('header-bg');
        if (fileInput.files[0]) formData.append('backgroundImage', fileInput.files[0]);

        try {
            const res = await fetch('/api/v1/settings/header', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) { alert('Header saved successfully'); window.fetchWebsiteSettings(); }
            else alert('Failed to save header');
        } catch (err) { console.error(err); }
    });

    document.getElementById('about-settings-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('about-title-input').value,
            description: document.getElementById('about-desc-input').value,
            mission: document.getElementById('about-mission-input').value,
            vision: document.getElementById('about-vision-input').value
        };
        try {
            const res = await fetch('/api/v1/settings/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) { alert('About saved successfully'); }
            else alert('Failed to save about settings');
        } catch (err) { console.error(err); }
    });

    document.getElementById('contact-settings-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) { alert('Contact saved successfully'); }
            else alert('Failed to save contact settings');
        } catch (err) { console.error(err); }
    });

    document.getElementById('add-feature-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            icon: document.getElementById('feat-icon').value,
            title: document.getElementById('feat-title').value,
            description: document.getElementById('feat-desc').value
        };
        try {
            const res = await fetch('/api/v1/settings/features', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) { e.target.reset(); window.fetchFeaturesList(); }
        } catch (err) { console.error(err); }
    });

    document.getElementById('add-pricing-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const featuresRaw = document.getElementById('price-features').value;
        const payload = {
            planName: document.getElementById('price-name').value,
            price: document.getElementById('price-amount').value,
            features: featuresRaw.split(',').map(s => s.trim()).filter(Boolean),
            isPopular: document.getElementById('price-popular').checked
        };
        try {
            const res = await fetch('/api/v1/settings/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) { e.target.reset(); window.fetchPricingList(); }
        } catch (err) { console.error(err); }
    });

    window.deleteFeature = async function(id) {
        if (!confirm('Delete this feature?')) return;
        try { await fetch(`/api/v1/settings/features/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); window.fetchFeaturesList(); } catch (e) { console.error(e); }
    };

    window.deletePricing = async function(id) {
        if (!confirm('Delete this pricing plan?')) return;
        try { await fetch(`/api/v1/settings/pricing/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); window.fetchPricingList(); } catch (e) { console.error(e); }
    };

    // Super Admin List

    window.fetchAdmins = async function() {
        const tbody = document.getElementById('admins-list');
        if (!tbody) return;
        try {
            const res = await fetch('/api/v1/auth/users', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok && data.success) {
                tbody.innerHTML = data.data.length ? data.data.map(a => `
                    <tr style="border-bottom:1px solid var(--border);">
                        <td style="padding:12px;">${a.name}<br><small style="color:var(--text-light);">${a.email}</small></td>
                        <td style="padding:12px;">${a.role}</td>
                        <td style="padding:12px;"><button onclick="deleteAdmin(${a.id})" class="btn btn-outline" style="font-size:12px; padding:4px 10px; color:var(--danger); border-color:var(--danger);">Delete</button></td>
                    </tr>`).join('') : '<tr><td colspan="3" style="padding:20px; text-align:center;">No admins found</td></tr>';
            }
        } catch (e) { console.error(e); }
    };

    document.getElementById('add-admin-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('admin-name-input')?.value,
            email: document.getElementById('admin-email-input')?.value,
            password: document.getElementById('admin-password-input')?.value,
            role: document.getElementById('admin-role-input')?.value,
        };
        try {
            const res = await fetch('/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (res.ok) { e.target.reset(); window.fetchAdmins(); }
            else { const d = await res.json(); alert(d.error || 'Failed'); }
        } catch (err) { console.error(err); }
    });

    window.deleteAdmin = async function(id) {
        if (!confirm('Delete this admin?')) return;
        try { await fetch(`/api/v1/auth/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); window.fetchAdmins(); } catch (e) { console.error(e); }
    };


    // Notification System Integration
    const notificationTrigger = document.getElementById('notification-trigger');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');
    const markAllRead = document.getElementById('mark-all-read');

    notificationTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => notificationDropdown?.classList.add('hidden'));
    notificationDropdown?.addEventListener('click', (e) => e.stopPropagation());

    window.updateNotifications = async function() {
        try {
            const res = await fetch('/api/notifications?role=admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const unread = data.data.filter(n => !n.isRead);
                if (notificationCount) {
                    notificationCount.textContent = unread.length;
                    notificationCount.style.display = unread.length > 0 ? 'block' : 'none';
                }
                if (notificationTrigger) {
                    notificationTrigger.style.display = 'block';
                }
                if (notificationList) {
                    if (unread.length === 0) {
                        notificationList.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:10px;">No new notifications</p>';
                    } else {
                        notificationList.innerHTML = unread.slice(0, 10).map(n => `
                            <div style="padding:10px; border-bottom:1px solid var(--border); font-size:0.85rem; background:#f8f9ff; font-weight:500;">
                                <div style="color:var(--text); margin-bottom:2px;">${n.message}</div>
                                <div style="color:var(--text-light); font-size:0.75rem;">${new Date(n.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                            </div>
                        `).join('');
                    }
                }
            }
        } catch (e) { console.error('Error updating notifications:', e); }
    };
    window.updateNotifications();
    setInterval(window.updateNotifications, 10000);
    // Poll for new chat sessions/messages every 10 seconds
    setInterval(() => {
        if (typeof window.fetchChatSessions === 'function') window.fetchChatSessions();
    }, 10000);

    markAllRead?.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/notifications/read-all?role=admin', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Immediate UI feedback
                if (notificationCount) {
                    notificationCount.textContent = '0';
                    notificationCount.style.display = 'none';
                }
                if (notificationList) {
                    notificationList.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:10px;">No new notifications</p>';
                }
                window.updateNotifications();
            }
        } catch (e) { console.error(e); }
    });

    /* ── Chat Support Logic (HISTORY INBOX) ── */
    let allChats = [];           // all raw chat records
    let activeFilterRole = 'all'; // current role filter
    let activeUserId = null;      // currently selected user session key

    // Helper: group chats into sessions by (userId + role)
    function groupChatsByUser(chats) {
        const map = new Map();
        chats.forEach(c => {
            const key = `${c.userId}_${c.role}`;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    userId: c.userId,
                    role: c.role,
                    userName: c.user ? (c.user.name || c.user.employee_name || c.user.email) : ((c.role || 'public').toLowerCase() === 'public' ? 'Public' : c.userId),
                    userEmail: c.user ? c.user.email : '',
                    lastAt: c.timestamp,
                    count: 0,
                    chats: []
                });
            }
            const session = map.get(key);
            session.chats.push(c);
            session.count++;
            if (c.status === 'NeedsAdmin') session.needsAction = true;
            if (new Date(c.timestamp) > new Date(session.lastAt)) session.lastAt = c.timestamp;
        });
        return Array.from(map.values()).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    }

    function roleBadgeColor(role) {
        const map = { public: '#e0e7ff:#3730a3', employee: '#dcfce7:#166534', manager: '#fef9c3:#854d0e', admin: '#fee2e2:#991b1b' };
        const r = (role || 'public').toLowerCase();
        const [bg, color] = (map[r] || '#f3f4f6:#374151').split(':');
        return { bg, color };
    }

    function renderSessionList(sessions) {
        const list = document.getElementById('chat-history-sessions');
        if (!list) return;
        if (sessions.length === 0) {
            list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-light);">No conversations found</div>';
            return;
        }
        list.innerHTML = sessions.map(s => {
            const { bg, color } = roleBadgeColor(s.role);
            const isActive = s.key === activeUserId;
            return `
              <div onclick="window.selectChatHistory('${s.key}')"
                   style="padding:12px 10px; cursor:pointer; border-radius:8px; margin-bottom:4px; transition:background 0.15s;
                          background:${isActive ? 'var(--primary-light,#eff6ff)' : 'transparent'};
                          border-left:3px solid ${isActive ? 'var(--primary)' : 'transparent'};">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                  <strong style="font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${s.userName}</strong>
                  <div style="display:flex; gap:4px; align-items:center;">
                    ${s.needsAction ? '<span style="background:#ef4444; color:#fff; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700; flex-shrink:0;">ACTION</span>' : ''}
                    <span style="background:${bg}; color:${color}; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:600; flex-shrink:0;">${(s.role||'public').toUpperCase()}</span>
                  </div>
                </div>
                <div style="font-size:11px; color:var(--text-light);">${s.count} messages &bull; ${new Date(s.lastAt).toLocaleDateString()}</div>
              </div>`;
        }).join('');
    }

    window.fetchChatSessions = async function() {
        const list = document.getElementById('chat-history-sessions');
        if (!list) return;
        list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-light);">Loading...</div>';

        try {
            const res = await fetch('/api/admin/chats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                allChats = data.data || [];
                applyRoleFilter(activeFilterRole);
                if (activeUserId) {
                    window.selectChatHistory(activeUserId);
                }
            } else {
                list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--danger);">Failed to load chats</div>';
            }
        } catch (e) {
            console.error('Error fetching chats:', e);
            list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--danger);">Network error</div>';
        }
    };

    function applyRoleFilter(role) {
        activeFilterRole = role;
        // Global exclusion: Admins don't need to oversee other Admin's private helpdesk chats
        let filtered = allChats.filter(c => (c.role || 'public').toLowerCase() !== 'admin');
        
        if (role !== 'all') {
            filtered = filtered.filter(c => (c.role || 'public').toLowerCase() === role);
        }
        renderSessionList(groupChatsByUser(filtered));

        // Update filter button styles
        document.querySelectorAll('.chat-filter-btn').forEach(btn => {
            const isActive = btn.dataset.role === role;
            btn.style.background = isActive ? 'var(--primary)' : '#fff';
            btn.style.color = isActive ? '#fff' : 'var(--text)';
            btn.style.borderColor = isActive ? 'var(--primary)' : 'var(--border)';
            btn.style.fontWeight = isActive ? '600' : '400';
        });
    }

    // Wire up role filter buttons
    document.querySelectorAll('.chat-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => applyRoleFilter(btn.dataset.role));
    });

    // Emoji & File handling for Admin Reply
    const adminEmojiBtn = document.getElementById('admin-emoji-btn');
    const adminEmojiPicker = document.getElementById('admin-emoji-picker');
    const adminReplyInput = document.getElementById('admin-reply-input');
    const adminFileBtn = document.getElementById('admin-file-btn');
    const adminReplyFile = document.getElementById('admin-reply-file');
    const adminFileName = document.getElementById('admin-file-name');

    if (adminEmojiBtn && adminEmojiPicker) {
        adminEmojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            adminEmojiPicker.style.display = adminEmojiPicker.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (!adminEmojiPicker.contains(e.target) && e.target !== adminEmojiBtn) {
                adminEmojiPicker.style.display = 'none';
            }
        });
        adminEmojiPicker.addEventListener('emoji-click', (e) => {
            if (adminReplyInput) {
                const start = adminReplyInput.selectionStart;
                const end = adminReplyInput.selectionEnd;
                const text = adminReplyInput.value;
                adminReplyInput.value = text.substring(0, start) + e.detail.unicode + text.substring(end);
                adminReplyInput.focus();
            }
            adminEmojiPicker.style.display = 'none';
        });
    }

    if (adminFileBtn && adminReplyFile) {
        adminFileBtn.addEventListener('click', () => adminReplyFile.click());
        adminReplyFile.addEventListener('change', () => {
            if (adminReplyFile.files.length > 0) {
                adminFileName.textContent = adminReplyFile.files[0].name;
                adminFileName.style.display = 'inline';
            } else {
                adminFileName.style.display = 'none';
            }
        });
    }

    async function sendAdminReply() {
        if (!activeUserId) return;
        if (!adminReplyInput) return;
        const content = adminReplyInput.value.trim();
        const hasFile = adminReplyFile && adminReplyFile.files.length > 0;
        
        if (!content && !hasFile) return;
        
        const [userId, role] = activeUserId.split('_');

        try {
            const formData = new FormData();
            formData.append('session_id', userId);
            formData.append('target_role', role);
            if (content) formData.append('content', content);
            else formData.append('content', 'Attached File');
            if (hasFile) formData.append('file', adminReplyFile.files[0]);

            const res = await fetch('/api/v1/chat/message', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // Let browser set multipart/form-data with boundary
                body: formData
            });

            if (res.ok) {
                adminReplyInput.value = '';
                if (adminReplyFile) adminReplyFile.value = '';
                if (adminFileName) adminFileName.style.display = 'none';
                window.fetchChatSessions(); // Re-fetch chats to display the new message and update left side
            }
        } catch (e) { console.error('Error sending admin reply:', e); }
    }

    document.getElementById('admin-reply-send')?.addEventListener('click', sendAdminReply);
    document.getElementById('admin-reply-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAdminReply(); });

    window.selectChatHistory = function(key) {
        activeUserId = key;
        applyRoleFilter(activeFilterRole); // re-render to highlight selection

        // Find all chats for this user
        const [userId, role] = key.split('_');
        const userChats = allChats.filter(c => String(c.userId) === String(userId) && c.role === role)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const userName = userChats[0]?.user ? (userChats[0].user.name || userChats[0].user.employee_name || userChats[0].user.email) : ((role || 'public').toLowerCase() === 'public' ? 'Public' : userId);
        const { bg, color } = roleBadgeColor(role);

        const titleEl = document.getElementById('chat-history-user-title');
        const sessionObj = groupChatsByUser(allChats).find(s => s.key === key);
        if (titleEl) {
            titleEl.innerHTML = `${userName} ${sessionObj?.needsAction ? '<span style="background:#ef4444; color:#fff; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:700; margin-left:12px; vertical-align:middle;">ACTION NEEDED</span>' : ''}`;
        }

        const badgeEl = document.getElementById('chat-history-role-badge');
        if (badgeEl) {
            badgeEl.textContent = (role || 'public').toUpperCase();
            badgeEl.style.background = bg;
            badgeEl.style.color = color;
        }

        const latestStatus = userChats.length > 0 ? userChats[userChats.length - 1].status : null;
        const isClosed = latestStatus === 'Closed';

        const replyArea = document.getElementById('admin-reply-area');
        if (replyArea) {
            replyArea.style.display = isClosed ? 'none' : 'flex';
        }

        const closeBtn = document.getElementById('close-session-btn');
        if (closeBtn) {
            closeBtn.style.display = isClosed ? 'none' : 'block';
            closeBtn.onclick = async () => {
                if (confirm('Are you sure you want to officially close this chat session?')) {
                    try {
                        const res = await fetch(`/api/v1/chat/session/${userId}/close`, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            alert('Session marked as closed.');
                            window.fetchChatSessions();
                        }
                    } catch (e) {
                        console.error('Error closing session:', e);
                    }
                }
            };
        }

        const container = document.getElementById('chat-history-messages');
        if (!container) return;

        if (userChats.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-light); margin-top:60px;">No messages found</p>';
            if (closeBtn) closeBtn.style.display = 'none';
            if (replyArea) replyArea.style.display = 'none';
            return;
        }

        container.innerHTML = userChats.map(c => {
            const hasFile = c.fileUrl || c.filename;
            const fileHTML = hasFile ? `
              <div style="margin-top:8px; padding:8px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; font-size:12px;">
                📎 <a href="${c.fileUrl || `/uploads/${c.filename}`}" target="_blank" style="color:#0ea5e9; text-decoration:underline;">${c.filename || 'Attached File'}</a>
              </div>` : '';

            let bubbles = '';

            // 1. Render Admin's native message
            if (c.sender_type === 'Admin') {
                 bubbles += `
                  <div style="display:flex; flex-direction:column; gap:4px; align-self:flex-end; max-width:75%; margin-top:8px;">
                    <div style="font-size:11px; color:var(--text-light); padding-right:4px; text-align:right;">Admin Support &bull; ${new Date(c.timestamp).toLocaleString()}</div>
                    <div style="background:var(--primary); color:#fff; border:1px solid var(--primary-dark); padding:10px 14px; border-radius:12px 12px 2px 12px; font-size:14px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                      ${c.message || ''}
                      ${fileHTML}
                    </div>
                  </div>
                 `;
            } else {
                 // 2. Render User message bubble
                 bubbles += `
                  <!-- User message bubble -->
                  <div style="display:flex; flex-direction:column; gap:4px; align-self:flex-start; max-width:75%; margin-top:8px;">
                    <div style="font-size:11px; color:var(--text-light); padding-left:4px;">${userName} &bull; ${new Date(c.timestamp).toLocaleString()}</div>
                    <div style="background:#fff; border:1px solid var(--border); padding:10px 14px; border-radius:12px 12px 12px 2px; font-size:14px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                      ${c.message || ''}
                      ${fileHTML}
                    </div>
                  </div>
                 `;
            }

            // 3. Render Bot (or admin-edited) response bubble if exists
            if (c.response) {
              bubbles += `
              <!-- Bot (or admin-edited) response bubble -->
              <div style="display:flex; flex-direction:column; gap:4px; align-self:flex-end; max-width:75%;">
                <div style="font-size:11px; color:var(--text-light); padding-right:4px; text-align:right;">Bot Response &bull; ${new Date(c.timestamp).toLocaleString()}</div>
                <div style="background:var(--primary-light,#eff6ff); border:1px solid #bfdbfe; padding:10px 14px; border-radius:12px 12px 2px 12px; font-size:14px; box-shadow:0 1px 2px rgba(0,0,0,0.05); position:relative;">
                  <div id="response-text-${c.id}">${c.response}</div>
                  <button onclick="window.openEditResponse(${c.id}, \`${(c.message||'').replace(/`/g,"'").replace(/"/g,"&quot;")}\`, \`${(c.response||'').replace(/`/g,"'").replace(/"/g,"&quot;")}\`)"
                          style="margin-top:8px; font-size:11px; padding:3px 10px; border:1px solid #93c5fd; border-radius:4px; background:#fff; color:#1d4ed8; cursor:pointer;">
                    ✏️ Edit Response
                  </button>
                </div>
              </div>`;
            }

            return bubbles;
        }).join('');

        container.scrollTop = container.scrollHeight;
    };

    window.openEditResponse = function(chatId, originalMsg, currentResponse) {
        document.getElementById('edit-response-chat-id').value = chatId;
        document.getElementById('edit-modal-original-msg').textContent = originalMsg;
        document.getElementById('edit-response-textarea').value = currentResponse;
        const modal = document.getElementById('edit-response-modal');
        modal.style.display = 'flex';
    };

    window.saveEditedResponse = async function() {
        const chatId = document.getElementById('edit-response-chat-id').value;
        const newResponse = document.getElementById('edit-response-textarea').value.trim();
        if (!newResponse) return alert('Response cannot be empty');
        try {
            const res = await fetch(`/api/admin/chat/${chatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ response: newResponse })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                // Update in-memory + re-render
                const chat = allChats.find(c => c.id == chatId);
                if (chat) chat.response = newResponse;
                document.getElementById('edit-response-modal').style.display = 'none';
                // Trigger full refresh to update list and thread
                window.fetchChatSessions();
                if (activeUserId) window.selectChatHistory(activeUserId);
            } else {
                alert(data.error || 'Failed to save response');
            }
        } catch (e) {
            console.error('Error saving response:', e);
            alert('Error: ' + e.message);
        }
    };

    // Close modal on backdrop click
    document.getElementById('edit-response-modal')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });





});
