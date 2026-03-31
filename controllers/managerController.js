const { Employee, Attendance, Leave, Asset, Payroll, Expense, Appreciation, CompanyPolicy, Offboarding, Payslip, Holiday, Letter, Notification, PrePayment, IncrementPromotion } = require('../models');
const { sequelize } = require('../config/db');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../services/emailService');

const DEFAULT_EMPLOYEE_PASSWORD = process.env.EMPLOYEE_DEFAULT_PASSWORD || 'Emp@1234';

// DASHBOARD
exports.getDashboardStats = async (req, res) => {
    try {
        const employees = await Employee.findAll();
        const activeEmployees = employees.filter(e => e.status === 'Active').length;
        
        const pendingLeaves = await Leave.count({ where: { status: 'Pending' } });
        
        // Today's attendance - simple logic (requires date formatting in real app)
        const today = new Date().toISOString().split('T')[0];
        const todaysAttendance = await Attendance.count({ where: { date: today } });

        // recent activities (leaves, assets etc)
        const recentLeaves = await Leave.findAll({ include: [Employee], limit: 3, order: [['leave_id', 'DESC']] });

        res.status(200).json({
            success: true,
            data: {
                totalEmployees: employees.length,
                activeEmployees,
                pendingLeaves,
                todaysAttendance,
                recentActivities: recentLeaves
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// EMPLOYEES
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.status(200).json({ success: true, data: employees });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createEmployee = async (req, res) => {
    try {
        const data = { ...req.body };
        if (!data.role) data.role = 'Employee';
        // Manager-created employee accounts use a default password unless explicitly provided.
        if (!data.password || !String(data.password).trim()) {
            data.password = DEFAULT_EMPLOYEE_PASSWORD;
        }

        if (req.user && req.user.role === 'Manager' && !data.manager_id) {
            let mgrEmp = await Employee.findOne({ where: { email: req.user.email } });
            if (!mgrEmp) {
                mgrEmp = await Employee.create({
                    employee_name: req.user.name || 'Manager',
                    email: req.user.email,
                    role: 'Employee',
                    designation: 'Manager',
                    department: 'Management',
                    joining_date: new Date()
                });
            }
            data.manager_id = mgrEmp.employee_id;
        }

        const plainPassword = data.password;
        const emp = await Employee.create(data);

        let emailSent = false;
        let emailError = null;
        try {
            const employeeName = emp.employee_name || data.employee_name || 'Employee';
            const message = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Welcome to HRM Portal</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hello <strong>${employeeName}</strong>,</p>
                        <p>Your employee account has been created by your manager.</p>
                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Login Email:</strong> ${emp.email}</p>
                            <p style="margin: 5px 0;"><strong>Default Password:</strong> ${plainPassword}</p>
                        </div>
                        <p>Please log in and change your password as soon as possible.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5000/index.html#login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to HRM Portal</a>
                        </div>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #777;">This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: emp.email,
                subject: 'Your HRM Employee Account Credentials',
                html: message,
                text: [
                    'Welcome to HRM Portal',
                    '',
                    `Hello ${employeeName},`,
                    'Your employee account has been created by your manager.',
                    `Login Email: ${emp.email}`,
                    `Default Password: ${plainPassword}`,
                    '',
                    'Please change your password after first login.',
                    'Login URL: http://localhost:5000/index.html#login'
                ].join('\n')
            });
            emailSent = true;
        } catch (emailErr) {
            console.error('[Manager] Failed to send employee credentials email:', emailErr.message);
            emailError = emailErr.message;
        }

        res.status(201).json({ success: true, data: emp, defaultPasswordSent: true, emailSent, emailError });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateEmployee = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.params.id);
        if(!emp) return res.status(404).json({ success: false, error: "Not found" });
        await emp.update(req.body);
        res.status(200).json({ success: true, data: emp });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.params.id);
        if(!emp) return res.status(404).json({ success: false, error: "Not found" });

        // Manually handle related records to prevent FK constraint violations
        const empId = emp.employee_id;
        await Attendance.destroy({ where: { employee_id: empId } });
        await Leave.destroy({ where: { employee_id: empId } });
        await Payroll.destroy({ where: { employee_id: empId } });
        await Expense.destroy({ where: { employee_id: empId } });
        await PrePayment.destroy({ where: { employee_id: empId } });
        await IncrementPromotion.destroy({ where: { employee_id: empId } });
        await Appreciation.destroy({ where: { employee_id: empId } });
        await Offboarding.destroy({ where: { employee_id: empId } });
        await Payslip.destroy({ where: { employee_id: empId } });
        
        // Unlink from Assets instead of deleting the asset hardware
        await Asset.update({ assigned_employee: null, status: 'Available' }, { where: { assigned_employee: empId } });

        await emp.destroy();
        res.status(200).json({ success: true, message: "Employee and all associated records deleted permanently" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// ATTENDANCE
exports.getAttendance = async (req, res) => {
    try {
        const records = await Attendance.findAll({ include: [Employee], order: [['date', 'DESC']] });
        res.status(200).json({ success: true, data: records });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createAttendance = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.body.employee_id);
        if (!emp) return res.status(400).json({ success: false, error: "Employee not found" });

        const record = await Attendance.create(req.body);
        const rRecord = await Attendance.findByPk(record.attendance_id, { include: [Employee] });
        res.status(201).json({ success: true, data: rRecord });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateAttendance = async (req, res) => {
    try {
        const att = await Attendance.findByPk(req.params.id);
        if(!att) return res.status(404).json({ success: false, error: "Not found" });
        await att.update(req.body);
        const rAtt = await Attendance.findByPk(att.attendance_id, { include: [Employee] });
        res.status(200).json({ success: true, data: rAtt });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const att = await Attendance.findByPk(req.params.id);
        if(!att) return res.status(404).json({ success: false, error: "Not found" });
        await att.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// LEAVES
exports.getLeaves = async (req, res) => {
    try {
        const records = await Leave.findAll({ include: [Employee], order: [['leave_id', 'DESC']] });
        res.status(200).json({ success: true, data: records });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.updateLeave = async (req, res) => {
    try {
        const leave = await Leave.findByPk(req.params.id);
        if(!leave) return res.status(404).json({ success: false, error: "Not found" });
        await leave.update(req.body);
        const rLeave = await Leave.findByPk(leave.leave_id, { include: [Employee] });
        res.status(200).json({ success: true, data: rLeave });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByPk(req.params.id);
        if(!leave) return res.status(404).json({ success: false, error: "Not found" });
        await leave.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// ASSETS
exports.getAssets = async (req, res) => {
    try {
        const assets = await Asset.findAll({ include: [Employee] });
        res.status(200).json({ success: true, data: assets });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createAsset = async (req, res) => {
    try {
        if (req.body.assigned_employee) {
            const emp = await Employee.findByPk(req.body.assigned_employee);
            if (!emp) return res.status(400).json({ success: false, error: "Assigned employee not found" });
        }
        const asset = await Asset.create(req.body);
        const rAsset = await Asset.findByPk(asset.asset_id, { include: [Employee] });
        res.status(201).json({ success: true, data: rAsset });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.id);
        if(!asset) return res.status(404).json({ success: false, error: "Not found" });
        await asset.update(req.body);
        const rAsset = await Asset.findByPk(asset.asset_id, { include: [Employee] });
        res.status(200).json({ success: true, data: rAsset });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.id);
        if(!asset) return res.status(404).json({ success: false, error: "Not found" });
        await asset.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// PAYROLL
exports.getPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.findAll({ include: [Employee] });
        res.status(200).json({ success: true, data: payrolls });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createPayroll = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.body.employee_id);
        if (!emp) return res.status(400).json({ success: false, error: "Employee not found" });
        
        const p = await Payroll.create(req.body);
        const rp = await Payroll.findByPk(p.payroll_id, { include: [Employee] });
        res.status(201).json({ success: true, data: rp });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updatePayroll = async (req, res) => {
    try {
        const p = await Payroll.findByPk(req.params.id);
        if(!p) return res.status(404).json({ success: false, error: "Not found" });
        await p.update(req.body);
        const rp = await Payroll.findByPk(p.payroll_id, { include: [Employee] });
        res.status(200).json({ success: true, data: rp });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deletePayroll = async (req, res) => {
    try {
        const p = await Payroll.findByPk(req.params.id);
        if(!p) return res.status(404).json({ success: false, error: "Not found" });
        await p.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.generatePayslip = async (req, res) => {
    try {
        const payroll = await Payroll.findByPk(req.params.id, { include: [Employee] });
        if(!payroll) return res.status(404).json({ success: false, error: "Payroll record not found" });

        const ps = await Payslip.create({
            employee_id: payroll.employee_id,
            payroll_id: payroll.payroll_id,
            basic_salary: payroll.basic_salary,
            allowances: payroll.allowances,
            deductions: payroll.deductions,
            net_salary: payroll.net_salary,
            payment_date: payroll.payment_date || new Date()
        });
        res.status(201).json({ success: true, data: ps, message: "Payslip generated and saved" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// APPRECIATIONS
exports.getAppreciations = async (req, res) => {
    try {
        const list = await Appreciation.findAll({ include: [Employee] });
        res.status(200).json({ success: true, data: list });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createAppreciation = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.body.employee_id);
        if (!emp) return res.status(400).json({ success: false, error: "Employee not found" });

        const app = await Appreciation.create(req.body);
        const rapp = await Appreciation.findByPk(app.appreciation_id, { include: [Employee] });
        res.status(201).json({ success: true, data: rapp });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateAppreciation = async (req, res) => {
    try {
        const app = await Appreciation.findByPk(req.params.id);
        if(!app) return res.status(404).json({ success: false, error: "Not found" });
        await app.update(req.body);
        const rapp = await Appreciation.findByPk(app.appreciation_id, { include: [Employee] });
        res.status(200).json({ success: true, data: rapp });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteAppreciation = async (req, res) => {
    try {
        const app = await Appreciation.findByPk(req.params.id);
        if(!app) return res.status(404).json({ success: false, error: "Not found" });
        await app.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// COMPANY POLICIES
exports.getPolicies = async (req, res) => {
    try {
        const policies = await CompanyPolicy.findAll();
        res.status(200).json({ success: true, data: policies });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createPolicy = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.file_url = `/uploads/policies/${req.file.filename}`;
        } else if (req.body.external_url) {
            data.file_url = req.body.external_url;
        }
        const p = await CompanyPolicy.create(data);
        res.status(201).json({ success: true, data: p });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updatePolicy = async (req, res) => {
    try {
        const p = await CompanyPolicy.findByPk(req.params.id);
        if(!p) return res.status(404).json({ success: false, error: "Not found" });
        const data = { ...req.body };
        if (req.file) {
            data.file_url = `/uploads/policies/${req.file.filename}`;
        }
        await p.update(data);
        res.status(200).json({ success: true, data: p });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deletePolicy = async (req, res) => {
    try {
        const p = await CompanyPolicy.findByPk(req.params.id);
        if(!p) return res.status(404).json({ success: false, error: "Not found" });
        await p.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// OFFBOARDINGS
exports.getOffboardings = async (req, res) => {
    try {
        const obs = await Offboarding.findAll({ include: [Employee] });
        res.status(200).json({ success: true, data: obs });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createOffboarding = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.body.employee_id);
        if (!emp) return res.status(400).json({ success: false, error: "Employee not found" });

        const o = await Offboarding.create(req.body);
        const ro = await Offboarding.findByPk(o.offboarding_id, { include: [Employee] });
        res.status(201).json({ success: true, data: ro });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteOffboarding = async (req, res) => {
    try {
        const o = await Offboarding.findByPk(req.params.id);
        if(!o) return res.status(404).json({ success: false, error: "Not found" });
        await o.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateOffboarding = async (req, res) => {
    try {
        const o = await Offboarding.findByPk(req.params.id);
        if(!o) return res.status(404).json({ success: false, error: "Not found" });
        await o.update(req.body);
        const ro = await Offboarding.findByPk(o.offboarding_id, { include: [Employee] });
        res.status(200).json({ success: true, data: ro });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// FINANCE / EXPENSES
exports.getExpenses = async (req, res) => {
    try {
        const exps = await Expense.findAll({ include: [Employee] });
        res.status(200).json({ success: true, data: exps });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createExpense = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.body.employee_id);
        if (!emp) return res.status(400).json({ success: false, error: "Employee not found" });

        const ex = await Expense.create(req.body);
        const rex = await Expense.findByPk(ex.expense_id, { include: [Employee] });
        res.status(201).json({ success: true, data: rex });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateExpense = async (req, res) => {
    try {
        const ex = await Expense.findByPk(req.params.id);
        if(!ex) return res.status(404).json({ success: false, error: "Not found" });
        await ex.update(req.body);
        const rex = await Expense.findByPk(ex.expense_id, { include: [Employee] });
        
        // Notify Employee via Global Service (Real-time)
        if (req.body.status && (req.body.status === 'Approved' || req.body.status === 'Rejected')) {
            if (rex.Employee && rex.Employee.email && global.globalNotificationService) {
                await global.globalNotificationService.sendGlobalNotification({
                    senderRole: 'manager',
                    senderEmail: req.user.email,
                    recipientEmails: [rex.Employee.email.toLowerCase()],
                    message: `Your expense claim for "${rex.title}" has been ${req.body.status}.`,
                    type: 'expense_status_update'
                });
            }
        }
        
        res.status(200).json({ success: true, data: rex });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteExpense = async (req, res) => {
    try {
        const ex = await Expense.findByPk(req.params.id);
        if(!ex) return res.status(404).json({ success: false, error: "Not found" });
        await ex.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// PRE PAYMENTS
exports.getPrePayments = async (req, res) => {
    try {
        const records = await PrePayment.findAll({ include: [Employee], order: [['created_at', 'DESC']] });
        res.status(200).json({ success: true, data: records });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createPrePayment = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.body.employee_id);
        if (!emp) return res.status(400).json({ success: false, error: "Employee not found" });

        const payload = {
            ...req.body,
            status: 'Pending'
        };
        const record = await PrePayment.create(payload);
        const result = await PrePayment.findByPk(record.id, { include: [Employee] });
        res.status(201).json({ success: true, data: result });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updatePrePayment = async (req, res) => {
    try {
        const record = await PrePayment.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, error: "Not found" });

        await record.update(req.body);
        const result = await PrePayment.findByPk(record.id, { include: [Employee] });
        res.status(200).json({ success: true, data: result });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updatePrePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }

        const record = await PrePayment.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, error: "Not found" });

        const payload = { status };
        if (status === 'Approved' || status === 'Rejected') {
            payload.approved_by = req.user.name || req.user.email || 'Manager';
            payload.approval_date = new Date();
        } else {
            payload.approved_by = null;
            payload.approval_date = null;
        }

        await record.update(payload);
        const result = await PrePayment.findByPk(record.id, { include: [Employee] });
        res.status(200).json({ success: true, data: result });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deletePrePayment = async (req, res) => {
    try {
        const record = await PrePayment.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, error: "Not found" });
        await record.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// INCREMENT / PROMOTION
exports.getIncrementPromotions = async (req, res) => {
    try {
        const records = await IncrementPromotion.findAll({ include: [Employee], order: [['created_at', 'DESC']] });
        res.status(200).json({ success: true, data: records });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createIncrementPromotion = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.body.employee_id);
        if (!emp) return res.status(400).json({ success: false, error: "Employee not found" });

        const currentSalary = parseFloat(req.body.current_salary || 0);
        const newSalary = parseFloat(req.body.new_salary || 0);
        if (!Number.isNaN(currentSalary) && !Number.isNaN(newSalary) && newSalary <= currentSalary) {
            return res.status(400).json({ success: false, error: "New salary must be greater than current salary" });
        }

        if (req.body.change_type === 'Promotion' && !String(req.body.new_designation || '').trim()) {
            return res.status(400).json({ success: false, error: "New designation is required for promotion" });
        }

        const payload = {
            ...req.body,
            department: req.body.department || emp.department,
            designation: req.body.designation || emp.designation,
            current_role: req.body.current_role || emp.designation,
            joining_date: req.body.joining_date || emp.joining_date,
            status: req.body.status || 'Pending'
        };

        const record = await IncrementPromotion.create(payload);
        const result = await IncrementPromotion.findByPk(record.increment_promotion_id, { include: [Employee] });
        res.status(201).json({ success: true, data: result });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateIncrementPromotion = async (req, res) => {
    try {
        const record = await IncrementPromotion.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, error: "Not found" });

        const payload = { ...req.body };
        const effectiveType = payload.change_type || record.change_type;
        const effectiveCurrentSalary = parseFloat(payload.current_salary ?? record.current_salary ?? 0);
        const effectiveNewSalary = parseFloat(payload.new_salary ?? record.new_salary ?? 0);

        if (!Number.isNaN(effectiveCurrentSalary) && !Number.isNaN(effectiveNewSalary) && effectiveNewSalary <= effectiveCurrentSalary) {
            return res.status(400).json({ success: false, error: "New salary must be greater than current salary" });
        }

        const effectiveDesignation = String(payload.new_designation ?? record.new_designation ?? '').trim();
        if (effectiveType === 'Promotion' && !effectiveDesignation) {
            return res.status(400).json({ success: false, error: "New designation is required for promotion" });
        }

        if (payload.status && (payload.status === 'Approved' || payload.status === 'Rejected')) {
            payload.approved_by = req.user.name || req.user.email || 'Manager';
            payload.approval_date = new Date();
        }
        if (payload.status === 'Pending') {
            payload.approved_by = null;
            payload.approval_date = null;
        }

        await record.update(payload);
        const result = await IncrementPromotion.findByPk(record.increment_promotion_id, { include: [Employee] });
        res.status(200).json({ success: true, data: result });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateIncrementPromotionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }

        const record = await IncrementPromotion.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, error: "Not found" });

        const payload = { status };
        if (status === 'Approved' || status === 'Rejected') {
            payload.approved_by = req.user.name || req.user.email || 'Manager';
            payload.approval_date = new Date();
        } else {
            payload.approved_by = null;
            payload.approval_date = null;
        }

        await record.update(payload);
        const result = await IncrementPromotion.findByPk(record.increment_promotion_id, { include: [Employee] });
        res.status(200).json({ success: true, data: result });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteIncrementPromotion = async (req, res) => {
    try {
        const record = await IncrementPromotion.findByPk(req.params.id);
        if (!record) return res.status(404).json({ success: false, error: "Not found" });
        await record.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// HOLIDAYS
exports.getHolidays = async (req, res) => {
    try {
        const holis = await Holiday.findAll({ order: [['date', 'ASC']] });
        res.status(200).json({ success: true, data: holis });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.createHoliday = async (req, res) => {
    try {
        const h = await Holiday.create(req.body);
        res.status(201).json({ success: true, data: h });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updateHoliday = async (req, res) => {
    try {
        const h = await Holiday.findByPk(req.params.id);
        if(!h) return res.status(404).json({ success: false, error: "Not found" });
        await h.update(req.body);
        res.status(200).json({ success: true, data: h });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteHoliday = async (req, res) => {
    try {
        const h = await Holiday.findByPk(req.params.id);
        if(!h) return res.status(404).json({ success: false, error: "Not found" });
        await h.destroy();
        res.status(200).json({ success: true, message: "Record deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// LETTERS
exports.getManagerLetters = async (req, res) => {
    try {
        // For letters, manager_id always refers to the SuperAdmin record (Managers/Admins)
        let managerId = req.user.id;
        if (!managerId) return res.status(400).json({ success: false, error: "Manager profile not found" });

        const letters = await Letter.findAll({
            where: { manager_id: managerId },
            include: [{ model: Employee, as: 'Recipient' }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ success: true, data: letters });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.sendLetter = async (req, res) => {
    try {
        console.log('--- SEND LETTER REQUEST ---', req.body);
        const { employee_id, title, content } = req.body;
        if (!employee_id || !title || !content) {
            console.warn('Missing fields:', { employee_id, title, content });
            return res.status(400).json({ success: false, error: "Please provide employee, title, and content" });
        }

        // Managers are identified by their email in the Employee table
        // Database enforces manager_id pointing to SuperAdmin table
        const managerId = req.user.id;
        console.log('Using SuperAdmin ID for letter sender:', managerId);


        let targetEmployeeIds = [];
        if (employee_id === 'all') {
            const allEmps = await Employee.findAll({ where: { status: 'Active' } });
            targetEmployeeIds = allEmps.filter(e => {
                const role = (e.role || '').toLowerCase();
                const desig = (e.designation || '').toLowerCase();
                const name = (e.employee_name || '').toLowerCase();
                return !role.includes('manager') && 
                       !role.includes('admin') && 
                       !desig.includes('manager') && 
                       !desig.includes('admin') && 
                       name !== 'shnoor manager' &&
                       e.email !== req.user.email; // Don't send to self
            }).map(e => e.employee_id);
        } else {
            targetEmployeeIds = [employee_id];
        }

        if (targetEmployeeIds.length === 0) {
            return res.status(400).json({ success: false, error: "No target employees found." });
        }

        const sentLetters = [];
        for (const targetId of targetEmployeeIds) {
            if (!targetId) continue;
            
            const letter = await Letter.create({
                title,
                content,
                manager_id: managerId,
                employee_id: targetId,
                status: 'Sent'
            });

            const rLetter = await Letter.findByPk(letter.letter_id, {
                include: [{ model: Employee, as: 'Recipient' }]
            });
            
            if (rLetter && rLetter.Recipient && rLetter.Recipient.email) {
                try {
                    await Notification.create({
                        userId: rLetter.Recipient.email.toLowerCase(),
                        role: 'employee',
                        message: `You have received a new letter: ${title}`,
                        type: 'Letter'
                    });

                    // Emit real-time global notification
                    if (global.globalNotificationService) {
                        await global.globalNotificationService.sendGlobalNotification({
                            senderRole: 'manager',
                            senderEmail: req.user.email,
                            message: `Letter Sent: ${title}`,
                            type: 'Letter',
                            recipientEmails: [rLetter.Recipient.email]
                        });
                    }
                } catch (notifErr) {
                    console.error('Non-critical notification error:', notifErr);
                }
            }
            sentLetters.push(rLetter);
        }

        res.status(201).json({ success: true, data: sentLetters[0], all_sent: sentLetters.length });
    } catch (err) { 
        console.error('Critical Letter Save Error:', err);
        res.status(400).json({ success: false, error: err.message }); 
    }
};

exports.updateLetter = async (req, res) => {
    try {
        const { title, content } = req.body;
        const letter = await Letter.findByPk(req.params.id, {
            include: [{ model: Employee, as: 'Recipient' }]
        });
        if (!letter) return res.status(404).json({ success: false, error: "Letter not found" });
        
        letter.title = title || letter.title;
        letter.content = content || letter.content;
        await letter.save();

        if (letter.Recipient && letter.Recipient.email) {
            await Notification.create({
                userId: letter.Recipient.email.toLowerCase(),
                role: 'employee',
                message: `Your letter "${letter.title}" has been updated by your manager.`,
                type: 'Letter'
            });
        }
        res.status(200).json({ success: true, data: letter });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.deleteLetter = async (req, res) => {
    try {
        const letter = await Letter.findByPk(req.params.id);
        if (!letter) return res.status(404).json({ success: false, error: "Letter not found" });
        await letter.destroy();
        res.status(200).json({ success: true, message: "Letter deleted" });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};
