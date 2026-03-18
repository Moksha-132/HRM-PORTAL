import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../../services/managerService';

const ManagerEmployeesView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [modalTitle, setModalTitle] = useState('Edit');
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const [form, setForm] = useState({
    employee_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joining_date: '',
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
      if (res.success) setEmployees(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEmployee({
      employee_name: form.employee_name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      designation: form.designation,
      joining_date: form.joining_date || null,
    });
    setForm({ employee_name: '', email: '', phone: '', department: '', designation: '', joining_date: '' });
    loadEmployees();
  };

  const openEdit = (employee) => {
    setModalTitle('Edit Employee');
    setModalFields([
      { label: 'Name', key: 'employee_name', value: employee.employee_name, type: 'text' },
      { label: 'Email', key: 'email', value: employee.email, type: 'email' },
      { label: 'Phone', key: 'phone', value: employee.phone, type: 'text' },
      { label: 'Department', key: 'department', value: employee.department, type: 'text' },
      { label: 'Designation', key: 'designation', value: employee.designation, type: 'text' },
      { label: 'Status', key: 'status', value: employee.status, type: 'select', options: ['Active', 'Inactive', 'OnLeave', 'Resigned'] },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        await updateEmployee(employee.employee_id, values);
        loadEmployees();
      } finally {
        setSaving(false);
      }
    };
    setModalOpen(true);
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Employees Management</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Add Employee</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Full Name</label>
              <input className="input" value={form.employee_name} onChange={(e) => setForm((prev) => ({ ...prev, employee_name: e.target.value }))} required />
              <label className="form-label">Email Address</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
              <label className="form-label">Phone Number</label>
              <input className="input" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <label className="form-label">Department</label>
              <input className="input" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} />
              <label className="form-label">Designation</label>
              <input className="input" value={form.designation} onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))} />
              <label className="form-label">Joining Date</label>
              <input className="input" type="date" value={form.joining_date} onChange={(e) => setForm((prev) => ({ ...prev, joining_date: e.target.value }))} />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Save Employee
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">All Employees</div>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      Loading employees...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.employee_id}>
                      <td>
                        <strong>{emp.employee_name}</strong>
                        <br />
                        <small>{emp.email}</small>
                      </td>
                      <td>
                        {emp.department || 'N/A'}
                        <br />
                        <small>{emp.designation || 'N/A'}</small>
                      </td>
                      <td>
                        <span className={`badge ${emp.status === 'Active' ? 'bg-green' : 'bg-red'}`}>{emp.status}</span>
                      </td>
                      <td>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(emp)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deleteEmployee(emp.employee_id).then(loadEmployees)}>
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
        title={modalTitle}
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

export default ManagerEmployeesView;
