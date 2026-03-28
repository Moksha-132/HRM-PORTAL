# GLOBALHR CLOUD

## HRM SAAS PLATFORM

### MANAGER PANEL ARCHITECTURE

------------------------------------------------------------------------

## ROUTE

`/manager`

------------------------------------------------------------------------

## MANAGER PAGE STRUCTURE

    ManagerDashboard
    │
    ├── SidebarNavigation
    │   ├── Dashboard
    │   ├── Employees
    │   ├── Attendance
    │   ├── Leaves
    │   ├── Assets
    │   ├── Payroll
    │   ├── Appreciations
    │   ├── CompanyPolicies
    │   ├── Offboardings
    │   └── Finance
    │
    └── MainContentArea
        ├── TopHeader
        │   ├── PageTitle
        │   ├── Notifications
        │   ├── LanguageSelector
        │   └── ProfileMenu
        │
        └── ContentPanel

------------------------------------------------------------------------

# DASHBOARD ARCHITECTURE

    ManagerDashboard
    │
    ├── AttendanceQuickPanel
    │   ├── CurrentIPAddress
    │   ├── CurrentTime
    │   ├── ClockInButton
    │   ├── ClockOutButton
    │   └── WorkStatusIndicator
    │
    ├── EmployeeStatisticsCards
    │   ├── TotalEmployees
    │   ├── ActiveEmployees
    │   ├── InactiveEmployees
    │   └── EmployeesUnderManager
    │
    ├── PendingApprovalSection
    │   ├── LeaveApprovals
    │   ├── ExpenseApprovals
    │   └── AssetRequests
    │
    ├── AttendanceOverviewWidget
    │   ├── TotalAttendance
    │   ├── PresentEmployees
    │   ├── AbsentEmployees
    │   └── LateEmployees
    │
    └── ClockInOutStatusWidget
        ├── EmployeesClockedIn
        └── EmployeesClockedOut

------------------------------------------------------------------------

# EMPLOYEE MANAGEMENT ARCHITECTURE

    EmployeeManagement
    │
    ├── EmployeeDirectory
    │   ├── EmployeeID
    │   ├── EmployeeName
    │   ├── Email
    │   ├── Phone
    │   ├── Department
    │   ├── Designation
    │   ├── Status
    │   └── ProfileActions
    │
    ├── EmployeeProfile
    │   ├── PersonalInformation
    │   ├── ContactInformation
    │   ├── JobInformation
    │   ├── Documents
    │   └── PerformanceRecords
    │
    ├── DepartmentManagement
    │   ├── DepartmentName
    │   ├── DepartmentHead
    │   ├── TotalEmployees
    │   └── DepartmentActions
    │
    ├── DesignationManagement
    │
    └── ShiftManagement

------------------------------------------------------------------------

# ATTENDANCE MANAGEMENT ARCHITECTURE

    AttendanceManagement
    │
    ├── ClockInSystem
    │   ├── EmployeeID
    │   ├── ClockInTime
    │   ├── IPAddress
    │   ├── DeviceInformation
    │   └── LocationTracking
    │
    ├── ClockOutSystem
    │   ├── EmployeeID
    │   ├── ClockOutTime
    │   ├── WorkDuration
    │   └── OvertimeCalculation
    │
    ├── AttendanceReports
    │   ├── DailyAttendance
    │   ├── WeeklyAttendance
    │   ├── MonthlyAttendance
    │   └── DepartmentAttendance
    │
    └── AttendanceAnalytics
        ├── AttendanceRate
        ├── AbsenteeismRate
        └── LateArrivalStatistics

------------------------------------------------------------------------

# LEAVE MANAGEMENT ARCHITECTURE

    LeaveManagement
    │
    ├── LeaveRequests
    │   ├── EmployeeName
    │   ├── LeaveType
    │   ├── StartDate
    │   ├── EndDate
    │   ├── LeaveReason
    │   └── LeaveStatus
    │
    ├── LeaveApprovalWorkflow
    │   ├── PendingRequests
    │   ├── ApprovedRequests
    │   └── RejectedRequests
    │
    ├── LeaveBalances
    │
    └── LeaveHistory

------------------------------------------------------------------------

# ASSET MANAGEMENT ARCHITECTURE

    AssetManagement
    │
    ├── AssetInventory
    │   ├── AssetID
    │   ├── AssetName
    │   ├── AssetCategory
    │   ├── AssetStatus
    │   └── AssetLocation
    │
    ├── AssetAssignment
    │   ├── AssignAsset
    │   ├── AssignedEmployee
    │   ├── AssignmentDate
    │   └── ReturnDate
    │
    └── AssetTracking

------------------------------------------------------------------------

# PAYROLL ARCHITECTURE

    PayrollOverview
    │
    ├── SalaryStructure
    │
    ├── Payslips
    │   ├── BasicSalary
    │   ├── Allowances
    │   ├── Deductions
    │   ├── Bonuses
    │   └── NetSalary
    │
    └── PayrollReports

------------------------------------------------------------------------

# FRONTEND ARCHITECTURE

    frontend/

    src
    │
    ├── pages
    │   ├── ManagerDashboard.jsx
    │   ├── EmployeesPage.jsx
    │   ├── DepartmentsPage.jsx
    │   ├── AttendancePage.jsx
    │   ├── LeavesPage.jsx
    │   ├── PayrollPage.jsx
    │   ├── AssetsPage.jsx
    │   └── AppreciationsPage.jsx
    │
    ├── components
    │   ├── SidebarNavigation.jsx
    │   ├── TopHeader.jsx
    │   ├── DashboardStatsCards.jsx
    │   ├── AttendanceWidget.jsx
    │   ├── EmployeeTable.jsx
    │   ├── LeaveApprovalTable.jsx
    │   └── AssetTable.jsx
    │
    ├── services
    │   ├── employeeService.js
    │   ├── attendanceService.js
    │   ├── leaveService.js
    │   ├── payrollService.js
    │   └── assetService.js
    │
    └── styles
        └── managerPanel.css

------------------------------------------------------------------------

# BACKEND ARCHITECTURE

    backend/

    src
    │
    ├── controllers
    │   ├── employeeController.js
    │   ├── departmentController.js
    │   ├── attendanceController.js
    │   ├── leaveController.js
    │   ├── payrollController.js
    │   └── assetController.js
    │
    ├── routes
    │   ├── employeeRoutes.js
    │   ├── departmentRoutes.js
    │   ├── attendanceRoutes.js
    │   ├── leaveRoutes.js
    │   ├── payrollRoutes.js
    │   └── assetRoutes.js
    │
    ├── models
    │   ├── EmployeeModel.js
    │   ├── DepartmentModel.js
    │   ├── AttendanceModel.js
    │   ├── LeaveModel.js
    │   ├── AssetModel.js
    │   └── PayrollModel.js
    │
    └── server.js

------------------------------------------------------------------------

# DATABASE TABLES

## employees

    employee_id
    employee_name
    email
    department_id
    designation_id
    manager_id
    status
    created_at

## departments

    department_id
    department_name
    department_head
    created_at

## attendance

    attendance_id
    employee_id
    clock_in
    clock_out
    ip_address
    location
    work_duration

## leaves

    leave_id
    employee_id
    leave_type
    start_date
    end_date
    reason
    status

## assets

    asset_id
    asset_name
    asset_category
    assigned_employee
    status

## payroll

    payroll_id
    employee_id
    basic_salary
    allowances
    deductions
    net_salary

------------------------------------------------------------------------

# END
