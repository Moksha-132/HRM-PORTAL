const { Employee, SuperAdmin } = require('./models');
const { sequelize } = require('./config/db');
require('dotenv').config();

// Helper to validate email format
const isValidEmailField = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const updateTestEmails = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to Database for email updates...');

        // 1. Update Managers (stored in SuperAdmin table with role 'Manager')
        const managers = await SuperAdmin.findAll({ where: { role: 'Manager' } });
        console.log(`Found ${managers.length} managers.`);

        // Example unique Gmails (User should replace these with their real ones)
        const managerGmail = 'rarun.test.manager@gmail.com'; 
        
        for (let i = 0; i < managers.length; i++) {
            const m = managers[i];
            const newEmail = i === 0 ? managerGmail : `rarun.test.manager${i + 1}@gmail.com`;
            
            if (isValidEmailField(newEmail)) {
                console.log(`Updating Manager ${m.name}: ${m.email} -> ${newEmail}`);
                await m.update({ email: newEmail });
            } else {
                console.warn(`Invalid email format skipped: ${newEmail}`);
            }
        }

        // 2. Update Employees
        const employees = await Employee.findAll();
        console.log(`Found ${employees.length} employees.`);

        const employeeGmail = 'rarun.test.employee@gmail.com';

        for (let i = 0; i < employees.length; i++) {
            const e = employees[i];
            const newEmail = i === 0 ? employeeGmail : `rarun.test.employee${i + 1}@gmail.com`;

            if (isValidEmailField(newEmail)) {
                console.log(`Updating Employee ${e.employee_name}: ${e.email} -> ${newEmail}`);
                await e.update({ email: newEmail });
            } else {
                console.warn(`Invalid email format skipped: ${newEmail}`);
            }
        }

        console.log('User emails updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to update emails:', err);
        process.exit(1);
    }
};

updateTestEmails();
