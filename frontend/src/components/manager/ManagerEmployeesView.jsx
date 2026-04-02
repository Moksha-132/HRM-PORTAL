import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../../services/managerService';

const departments = ['IT / Software Development', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations', 'Management'];
const designations = ['Software Engineer', 'Senior Software Engineer', 'HR Manager', 'Finance Analyst', 'Marketing Executive', 'Sales Representative', 'Intern-Software Engineer', 'Project Manager', 'Director'];
const workModes = ['Work from Home', 'Hybrid', 'Work from Office'];

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
    work_mode: 'Work from Office',
    location: 'Remote'
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
    try {
      const result = await createEmployee({
        ...form,
        joining_date: form.joining_date || null,
      });

      if (result?.emailSent) {
        window.alert('Employee created and credentials email sent successfully.');
      } else {
        window.alert(`Employee created, but credentials email failed: ${result?.emailError || 'Unknown email error'}`);
      }

      setForm({ 
        employee_name: '', 
        email: '', 
        phone: '', 
        department: '', 
        designation: '', 
        joining_date: '',
        work_mode: 'Work from Office',
        location: 'Remote'
      });
      loadEmployees();
    } catch (err) {
      window.alert(err?.response?.data?.error || 'Failed to create employee.');
    }
  };

  const openEdit = (employee) => {
    setModalTitle('Edit Employee');
    setModalFields([
      { label: 'Name', key: 'employee_name', value: employee.employee_name, type: 'text' },
      { label: 'Email', key: 'email', value: employee.email, type: 'email' },
      { label: 'Phone', key: 'phone', value: employee.phone, type: 'text' },
      { label: 'Department', key: 'department', value: employee.department, type: 'select', options: departments },
      { label: 'Designation', key: 'designation', value: employee.designation, type: 'select', options: designations },
      { label: 'Work Mode', key: 'work_mode', value: employee.work_mode || 'Work from Office', type: 'select', options: workModes },
      { label: 'Location', key: 'location', value: employee.location || 'Remote', type: 'text' },
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
              
              <label className="form-label">Joining Date</label>
              <input className="input" type="date" value={form.joining_date} onChange={(e) => setForm((prev) => ({ ...prev, joining_date: e.target.value }))} />

              <label className="form-label">Department</label>
              <select className="input" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <label className="form-label">Designation</label>
              <select className="input" value={form.designation} onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))}>
                <option value="">Select Designation</option>
                {designations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <label className="form-label">Work Allotment</label>
              <select className="input" value={form.work_mode} onChange={(e) => setForm((prev) => ({ ...prev, work_mode: e.target.value }))}>
                {workModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              
              <label className="form-label">Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="e.g. Remote, City" />

              <button type="submit" className="btn btn-solid" style={{ width: '100%', marginTop: '10px' }}>
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
                  <th>Employee Info</th>
                  <th>Role & Dept</th>
                  <th>Work Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Loading employees...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.employee_id}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 600 }}>{emp.employee_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.email}</div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontSize: '13px' }}>{emp.designation || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.department || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontSize: '13px' }}>{emp.work_mode || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.location || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`badge ${emp.status === 'Active' ? 'bg-green' : 'bg-red'}`}>{emp.status}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(emp)} style={{ marginRight: '8px' }}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => {
                          if(window.confirm('Delete this employee?')) deleteEmployee(emp.employee_id).then(loadEmployees);
                        }}>
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
