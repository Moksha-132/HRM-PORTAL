const { Sequelize } = require('sequelize');
require('./loadEnv');

const postgresUri = process.env.POSTGRES_URI || process.env.DATABASE_URL;

const sequelize = postgresUri
    ? new Sequelize(postgresUri, {
        dialect: 'postgres',
        logging: false,
    })
    : new Sequelize(
        process.env.DB_NAME || 'hrm_portal',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'postgres',
        {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            dialect: 'postgres',
            logging: false,
        }
    );

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`PostgreSQL Connected: ${sequelize.config.host}`);
    } catch (error) {
        console.error(`Error connecting to PostgreSQL: ${error.message}`);
        if (!postgresUri && !process.env.DB_PASSWORD) {
            console.error('Missing PostgreSQL configuration. Add POSTGRES_URI or DB_NAME/DB_USER/DB_PASSWORD/DB_HOST/DB_PORT to your .env file.');
        }
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
