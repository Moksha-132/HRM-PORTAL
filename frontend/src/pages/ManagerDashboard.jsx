import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ManagerOverviewView from '../components/manager/ManagerOverviewView';
import ManagerEmployeesView from '../components/manager/ManagerEmployeesView';
import ManagerAttendanceView from '../components/manager/ManagerAttendanceView';
import ManagerLeavesView from '../components/manager/ManagerLeavesView';
import ManagerAssetsView from '../components/manager/ManagerAssetsView';
import ManagerPayrollView from '../components/manager/ManagerPayrollView';
import ManagerPrePaymentsView from '../components/manager/ManagerPrePaymentsView';
import ManagerIncrementPromotionView from '../components/manager/ManagerIncrementPromotionView';
import ManagerAppreciationsView from '../components/manager/ManagerAppreciationsView';
import ManagerPoliciesView from '../components/manager/ManagerPoliciesView';
import ManagerOffboardingsView from '../components/manager/ManagerOffboardingsView';
import ManagerHolidaysView from '../components/manager/ManagerHolidaysView';
import ManagerDashboardAddons from '../components/manager/ManagerDashboardAddons';
import { clearAcceptedPolicies } from '../utils/policyAcceptance';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [email, setEmail] = useState('manager@shnoor.com');

  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
      { id: 'employees', label: 'Employees', icon: 'fas fa-users' },
      { id: 'attendance', label: 'Attendance', icon: 'fas fa-clock' },
      { id: 'leaves', label: 'Leaves', icon: 'fas fa-calendar-alt' },
      { id: 'assets', label: 'Assets', icon: 'fas fa-laptop' },
      {
        id: 'payroll-menu',
        label: 'Payroll',
        icon: 'fas fa-money-check-alt',
        children: [
          { id: 'pre-payments', label: 'Pre Payments' },
          { id: 'increment-promotion', label: 'Increment / Promotion' },
          { id: 'payroll', label: 'Payroll' },
        ],
      },
      { id: 'appreciations', label: 'Appreciations', icon: 'fas fa-award' },
      { id: 'policies', label: 'Policies', icon: 'fas fa-file-contract' },
      { id: 'offboardings', label: 'Offboardings', icon: 'fas fa-user-minus' },
      { id: 'holidays', label: 'Holidays', icon: 'fas fa-calendar-day' },
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
    if (role === 'Employee') {
      navigate('/employee', { replace: true });
      return;
    }
    setEmail(sessionStorage.getItem('shnoor_email') || localStorage.getItem('shnoor_email') || 'manager@shnoor.com');
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
    dashboard: ManagerOverviewView,
    employees: ManagerEmployeesView,
    attendance: ManagerAttendanceView,
    leaves: ManagerLeavesView,
    assets: ManagerAssetsView,
    'pre-payments': ManagerPrePaymentsView,
    'increment-promotion': ManagerIncrementPromotionView,
    payroll: ManagerPayrollView,
    appreciations: ManagerAppreciationsView,
    policies: ManagerPoliciesView,
    offboardings: ManagerOffboardingsView,
    holidays: ManagerHolidaysView,
  }[activeView];

  return (
    <div className="dashboard-mode">
      <DashboardLayout
        roleLabel="Manager"
        email={email}
        navItems={navItems}
        activeId={activeView}
        onSelect={setActiveView}
        onLogout={handleLogout}
        title={pageTitle}
      >
        {ViewComponent ? <ViewComponent /> : null}
        {activeView === 'dashboard' ? <ManagerDashboardAddons /> : null}
      </DashboardLayout>
    </div>
  );
};

export default ManagerDashboard;
