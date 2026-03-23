const { Employee, SuperAdmin } = require('./models');
const { connectDB, sequelize } = require('./config/db');

const checkEmails = async () => {
    try {
        await connectDB();
        
        console.log('--- EMPLOYEES ---');
        const employees = await Employee.findAll();
        employees.forEach(emp => {
            console.log(`- ${emp.employee_name}: [${emp.email}]`);
        });

        console.log('\n--- ADMINS/MANAGERS ---');
        const admins = await SuperAdmin.findAll();
        admins.forEach(admin => {
            console.log(`- ${admin.name} (${admin.role}): [${admin.email}]`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkEmails();
