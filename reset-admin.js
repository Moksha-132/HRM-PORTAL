/**
 * reset-admin.js
 * Run: node reset-admin.js
 * Resets the Super Admin password to Admin@1234
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/db');
const SuperAdmin = require('./models/SuperAdmin');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected');

        const newPassword = 'Admin@1234';
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        // Update all Super Admin / Admin accounts (or just the first one)
        const admins = await SuperAdmin.findAll({
            where: sequelize.literal(`role IN ('Super Admin', 'Admin')`)
        });

        for (const admin of admins) {
            admin.password = hashed;
            admin.changed('password', true);
            await admin.save({ hooks: false }); // skip beforeUpdate hook since we hashed manually
        }
        console.log('Password updated for', admins.length, 'admin account(s).');
        console.log('Accounts updated:', admins.map(a => a.email).join(', '));
        console.log('New password: Admin@1234');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
