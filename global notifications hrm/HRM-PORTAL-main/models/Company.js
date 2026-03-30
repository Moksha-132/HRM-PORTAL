const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please add a company name' },
            notEmpty: { msg: 'Please add a company name' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Please add a contact email' },
            isEmail: { msg: 'Please add a valid email' }
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Please add a location' }
        }
    },
    status: {
        type: DataTypes.ENUM('Active', 'Pending', 'Inactive'),
        defaultValue: 'Pending'
    },
    subscriptionPlan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = Company;
