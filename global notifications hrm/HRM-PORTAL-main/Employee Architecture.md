# GLOBALHR CLOUD

## HRM SAAS PLATFORM

### EMPLOYEE PANEL ARCHITECTURE

------------------------------------------------------------------------

## ROLE DESCRIPTION

**Role**: Employee

**Purpose**: Employees use this panel to manage their personal HR information and workplace activities.

**Main Responsibilities**:
- Mark attendance
- Apply for leave
- View payslips
- Submit expenses
- Access company policies
- Manage profile information

------------------------------------------------------------------------

## EMPLOYEE PANEL STRUCTURE

    EmployeePanel
    │
    ├── Dashboard
    │
    ├── AssetManagement
    │
    ├── HolidayCalendar
    │
    ├── AppreciationSystem
    │
    ├── LeaveManagement
    │
    ├── AttendanceTracking
    │
    ├── OffboardingRequests
    │
    ├── LetterHeadDownloads
    │
    ├── ExpenseManagement
    │
    ├── PayrollAccess
    │
    ├── CompanyPolicyViewer
    │
    ├── CustomFields
    │
    └── ProfileManagement

------------------------------------------------------------------------

# DASHBOARD ARCHITECTURE

    EmployeeDashboard
    │
    ├── ProfileCard
    │   │
    │   ├── EmployeeName
    │   ├── Designation
    │   ├── Department
    │   ├── PhoneNumber
    │   ├── Email
    │   ├── Address
    │   └── JoiningDate
    │
    ├── AttendanceDetails
    │   │
    │   ├── TotalAttendance
    │   ├── PresentDays
    │   ├── LeaveDays
    │   ├── HalfDays
    │   └── LateAttendance
    │
    ├── LeaveDetails
    │   │
    │   ├── TotalLeaves
    │   ├── ApprovedLeaves
    │   ├── PendingLeaves
    │   ├── RejectedLeaves
    │   └── PaidUnpaidLeaves
    │
    ├── ActivityCounters
    │   │
    │   ├── Appreciations
    │   ├── Warnings
    │   ├── Expenses
    │   └── Complaints
    │
    └── WorkingHoursDetails

------------------------------------------------------------------------

# LEAVE MANAGEMENT MODULE

    LeaveManagement
    │
    ├── ApplyLeave
    │   │
    │   ├── LeaveType
    │   ├── StartDate
    │   ├── EndDate
    │   ├── LeaveReason
    │   └── SubmitRequest
    │
    ├── LeaveStatus
    │
    ├── LeaveHistory
    │
    └── LeaveBalance

------------------------------------------------------------------------

# ATTENDANCE MODULE

    AttendanceTracking
    │
    ├── DailyAttendance
    │
    ├── MonthlyAttendance
    │
    ├── AttendanceHistory
    │
    └── AttendanceReports

------------------------------------------------------------------------

# EXPENSE MANAGEMENT MODULE

    ExpenseManagement
    │
    ├── SubmitExpense
    │   │
    │   ├── ExpenseType
    │   ├── Amount
    │   ├── Date
    │   ├── ReceiptUpload
    │   └── Description
    │
    ├── ExpenseHistory
    │
    └── ExpenseStatus

------------------------------------------------------------------------

# PAYROLL ACCESS MODULE

    PayrollAccess
    │
    ├── Payslips
    │
    ├── SalaryBreakdown
    │
    └── TaxInformation

------------------------------------------------------------------------

# PROFILE MANAGEMENT MODULE

    ProfileManagement
    │
    ├── PersonalInformation
    │
    ├── ContactInformation
    │
    ├── EmergencyContacts
    │
    ├── Documents
    │
    └── PasswordSettings

------------------------------------------------------------------------

# FRONTEND ARCHITECTURE

    frontend/

    src
    │
    ├── pages
    │   ├── EmployeeDashboard.jsx
    │   ├── LeavesPage.jsx
    │   ├── AttendancePage.jsx
    │   ├── ExpensesPage.jsx
    │   ├── PayrollPage.jsx
    │   └── ProfilePage.jsx
    │
    ├── components
    │   ├── SidebarNavigation.jsx
    │   ├── DashboardCards.jsx
    │   ├── LeaveApplicationForm.jsx
    │   ├── AttendanceChart.jsx
    │   └── ExpenseTable.jsx
    │
    └── services
        ├── employeeService.js
        ├── attendanceService.js
        ├── leaveService.js
        ├── expenseService.js
        └── payrollService.js

------------------------------------------------------------------------

# BACKEND ARCHITECTURE

    backend/

    src
    │
    ├── controllers
    │   ├── employeeController.js
    │   ├── attendanceController.js
    │   ├── leaveController.js
    │   ├── expenseController.js
    │   └── payrollController.js
    │
    ├── routes
    │   ├── employeeRoutes.js
    │   ├── attendanceRoutes.js
    │   ├── leaveRoutes.js
    │   ├── expenseRoutes.js
    │   └── payrollRoutes.js
    │
    ├── models
    │   ├── EmployeeModel.js
    │   ├── AttendanceModel.js
    │   ├── LeaveModel.js
    │   ├── ExpenseModel.js
    │   └── PayrollModel.js
    │
    └── server.js

------------------------------------------------------------------------

# DATABASE TABLES

## employees

    employee_id
    name
    email
    department
    designation
    joining_date

## attendance

    attendance_id
    employee_id
    date
    clock_in
    clock_out

## leaves

    leave_id
    employee_id
    leave_type
    start_date
    end_date
    status

## expenses

    expense_id
    employee_id
    amount
    receipt
    status

## payroll

    payroll_id
    employee_id
    salary
    deductions
    net_salary

------------------------------------------------------------------------

# END
