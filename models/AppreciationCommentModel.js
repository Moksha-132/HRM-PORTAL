const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AppreciationComment = sequelize.define('AppreciationComment', {
    comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    appreciation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    commenter_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    commenter_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'appreciation_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = AppreciationComment;
