import React, { useEffect, useMemo, useState } from 'react';
import { getCompanies, getTransactions } from '../../services/adminService';
import { getAdmins } from '../../services/authService';

const AdminOverviewView = () => {
  const [data, setData] = useState({
    companies: [],
    transactions: [],
    admins: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [compRes, transRes, adminRes] = await Promise.all([
          getCompanies().catch(() => ({ success: false })),
          getTransactions().catch(() => ({ success: false })),
          getAdmins().catch(() => ({ success: false }))
        ]);

        if (active) {
          setData({
            companies: compRes.success ? (compRes.data || []) : [],
            transactions: transRes.success ? (transRes.data || []) : [],
            admins: adminRes.success ? (adminRes.data || []) : []
          });
        }
      } catch (err) {
        if (active) setError('Failed to load dashboard statistics.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, []);

  // 1. KPI Cards logic
  const stats = useMemo(() => {
    const total = data.companies.length;
    const active = data.companies.filter((c) => c.status === 'Active').length;
    const inactive = data.companies.filter((c) => c.status === 'Inactive').length;
    const pending = data.companies.filter((c) => c.status === 'Pending').length;
    return { total, active, inactive, pending };
  }, [data.companies]);

  // 2. Subscription Overview logic
  const subscriptionStats = useMemo(() => {
    const plans = {};
    let nullCount = 0;
    data.companies.forEach(c => {
        const plan = c.subscriptionPlan || c.subscription_plan;
        if (!plan) {
            nullCount++;
        } else {
            plans[plan] = (plans[plan] || 0) + 1;
        }
    });
    return { plans, nullCount };
  }, [data.companies]);

  // Calculations for transactions
  const totalRevenue = useMemo(() => {
     return data.transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  }, [data.transactions]);

  // Current User (Session)
  const currentAdminEmail = sessionStorage.getItem('shnoor_admin_email') || sessionStorage.getItem('shnoor_email') || 'Admin';

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Admin Dashboard</h1>
        <p className="page-sub">Comprehensive overview of organizations, billing, and access control</p>
      </div>

      {loading && <div style={{ marginBottom: 20, color: 'var(--text)' }}>Loading platform data...</div>}
      {error && <div style={{ marginBottom: 20, color: '#ef4444' }}>{error}</div>}

      {/* 1. KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-label">Total Companies</div>
          <div className="stat-val">{stats.total}</div>
          <div className="stat-sub">Registered organizations</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">Active Companies</div>
          <div className="stat-val" style={{ color: '#10b981' }}>{stats.active}</div>
          <div className="stat-sub">Currently operating</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label">Inactive Companies</div>
          <div className="stat-val" style={{ color: '#ef4444' }}>{stats.inactive}</div>
          <div className="stat-sub">Suspended accounts</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-val" style={{ color: '#f59e0b' }}>{stats.pending}</div>
          <div className="stat-sub">Awaiting verification</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
         {/* 2. Subscription Overview */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Subscription Overview</div></div>
            <div className="panel-body">
               {Object.keys(subscriptionStats.plans).length > 0 || subscriptionStats.nullCount > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                     {Object.entries(subscriptionStats.plans).map(([planName, count]) => (
                        <li key={planName} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                           <span style={{ fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{planName} Plan</span>
                           <span style={{ fontWeight: 600, color: 'var(--text)', background: 'color-mix(in srgb, var(--primary) 18%, transparent)', padding: '2px 10px', borderRadius: 12, fontSize: '0.85rem', border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)' }}>{count} orgs</span>
                        </li>
                     ))}
                     {subscriptionStats.nullCount > 0 && (
                        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                           <span style={{ fontWeight: 500, color: 'var(--text-light)' }}>Custom / Trial (No Plan)</span>
                           <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>{subscriptionStats.nullCount} orgs</span>
                        </li>
                     )}
                  </ul>
               ) : (
                  <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No subscription data available.</div>
               )}
            </div>
         </div>

         {/* 3. Transaction Overview */}
         <div className="panel" style={{ margin: 0 }}>
            <div className="panel-head"><div className="panel-title">Transaction Overview & Revenue</div></div>
            <div className="panel-body">
               <div style={{ marginBottom: 20, textAlign: 'center', background: 'color-mix(in srgb, var(--primary) 10%, var(--card-bg) 90%)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 600, marginBottom: 4 }}>Total Processed Revenue</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-dark)' }}>${totalRevenue.toFixed(2)}</div>
               </div>
               
               <strong style={{ display: 'block', marginBottom: 12, fontSize: '0.9rem', color: 'var(--text)' }}>Recent Transactions</strong>
               {data.transactions.length > 0 ? (
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                     {data.transactions.slice(0, 5).map(t => (
                        <div key={t.transaction_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                           <div>
                              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{t.Company?.name || 'Unknown Corp'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(t.date).toLocaleDateString()}</div>
                           </div>
                           <div style={{ fontWeight: 700, color: t.status === 'Completed' ? 'var(--primary-dark)' : '#f59e0b' }}>
                              ${t.amount}
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent transactions recorded.</div>
               )}
            </div>
         </div>
      </div>

      {/* 4. Existing Manager Details */}
      <div className="panel" style={{ marginBottom: '24px' }}>
         <div className="panel-head">
            <div className="panel-title">Platform Managers</div>
         </div>
         <div className="table-wrap" style={{ maxHeight: 350, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                  <tr>
                     <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-light)' }}>Manager Profile</th>
                     <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-light)' }}>Access Role</th>
                     <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid var(--border)', color: 'var(--text-light)' }}>Status</th>
                  </tr>
               </thead>
               <tbody>
                  {data.admins.length > 0 ? data.admins.map((adm, idx) => (
                     <tr key={adm.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px' }}>
                           <div style={{ fontWeight: 600, color: 'var(--text)' }}>{adm.name || 'Admin User'}</div>
                           <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{adm.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                           <span style={{ 
                              background: 'color-mix(in srgb, var(--primary) 12%, transparent)', 
                              color: 'var(--text)', 
                              padding: '4px 10px', 
                              borderRadius: 12, 
                              fontSize: '0.85rem', 
                              fontWeight: 500,
                              border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)'
                           }}>
                              {adm.role || 'Administrator'}
                           </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                           {adm.email === currentAdminEmail ? (
                              <span style={{ color: 'var(--primary-dark)', fontWeight: 600, fontSize: '0.85rem' }}>Active (You)</span>
                           ) : (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Active</span>
                           )}
                        </td>
                     </tr>
                  )) : (
                     <tr><td colSpan="3" style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>No managers found.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

export default AdminOverviewView;
