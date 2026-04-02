import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { deleteLeave, getLeaves, updateLeave } from '../../services/managerService';

const ManagerLeavesView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLeaves();
      if (res.success) setLeaves(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (item) => {
    setModalFields([
      { label: 'Leave Type', key: 'leave_type', value: item.leave_type, type: 'text' },
      { label: 'Start Date', key: 'start_date', value: item.start_date, type: 'date' },
      { label: 'End Date', key: 'end_date', value: item.end_date, type: 'date' },
      { label: 'Reason', key: 'reason', value: item.reason, type: 'textarea' },
      { label: 'Status', key: 'status', value: item.status, type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateLeave(item.leave_id, values);
        load();
      } finally {
        setSaving(false);
      }
    };
    setModalOpen(true);
  };

  const updateStatus = async (id, status) => {
    await updateLeave(id, { status });
    load();
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Leave Management</h1>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ color: 'var(--text-light)' }}>Leave ID</th>
                <th style={{ color: 'var(--text-light)' }}>Emp ID</th>
                <th style={{ color: 'var(--text-light)' }}>Type</th>
                <th style={{ color: 'var(--text-light)' }}>Duration</th>
                <th style={{ color: 'var(--text-light)' }}>Reason</th>
                <th style={{ color: 'var(--text-light)' }}>Status</th>
                <th style={{ color: 'var(--text-light)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    Loading leaves...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.leave_id}>
                    <td style={{ color: 'var(--text)' }}>#{leave.leave_id}</td>
                    <td>
                      <span style={{ color: 'var(--text)' }}>{leave.employee_id}</span> <small style={{ color: 'var(--text-light)' }}>({leave.Employee ? leave.Employee.employee_name : 'N/A'})</small>
                    </td>
                    <td style={{ color: 'var(--text)' }}>{leave.leave_type}</td>
                    <td>
                      {leave.start_date} to {leave.end_date}
                    </td>
                    <td style={{ color: 'var(--text)' }}>{leave.reason || 'N/A'}</td>
                    <td>
                      <span className={`badge ${leave.status === 'Approved' ? 'bg-green' : leave.status === 'Rejected' ? 'bg-red' : 'bg-yellow'}`} style={{ color: '#fff' }}>{leave.status}</span>
                    </td>
                    <td>
                      {leave.status === 'Pending' && (
                        <>
                          <button type="button" className="action-btn" style={{ color: 'var(--primary-dark)', background: 'color-mix(in srgb, var(--primary) 12%, transparent)', borderRadius: 8 }} onClick={() => updateStatus(leave.leave_id, 'Approved')} title="Approve">
                            <i className="fas fa-check-circle" />
                          </button>
                          <button type="button" className="action-btn" style={{ color: '#dc2626', background: 'rgba(220,38,38,0.10)', borderRadius: 8 }} onClick={() => updateStatus(leave.leave_id, 'Rejected')} title="Reject">
                            <i className="fas fa-times-circle" />
                          </button>
                        </>
                      )}
                      <button type="button" className="action-btn edit-btn" onClick={() => openEdit(leave)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button type="button" className="action-btn delete-btn" onClick={() => deleteLeave(leave.leave_id).then(load)}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditModal
        isOpen={modalOpen}
        title="Edit Leave"
        fields={modalFields}
        onClose={() => setModalOpen(false)}
        onSave={async (values) => {
          if (saveRef.current) await saveRef.current(values);
          setModalOpen(false);
        }}
        saving={saving}
      />
    </div>
  );
};

export default ManagerLeavesView;
