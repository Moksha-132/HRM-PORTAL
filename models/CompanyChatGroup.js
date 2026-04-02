const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CompanyChatGroup = sequelize.define('CompanyChatGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_direct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    direct_key: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }
}, {
    tableName: 'company_chat_groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CompanyChatGroup;
