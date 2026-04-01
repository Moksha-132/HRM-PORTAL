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
        
        let user;
        if (decoded.role === 'Employee') {
            user = await Employee.findByPk(decoded.id);
        } else {
            user = await SuperAdmin.findByPk(decoded.id);
            if (user) {
                // Ensure every Manager/Admin has a record in the Employee table for self-service
                let empRecord = await Employee.findOne({ where: { email: user.email } });
                
                if (!empRecord) {
                    // Create a shadow employee record if it doesn't exist
                    empRecord = await Employee.create({
                        employee_name: user.name,
                        email: user.email,
                        role: user.role, // e.g. 'Manager'
                        status: 'Active',
                        designation: user.role,
                        department: 'Management',
                        joining_date: new Date()
                    });
                }

                // Attach employee properties to the user object for the controllers
                user.employee_id = empRecord.employee_id;
                user.employee_name = empRecord.employee_name;
                user.department = empRecord.department;
                user.designation = empRecord.designation;
                user.joining_date = empRecord.joining_date;
                user.manager_id = empRecord.manager_id;
            }
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'User no longer exists' });
        }

        req.user = user;

        // Ensure email is always available
        if (!req.user.email) {
            return res.status(401).json({ success: false, error: 'Invalid user data' });
        }

        next();
    } catch (err) {
        console.error('Auth error:', err.message);
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
