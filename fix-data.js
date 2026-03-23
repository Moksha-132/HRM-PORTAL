const { Employee, SuperAdmin, Department } = require('./models');
const { sequelize } = require('./config/db');
require('dotenv').config();

const updateDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB...');

        // 1. Create a default department
        let itDep = await Department.findOne({ where: { department_name: 'Information Technology' } });
        if (!itDep) {
            itDep = await Department.create({ department_name: 'Information Technology' });
            console.log('Created Information Technology department.');
        }

        // 2. Update/Create Super Admin (hrm.admin123@gmail.com)
        let admin = await SuperAdmin.findOne({ where: { role: 'Super Admin' } });
        if (admin) {
            console.log(`Updating Admin ${admin.email} -> hrm.admin123@gmail.com`);
            await admin.update({ email: 'hrm.admin123@gmail.com', password: 'password123' });
        } else {
            console.log('Creating new Super Admin: hrm.admin123@gmail.com');
            await SuperAdmin.create({ name: 'System Admin', email: 'hrm.admin123@gmail.com', password: 'password123', role: 'Super Admin' });
        }

        // 3. Update/Create Employee (hrm.employee123@gmail.com)
        let emp = await Employee.findOne({ where: { email: 'emp@shnoor.com' } });
        if (!emp) emp = await Employee.findOne(); // Fallback to first employee
        
        if (emp) {
            console.log(`Updating Employee ${emp.email} -> hrm.employee123@gmail.com`);
            await emp.update({ 
                email: 'hrm.employee123@gmail.com', 
                password: 'password123', 
                department_id: itDep.department_id,
                employee_name: 'Arun Employee' 
            });
        } else {
            console.log('Creating new Employee: hrm.employee123@gmail.com');
            await Employee.create({ 
                employee_name: 'Arun Employee', 
                email: 'hrm.employee123@gmail.com', 
                password: 'password123', 
                department_id: itDep.department_id,
                designation: 'Software Engineer',
                role: 'Employee'
            });
        }

        // 4. Update Manager
        let manager = await SuperAdmin.findOne({ where: { role: 'Manager' } });
        if (manager) {
            console.log(`Updating Manager ${manager.email} -> rshnoor.manager@gmail.com`);
            await manager.update({ email: 'rshnoor.manager@gmail.com', password: 'password123' });
        } else {
            console.log('Creating new Manager: rshnoor.manager@gmail.com');
            await SuperAdmin.create({ name: 'Arun Manager', email: 'rshnoor.manager@gmail.com', password: 'password123', role: 'Manager' });
        }

        console.log('Database updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to update DB:', err);
        process.exit(1);
    }
};

updateDB();
