/* ── Employee Dashboard JS ── */

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('shnoor_token');
    if (!token) {
        window.location.href = 'index.html#login';
        return;
    }

    const pageTitle = document.getElementById('page-title');
    const links = document.querySelectorAll('.sidebar-link');
    const views = document.querySelectorAll('.view');
    const emailDisplay = document.getElementById('employee-email-display');

    if (emailDisplay) {
        emailDisplay.textContent = sessionStorage.getItem('shnoor_admin_email') || 'emp@shnoor.com';
    }

    // Unified API Call
    async function apiCall(endpoint, method = 'GET', body = null) {
        const timestamp = new Date().getTime();
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `/api/v1/employee/${endpoint}${separator}nocache=${timestamp}`;
        
        const options = {
            method,
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Accept': 'application/json'
            }
        };
        if(body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || `Server error (${res.status})`);
        }
        return await res.json();
    }

    function loadData(viewId) {
        if(viewId === 'view-dashboard') fetchDashboard();
        if(viewId === 'view-attendance') fetchAttendance();
        if(viewId === 'view-leaves') fetchLeaves();
        if(viewId === 'view-assets') fetchAssets();
        if(viewId === 'view-calendar') fetchHolidays();
        if(viewId === 'view-appreciations') fetchAppreciations();
        if(viewId === 'view-offboarding') fetchOffboardings();
        if(viewId === 'view-expenses') fetchExpenses();
        if(viewId === 'view-payroll') fetchPayroll();
        if(viewId === 'view-policies') fetchPolicies();
        if(viewId === 'view-profile') fetchProfile();
    }

    // Navigation logic
    const sections = {
        'nav-dashboard': 'view-dashboard',
        'nav-attendance': 'view-attendance',
        'nav-leaves': 'view-leaves',
        'nav-assets': 'view-assets',
        'nav-calendar': 'view-calendar',
        'nav-appreciations': 'view-appreciations',
        'nav-offboarding': 'view-offboarding',
        'nav-expenses': 'view-expenses',
        'nav-payroll': 'view-payroll',
        'nav-policies': 'view-policies',
        'nav-profile': 'view-profile'
    };

    links.forEach(link => {
        if(link.id === 'nav-logout') return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = sections[link.id];
            if(!viewId) return;

            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(viewId).classList.remove('hidden');
            pageTitle.textContent = link.textContent.trim();
            
            loadData(viewId);
        });
    });

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

    // --- DASHBOARD ---
    async function fetchDashboard() {
        try {
            const res = await apiCall('dashboard');
            const d = res.data;
            document.getElementById('d-att-status').textContent = d.todayStatus;
            document.getElementById('d-work-hours').textContent = d.totalWorkingHours;
            document.getElementById('d-late-count').textContent = d.lateAttendanceCount;
            document.getElementById('d-asset-count').textContent = d.assetCount;
            document.getElementById('d-emp-name').textContent = d.employee.name;
            document.getElementById('d-emp-join').textContent = d.employee.joining_date || 'N/A';
            document.getElementById('d-emp-dept').textContent = d.employee.department || 'N/A';
            document.getElementById('d-emp-desig').textContent = d.employee.designation || 'N/A';

            document.getElementById('dash-app-list').innerHTML = d.recentActivities.appreciations.map(a => `
                <tr><td><strong>${a.title}</strong><br/><small>${a.date}</small></td></tr>
            `).join('') || '<tr><td>No recent appreciations</td></tr>';
        } catch(e) { console.error(e); }
    }

    // --- ATTENDANCE ---
    async function fetchAttendance() {
        try {
            const res = await apiCall('attendance');
            const records = res.data;
            const today = new Date().toISOString().split('T')[0];
            
            // Logic for multiple clock-in/out:
            // Find if there is an ACTIVE record (clock_out is null) regardless of date
            const activeRec = records.find(r => r.clock_out === null);

            const inBtn = document.getElementById('btn-clock-in');
            const outBtn = document.getElementById('btn-clock-out');

            if (activeRec) {
                // If active record exists, must clock out
                inBtn.disabled = true;
                outBtn.disabled = false;
            } else {
                // If no active record, can clock in
                inBtn.disabled = false;
                outBtn.disabled = true;
            }

            document.getElementById('att-list').innerHTML = records.map(r => `
                <tr>
                    <td>${r.date}</td>
                    <td>${new Date(r.clock_in).toLocaleTimeString()}</td>
                    <td>${r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : '---'}</td>
                    <td>${r.work_duration || '0'}</td>
                    <td><span class="badge ${r.status==='Present'?'bg-green':'bg-yellow'}">${r.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;">No history found</td></tr>';
        } catch(e) {}
    }

    document.getElementById('btn-clock-in')?.addEventListener('click', async () => {
        try {
            await apiCall('attendance/clock-in', 'POST');
            fetchAttendance();
        } catch(e) { alert(e.message); }
    });

    document.getElementById('btn-clock-out')?.addEventListener('click', async () => {
        try {
            await apiCall('attendance/clock-out', 'POST');
            fetchAttendance();
        } catch(e) { alert(e.message); }
    });

    // --- LEAVES ---
    async function fetchLeaves() {
        try {
            const res = await apiCall('leaves');
            document.getElementById('lv-list').innerHTML = res.data.map(l => `
                <tr>
                    <td>${l.start_date} to ${l.end_date}</td>
                    <td>${l.leave_type}</td>
                    <td><span class="badge ${l.status==='Approved'?'bg-green':(l.status==='Rejected'?'bg-red':'bg-yellow')}">${l.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;">No leave requests</td></tr>';
        } catch(e) {}
    }

    document.getElementById('form-leave')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('leaves', 'POST', {
                leave_type: document.getElementById('lv-type').value,
                start_date: document.getElementById('lv-start').value,
                end_date: document.getElementById('lv-end').value,
                reason: document.getElementById('lv-reason').value
            });
            alert('Leave request submitted');
            document.getElementById('form-leave').reset();
            fetchLeaves();
        } catch(e) { alert(e.message); }
    });

    // --- ASSETS ---
    async function fetchAssets() {
        try {
            const res = await apiCall('assets');
            document.getElementById('ass-list').innerHTML = res.data.map(a => `
                <tr>
                    <td>${a.asset_name}</td>
                    <td>${a.asset_category}</td>
                    <td>${a.serial_number || 'N/A'}</td>
                    <td><span class="badge ${a.status==='Available'?'bg-green':'bg-yellow'}">${a.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;">No assets assigned</td></tr>';
        } catch(e) {}
    }

    // --- HOLIDAYS ---
    async function fetchHolidays() {
        try {
            const res = await apiCall('holidays');
            document.getElementById('holi-list').innerHTML = res.data.map(h => `
                <tr>
                    <td><strong>${h.holiday_name}</strong></td>
                    <td>${h.date}</td>
                    <td>${h.description || ''}</td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;">No upcoming holidays</td></tr>';
        } catch(e) {}
    }

    // --- APPRECIATIONS ---
    async function fetchAppreciations() {
        try {
            const res = await apiCall('appreciations');
            document.getElementById('app-list').innerHTML = res.data.map(a => `
                <tr>
                    <td><strong>${a.title}</strong></td>
                    <td>${a.description || ''}</td>
                    <td>${a.date}</td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;">No appreciations yet</td></tr>';
        } catch(e) {}
    }

    // --- OFFBOARDING ---
    async function fetchOffboardings() {
        try {
            const res = await apiCall('offboarding');
            document.getElementById('off-list').innerHTML = res.data.map(o => `
                <tr>
                    <td>${o.last_working_date}</td>
                    <td><span class="badge ${o.status==='Completed'?'bg-green':'bg-yellow'}">${o.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="2" style="text-align:center;">No requests</td></tr>';
        } catch(e) {}
    }

    document.getElementById('form-off')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('offboarding', 'POST', {
                reason: document.getElementById('off-reason').value,
                last_working_date: document.getElementById('off-date').value
            });
            alert('Resignation request submitted');
            document.getElementById('form-off').reset();
            fetchOffboardings();
        } catch(e) { alert(e.message); }
    });

    // --- EXPENSES ---
    async function fetchExpenses() {
        try {
            const res = await apiCall('expenses');
            document.getElementById('exp-list').innerHTML = res.data.map(ex => `
                <tr>
                    <td>${ex.title}</td>
                    <td>$${ex.amount}</td>
                    <td><span class="badge ${ex.status==='Approved'?'bg-green':(ex.status==='Rejected'?'bg-red':'bg-yellow')}">${ex.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;">No claims</td></tr>';
        } catch(e) {}
    }

    document.getElementById('form-exp')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('expenses', 'POST', {
                title: document.getElementById('exp-title').value,
                amount: document.getElementById('exp-amt').value,
                category: document.getElementById('exp-cat').value
            });
            alert('Expense claim submitted');
            document.getElementById('form-exp').reset();
            fetchExpenses();
        } catch(e) { alert(e.message); }
    });

    // --- PAYROLL ---
    async function fetchPayroll() {
        try {
            const res = await apiCall('payslips');
            document.getElementById('pay-list').innerHTML = res.data.map(s => `
                <tr>
                    <td>${s.payment_date || 'N/A'}</td>
                    <td>$${s.net_salary}</td>
                    <td>${s.payment_date}</td>
                    <td><button onclick="downloadPayslip(${s.payslip_id})" class="btn btn-outline" style="font-size:11px; padding:4px 8px;">Download</button></td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;">No payslips available</td></tr>';
        } catch(e) {}
    }

    window.downloadPayslip = async (id) => {
        try {
            const res = await fetch(`/api/v1/employee/payslips/${id}/download`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('shnoor_token')}` }
            });
            if(!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${id}.html`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch(err) { alert(err.message); }
    };

    // --- POLICIES ---
    async function fetchPolicies() {
        try {
            const res = await apiCall('policies');
            document.getElementById('pol-list').innerHTML = res.data.map(p => `
                <tr>
                    <td><strong>${p.title}</strong></td>
                    <td>${p.description}</td>
                    <td><a href="${p.file_url}" target="_blank" style="color:var(--primary);">View</a></td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;">No policies found</td></tr>';
        } catch(e) {}
    }

    // --- PROFILE ---
    async function fetchProfile() {
        try {
            const res = await apiCall('profile');
            const p = res.data;
            document.getElementById('prof-name').value = p.employee_name;
            document.getElementById('prof-email').value = p.email;
            document.getElementById('prof-phone').value = p.phone || '';
        } catch(e) {}
    }

    document.getElementById('form-profile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('profile', 'PUT', {
                employee_name: document.getElementById('prof-name').value,
                phone: document.getElementById('prof-phone').value
            });
            alert('Profile updated');
        } catch(e) { alert(e.message); }
    });

    document.getElementById('form-pass')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('profile/password', 'PUT', {
                currentPassword: document.getElementById('pass-curr').value,
                newPassword: document.getElementById('pass-new').value
            });
            alert('Password changed successfully');
            document.getElementById('form-pass').reset();
        } catch(e) { alert(e.message); }
    });

    // --- Notification System Logic ---
    const notifTrigger = document.getElementById('notification-trigger');
    const notifDropdown = document.getElementById('notification-dropdown');
    const notifCount = document.getElementById('notification-count');
    const notifList = document.getElementById('notification-list');
    const markAllReadBtn = document.getElementById('mark-all-read');

    notifTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        notifDropdown?.classList.add('hidden');
    });

    window.fetchNotifications = async function() {
        const email = sessionStorage.getItem('shnoor_admin_email') || 'emp@shnoor.com';
        try {
            const res = await fetch(`/api/notifications?userId=${encodeURIComponent(email)}&role=employee`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const unread = data.data.filter(n => !n.isRead);
                if (unread.length > 0) {
                    notifCount.textContent = unread.length;
                    notifCount.style.display = 'block';
                } else {
                    notifCount.style.display = 'none';
                }

                if (data.data.length > 0) {
                    notifList.innerHTML = data.data.map(n => `
                        <div class="notif-item ${n.isRead ? '' : 'unread'}" style="padding:10px; border-bottom:1px solid var(--border); font-size:0.9rem; ${n.isRead ? '' : 'background:#f0f7ff;'}">
                            <div style="font-weight:${n.isRead ? '400' : '600'};">${n.message}</div>
                            <div style="font-size:0.75rem; color:var(--text-light); margin-top:4px;">${new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('');
                } else {
                    notifList.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:10px;">No notifications</p>';
                }
            }
        } catch (e) {
            console.error('Error fetching notifications:', e);
        }
    };

    markAllReadBtn?.addEventListener('click', async () => {
        const email = sessionStorage.getItem('shnoor_admin_email') || 'emp@shnoor.com';
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: email, role: 'employee' })
            });
            window.fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    });

    // Start notification polling
    window.fetchNotifications();
    setInterval(window.fetchNotifications, 30000); // every 30s

    // Initial Load
    fetchDashboard();
});
