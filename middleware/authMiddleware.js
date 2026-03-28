const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const Employee = require('../models/EmployeeModel');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role === 'Employee') {
            req.user = await Employee.findByPk(decoded.id);
        } else {
            req.user = await SuperAdmin.findByPk(decoded.id);
        }

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User no longer exists' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: `User role ${req.user.role} is not authorized` });
        }
        next();
    };
};
