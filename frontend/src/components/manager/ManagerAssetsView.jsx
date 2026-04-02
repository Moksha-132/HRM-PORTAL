import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createAsset, deleteAsset, getAssets, getEmployees, updateAsset } from '../../services/managerService';

const ManagerAssetsView = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    asset_name: '',
    asset_category: '',
    serial_number: '',
    assigned_employee: '',
    assignment_date: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const [assetRes, empRes] = await Promise.all([getAssets(), getEmployees()]);
      if (assetRes.success) setAssets(assetRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAsset({
      asset_name: form.asset_name,
      asset_category: form.asset_category,
      serial_number: form.serial_number,
      assigned_employee: form.assigned_employee || null,
      assignment_date: form.assignment_date || null,
      status: form.assigned_employee ? 'Assigned' : 'Available',
    });
    setForm({ asset_name: '', asset_category: '', serial_number: '', assigned_employee: '', assignment_date: '' });
    load();
  };

  const openEdit = (asset) => {
    setModalFields([
      { label: 'Asset Name', key: 'asset_name', value: asset.asset_name, type: 'text' },
      { label: 'Category', key: 'asset_category', value: asset.asset_category, type: 'text' },
      { label: 'Serial Number', key: 'serial_number', value: asset.serial_number, type: 'text' },
      {
        label: 'Assign To',
        key: 'assigned_employee',
        value: asset.assigned_employee,
        type: 'select',
        options: employees.filter(Boolean).map((emp) => ({ val: emp.employee_id, lab: emp.employee_name || `Employee #${emp.employee_id}` })),
      },
      { label: 'Status', key: 'status', value: asset.status, type: 'select', options: ['Available', 'Assigned', 'Returned', 'Damaged'] },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateAsset(asset.asset_id, values);
        load();
      } finally {
        setSaving(false);
      }
    };
    setModalOpen(true);
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Assets Management</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Assign Asset</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Asset Name</label>
              <input className="input" value={form.asset_name} onChange={(e) => setForm((prev) => ({ ...prev, asset_name: e.target.value }))} required />
              <label className="form-label">Asset Category</label>
              <input className="input" value={form.asset_category} onChange={(e) => setForm((prev) => ({ ...prev, asset_category: e.target.value }))} required />
              <label className="form-label">Serial Number</label>
              <input className="input" value={form.serial_number} onChange={(e) => setForm((prev) => ({ ...prev, serial_number: e.target.value }))} />
              <label className="form-label">Assign To Employee</label>
              <select className="input" value={form.assigned_employee} onChange={(e) => setForm((prev) => ({ ...prev, assigned_employee: e.target.value }))}>
                <option value="">Available (Unassigned)</option>
                {employees.filter(Boolean).map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {(emp.employee_name || 'Employee')} (ID: {emp.employee_id})
                  </option>
                ))}
              </select>
              <label className="form-label">Assignment Date</label>
              <input className="input" type="date" value={form.assignment_date} onChange={(e) => setForm((prev) => ({ ...prev, assignment_date: e.target.value }))} />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Assign Asset
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>S/N</th>
                  <th>Emp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Loading assets...
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No assets found.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.asset_id}>
                      <td>
                        {asset.asset_name}
                        <br />
                        <small>{asset.asset_category}</small>
                      </td>
                      <td>{asset.serial_number || 'N/A'}</td>
                      <td>{asset.assigned_employee || 'Unassigned'}</td>
                      <td>
                        <span className={`badge ${asset.status === 'Available' ? 'bg-green' : 'bg-yellow'}`}>{asset.status}</span>
                      </td>
                      <td>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(asset)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteAsset(asset.asset_id).then(load)}>
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
      </div>

      <EditModal
        isOpen={modalOpen}
        title="Edit Asset"
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

export default ManagerAssetsView;
