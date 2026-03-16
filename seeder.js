const dotenv = require('dotenv');
// Note: We don't import mongoose anymore. We import sequelize models directly
const SuperAdmin = require('./models/SuperAdmin');
const Company = require('./models/Company');
const { HeaderSetting, AboutSetting, ContactSetting, Feature, Pricing } = require('./models/Settings');
const { sequelize } = require('./config/db');

// Load env vars
dotenv.config();

const importData = async () => {
    try {
        // Authenticate to database
        await sequelize.authenticate();
        console.log('Connected to Database for seeding...');

        // Sync schemas
        await sequelize.sync({ force: true }); // Warning: force: true DROPS ALL TABLES first!

        // Seed data
        await SuperAdmin.destroy({ where: {} });
        await SuperAdmin.create({
            name: 'System Admin',
            email: 'admin@shnoor.com',
            password: 'Admin@1234', // Hardcoded password from main.js frontend logic
            role: 'Super Admin'
        });

        await SuperAdmin.create({
            name: 'Shnoor Manager',
            email: 'manager@shnoor.com',
            password: 'Manager@1234',
            role: 'Manager'
        });

        await SuperAdmin.create({
            name: 'Shnoor Employee',
            email: 'emp@shnoor.com',
            password: 'Emp@1234',
            role: 'Employee'
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
