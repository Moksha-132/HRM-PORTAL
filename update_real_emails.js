const { Employee, SuperAdmin } = require('./models');
const { sequelize } = require('./config/db');
const { Op } = require('sequelize');
require('dotenv').config();

const updateRealTestEmails = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to Database for final email updates...');

        // 1. Update Super Admin
        const superAdmin = await SuperAdmin.findOne({ where: { role: 'Super Admin' } });
        if (superAdmin) {
            console.log(`Updating Super Admin: ${superAdmin.email} -> hrm.admin123@gmail.com`);
            await superAdmin.update({ email: 'hrm.admin123@gmail.com', password: 'Admin@1234' });
        }

        // 2. Update Manager
        const manager = await SuperAdmin.findOne({ where: { role: 'Manager' } });
        if (manager) {
            console.log(`Updating Manager: ${manager.email} -> rarunkumarnaik07@gmail.com`);
            await manager.update({ email: 'rarunkumarnaik07@gmail.com', password: 'Admin@1234' });
        }

        // 3. Update Employee
        // We'll update the first employee found or the one that was previously a test one
        const employee = await Employee.findOne();
        if (employee) {
            console.log(`Updating Employee: ${employee.email} -> hrm.employee123@gmail.com`);
            await employee.update({ email: 'hrm.employee123@gmail.com', password: 'Admin@1234' });
        }

        console.log('Real test emails updated in Database successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to update real emails:', err);
        process.exit(1);
    }
};

updateRealTestEmails();
