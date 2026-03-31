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
import EmployeePrePaymentsView from '../components/employee/EmployeePrePaymentsView';
import EmployeeIncrementPromotionView from '../components/employee/EmployeeIncrementPromotionView';
import EmployeePoliciesView from '../components/employee/EmployeePoliciesView';
import EmployeeProfileView from '../components/employee/EmployeeProfileView';
import EmployeeLettersView from '../components/employee/EmployeeLettersView';
import EmployeeRemainingLeavesView from '../components/employee/EmployeeRemainingLeavesView';
import EmployeeUnpaidLeavesView from '../components/employee/EmployeeUnpaidLeavesView';
import EmployeePaidLeavesView from '../components/employee/EmployeePaidLeavesView';
import EmployeeDashboardAddons from '../components/employee/EmployeeDashboardAddons';
import { clearAcceptedPolicies } from '../utils/policyAcceptance';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [email, setEmail] = useState('emp@shnoor.com');

  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
      { id: 'attendance', label: 'Attendance', icon: 'fas fa-clock' },
      { id: 'leaves_parent', label: 'Leaves', icon: 'fas fa-calendar-alt', children: [
        { id: 'leaves', label: 'Leaves' },
        { id: 'remaining_leaves', label: 'Remaining Leaves' },
        { id: 'unpaid_leaves', label: 'Unpaid Leaves' },
        { id: 'paid_leaves', label: 'Paid Leaves' },
      ]},
      { id: 'assets', label: 'Assets', icon: 'fas fa-laptop' },
      { id: 'calendar', label: 'Holiday Calendar', icon: 'fas fa-calendar-day' },
      { id: 'appreciations', label: 'Thanks', icon: 'fas fa-thumbs-up' },
      { id: 'offboarding', label: 'Offboarding', icon: 'fas fa-user-minus' },
      { id: 'expenses', label: 'Expenses', icon: 'fas fa-receipt' },
      {
        id: 'payroll-menu',
        label: 'Payroll',
        icon: 'fas fa-money-check-alt',
        children: [
          { id: 'payroll', label: 'Payroll (History)' },
          { id: 'pre-payments', label: 'Pre Payments' },
          { id: 'increment-promotion', label: 'Increment / Promotion' },
        ],
      },
      { id: 'policies', label: 'Policies', icon: 'fas fa-file-contract' },
      { id: 'letters', label: 'Letters', icon: 'fas fa-envelope-open-text' },
      { id: 'profile', label: 'My Profile', icon: 'fas fa-user-cog' },
    ],
    []
  );

  const pageTitle = useMemo(() => {
    for (const item of navItems) {
      if (item.id === activeView) return item.label;
      if (Array.isArray(item.children)) {
        const child = item.children.find((c) => c.id === activeView);
        if (child) return child.label;
      }
    }
    return 'Dashboard';
  }, [activeView, navItems]);

  useEffect(() => {
    const token = sessionStorage.getItem('shnoor_token') || localStorage.getItem('shnoor_token');
    const role = sessionStorage.getItem('shnoor_role') || localStorage.getItem('shnoor_role') || '';
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (role === 'Admin' || role === 'Super Admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (role === 'Manager') {
      navigate('/manager', { replace: true });
      return;
    }
    setEmail(sessionStorage.getItem('shnoor_email') || localStorage.getItem('shnoor_email') || 'emp@shnoor.com');
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('shnoor_token');
    sessionStorage.removeItem('shnoor_role');
    sessionStorage.removeItem('shnoor_email');
    sessionStorage.removeItem('shnoor_admin_email');
    localStorage.removeItem('shnoor_token');
    localStorage.removeItem('shnoor_role');
    localStorage.removeItem('shnoor_email');
    clearAcceptedPolicies();
    navigate('/login');
  };

  const ViewComponent = {
    dashboard: EmployeeOverviewView,
    attendance: EmployeeAttendanceView,
    leaves: EmployeeLeavesView,
    remaining_leaves: EmployeeRemainingLeavesView,
    unpaid_leaves: EmployeeUnpaidLeavesView,
    paid_leaves: EmployeePaidLeavesView,
    assets: EmployeeAssetsView,
    calendar: EmployeeCalendarView,
    appreciations: EmployeeAppreciationsView,
    offboarding: EmployeeOffboardingView,
    expenses: EmployeeExpensesView,
    payroll: EmployeePayrollView,
    'pre-payments': EmployeePrePaymentsView,
    'increment-promotion': EmployeeIncrementPromotionView,
    policies: EmployeePoliciesView,
    letters: EmployeeLettersView,
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
        {activeView === 'dashboard' ? <EmployeeDashboardAddons /> : null}
      </DashboardLayout>
    </div>
  );
};

export default EmployeeDashboard;
