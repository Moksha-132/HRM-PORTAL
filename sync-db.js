require('./models');
const { sequelize } = require('./config/db');

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced with new manager models successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
        process.exit(1);
    });
