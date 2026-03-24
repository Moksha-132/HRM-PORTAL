// Import all existing models
const SuperAdmin = require('./SuperAdmin');
const Company = require('./Company');
const EmailQuery = require('./EmailQuery');
const OfflineRequest = require('./OfflineRequest');
const { HeaderSetting, WebsiteSetting, AboutSetting, ContactSetting, Feature, Pricing } = require('./Settings');
const Subscription = require('./Subscription');
const Transaction = require('./Transaction');
const ChatMessage = require('./ChatMessage');
const Notification = require('./Notification');

// Import Manager Panel Models
const Department = require('./DepartmentModel');
const Employee = require('./EmployeeModel');
const Attendance = require('./AttendanceModel');
const Leave = require('./LeaveModel');
const Asset = require('./AssetModel');
const Payroll = require('./PayrollModel');
const Expense = require('./ExpenseModel');
const Appreciation = require('./AppreciationModel');
const CompanyPolicy = require('./CompanyPolicyModel');
const Offboarding = require('./OffboardingModel');
const Payslip = require('./PayslipModel');
const Holiday = require('./HolidayModel');
const Letter = require('./LetterModel');

// Define Associations here if necessary
// e.g.
Employee.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(Employee, { foreignKey: 'department_id' });

Employee.belongsTo(Employee, { as: 'Manager', foreignKey: 'manager_id' });

Attendance.belongsTo(Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Employee.hasMany(Attendance, { foreignKey: 'employee_id', onDelete: 'CASCADE' });

Leave.belongsTo(Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Employee.hasMany(Leave, { foreignKey: 'employee_id', onDelete: 'CASCADE' });

Asset.belongsTo(Employee, { foreignKey: 'assigned_employee', onDelete: 'SET NULL' });
Employee.hasMany(Asset, { foreignKey: 'assigned_employee', onDelete: 'SET NULL' });

Payroll.belongsTo(Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Employee.hasMany(Payroll, { foreignKey: 'employee_id', onDelete: 'CASCADE' });

Expense.belongsTo(Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Employee.hasMany(Expense, { foreignKey: 'employee_id', onDelete: 'CASCADE' });

Appreciation.belongsTo(Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Employee.hasMany(Appreciation, { foreignKey: 'employee_id', onDelete: 'CASCADE' });

Offboarding.belongsTo(Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Employee.hasMany(Offboarding, { foreignKey: 'employee_id', onDelete: 'CASCADE' });

Payslip.belongsTo(Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
Employee.hasMany(Payslip, { foreignKey: 'employee_id', onDelete: 'CASCADE' });

Letter.belongsTo(Employee, { as: 'Sender', foreignKey: 'manager_id', onDelete: 'CASCADE' });
Letter.belongsTo(Employee, { as: 'Recipient', foreignKey: 'employee_id', onDelete: 'CASCADE' });


module.exports = {
    SuperAdmin, Company, EmailQuery, OfflineRequest, HeaderSetting, WebsiteSetting, AboutSetting, ContactSetting, Feature, Pricing, Subscription, Transaction,
    Department, Employee, Attendance, Leave, Asset, Payroll, Expense, Appreciation, CompanyPolicy, Offboarding, Payslip, Holiday, Letter,
    ChatMessage, Notification
};
