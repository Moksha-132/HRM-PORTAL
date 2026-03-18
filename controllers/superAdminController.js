const SuperAdmin = require('../models/SuperAdmin');
const Employee = require('../models/EmployeeModel');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
    // Include role in payload to help middleware distinguish between tables if necessary
    const token = jwt.sign({ id: user.id || user.employee_id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: { 
            id: user.id || user.employee_id, 
            name: user.name || user.employee_name, 
            email: user.email, 
            role: user.role 
        }
    });
};

// @desc    Login User (Super Admin, Manager, or Employee)
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        // 1. Check SuperAdmin table (Super Admin, Admin, Manager)
        let user = await SuperAdmin.findOne({ where: { email } });

        // If a SuperAdmin record exists but is marked Employee, prefer the Employee table
        if (user && user.role === 'Employee') {
            const emp = await Employee.findOne({ where: { email } });
            if (emp) {
                user = emp;
            }
        }

        if (!user) {
            // 2. Check Employee table
            user = await Employee.findOne({ where: { email } });
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Register initial Super Admin (setup only)
// @route   POST /api/v1/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await SuperAdmin.create({ name, email, password, role });
        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all Super Admins
// @route   GET /api/v1/auth/users
exports.getUsers = async (req, res) => {
    try {
        const users = await SuperAdmin.findAll();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete User
// @route   DELETE /api/v1/auth/users/:id
exports.deleteUser = async (req, res) => {
    try {
        await SuperAdmin.destroy({ where: { id: req.params.id } });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await SuperAdmin.findByPk(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };
        // Option to include other basic details, but for now name and email.

        const user = await SuperAdmin.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        await user.update(fieldsToUpdate);

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
