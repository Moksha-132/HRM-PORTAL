require('./models');
const { sequelize } = require('./config/db');
const { Employee } = require('./models');

Employee.sync({ alter: true })
    .then(() => {
        console.log('Employee model synced successfully with alter: true');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed to sync Employee model:', err);
        process.exit(1);
    });
