const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const Employee = require('../models/EmployeeModel');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
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
                        phone: user.phone || null,
                        profile_photo: user.profile_photo || null,
                        status: 'Active',
                        designation: user.role,
                        department: 'Management',
                        joining_date: new Date()
                    });
                } else {
                    // Keep key profile fields in sync between SuperAdmin and shadow employee profile.
                    const syncPatch = {};
                    if (user.name && empRecord.employee_name !== user.name) syncPatch.employee_name = user.name;
                    if (user.phone !== undefined && empRecord.phone !== user.phone) syncPatch.phone = user.phone;
                    if (user.profile_photo !== undefined && empRecord.profile_photo !== user.profile_photo) {
                        syncPatch.profile_photo = user.profile_photo;
                    }
                    if (Object.keys(syncPatch).length > 0) {
                        await empRecord.update(syncPatch);
                    }
                }

                // Attach employee properties to the user object for the controllers
                user.employee_id = empRecord.employee_id;
                user.employee_name = empRecord.employee_name;
                user.department = empRecord.department;
                user.designation = empRecord.designation;
                user.joining_date = empRecord.joining_date;
                user.manager_id = empRecord.manager_id;
                user.work_mode = empRecord.work_mode;
                user.location = empRecord.location;
                user.profile_photo = empRecord.profile_photo || user.profile_photo || null;
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
