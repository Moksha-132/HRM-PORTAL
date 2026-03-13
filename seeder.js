const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SuperAdmin = require('./models/SuperAdmin');
const Company = require('./models/Company');
const { HeaderSetting, AboutSetting, ContactSetting, Feature, Pricing } = require('./models/Settings');

// Load env vars
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        await SuperAdmin.deleteMany();

        await SuperAdmin.create({
            name: 'System Admin',
            email: 'admin@shnoor.com',
            password: 'Admin@1234', // Hardcoded password from main.js frontend logic
            role: 'Super Admin'
        });

        await HeaderSetting.deleteMany();
        await HeaderSetting.create({
            title: 'Shnoor International LLc',
            subtitle: 'Empowering Next-Gen Workforce',
            description: 'Advanced Human Resource Management designed for the modern enterprise.',
            buttonText: 'Get Started',
            buttonLink: '#register',
            showButton: true
        });

        await AboutSetting.deleteMany();
        await AboutSetting.create({
            title: 'Leading the Future of HR',
            description: 'Shnoor International provides a cutting-edge HR portal that simplifies workforce management for modern enterprises. We bridge the gap between people and productivity.',
            mission: 'To empower organizations with an intuitive platform that streamlines core HR processes, fostering an engaging work environment.',
            vision: 'To emerge as the leading provider of HR technology solutions, consistently setting new standards for ease-of-use and reliability.'
        });

        await ContactSetting.deleteMany();
        await ContactSetting.create({
            address: '123 Business Avenue, Suite 100\nNew York, NY 10001',
            email: 'contact@shnoor.com',
            phone: '+1 (555) 123-4567',
            facebook: '#',
            twitter: '#',
            linkedin: '#',
            instagram: '#'
        });

        await Feature.deleteMany();
        await Feature.insertMany([
            { title: 'Employee Directory', description: 'Centralized repository of all employee records and documents.', icon: '👥' },
            { title: 'Time Tracking', description: 'Automated attendance and leave management system.', icon: '⏱️' },
            { title: 'Payroll Integration', description: 'Seamlessly calculate and export payroll data.', icon: '💰' },
            { title: 'Performance Reviews', description: 'Built-in workflows for regular performance evaluations.', icon: '📈' },
            { title: 'Self-Service Portal', description: 'Employees can manage their own data and requests.', icon: '📱' },
            { title: 'Advanced Reporting', description: 'Customizable reports and analytics dashboards.', icon: '📊' }
        ]);

        await Pricing.deleteMany();
        await Pricing.insertMany([
            { planName: 'Basic', price: 49, features: ['Up to 50 Users', 'Basic Directory', 'Email Support'], isPopular: false },
            { planName: 'Pro', price: 99, features: ['Up to 250 Users', 'Performance Reviews', 'Time Tracking', 'Priority Support'], isPopular: true },
            { planName: 'Enterprise', price: 299, features: ['Unlimited Users', 'Payroll Integration', 'Custom Reporting', '24/7 Phone Support'], isPopular: false }
        ]);

        await Company.deleteMany();
        await Company.create([
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
