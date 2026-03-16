const { Employee, Attendance, Leave, Asset, Payroll, Expense, Appreciation, CompanyPolicy, Offboarding, Payslip, Holiday } = require('../models');
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

        // Assigned Assets
        const assignedAssets = await Asset.count({ where: { assigned_employee: empId } });

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

        const existing = await Attendance.findOne({ where: { employee_id: empId, date: today } });
        if (existing) return res.status(400).json({ success: false, error: 'Already clocked in today' });

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
        const today = new Date().toISOString().split('T')[0];

        const record = await Attendance.findOne({ where: { employee_id: empId, date: today, clock_out: null } });
        if (!record) return res.status(400).json({ success: false, error: 'No active clock-in found for today' });

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
        const list = await Offboarding.findAll({ where: { employee_id: req.user.employee_id } });
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
        const pay = await Payroll.findAll({ where: { employee_id: req.user.employee_id }, order: [['payment_date', 'DESC']] });
        res.status(200).json({ success: true, data: pay });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

exports.getMyPayslips = async (req, res) => {
    try {
        const slips = await Payslip.findAll({ where: { employee_id: req.user.employee_id }, order: [['payment_date', 'DESC']] });
        res.status(200).json({ success: true, data: slips });
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
