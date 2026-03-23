const dotenv = require('dotenv');
// Note: We don't import mongoose anymore. We import sequelize models directly
const SuperAdmin = require('./models/SuperAdmin');
const Company = require('./models/Company');
const Employee = require('./models/EmployeeModel');
const { HeaderSetting, WebsiteSetting, AboutSetting, ContactSetting, Feature, Pricing } = require('./models/Settings');
const { sequelize } = require('./config/db');
const { Department } = require('./models');

// Load env vars
dotenv.config();

const importData = async () => {
    try {
        // Authenticate to database
        await sequelize.authenticate();
        console.log('Connected to Database for seeding...');

        // Sync schemas
        console.log('Syncing database (force: true)...');
        await sequelize.sync({ force: true }); 

        // Create Default Department
        const hrDep = await Department.create({
            department_name: 'Human Resources'
        });
        console.log('Created Human Resources department.');

        // Seed data
        console.log('Seeding administrative users...');
        await SuperAdmin.create({
            name: 'System Admin',
            email: 'hrm.admin123@gmail.com',
            password: 'password123', 
            role: 'Super Admin'
        });

        await SuperAdmin.create({
            name: 'Shnoor Manager',
            email: 'rshnoor.manager@gmail.com',
            password: 'password123',
            role: 'Manager'
        });

        console.log('Seeding employees...');
        await Employee.create({
            employee_name: 'Shnoor Employee',
            email: 'hrm.employee123@gmail.com',
            password: 'password123',
            role: 'Employee',
            department: 'Human Resources',
            department_id: hrDep.department_id,
            designation: 'Software Engineer',
            joining_date: new Date()
        });

        await HeaderSetting.destroy({ where: {} });
        await HeaderSetting.create({
            title: 'Shnoor International LLc',
            subtitle: 'Empowering Next-Gen Workforce',
            description: 'Advanced Human Resource Management designed for the modern enterprise.',
            buttonText: 'Get Started',
            buttonLink: '#register',
            showButton: true
        });

        await AboutSetting.destroy({ where: {} });
        await AboutSetting.create({
            title: 'Leading the Future of HR',
            description: 'Shnoor International provides a cutting-edge HR portal that simplifies workforce management for modern enterprises. We bridge the gap between people and productivity.',
            mission: 'To empower organizations with an intuitive platform that streamlines core HR processes, fostering an engaging work environment.',
            vision: 'To emerge as the leading provider of HR technology solutions, consistently setting new standards for ease-of-use and reliability.'
        });

        await ContactSetting.destroy({ where: {} });
        await ContactSetting.create({
            address: '123 Business Avenue, Suite 100\nNew York, NY 10001',
            email: 'contact@shnoor.com',
            phone: '+1 (555) 123-4567',
            facebook: '#',
            twitter: '#',
            linkedin: '#',
            instagram: '#'
        });

        await Feature.destroy({ where: {} });
        await Feature.bulkCreate([
            { title: 'Employee Directory', description: 'Centralized repository of all employee records and documents.', icon: '👥' },
            { title: 'Time Tracking', description: 'Automated attendance and leave management system.', icon: '⏱️' },
            { title: 'Payroll Integration', description: 'Seamlessly calculate and export payroll data.', icon: '💰' },
            { title: 'Performance Reviews', description: 'Built-in workflows for regular performance evaluations.', icon: '📈' },
            { title: 'Self-Service Portal', description: 'Employees can manage their own data and requests.', icon: '📱' },
            { title: 'Advanced Reporting', description: 'Customizable reports and analytics dashboards.', icon: '📊' }
        ]);

        await Pricing.destroy({ where: {} });
        await Pricing.bulkCreate([
            { planName: 'Basic', price: 49, features: ['Up to 50 Users', 'Basic Directory', 'Email Support'], isPopular: false },
            { planName: 'Pro', price: 99, features: ['Up to 250 Users', 'Performance Reviews', 'Time Tracking', 'Priority Support'], isPopular: true },
            { planName: 'Enterprise', price: 299, features: ['Unlimited Users', 'Payroll Integration', 'Custom Reporting', '24/7 Phone Support'], isPopular: false }
        ]);

        await Company.destroy({ where: {} });
        await Company.bulkCreate([
            {
                name: 'Shnoor Tech Solutions',
                email: 'contact@shnoortech.com',
                location: 'Dubai, UAE',
                status: 'Active'
            },
            {
                name: 'Global HR Services',
                email: 'hr@globalhr.com',
                location: 'London, UK',
                status: 'Pending'
            }
        ]);

        console.log('Seeder completed successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importData();
