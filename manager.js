document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('shnoor_token');
    if (!token) {
        window.location.href = 'index.html#login';
        return;
    }

    const pageTitle = document.getElementById('page-title');
    const links = document.querySelectorAll('.sidebar-link');
    const views = document.querySelectorAll('.view');
    const emailDisplay = document.getElementById('manager-email-display');

    if (emailDisplay) {
        const storedEmail = sessionStorage.getItem('shnoor_admin_email') || sessionStorage.getItem('shnoor_email');
        if (storedEmail) emailDisplay.textContent = storedEmail;
    }

    // Navigation logic
    links.forEach(link => {
        if (link.id === 'nav-logout') return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const section = link.id.split('-')[1];
            const targetId = 'view-' + section;
            views.forEach(v => v.classList.add('hidden'));

            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.remove('hidden');
            pageTitle.textContent = link.textContent.trim();

            loadDataForView(targetId);
        });
    });

    // Unified API Call with cache busting and better error handling
    async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
        const timestamp = new Date().getTime();
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `/api/v1/manager/${endpoint}${separator}nocache=${timestamp}`;

        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Accept': 'application/json'
            }
        };

        if (!isFormData) {
            options.headers['Content-Type'] = 'application/json';
            if (body) options.body = JSON.stringify(body);
        } else {
            options.body = body;
        }

        const res = await fetch(url, options);
        let result;
        const contentType = res.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            result = await res.json();
        } else {
            const text = await res.text();
            console.error("Non-JSON response:", text);
            throw new Error(`Server returned non-JSON response (${res.status}). Please check server logs.`);
        }

        if (!res.ok) {
            throw new Error(result.error || `Server error (${res.status})`);
        }
        return result;
    }

    // Explicitly scope refresh functions to window for global access
    window.refreshTable = (tbodyId) => {
        const tbody = document.getElementById(tbodyId);
        if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px;">Refreshing data...</td></tr>';
    };

    // Generic Delete with IMMEDIATE UI removal and background refresh
    window.deleteRecord = async (endpoint, id, refreshFunctionName) => {
        if (!confirm('Are you absolutely sure you want to delete this record permanently? This action cannot be undone.')) return;

        try {
            // 1. Send delete request
            const res = await apiCall(`${endpoint}/${id}`, 'DELETE');

            // 2. Alert success
            alert(res.message || 'Deleted successfully');

            // 3. Immediately trigger refresh of the specific view
            if (refreshFunctionName && typeof window[refreshFunctionName] === 'function') {
                console.log(`Triggering refresh: ${refreshFunctionName}`);
                window[refreshFunctionName]();
            } else {
                console.warn(`Refresh function ${refreshFunctionName} not found on window`);
            }

            // 4. Update dashboard stats
            if (window.fetchDashboard) window.fetchDashboard();

        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    // Helper to refresh all selects
    window.refreshEmployeeSelects = async () => {
        try {
            const res = await apiCall('employees');
            const emps = res.data;
            const selectIds = ['att-emp-id', 'ass-emp', 'pay-emp', 'app-emp', 'off-emp', 'exp-emp', 'letter-emp'];
            selectIds.forEach(id => {
                const select = document.getElementById(id);
                if (!select) return;
                const firstOpt = select.options[0] ? select.options[0].outerHTML : '<option value="">Select Employee</option>';
                
                if (id === 'letter-emp') {
                    const validEmps = emps.filter(e => 
                        e.role && 
                        !e.role.toLowerCase().includes('manager') && 
                        !e.role.toLowerCase().includes('admin') &&
                        e.employee_name.toLowerCase() !== 'shnoor manager'
                    );
                    select.innerHTML = firstOpt + '<option value="all">All Employees</option>' + validEmps.map(e => `<option value="${e.employee_id}">${e.employee_name}</option>`).join('');
                } else {
                    select.innerHTML = firstOpt + emps.map(e => `<option value="${e.employee_id}">${e.employee_name}</option>`).join('');
                }
            });
            return emps;
        } catch (e) { return []; }
    };

    // VIEW LOADER
    function loadDataForView(viewId) {
        window.refreshEmployeeSelects();
        if (viewId === 'view-dashboard') window.fetchDashboard();
        if (viewId === 'view-employees') window.fetchEmployees();
        if (viewId === 'view-attendance') window.fetchAttendance();
        if (viewId === 'view-leaves') window.fetchLeaves();
        if (viewId === 'view-assets') window.fetchAssets();
        if (viewId === 'view-payroll') window.fetchPayroll();
        if (viewId === 'view-appreciations') window.fetchAppreciations();
        if (viewId === 'view-policies') window.fetchPolicies();
        if (viewId === 'view-offboardings') window.fetchOffboardings();
        if (viewId === 'view-finance') window.fetchExpenses();
        if (viewId === 'view-holidays') window.fetchHolidays();
        if (viewId === 'view-profile') window.fetchProfile();
        if (viewId === 'view-letters') window.fetchLetters();
    }

    // --- MODULES ---

    window.fetchDashboard = async () => {
        try {
            const res = await apiCall('dashboard');
            document.getElementById('d-tot-emp').textContent = res.data.totalEmployees;
            document.getElementById('d-act-emp').textContent = res.data.activeEmployees;
            document.getElementById('d-pend-leaves').textContent = res.data.pendingLeaves;
            document.getElementById('d-tod-att').textContent = res.data.todaysAttendance;

            const dashList = document.getElementById('dash-recent-list');
            dashList.innerHTML = res.data.recentActivities.map(l => `
                <tr>
                    <td>${l.Employee ? l.Employee.employee_name : 'N/A'}</td>
                    <td>${l.leave_type}</td>
                    <td>${l.start_date} to ${l.end_date}</td>
                    <td><span class="badge ${l.status === 'Approved' ? 'bg-green' : (l.status === 'Rejected' ? 'bg-red' : 'bg-yellow')}">${l.status}</span></td>
                </tr>
            `).join('');
            if (!res.data.recentActivities.length) dashList.innerHTML = '<tr><td colspan="4" style="text-align:center;">No recent leave activity</td></tr>';
        } catch (e) { }
    };

    window.fetchEmployees = async () => {
        window.refreshTable('emp-list');
        const res = await apiCall('employees');
        document.getElementById('emp-list').innerHTML = res.data.map(e => `
            <tr>
                <td><strong>${e.employee_name}</strong><br/><small>${e.email}</small></td>
                <td>${e.department || 'N/A'}<br/><small>${e.designation || 'N/A'}</small></td>
                <td><span class="badge ${e.status === 'Active' ? 'bg-green' : 'bg-red'}">${e.status}</span></td>
                <td>
                    <button onclick="editEmployee(${e.employee_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('employees', ${e.employee_id}, 'fetchEmployees')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.editEmployee = async (id) => {
        const res = await apiCall('employees');
        const item = res.data.find(x => x.employee_id == id);
        if (!item) return;
        openEditModal('Employee', id, [
            { label: 'Name', key: 'employee_name', value: item.employee_name, type: 'text' },
            { label: 'Email', key: 'email', value: item.email, type: 'email' },
            { label: 'Phone', key: 'phone', value: item.phone, type: 'text' },
            { label: 'Department', key: 'department', value: item.department, type: 'text' },
            { label: 'Designation', key: 'designation', value: item.designation, type: 'text' },
            { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Active', 'Inactive', 'OnLeave', 'Resigned'] }
        ], async (data) => {
            await apiCall(`employees/${id}`, 'PUT', data);
            window.fetchEmployees();
            window.refreshEmployeeSelects();
        });
    };

    document.getElementById('form-emp')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiCall('employees', 'POST', {
            employee_name: document.getElementById('emp-name').value,
            email: document.getElementById('emp-email').value,
            phone: document.getElementById('emp-phone').value,
            department: document.getElementById('emp-dept').value,
            designation: document.getElementById('emp-desig').value,
            joining_date: document.getElementById('emp-join').value || null
        });
        document.getElementById('form-emp').reset();
        window.fetchEmployees();
        window.refreshEmployeeSelects();
    });

    window.fetchAttendance = async () => {
        window.refreshTable('att-list');
        const res = await apiCall('attendance');
        document.getElementById('att-list').innerHTML = res.data.map(a => `
            <tr>
                <td>${a.employee_id} <small>(${a.Employee ? a.Employee.employee_name : 'N/A'})</small></td>
                <td>${a.date}</td>
                <td>${a.clock_in ? new Date(a.clock_in).toLocaleTimeString() : 'N/A'}</td>
                <td>${a.clock_out ? new Date(a.clock_out).toLocaleTimeString() : 'N/A'}</td>
                <td>${a.status}</td>
                <td>
                    <button onclick="editAttendance(${a.attendance_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('attendance', ${a.attendance_id}, 'fetchAttendance')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.editAttendance = async (id) => {
        const res = await apiCall('attendance');
        const item = res.data.find(x => x.attendance_id == id);
        if (!item) return;
        openEditModal('Attendance', id, [
            { label: 'Date', key: 'date', value: item.date, type: 'date' },
            { label: 'Clock In', key: 'clock_in', value: item.clock_in ? item.clock_in.substring(0, 16) : '', type: 'datetime-local' },
            { label: 'Clock Out', key: 'clock_out', value: item.clock_out ? item.clock_out.substring(0, 16) : '', type: 'datetime-local' },
            { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Present', 'Absent', 'Late', 'Half Day'] }
        ], async (data) => {
            await apiCall(`attendance/${id}`, 'PUT', data);
            window.fetchAttendance();
        });
    };

    window.fetchLeaves = async () => {
        window.refreshTable('lv-list');
        const res = await apiCall('leaves');
        document.getElementById('lv-list').innerHTML = res.data.map(l => `
            <tr>
                <td>#${l.leave_id}</td>
                <td>${l.employee_id} <small>(${l.Employee ? l.Employee.employee_name : 'N/A'})</small></td>
                <td>${l.leave_type}</td>
                <td>${l.start_date} to ${l.end_date}</td>
                <td>${l.reason || 'N/A'}</td>
                <td><span class="badge ${l.status === 'Approved' ? 'bg-green' : (l.status === 'Rejected' ? 'bg-red' : 'bg-yellow')}">${l.status}</span></td>
                <td>
                    <button onclick="updateLeave(${l.leave_id}, 'Approved')" class="action-btn" style="color:green" title="Approve"><i class="fas fa-check-circle"></i></button>
                    <button onclick="updateLeave(${l.leave_id}, 'Rejected')" class="action-btn" style="color:red" title="Reject"><i class="fas fa-times-circle"></i></button>
                    <button onclick="editLeave(${l.leave_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('leaves', ${l.leave_id}, 'fetchLeaves')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.updateLeave = async (id, status) => {
        await apiCall(`leaves/${id}`, 'PUT', { status });
        window.fetchLeaves();
        window.fetchDashboard();
    };

    window.editLeave = async (id) => {
        const res = await apiCall('leaves');
        const item = res.data.find(x => x.leave_id == id);
        if (!item) return;
        openEditModal('Leave', id, [
            { label: 'Leave Type', key: 'leave_type', value: item.leave_type, type: 'text' },
            { label: 'Start Date', key: 'start_date', value: item.start_date, type: 'date' },
            { label: 'End Date', key: 'end_date', value: item.end_date, type: 'date' },
            { label: 'Reason', key: 'reason', value: item.reason, type: 'textarea' },
            { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'Approved', 'Rejected'] }
        ], async (data) => {
            await apiCall(`leaves/${id}`, 'PUT', data);
            window.fetchLeaves();
            window.fetchDashboard();
        });
    };

    window.fetchAssets = async () => {
        window.refreshTable('ass-list');
        const res = await apiCall('assets');
        document.getElementById('ass-list').innerHTML = res.data.map(a => `
            <tr>
                <td>${a.asset_name}<br/><small>${a.asset_category}</small></td>
                <td>${a.serial_number || 'N/A'}</td>
                <td>${a.assigned_employee || 'Unassigned'}</td>
                <td><span class="badge ${a.status === 'Available' ? 'bg-green' : 'bg-yellow'}">${a.status}</span></td>
                <td>
                    <button onclick="editAsset(${a.asset_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('assets', ${a.asset_id}, 'fetchAssets')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.editAsset = async (id) => {
        const res = await apiCall('assets');
        const item = res.data.find(x => x.asset_id == id);
        const emps = await window.refreshEmployeeSelects();
        if (!item) return;
        openEditModal('Asset', id, [
            { label: 'Asset Name', key: 'asset_name', value: item.asset_name, type: 'text' },
            { label: 'Category', key: 'asset_category', value: item.asset_category, type: 'text' },
            { label: 'Serial Number', key: 'serial_number', value: item.serial_number, type: 'text' },
            { label: 'Assign To', key: 'assigned_employee', value: item.assigned_employee, type: 'select', options: emps.map(e => ({ val: e.employee_id, lab: e.employee_name })) },
            { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Available', 'Assigned', 'Returned', 'Damaged'] }
        ], async (data) => {
            await apiCall(`assets/${id}`, 'PUT', data);
            window.fetchAssets();
        });
    };

    window.fetchPayroll = async () => {
        window.refreshTable('pay-list');
        const res = await apiCall('payroll');
        document.getElementById('pay-list').innerHTML = res.data.map(p => `
            <tr>
                <td>${p.employee_id} (${p.Employee ? p.Employee.employee_name : 'N/A'})</td>
                <td>$${p.basic_salary}</td>
                <td>$${p.net_salary}</td>
                <td>${p.payment_date || 'N/A'}</td>
                <td>
                    <button onclick="generatePayslipBtn(${p.payroll_id})" class="btn btn-outline" style="font-size:10px; padding:4px 8px;">Generate Payslip</button>
                    <button onclick="editPayroll(${p.payroll_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('payroll', ${p.payroll_id}, 'fetchPayroll')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.editPayroll = async (id) => {
        const res = await apiCall('payroll');
        const item = res.data.find(x => x.payroll_id == id);
        if (!item) return;
        openEditModal('Payroll', id, [
            { label: 'Basic Salary', key: 'basic_salary', value: item.basic_salary, type: 'number' },
            { label: 'Allowances', key: 'allowances', value: item.allowances, type: 'number' },
            { label: 'Deductions', key: 'deductions', value: item.deductions, type: 'number' },
            { label: 'Payment Date', key: 'payment_date', value: item.payment_date, type: 'date' }
        ], async (data) => {
            data.net_salary = (parseFloat(data.basic_salary) + parseFloat(data.allowances || 0)) - parseFloat(data.deductions || 0);
            await apiCall(`payroll/${id}`, 'PUT', data);
            window.fetchPayroll();
        });
    };

    window.fetchAppreciations = async () => {
        window.refreshTable('app-list');
        const res = await apiCall('appreciations');
        document.getElementById('app-list').innerHTML = res.data.map(a => `
            <tr>
                <td>${a.employee_id} (${a.Employee ? a.Employee.employee_name : 'N/A'})</td>
                <td><strong>${a.title}</strong><br/><small>${a.description}</small></td>
                <td>${a.date}</td>
                <td>
                    <button onclick="editAppreciation(${a.appreciation_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('appreciations', ${a.appreciation_id}, 'fetchAppreciations')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.editAppreciation = async (id) => {
        const res = await apiCall('appreciations');
        const item = res.data.find(x => x.appreciation_id == id);
        if (!item) return;
        openEditModal('Appreciation', id, [
            { label: 'Award Title', key: 'title', value: item.title, type: 'text' },
            { label: 'Description', key: 'description', value: item.description, type: 'textarea' },
            { label: 'Date', key: 'date', value: item.date, type: 'date' }
        ], async (data) => {
            await apiCall(`appreciations/${id}`, 'PUT', data);
            window.fetchAppreciations();
        });
    };

    window.fetchPolicies = async () => {
        window.refreshTable('pol-list');
        const res = await apiCall('policies');
        document.getElementById('pol-list').innerHTML = res.data.map(p => `
            <tr>
                <td><strong>${p.title}</strong><br/><small>${p.description}</small></td>
                <td>${p.uploaded_date?.split('T')[0] || 'N/A'}</td>
                <td><a href="${p.file_url}" target="_blank" style="color:var(--primary);">View</a></td>
                <td>
                     <button onclick="editPolicy(${p.policy_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                     <button onclick="deleteRecord('policies', ${p.policy_id}, 'fetchPolicies')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.editPolicy = async (id) => {
        const res = await apiCall('policies');
        const item = res.data.find(x => x.policy_id == id);
        if (!item) return;
        openEditModal('Policy', id, [
            { label: 'Title', key: 'title', value: item.title, type: 'text' },
            { label: 'Description', key: 'description', value: item.description, type: 'textarea' },
            { label: 'Document URL', key: 'file_url', value: item.file_url, type: 'text' }
        ], async (data) => {
            await apiCall(`policies/${id}`, 'PUT', data);
            window.fetchPolicies();
        });
    };

    window.fetchOffboardings = async () => {
        window.refreshTable('off-list');
        const res = await apiCall('offboardings');
        document.getElementById('off-list').innerHTML = res.data.map(o => `
            <tr>
                <td>${o.employee_id}</td>
                <td><strong>${o.Employee ? o.Employee.employee_name : 'N/A'}</strong></td>
                <td>${o.reason || 'N/A'}</td>
                <td>${o.last_working_date}</td>
                <td><span class="badge ${o.status === 'Completed' ? 'bg-green' : 'bg-yellow'}">${o.status}</span></td>
                <td>
                    <button onclick="updateOffboarding(${o.offboarding_id}, 'Completed')" class="action-btn" title="Complete" style="color:green"><i class="fas fa-check-double"></i></button>
                    <button onclick="editOffboarding(${o.offboarding_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('offboardings', ${o.offboarding_id}, 'fetchOffboardings')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.updateOffboarding = async (id, status) => {
        await apiCall(`offboardings/${id}`, 'PUT', { status });
        window.fetchOffboardings();
    };

    window.editOffboarding = async (id) => {
        const res = await apiCall('offboardings');
        const item = res.data.find(x => x.offboarding_id == id);
        if (!item) return;
        openEditModal('Offboarding', id, [
            { label: 'Reason', key: 'reason', value: item.reason, type: 'textarea' },
            { label: 'Last Date', key: 'last_working_date', value: item.last_working_date, type: 'date' },
            { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'In Progress', 'Completed'] }
        ], async (data) => {
            await apiCall(`offboardings/${id}`, 'PUT', data);
            window.fetchOffboardings();
        });
    };

    window.fetchExpenses = async () => {
        window.refreshTable('exp-list');
        const res = await apiCall('expenses');
        document.getElementById('exp-list').innerHTML = res.data.map(ex => `
            <tr>
                <td><strong>${ex.title}</strong><br/><small>${ex.category}</small></td>
                <td>${ex.employee_id} (${ex.Employee ? ex.Employee.employee_name : 'N/A'})</td>
                <td>$${ex.amount}</td>
                <td><span class="badge ${ex.status === 'Approved' ? 'bg-green' : (ex.status === 'Rejected' ? 'bg-red' : 'bg-yellow')}">${ex.status}</span></td>
                <td>
                    <button onclick="updateExpense(${ex.expense_id}, 'Approved')" class="action-btn" style="color:green" title="Approve"><i class="fas fa-thumbs-up"></i></button>
                    <button onclick="editExpense(${ex.expense_id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('expenses', ${ex.expense_id}, 'fetchExpenses')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.updateExpense = async (id, status) => {
        await apiCall(`expenses/${id}`, 'PUT', { status });
        window.fetchExpenses();
    };

    window.editExpense = async (id) => {
        const res = await apiCall('expenses');
        const item = res.data.find(x => x.expense_id == id);
        if (!item) return;
        openEditModal('Expense', id, [
            { label: 'Title', key: 'title', value: item.title, type: 'text' },
            { label: 'Amount', key: 'amount', value: item.amount, type: 'number' },
            { label: 'Category', key: 'category', value: item.category, type: 'text' },
            { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'Approved', 'Rejected'] }
        ], async (data) => {
            await apiCall(`expenses/${id}`, 'PUT', data);
            window.fetchExpenses();
        });
    };

    window.openEditModal = (title, id, fields, onSave) => {
        const modal = document.getElementById('edit-modal');
        const form = document.getElementById('edit-form');
        document.getElementById('modal-title').textContent = 'Edit ' + title;
        form.innerHTML = fields.map(f => {
            const inputId = `m-field-${f.key}`;
            const label = `<label class="form-label">${f.label}</label>`;
            if (f.type === 'select') {
                return `<div>${label}<select id="${inputId}" class="input">${f.options.map(opt => {
                    const val = typeof opt === 'object' ? opt.val : opt;
                    const lab = typeof opt === 'object' ? opt.lab : opt;
                    return `<option value="${val}" ${val == f.value ? 'selected' : ''}>${lab}</option>`;
                }).join('')}</select></div>`;
            } else if (f.type === 'textarea') {
                return `<div>${label}<textarea id="${inputId}" class="input" rows="3">${f.value || ''}</textarea></div>`;
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
            window.closeModal();
        });
        modal.classList.remove('hidden');
    };

    window.closeModal = () => document.getElementById('edit-modal').classList.add('hidden');

    // Forms
    document.getElementById('form-att')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiCall('attendance', 'POST', {
            employee_id: document.getElementById('att-emp-id').value,
            date: document.getElementById('att-date').value,
            clock_in: document.getElementById('att-in').value,
            clock_out: document.getElementById('att-out').value || null,
        });
        document.getElementById('form-att').reset();
        window.fetchAttendance();
    });

    document.getElementById('form-ass')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiCall('assets', 'POST', {
            asset_name: document.getElementById('ass-name').value,
            asset_category: document.getElementById('ass-cat').value,
            serial_number: document.getElementById('ass-sn').value,
            assigned_employee: document.getElementById('ass-emp').value || null,
            assignment_date: document.getElementById('ass-date').value || null,
            status: document.getElementById('ass-emp').value ? 'Assigned' : 'Available'
        });
        document.getElementById('form-ass').reset();
        window.fetchAssets();
    });

    document.getElementById('form-pay')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const base = parseFloat(document.getElementById('pay-base').value || 0);
        const allow = parseFloat(document.getElementById('pay-allow').value || 0);
        const ded = parseFloat(document.getElementById('pay-deduct').value || 0);
        await apiCall('payroll', 'POST', {
            employee_id: document.getElementById('pay-emp').value,
            basic_salary: base,
            allowances: allow,
            deductions: ded,
            net_salary: (base + allow) - ded,
            payment_date: document.getElementById('pay-date').value || null
        });
        document.getElementById('form-pay').reset();
        window.fetchPayroll();
    });

    document.getElementById('form-app')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiCall('appreciations', 'POST', {
            employee_id: document.getElementById('app-emp').value,
            title: document.getElementById('app-title').value,
            description: document.getElementById('app-desc').value,
            date: document.getElementById('app-date').value
        });
        document.getElementById('form-app').reset();
        window.fetchAppreciations();
    });

    document.getElementById('form-off')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiCall('offboardings', 'POST', {
            employee_id: document.getElementById('off-emp').value,
            reason: document.getElementById('off-reason').value,
            last_working_date: document.getElementById('off-date').value
        });
        document.getElementById('form-off').reset();
        window.fetchOffboardings();
    });

    document.getElementById('form-exp')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiCall('expenses', 'POST', {
            title: document.getElementById('exp-title').value,
            employee_id: document.getElementById('exp-emp').value,
            amount: document.getElementById('exp-amt').value,
            category: document.getElementById('exp-cat').value
        });
        document.getElementById('form-exp').reset();
        window.fetchExpenses();
    });

    document.getElementById('form-pol')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', document.getElementById('pol-title').value);
        formData.append('description', document.getElementById('pol-desc').value);

        const fileInput = document.getElementById('pol-file');
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        const externalUrl = document.getElementById('pol-url').value;
        if (externalUrl) {
            formData.append('external_url', externalUrl);
        }

        try {
            await apiCall('policies', 'POST', formData, true);
            alert('Policy published successfully');
            document.getElementById('form-pol').reset();
            window.fetchPolicies();
        } catch (err) {
            alert('Publish failed: ' + err.message);
        }
    });

    window.fetchHolidays = async () => {
        window.refreshTable('holi-list');
        const res = await apiCall('holidays');
        document.getElementById('holi-list').innerHTML = res.data.map((h, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${h.date}</td>
                <td><strong>${h.holiday_name}</strong></td>
                <td>
                    <button onclick="editHoliday(${h.holiday_id || h.id})" class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecord('holidays', ${h.holiday_id || h.id}, 'fetchHolidays')" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    window.editHoliday = async (id) => {
        const res = await apiCall('holidays');
        const item = res.data.find(x => (x.holiday_id || x.id) == id);
        if (!item) return;
        openEditModal('Holiday', id, [
            { label: 'Title', key: 'holiday_name', value: item.holiday_name, type: 'text' },
            { label: 'Date', key: 'date', value: item.date, type: 'date' },
            { label: 'Description', key: 'description', value: item.description, type: 'textarea' }
        ], async (data) => {
            await apiCall(`holidays/${id}`, 'PUT', data);
            window.fetchHolidays();
        });
    };

    document.getElementById('form-holi')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiCall('holidays', 'POST', {
            holiday_name: document.getElementById('holi-title').value,
            date: document.getElementById('holi-date').value,
            description: document.getElementById('holi-desc').value
        });
        document.getElementById('form-holi').reset();
        window.fetchHolidays();
    });

    window.fetchLetters = async () => {
        window.refreshTable('letter-list');
        const res = await apiCall('letters');
        window.letterData = res.data;
        document.getElementById('letter-list').innerHTML = res.data.map(l => `
            <tr>
                <td><strong>${l.title}</strong></td>
                <td>${l.Recipient ? l.Recipient.employee_name : 'N/A'}</td>
                <td><span class="badge ${l.status === 'Sent' ? 'bg-green' : 'bg-yellow'}">${l.status}</span></td>
                <td>${new Date(l.created_at).toLocaleString()}</td>
                <td>
                    <button class="action-btn" title="Preview Letter" onclick="previewManagerLetter(${l.letter_id})" style="color:var(--text-light)"><i class="fas fa-eye"></i></button>
                    <button class="action-btn" title="Edit Letter" onclick="editManagerLetter(${l.letter_id})" style="color:var(--primary)"><i class="fas fa-edit"></i></button>
                    <button class="action-btn" title="Delete Letter" onclick="deleteManagerLetter(${l.letter_id})" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    };

    // --- Quill ---

    if (window.Quill) {
        window.newLetterQuill = new Quill('#letter-content-editor', {
            theme: 'snow',
            modules: { toolbar: [[{ font: [] }], [{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]] }
        });
        window.editLetterQuill = new Quill('#edit-letter-content-editor', {
            theme: 'snow',
            modules: { toolbar: [[{ font: [] }], [{ header: [1, 2, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]] }
        });
    }

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
        const cleanedContent = item.content.replace(/^(<p>)?\s*Dear\s+.*?<\/p>[\r\n\s]*/i, '');

        element.innerHTML = `
            <div style="text-align: left; margin-bottom: 30px;">
                <img id="pdf-logo" src="logo.avif" alt="SHNOOR Logo" style="max-height: 80px;">
            </div>
            <div style="text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; text-transform: uppercase;">
                ${item.title}
            </div>
            <div style="margin-bottom: 20px;">
                Date: ${todayDate}<br><br>
            </div>
            <div style="white-space: pre-wrap; margin-bottom: 40px; text-align: justify; color: #000;">${cleanedContent}</div>
            <div style="margin-top: 60px;">
                <strong>Thanks & Regards</strong><br>
                <strong>Hiring Team - SHNOOR International LLC</strong><br>
                Mount Tabor Road, Odessa, Missouri, United States | Ph: +91-9429694298<br>
                www.shnoor.com<br><br>
                <div style="text-align: left; margin-top: 20px;">
                    <img id="pdf-signature" src="signature.png" alt="Signature" style="max-height: 150px;">
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

        if (window.html2pdf) {
            const logoImg = element.querySelector('#pdf-logo');
            let logoDataURL = null;
            let aspect = 1;
            
            if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = logoImg.naturalWidth;
                    canvas.height = logoImg.naturalHeight;
                    aspect = canvas.height / canvas.width;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(logoImg, 0, 0);
                    logoDataURL = canvas.toDataURL('image/png');
                    logoImg.parentNode.style.display = 'none';
                } catch(e) { console.error(e); }
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
                    }
                }
            }).save();
        }
    };

    window.previewManagerLetter = (id) => {
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

    window.editManagerLetter = (id) => {
        const item = window.letterData.find(x => x.letter_id == id);
        if (!item) return;

        document.getElementById('edit-letter-title').value = item.title;
        if (window.editLetterQuill) window.editLetterQuill.root.innerHTML = item.content;

        document.getElementById('edit-letter-modal').classList.remove('hidden');

        document.getElementById('modal-letter-save-btn').onclick = async () => {
            const newTitle = document.getElementById('edit-letter-title').value;
            const newContent = window.editLetterQuill ? window.editLetterQuill.root.innerHTML : '';
            if (!newTitle || !newContent || newContent === '<p><br></p>') return alert("Please fill all fields");

            await apiCall('letters/' + id, 'PUT', { title: newTitle, content: newContent });
            document.getElementById('edit-letter-modal').classList.add('hidden');
            fetchLetters();
        };
    };

    window.deleteManagerLetter = async (id) => {
        if (!confirm("Are you sure you want to delete this official letter?")) return;
        try {
            await apiCall('letters/' + id, 'DELETE');
            fetchLetters();
        } catch (e) { alert("Error deleting letter"); }
    };

    const LETTER_TEMPLATES = {
        offer: {
            title: "Offer of Employment",
            content: "Dear [Employee Name],\n\nWe are pleased to offer you the position of [Job Title] at SHNOOR International LLC. We were impressed with your background and believe you will be a valuable addition to our team.\n\nYour start date will be [Date], and you will report to [Manager Name]. Your initial compensation will be [Salary] per annum, payable in accordance with our standard payroll schedule.\n\nWe look forward to welcoming you to the SHNOOR family!"
        },
        promotion: {
            title: "Promotion and Salary Revision",
            content: "Dear [Employee Name],\n\nCongratulations! We are delighted to inform you of your promotion to the position of [New Job Title], effective from [Effective Date].\n\nThis promotion is a recognition of your hard work, dedication, and the significant impact you have made on our team. Your new annual compensation will be [New Salary].\n\nWe are confident that you will continue to excel in your new role and contribute to the ongoing success of SHNOOR International LLC."
        },
        appreciation: {
            title: "Letter of Appreciation",
            content: "Dear [Employee Name],\n\nThis letter is to express our sincere appreciation for your outstanding performance and dedication to SHNOOR International LLC. Your contributions to [Project Name/Specific Area] have been exceptional.\n\nYour commitment to excellence and your positive attitude are an inspiration to the entire team. Thank you for your hard work and for being such a valuable member of our organization."
        },
        relieving: {
            title: "Relieving Letter and experience certificate",
            content: "Dear [Employee Name],\n\nThis is to certify that [Employee Name] was employed with SHNOOR International LLC from [Start Date] to [End Date]. During this period, they served as [Last Designation].\n\nWe would like to confirm that [Employee Name] is being relieved of their duties effective [End Date]. We appreciate the contributions made during their tenure and wish them the very best in their future professional endeavors."
        },
        warning: {
            title: "Performance / Conduct Warning",
            content: "Dear [Employee Name],\n\nThis is a formal warning letter regarding [specific issue, e.g., consistent tardiness / performance concerns]. Despite previous verbal discussions, we have not seen the required improvement in [Area of concern].\n\nWe expect to see immediate and sustained improvement in your [Performance/Conduct]. Please be advised that further instances of this nature may lead to more severe disciplinary action, up to and including termination of employment."
        },
        internship: {
            title: "Internship Completion Certificate",
            content: "Dear [Employee Name],\n\nThis is to certify that [Employee Name] has successfully completed their internship with SHNOOR International LLC from [Start Date] to [End Date]. During this period, they worked with the [Department Name] team as an Intern.\n\nThey demonstrated a keen interest in learning and contributed effectively to the team's objectives. Their performance during the internship was [Rating, e.g., Outstanding]. We wish them all the best in their academic and professional journey ahead."
        },
        termination: {
            title: "Notification of Termination",
            content: "Dear [Employee Name],\n\nWe regret to inform you that your employment with SHNOOR International LLC is being terminated, effective [Effective Date]. This decision has been made due to [Reason, e.g., business restructuring / performance issues].\n\nYour final paycheck, including any accrued vacation pay and benefits information, will be [sent to you / provided]. Please return all company property, including keys and equipment, by [Date]. We wish you the best in your future endeavors."
        },
        confirmation: {
            title: "Employment Confirmation Letter",
            content: "Dear [Employee Name],\n\nWe are pleased to inform you that you have successfully completed your probation period at SHNOOR International LLC. Based on your performance and contribution to the team, we are happy to confirm your permanent appointment as [Job Title].\n\nAll other terms and conditions of your employment as per your initial offer letter remain unchanged. We look forward to your continued growth and success with the organization."
        }
    };

    document.getElementById('letter-template')?.addEventListener('change', (e) => {
        const templateKey = e.target.value;
        if (templateKey && LETTER_TEMPLATES[templateKey]) {
            const template = LETTER_TEMPLATES[templateKey];
            document.getElementById('letter-title').value = template.title;
            if (window.newLetterQuill) {
                window.newLetterQuill.root.innerHTML = template.content.replace(/\n/g, '<br>');
            }
        } else {
            document.getElementById('letter-title').value = '';
            if (window.newLetterQuill) window.newLetterQuill.root.innerHTML = '';
        }
    });

    document.getElementById('form-letter')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const contentVal = window.newLetterQuill ? window.newLetterQuill.root.innerHTML : '';
        if (!contentVal || contentVal === '<p><br></p>') return alert("Please type your letter content");

        await apiCall('letters', 'POST', {
            employee_id: document.getElementById('letter-emp').value,
            title: document.getElementById('letter-title').value,
            content: contentVal
        });
        document.getElementById('form-letter').reset();
        if (window.newLetterQuill) window.newLetterQuill.root.innerHTML = '';
        window.fetchLetters();
    });

    window.generatePayslipBtn = async (id) => {
        try {
            const res = await apiCall(`payroll/${id}/generate-payslip`, 'POST');
            alert(res.message);
        } catch (e) { }
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
        const email = sessionStorage.getItem('shnoor_admin_email') || sessionStorage.getItem('shnoor_email') || 'manager@shnoor.com';
        try {
            const res = await fetch(`/api/notifications?userId=${encodeURIComponent(email)}&role=manager`, {
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
        const email = sessionStorage.getItem('shnoor_admin_email') || sessionStorage.getItem('shnoor_email') || 'manager@shnoor.com';
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: email, role: 'manager' })
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
        const email = sessionStorage.getItem('shnoor_admin_email') || sessionStorage.getItem('shnoor_email');
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

    // --- PROFILE ---
    window.fetchProfile = async () => {
        try {
            const res = await fetch('/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                document.getElementById('prof-name').value = data.data.name || '';
                document.getElementById('prof-email').value = data.data.email || '';
                document.getElementById('prof-phone').value = data.data.phone || '';
            }
        } catch (e) { console.error('Error fetching profile:', e); }
    };

    document.getElementById('form-profile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('prof-name').value;
        const email = document.getElementById('prof-email').value;
        const phone = document.getElementById('prof-phone').value;

        try {
            const res = await fetch('/api/v1/auth/updatedetails', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, phone })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('Profile updated successfully');
                if (emailDisplay) emailDisplay.textContent = email;
                sessionStorage.setItem('shnoor_admin_email', email);
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (err) { console.error(err); }
    });

    document.getElementById('form-pass')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('pass-curr').value;
        const newPassword = document.getElementById('pass-new').value;

        try {
            const res = await fetch('/api/v1/auth/updatepassword', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('Password updated successfully');
                e.target.reset();
            } else {
                alert(data.error || 'Failed to update password');
            }
        } catch (err) { console.error(err); }
    });

    // Initial Load
    window.fetchDashboard();
});
