const { Employee, Attendance, Leave, Asset, Payroll, Expense, Appreciation, CompanyPolicy, Offboarding, Payslip, Holiday, Letter } = require('../models');
const { Op } = require('sequelize');

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const empId = req.user.employee_id;
        const today = new Date().toISOString().split('T')[0];

        // Today's attendance
        const todayAttendance = await Attendance.findOne({ where: { employee_id: empId, date: today } });
        
        // Late count (let's assume after 10:00 AM is late)
        const lateAttendance = await Attendance.count({
            where: {
                employee_id: empId,
                clock_in: { [Op.gt]: new Date(`${today}T10:00:00`) }
            }
        });

        // Total working hours (sum of all work_duration)
        const totalDuration = await Attendance.sum('work_duration', { where: { employee_id: empId } });

        // Recent Appreciations
        const recentAppreciations = await Appreciation.findAll({ where: { employee_id: empId }, limit: 5, order: [['date', 'DESC']] });

        // Assigned Assets (Only count those currently 'Assigned')
        const assignedAssets = await Asset.count({ where: { assigned_employee: empId, status: 'Assigned' } });

        // Recent Leave Activity
        const recentLeaves = await Leave.findAll({ where: { employee_id: empId }, limit: 5, order: [['leave_id', 'DESC']] });

        res.status(200).json({
            success: true,
            data: {
                employee: {
                    name: req.user.employee_name,
                    joining_date: req.user.joining_date,
                    department: req.user.department,
                    designation: req.user.designation
                },
                todayStatus: todayAttendance ? (todayAttendance.clock_out ? 'Completed' : 'Checked In') : 'Not Checked In',
                totalWorkingHours: totalDuration || 0,
                lateAttendanceCount: lateAttendance,
                appreciationCount: recentAppreciations.length,
                assetCount: assignedAssets,
                recentActivities: {
                    appreciations: recentAppreciations,
                    leaves: recentLeaves
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- ATTENDANCE ---
exports.clockIn = async (req, res) => {
    try {
        const empId = req.user.employee_id;
        const today = new Date().toISOString().split('T')[0];

        // Check if there's an active (unclosed) clock-in
        const active = await Attendance.findOne({ where: { employee_id: empId, clock_out: null } });
        if (active) return res.status(400).json({ success: false, error: 'You are already clocked in. Please clock out first before clocking in again.' });

        const record = await Attendance.create({
            employee_id: empId,
            date: today,
            clock_in: new Date(),
            status: 'Present'
        });

        res.status(201).json({ success: true, data: record });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.clockOut = async (req, res) => {
    try {
        const empId = req.user.employee_id;

        // Find the most recent active clock-in session (even if from a previous day)
        const record = await Attendance.findOne({ 
            where: { employee_id: empId, clock_out: null },
            order: [['clock_in', 'DESC']]
        });
        
        if (!record) return res.status(400).json({ success: false, error: 'No active clock-in found. Please clock in first.' });

        const clockOutTime = new Date();
        const duration = (clockOutTime - new Date(record.clock_in)) / (1000 * 60 * 60); // In hours

        await record.update({
            clock_out: clockOutTime,
            work_duration: parseFloat(duration.toFixed(2))
        });

        res.status(200).json({ success: true, data: record });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.getAttendanceHistory = async (req, res) => {
    try {
        const history = await Attendance.findAll({ where: { employee_id: req.user.employee_id }, order: [['date', 'DESC']] });
        res.status(200).json({ success: true, data: history });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- LEAVES ---
exports.applyLeave = async (req, res) => {
    try {
        const data = { ...req.body, employee_id: req.user.employee_id, status: 'Pending' };
        const leave = await Leave.create(data);
        res.status(201).json({ success: true, data: leave });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.findAll({ where: { employee_id: req.user.employee_id }, order: [['leave_id', 'DESC']] });
        res.status(200).json({ success: true, data: leaves });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- ASSETS ---
exports.getMyAssets = async (req, res) => {
    try {
        const assets = await Asset.findAll({ where: { assigned_employee: req.user.employee_id } });
        res.status(200).json({ success: true, data: assets });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- APPRECIATIONS ---
exports.getMyAppreciations = async (req, res) => {
    try {
        const list = await Appreciation.findAll({ where: { employee_id: req.user.employee_id }, order: [['date', 'DESC']] });
        res.status(200).json({ success: true, data: list });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- HOLIDAYS ---
exports.getUpcomingHolidays = async (req, res) => {
    try {
        const holis = await Holiday.findAll({ order: [['date', 'ASC']] });
        res.status(200).json({ success: true, data: holis });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- POLICIES ---
exports.getPolicies = async (req, res) => {
    try {
        const pols = await CompanyPolicy.findAll({ order: [['uploaded_date', 'DESC']] });
        res.status(200).json({ success: true, data: pols });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- OFFBOARDING ---
exports.submitResignation = async (req, res) => {
    try {
        const data = { ...req.body, employee_id: req.user.employee_id, status: 'Pending' };
        const off = await Offboarding.create(data);
        res.status(201).json({ success: true, data: off });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.getMyOffboardings = async (req, res) => {
    try {
        const list = await Offboarding.findAll({ where: { employee_id: req.user.employee_id }, order: [['created_at', 'DESC']] });
        res.status(200).json({ success: true, data: list });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- EXPENSES ---
exports.submitExpense = async (req, res) => {
    try {
        const data = { ...req.body, employee_id: req.user.employee_id, status: 'Pending' };
        const exp = await Expense.create(data);
        res.status(201).json({ success: true, data: exp });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.getMyExpenses = async (req, res) => {
    try {
        const list = await Expense.findAll({ where: { employee_id: req.user.employee_id }, order: [['id', 'DESC']] });
        res.status(200).json({ success: true, data: list });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- PAYROLL / PAYSLIPS ---
exports.getMyPayroll = async (req, res) => {
    try {
        // Display only payroll records that have an associated Payslip (meaning they are "published")
        const slips = await Payslip.findAll({ 
            where: { employee_id: req.user.employee_id }, 
            order: [['payment_date', 'DESC']] 
        });
        res.status(200).json({ success: true, data: slips });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.getMyPayslips = async (req, res) => {
    try {
        const slips = await Payslip.findAll({ where: { employee_id: req.user.employee_id }, order: [['payment_date', 'DESC']] });
        res.status(200).json({ success: true, data: slips });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.downloadPayslip = async (req, res) => {
    try {
        const slip = await Payslip.findByPk(req.params.id, { include: [Employee] });
        if (!slip || slip.employee_id !== req.user.employee_id) {
            return res.status(404).json({ success: false, error: "Payslip not found" });
        }

        const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                .payslip-box { border: 2px solid #333; padding: 30px; max-width: 600px; margin: auto; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #777; }
                .total { font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="payslip-box">
                <div class="header">
                    <h2>OFFICIAL PAYSLIP</h2>
                    <p>SHNOOR HRM PORTAL</p>
                </div>
                <div class="grid">
                    <div>
                        <strong>Employee Details:</strong><br>
                        Name: ${req.user.employee_name}<br>
                        ID: ${req.user.employee_id}
                    </div>
                    <div>
                        <strong>Payment Info:</strong><br>
                        Date: ${slip.payment_date}
                    </div>
                </div>
                <div style="margin-top: 30px;">
                    <strong>Earnings:</strong><br>
                    Basic Salary: $${slip.basic_salary}<br>
                    Allowances: $${slip.allowances}
                </div>
                <div style="margin-top: 20px;">
                    <strong>Deductions:</strong><br>
                    Total Deductions: $${slip.deductions}
                </div>
                <div class="total">
                    NET PAYABLE: $${slip.net_salary}
                </div>
                <div class="footer">
                    This is an electronically generated document. No signature required.
                </div>
            </div>
        </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename=payslip_${slip.payment_date}.html`);
        res.send(content);

    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- PROFILE ---
exports.getProfile = async (req, res) => {
    res.status(200).json({ success: true, data: req.user });
};

exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            employee_name: req.body.employee_name,
            phone: req.body.phone,
            email: req.body.email
        };
        await req.user.update(fieldsToUpdate);
        res.status(200).json({ success: true, data: req.user });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const isMatch = await req.user.matchPassword(currentPassword);
        if (!isMatch) return res.status(400).json({ success: false, error: 'Current password incorrect' });

        req.user.password = newPassword;
        await req.user.save();
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

// --- LETTERS ---
exports.getEmployeeLetters = async (req, res) => {
    try {
        const letters = await Letter.findAll({
            where: { employee_id: req.user.employee_id },
            include: [{ model: SuperAdmin, as: 'Sender' }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ success: true, data: letters });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.updateLetter = async (req, res) => {
    try {
        const letter = await Letter.findByPk(req.params.id);
        if(!letter) return res.status(404).json({ success: false, error: "Not found" });
        
        // Ensure the letter belongs to the employee
        if (letter.employee_id !== req.user.employee_id) {
            return res.status(403).json({ success: false, error: "Not authorized to edit this letter" });
        }
        
        // Update content and change status
        const { content } = req.body;
        if (!content) return res.status(400).json({ success: false, error: "Content is required" });
        
        await letter.update({
            content,
            status: 'Edited'
        });
        
        const updatedLetter = await Letter.findByPk(letter.letter_id, {
            include: [{ model: Employee, as: 'Sender' }]
        });

        // NOTIFY MANAGER (Sender)
        if (updatedLetter && updatedLetter.Sender && updatedLetter.Sender.email) {
            await Notification.create({
                userId: updatedLetter.Sender.email.toLowerCase(),
                role: 'manager',
                message: `Employee ${req.user.employee_name} has edited the letter: "${updatedLetter.title}"`,
                type: 'Letter'
            });
        }

        res.status(200).json({ success: true, data: updatedLetter });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};
