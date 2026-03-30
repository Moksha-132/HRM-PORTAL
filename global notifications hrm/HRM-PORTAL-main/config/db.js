const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// Assuming POSTGRES_URI is defined in your .env file
// Format: postgres://username:password@localhost:5432/database_name
const sequelize = new Sequelize(process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/hrm_portal', {
    dialect: 'postgres',
    logging: false, // Set to true if you want to see SQL queries in the console
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`PostgreSQL Connected: ${sequelize.config.host}`);
    } catch (error) {
        console.error(`Error connecting to PostgreSQL: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
