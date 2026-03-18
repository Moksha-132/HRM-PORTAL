import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import EmployeeOverviewView from '../components/employee/EmployeeOverviewView';
import EmployeeAttendanceView from '../components/employee/EmployeeAttendanceView';
import EmployeeLeavesView from '../components/employee/EmployeeLeavesView';
import EmployeeAssetsView from '../components/employee/EmployeeAssetsView';
import EmployeeCalendarView from '../components/employee/EmployeeCalendarView';
import EmployeeAppreciationsView from '../components/employee/EmployeeAppreciationsView';
import EmployeeOffboardingView from '../components/employee/EmployeeOffboardingView';
import EmployeeExpensesView from '../components/employee/EmployeeExpensesView';
import EmployeePayrollView from '../components/employee/EmployeePayrollView';
import EmployeePoliciesView from '../components/employee/EmployeePoliciesView';
import EmployeeProfileView from '../components/employee/EmployeeProfileView';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [email, setEmail] = useState('emp@shnoor.com');

  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
      { id: 'attendance', label: 'Attendance', icon: 'fas fa-clock' },
      { id: 'leaves', label: 'Leaves', icon: 'fas fa-calendar-alt' },
      { id: 'assets', label: 'Assets', icon: 'fas fa-laptop' },
      { id: 'calendar', label: 'Holiday Calendar', icon: 'fas fa-calendar-day' },
      { id: 'appreciations', label: 'Appreciations', icon: 'fas fa-award' },
      { id: 'offboarding', label: 'Offboarding', icon: 'fas fa-user-minus' },
      { id: 'expenses', label: 'Expenses', icon: 'fas fa-receipt' },
      { id: 'payroll', label: 'Payroll', icon: 'fas fa-money-check-alt' },
      { id: 'policies', label: 'Policies', icon: 'fas fa-file-contract' },
      { id: 'profile', label: 'My Profile', icon: 'fas fa-user-cog' },
    ],
    []
  );

  const pageTitle = useMemo(() => {
    const match = navItems.find((item) => item.id === activeView);
    return match ? match.label : 'Dashboard';
  }, [activeView, navItems]);

  useEffect(() => {
    const token = localStorage.getItem('shnoor_token');
    if (!token) {
      navigate('/#login', { replace: true });
      return;
    }
    setEmail(localStorage.getItem('shnoor_email') || 'emp@shnoor.com');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('shnoor_token');
    localStorage.removeItem('shnoor_role');
    localStorage.removeItem('shnoor_email');
    navigate('/#login');
  };

  const ViewComponent = {
    dashboard: EmployeeOverviewView,
    attendance: EmployeeAttendanceView,
    leaves: EmployeeLeavesView,
    assets: EmployeeAssetsView,
    calendar: EmployeeCalendarView,
    appreciations: EmployeeAppreciationsView,
    offboarding: EmployeeOffboardingView,
    expenses: EmployeeExpensesView,
    payroll: EmployeePayrollView,
    policies: EmployeePoliciesView,
    profile: EmployeeProfileView,
  }[activeView];

  return (
    <div className="dashboard-mode">
      <DashboardLayout
        roleLabel="Employee"
        email={email}
        navItems={navItems}
        activeId={activeView}
        onSelect={setActiveView}
        onLogout={handleLogout}
        title={pageTitle}
      >
        {ViewComponent ? <ViewComponent /> : null}
      </DashboardLayout>
    </div>
  );
};

export default EmployeeDashboard;
