const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CompanyPolicy = sequelize.define('CompanyPolicy', {
    policy_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'company_policies',
    timestamps: true,
    createdAt: 'uploaded_date',
    updatedAt: false
});

module.exports = CompanyPolicy;
