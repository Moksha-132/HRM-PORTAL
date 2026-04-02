import React, { useEffect, useState } from 'react';
import { getTrialManagers, updateTrialManager } from '../../services/authService';

const AdminManagerTrialView = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [editForm, setEditForm] = useState({ trialStartDate: '', trialEndDate: '', status: '' });

  const loadManagers = async () => {
    setLoading(true);
    try {
      const res = await getTrialManagers();
      if (res.success) setManagers(res.data);
    } catch (err) {
      console.error('Error loading managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const calculateRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const openEditModal = (m) => {
    setSelectedManager(m);
    setEditForm({
      trialStartDate: formatDateForInput(m.trialStartDate),
      trialEndDate: formatDateForInput(m.trialEndDate),
      status: m.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedManager(null);
  };

  const handleSaveModal = async () => {
    if (!selectedManager) return;
    try {
      await updateTrialManager(selectedManager.id, editForm);
      closeModal();
      loadManagers();
    } catch (err) {
      alert('Failed to update trial data.');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateTrialManager(id, { status: newStatus });
      loadManagers();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const getActionButtonStyle = (status) => {
    const isActive = status === 'Active';
    return {
      padding: '6px 14px',
      fontSize: '0.8rem',
      fontWeight: 700,
      minWidth: '104px',
      backgroundColor: isActive ? '#dc2626' : '#2563eb',
      color: '#ffffff',
      border: `1px solid ${isActive ? '#b91c1c' : '#1d4ed8'}`,
      boxShadow: isActive
        ? '0 4px 10px rgba(220, 38, 38, 0.28)'
        : '0 4px 10px rgba(37, 99, 235, 0.3)',
      borderRadius: '8px'
    };
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Manager Trial Management</h1>
        <p className="page-sub">Monitor and control manager trial periods and system access</p>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Platform Managers & Trials</div>
        </div>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--card-bg)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Manager</th>
                <th style={{ padding: '16px', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Registration</th>
                <th style={{ padding: '16px', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Trial Validity</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Time Left</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading management data...</td></tr>
              ) : (managers.length === 0) ? (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No managers registered on the platform yet.</td></tr>
              ) : managers.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{m.name || 'Unnamed'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>{m.email}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
                      {m.trialStartDate ? new Date(m.trialStartDate).toLocaleDateString() : 'N/A'} 
                      <span style={{ margin: '0 8px', color: '#cbd5e1' }}>→</span>
                      {m.trialEndDate ? new Date(m.trialEndDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      background: calculateRemainingDays(m.trialEndDate) < 3 ? '#fff1f2' : '#f0fdf4',
                      color: calculateRemainingDays(m.trialEndDate) < 3 ? '#e11d48' : '#16a34a',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: `1px solid ${calculateRemainingDays(m.trialEndDate) < 3 ? '#fecdd3' : '#dcfce7'}`
                    }}>
                      {calculateRemainingDays(m.trialEndDate)} Days
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      backgroundColor: m.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: m.status === 'Active' ? '#15803d' : '#475569',
                      textTransform: 'uppercase'
                    }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600 }}
                        onClick={() => openEditModal(m)}
                      >
                        Edit Trial
                      </button>
                      <button
                        className="btn btn-sm"
                        style={getActionButtonStyle(m.status)}
                        onClick={() => toggleStatus(m.id, m.status)}
                      >
                        {m.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ MODAL OVERLAY */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            maxWidth: '500px', 
            width: '100%', 
            padding: '30px', 
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>Edit Trial</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '6px' }}>
                Updating control for manager: <b style={{ color: 'var(--text)' }}>{selectedManager?.name || selectedManager?.email}</b>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text)' }}>
                    Trial Period Begins
                  </label>
                  <input 
                    type="date" 
                    className="input" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'var(--text)', background: 'color-mix(in srgb, var(--primary) 10%, var(--card-bg) 90%)', borderColor: 'var(--border)' }}
                    value={editForm.trialStartDate}
                    onChange={(e) => setEditForm({...editForm, trialStartDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text)' }}>
                    Trial Period Ends
                  </label>
                  <input 
                    type="date" 
                    className="input" 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'var(--text)', background: 'color-mix(in srgb, var(--primary) 10%, var(--card-bg) 90%)', borderColor: 'var(--border)' }}
                    value={editForm.trialEndDate}
                    onChange={(e) => setEditForm({...editForm, trialEndDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text)' }}>
                    System Authorization Status
                  </label>
                  <select 
                    className="input"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', color: 'var(--text)', background: 'color-mix(in srgb, var(--primary) 10%, var(--card-bg) 90%)', borderColor: 'var(--border)' }}
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="Active">Authorized (Active)</option>
                    <option value="Inactive">Restricted (Inactive)</option>
                  </select>
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '14px' }}>
              <button 
                className="btn btn-solid" 
                style={{ flex: 1, padding: '12px', fontWeight: 700, background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary-dark)' }} 
                onClick={handleSaveModal}
              >
                Apply Changes
              </button>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '12px', fontWeight: 700, color: 'var(--text)', borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--primary) 6%, var(--card-bg) 94%)' }} 
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagerTrialView;
