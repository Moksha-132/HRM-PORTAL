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
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || `Server error (${res.status})`);
        }
        return await res.json();
    }

    function loadData(viewId) {
        if (viewId === 'view-dashboard') fetchDashboard();
        if (viewId === 'view-attendance') fetchAttendance();
        if (viewId === 'view-leaves') fetchLeaves();
        if (viewId === 'view-assets') fetchAssets();
        if (viewId === 'view-calendar') fetchHolidays();
        if (viewId === 'view-appreciations') fetchAppreciations();
        if (viewId === 'view-offboarding') fetchOffboardings();
        if (viewId === 'view-expenses') fetchExpenses();
        if (viewId === 'view-payroll') fetchPayroll();
        if (viewId === 'view-policies') fetchPolicies();
        if (viewId === 'view-profile') fetchProfile();
        if (viewId === 'view-letters') fetchLetters();
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
        'nav-letters': 'view-letters',
        'nav-profile': 'view-profile'
    };

    links.forEach(link => {
        if (link.id === 'nav-logout') return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = sections[link.id];
            if (!viewId) return;

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
        } catch (e) { console.error(e); }
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
                    <td><span class="badge ${r.status === 'Present' ? 'bg-green' : 'bg-yellow'}">${r.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;">No history found</td></tr>';
        } catch (e) { }
    }

    document.getElementById('btn-clock-in')?.addEventListener('click', async () => {
        try {
            await apiCall('attendance/clock-in', 'POST');
            fetchAttendance();
        } catch (e) { alert(e.message); }
    });

    document.getElementById('btn-clock-out')?.addEventListener('click', async () => {
        try {
            await apiCall('attendance/clock-out', 'POST');
            fetchAttendance();
        } catch (e) { alert(e.message); }
    });

    // --- LEAVES ---
    async function fetchLeaves() {
        try {
            const res = await apiCall('leaves');
            document.getElementById('lv-list').innerHTML = res.data.map(l => `
                <tr>
                    <td>${l.start_date} to ${l.end_date}</td>
                    <td>${l.leave_type}</td>
                    <td><span class="badge ${l.status === 'Approved' ? 'bg-green' : (l.status === 'Rejected' ? 'bg-red' : 'bg-yellow')}">${l.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;">No leave requests</td></tr>';
        } catch (e) { }
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
        } catch (e) { alert(e.message); }
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
                    <td><span class="badge ${a.status === 'Available' ? 'bg-green' : 'bg-yellow'}">${a.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;">No assets assigned</td></tr>';
        } catch (e) { }
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
        } catch (e) { }
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
        } catch (e) { }
    }

    // --- OFFBOARDING ---
    async function fetchOffboardings() {
        try {
            const res = await apiCall('offboarding');
            document.getElementById('off-list').innerHTML = res.data.map(o => `
                <tr>
                    <td>${o.last_working_date}</td>
                    <td><span class="badge ${o.status === 'Completed' ? 'bg-green' : 'bg-yellow'}">${o.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="2" style="text-align:center;">No requests</td></tr>';
        } catch (e) { }
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
        } catch (e) { alert(e.message); }
    });

    // --- EXPENSES ---
    async function fetchExpenses() {
        try {
            const res = await apiCall('expenses');
            document.getElementById('exp-list').innerHTML = res.data.map(ex => `
                <tr>
                    <td>${ex.title}</td>
                    <td>$${ex.amount}</td>
                    <td><span class="badge ${ex.status === 'Approved' ? 'bg-green' : (ex.status === 'Rejected' ? 'bg-red' : 'bg-yellow')}">${ex.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;">No claims</td></tr>';
        } catch (e) { }
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
        } catch (e) { alert(e.message); }
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
        } catch (e) { }
    }

    window.downloadPayslip = async (id) => {
        try {
            const res = await fetch(`/api/v1/employee/payslips/${id}/download`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('shnoor_token')}` }
            });
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${id}.html`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) { alert(err.message); }
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
        } catch (e) { }
    }

    // --- PROFILE ---
    async function fetchProfile() {
        try {
            const res = await apiCall('profile');
            const p = res.data;
            document.getElementById('prof-name').value = p.employee_name;
            document.getElementById('prof-email').value = p.email;
            document.getElementById('prof-phone').value = p.phone || '';
        } catch (e) { }
    }

    document.getElementById('form-profile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await apiCall('profile', 'PUT', {
                employee_name: document.getElementById('prof-name').value,
                phone: document.getElementById('prof-phone').value
            });
            alert('Profile updated');
        } catch (e) { alert(e.message); }
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
        } catch (e) { alert(e.message); }
    });

    // --- LETTERS ---
    async function fetchLetters() {
        try {
            const res = await apiCall('letters');
            window.letterData = res.data; // cache for download
            document.getElementById('letter-list').innerHTML = res.data.map(l => `
                <tr>
                    <td><strong>${l.title}</strong></td>
                    <td>${l.Sender ? l.Sender.employee_name : 'N/A'}</td>
                    <td><span class="badge ${l.status === 'Sent' ? 'bg-green' : 'bg-yellow'}">${l.status === 'Sent' ? 'Received' : l.status}</span></td>
                    <td>${new Date(l.created_at).toLocaleString()}</td>
                    <td>
                        <button onclick="previewLetter(${l.letter_id})" class="action-btn" style="color:var(--text-light);" title="Preview Letter"><i class="fas fa-eye"></i></button>
                        <button onclick="editLetter(${l.letter_id})" class="action-btn edit-btn" title="Edit Content"><i class="fas fa-edit"></i></button>
                        <button onclick="downloadLetterText(${l.letter_id})" class="action-btn" style="color:var(--primary);" title="Download Document"><i class="fas fa-download"></i></button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" style="text-align:center;">No letters found</td></tr>';
        } catch (e) { }
    }

    window.fetchLetters = fetchLetters;

    window.openEditModal = (title, id, fields, onSave) => {
        const modal = document.getElementById('edit-modal');
        const form = document.getElementById('edit-form');
        document.getElementById('modal-title').textContent = 'Edit ' + title;
        form.innerHTML = fields.map(f => {
            const inputId = `m-field-${f.key}`;
            const label = `<label class="form-label">${f.label}</label>`;
            if (f.type === 'textarea') {
                return `<div>${label}<textarea id="${inputId}" class="input" rows="8">${f.value || ''}</textarea></div>`;
            } else {
                return `<div>${label}<input type="${f.type}" id="${inputId}" class="input" value="${f.value || ''}"></div>`;
            }
        }).join('');

        const saveBtn = document.getElementById('modal-save-btn');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.addEventListener('click', async () => {
            const data = {};
            fields.forEach(f => { data[f.key] = document.getElementById(`m-field-${f.key}`).value; });
            await onSave(data);
            document.getElementById('edit-modal').classList.add('hidden');
        });
        modal.classList.remove('hidden');
    };

    // --- Quill ---
    if (window.Quill) {
        window.editLetterQuill = new Quill('#edit-letter-content-editor', {
            theme: 'snow',
            modules: { toolbar: [[{ font: [] }], [{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]] }
        });
    }

    window.previewLetter = (id) => {
        const item = window.letterData.find(x => x.letter_id == id);
        if (!item) return;
        
        const todayDate = new Date().toISOString().split('T')[0];
        
        document.getElementById('preview-letter-title').textContent = 'Letter Preview';
        document.getElementById('preview-letter-body').innerHTML = `
            <div style="text-align: left; margin-bottom: 30px;">
                <img src="/logo.avif" alt="Logo" style="max-height: 80px;">
            </div>
            
            <div style="text-align: center; font-size: 18px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; text-transform: uppercase;">
                ${item.title}
            </div>
            
            <div style="margin-bottom: 20px;">
                Date: ${todayDate}<br><br>
            </div>
            
            <div style="white-space: pre-wrap; margin-bottom: 40px; text-align: justify; font-size: 14px; line-height: 1.6; color: #000;">
                ${item.content}
            </div>
            
            <div style="margin-top: 60px;">
                <strong>Thanks & Regards</strong><br>
                <strong>Hiring Team - SHNOOR International LLC</strong><br>
                <span style="font-size: 10px; color: #666;">Mount Tabor Road, Odessa, Missouri, US | Ph: +91-9429694298</span><br>
                <div style="text-align: left; margin-top: 15px;">
                    <img src="/signature.png" alt="Signature" style="max-height: 80px;">
                </div>
            </div>
        `;

        document.getElementById('preview-letter-modal').classList.remove('hidden');
    };

    window.editLetter = async (id) => {
        if (!window.letterData) await fetchLetters();
        const item = window.letterData.find(x => x.letter_id == id);
        if (!item) return;

        document.getElementById('edit-letter-title').value = item.title;
        if (window.editLetterQuill) window.editLetterQuill.root.innerHTML = item.content;

        document.getElementById('edit-letter-modal').classList.remove('hidden');

        document.getElementById('modal-letter-save-btn').onclick = async () => {
            const newContent = window.editLetterQuill ? window.editLetterQuill.root.innerHTML : '';
            if (!newContent || newContent === '<p><br></p>') return alert("Content cannot be empty");

            try {
                await apiCall('letters/' + id, 'PUT', { content: newContent });
                document.getElementById('edit-letter-modal').classList.add('hidden');
                fetchLetters();
            } catch (e) { alert(e.message); }
        };
    };

    window.downloadLetterText = async (id) => {
        if (!window.letterData) await fetchLetters();
        const item = window.letterData.find(x => x.letter_id == id);
        if (!item) return;

        const element = document.createElement('div');
        element.style.padding = '40px';
        element.style.fontFamily = "'Segoe UI', Arial, sans-serif";
        element.style.color = '#000';
        element.style.lineHeight = '1.5';
        element.style.fontSize = '12px';

        const todayDate = new Date().toISOString().split('T')[0];
        const empName = item.Recipient ? item.Recipient.employee_name : 'Employee';

        // Strip out "Dear [Name]" from the beginning of the content even if wrapped in HTML tags
        const cleanedContent = item.content.replace(/^(<p>)?\s*Dear\s+.*?<\/p>[\r\n\s]*/i, '');

        element.innerHTML = `
            <div style="text-align: left; margin-bottom: 30px;">
                <img id="pdf-logo" src="logo.avif" alt="SHNOOR Logo" style="max-height: 80px;">
            </div>
            
            <div style="text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">
                ${item.title}
            </div>
            
            <div style="margin-bottom: 20px;">
                Date: ${todayDate}<br><br>
            </div>
            
            <div style="white-space: pre-wrap; margin-bottom: 40px; text-align: justify; color: #000;">${cleanedContent}</div>
            
            <div style="margin-top: 60px;">
                <strong>Thanks & Regards</strong><br>
                <strong>Hiring Team - SHNOOR International LLC</strong><br>
                Mount Tabor Road, Odessa, Missouri, United States, Ph: +91-9429694298<br>
                www.shnoor.com<br><br>
                <div style="text-align: left; margin-top: 20px;">
                    <img id="pdf-signature" src="signature.png" alt="Signature and Stamp" style="max-height: 150px;">
                </div>
            </div>
        `;

        const opt = {
            margin: [40, 20, 25, 20],
            filename: item.title.replace(/\s+/g, '_') + '_' + id + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const generatePdf = () => {
            if (window.html2pdf) {
                const logoImg = element.querySelector('#pdf-logo');
                let logoDataURL = null;
                let aspect = 1;
                
                if (logoImg && logoImg.complete && logoImg.naturalWidth > 0 && String(logoImg.src).indexOf('base64') === -1) {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = logoImg.naturalWidth;
                        canvas.height = logoImg.naturalHeight;
                        aspect = canvas.height / canvas.width;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(logoImg, 0, 0);
                        logoDataURL = canvas.toDataURL('image/png');
                        logoImg.parentNode.style.display = 'none'; // hide in HTML
                    } catch(e) { console.error('Error extracting logo:', e); }
                } else if (logoImg && String(logoImg.src).indexOf('base64') !== -1) {
                    logoDataURL = logoImg.src;
                    aspect = logoImg.naturalHeight / logoImg.naturalWidth;
                    logoImg.parentNode.style.display = 'none';
                }

                html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
                    const totalPages = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        if (logoDataURL) {
                            let drawWidth = 50;
                            let drawHeight = 50 * aspect;
                            if (drawHeight > 22) {
                                drawHeight = 22;
                                drawWidth = 22 / aspect;
                            }
                            pdf.addImage(logoDataURL, 'PNG', 20, 10, drawWidth, drawHeight);
                        } else {
                            // Fallback text
                            pdf.setFontSize(22);
                            pdf.setTextColor(79, 110, 247);
                            pdf.text("shnoor", 20, 15);
                        }
                    }
                }).save();
            } else {
                alert('PDF generation library is loading. Please try again.');
            }
        };

        // footer image
        const images = Array.from(element.querySelectorAll('img'));
        const imagePromises = images.map(img => {
            return new Promise((resolve) => {
                if (img.complete && img.naturalWidth > 0) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = () => {
                        // Fallbacks if images fail to load
                        if (img.id === 'pdf-logo') {
                            img.outerHTML = '<div style="font-size: 28px; font-weight: bold; color: #4f6ef7; letter-spacing: 1px;">shnoor</div>';
                        } else {
                            img.style.display = 'none';
                        }
                        resolve();
                    };
                }
            });
        });

        Promise.all(imagePromises).then(() => {
            generatePdf();
        });
    };

    // --- Notification System Logic ---
    const notifTrigger = document.getElementById('notification-trigger');
    const notifDropdown = document.getElementById('notification-dropdown');
    const notifCount = document.getElementById('notification-count');
    const notifList = document.getElementById('notification-list');
    const markAllReadBtn = document.getElementById('mark-all-read');
    const announcedNotificationIds = new Set();

    function ensurePopupHost() {
        let host = document.getElementById('popup-notification-host');
        if (host) return host;
        host = document.createElement('div');
        host.id = 'popup-notification-host';
        host.style.position = 'fixed';
        host.style.top = '20px';
        host.style.right = '20px';
        host.style.zIndex = '9999';
        host.style.display = 'flex';
        host.style.flexDirection = 'column';
        host.style.gap = '10px';
        document.body.appendChild(host);
        return host;
    }

    function playNotificationSound() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            const ctx = new Ctx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.36);
            osc.onended = () => ctx.close();
        } catch (e) {
            // Ignore sound playback failures (browser autoplay/audio restrictions)
        }
    }

    function showPopupNotification(notification) {
        const host = ensurePopupHost();
        const popup = document.createElement('div');
        popup.style.width = '320px';
        popup.style.maxWidth = '86vw';
        popup.style.background = '#ffffff';
        popup.style.border = '1px solid var(--border)';
        popup.style.borderLeft = '4px solid var(--primary)';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
        popup.style.padding = '12px 14px';
        popup.style.color = 'var(--text-dark)';
        popup.innerHTML = `
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
                <div>
                    <div style="font-size:12px; color:var(--primary); font-weight:700; margin-bottom:4px;">New Notification</div>
                    <div style="font-size:13px; line-height:1.4; font-weight:600;">${notification.message}</div>
                    <div style="font-size:11px; color:var(--text-light); margin-top:6px;">${new Date(notification.timestamp).toLocaleString()}</div>
                </div>
                <button type="button" aria-label="Close" style="border:none; background:transparent; color:var(--text-light); font-size:16px; cursor:pointer;">&times;</button>
            </div>
        `;
        const closeBtn = popup.querySelector('button');
        closeBtn?.addEventListener('click', () => popup.remove());
        host.appendChild(popup);
        playNotificationSound();
        setTimeout(() => {
            if (popup.parentNode) popup.remove();
        }, 7000);
    }

    function announceUnreadNotifications(unread) {
        unread.forEach((n) => {
            if (announcedNotificationIds.has(n.id)) return;
            announcedNotificationIds.add(n.id);
            showPopupNotification(n);
        });
    }

    notifTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown?.classList.toggle('hidden');
        
        // Request desktop notification permission on user gesture if not already decided
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    });

    document.addEventListener('click', () => {
        notifDropdown?.classList.add('hidden');
    });

    window.fetchNotifications = async function () {
        const email = sessionStorage.getItem('shnoor_admin_email') || 'emp@shnoor.com';
        try {
            const res = await fetch(`/api/notifications?userId=${encodeURIComponent(email)}&role=employee`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const unread = data.data.filter(n => !n.isRead);
                announceUnreadNotifications(unread);
                if (unread.length > 0) {
                    notifCount.textContent = unread.length;
                    notifCount.style.display = 'block';
                } else {
                    notifCount.style.display = 'none';
                }

                if (unread.length > 0) {
                    notifList.innerHTML = unread.map(n => `
                        <div class="notif-item unread" style="padding:10px; border-bottom:1px solid var(--border); font-size:0.9rem; background:#f0f7ff;">
                            <div style="font-weight:600;">${n.message}</div>
                            <div style="font-size:0.75rem; color:var(--text-light); margin-top:4px;">${new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('');
                } else {
                    notifList.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:10px;">No new notifications</p>';
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

    // Real-time Socket.IO and Desktop Notifications
    if (typeof io !== 'undefined') {
        const socket = io();
        const email = sessionStorage.getItem('shnoor_admin_email');
        if (email) {
            socket.emit('join_room', email);
        }

        // Request permission early
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        socket.on('new_notification', (data) => {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(data.title || 'New Notification', {
                    body: data.message
                });
            } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(data.title || 'New Notification', {
                            body: data.message
                        });
                    }
                });
            }
            
            // Show HUD popup 
            showPopupNotification(data);
            // Refresh notification API count
            window.fetchNotifications();
        });
    }

    // Initial Load
    fetchDashboard();
});
