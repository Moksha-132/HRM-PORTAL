const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const Employee = sequelize.define('Employee', {
    employee_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null if created by manager without initial password, but for login it's needed
        defaultValue: 'Emp@1234' // Default password for new employees
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profile_photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'department_id'
        }
    },
    manager_id: {
        type: DataTypes.INTEGER, // References Employee
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'OnLeave', 'Resigned'),
        defaultValue: 'Active'
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
    },
    work_mode: {
        type: DataTypes.STRING, // 'Work from Home', 'Hybrid', 'Work from Office'
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    hooks: {
        beforeCreate: async (emp) => {
            if (emp.password) {
                const salt = await bcrypt.genSalt(10);
                emp.password = await bcrypt.hash(emp.password, salt);
            }
        },
        beforeUpdate: async (emp) => {
            if (emp.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                emp.password = await bcrypt.hash(emp.password, salt);
            }
        }
    }
});

// Match user entered password to hashed password in database
Employee.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Employee;
