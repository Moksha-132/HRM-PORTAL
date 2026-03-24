const { Employee, Attendance, Leave, Asset, Payroll, Expense, Appreciation, CompanyPolicy, Offboarding, Payslip, Holiday, Letter, Notification } = require('../models');
const fs = require('fs');
const path = require('path');

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
        const emp = await Employee.create(data);
        res.status(201).json({ success: true, data: emp });
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
        // Find letters associated with this manager
        // We assume req.user is populated properly and has an employee_id if they are a manager
        let managerId = req.user.employee_id;
        if (!managerId) {
            // fallback if req.user is just an email (SuperAdmin or special case)
            const emp = await Employee.findOne({ where: { email: req.user.email } });
            if (emp) managerId = emp.employee_id;
        }

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
        const { employee_id, title, content } = req.body;
        if (!employee_id || !title || !content) {
            return res.status(400).json({ success: false, error: "Please provide employee, title, and content" });
        }

        let managerId = req.user.employee_id;
        if (!managerId) {
            const emp = await Employee.findOne({ where: { email: req.user.email } });
            if (emp) managerId = emp.employee_id;
        }

        if (!managerId) return res.status(400).json({ success: false, error: "Manager profile required to send letter" });

        let targetEmployeeIds = [];
        if (employee_id === 'all') {
            const allEmps = await Employee.findAll({ where: { role: 'Employee', status: 'Active' } });
            targetEmployeeIds = allEmps.map(e => e.employee_id);
        } else {
            targetEmployeeIds = [employee_id];
        }

        if (targetEmployeeIds.length === 0) {
             return res.status(400).json({ success: false, error: "No target employees found." });
        }

        const sentLetters = [];
        for (const targetId of targetEmployeeIds) {
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
                await Notification.create({
                    userId: rLetter.Recipient.email.toLowerCase(),
                    role: 'employee',
                    message: `You have received a new letter: ${title}`,
                    type: 'Letter'
                });
            }
            sentLetters.push(rLetter);
        }

        res.status(201).json({ success: true, data: sentLetters[0], all_sent: sentLetters.length });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
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
