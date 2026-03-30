import React, { useEffect, useRef, useState } from 'react';
import EditModal from '../EditModal';
import { createPolicy, deletePolicy, getPolicies, updatePolicy } from '../../services/managerService';

const ManagerPoliciesView = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', file: null, file_url: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFields, setModalFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(() => {});

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPolicies();
      if (res.success) setPolicies(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (form.file) formData.append('file', form.file);
    if (form.file_url) formData.append('file_url', form.file_url);
    await createPolicy(formData);
    setForm({ title: '', description: '', file: null, file_url: '' });
    load();
  };

  const openEdit = (policy) => {
    setModalFields([
      { label: 'Title', key: 'title', value: policy.title, type: 'text' },
      { label: 'Description', key: 'description', value: policy.description, type: 'textarea' },
      { label: 'Document URL', key: 'file_url', value: policy.file_url, type: 'text' },
    ]);
    saveRef.current = async (values) => {
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append('title', values.title || '');
        formData.append('description', values.description || '');
        formData.append('file_url', values.file_url || '');
        await updatePolicy(policy.policy_id, formData);
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
        <h1 className="page-h1">Company Policies</h1>
      </div>
      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Upload Policy</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit}>
              <label className="form-label">Policy Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
              <label className="form-label">Short Description</label>
              <textarea className="input" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              <label className="form-label">Attach Document (Optional)</label>
              <input className="input" type="file" onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
              <label className="form-label">External Link (Optional)</label>
              <input className="input" value={form.file_url} onChange={(e) => setForm((prev) => ({ ...prev, file_url: e.target.value }))} />
              <button type="submit" className="btn btn-solid" style={{ width: '100%' }}>
                Publish Policy
              </button>
            </form>
          </div>
        </div>
        <div className="panel">
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Uploaded</th>
                  <th>Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      Loading policies...
                    </td>
                  </tr>
                ) : policies.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      No policies found.
                    </td>
                  </tr>
                ) : (
                  policies.map((policy) => (
                    <tr key={policy.policy_id}>
                      <td>
                        <strong>{policy.title}</strong>
                        <br />
                        <small>{policy.description}</small>
                      </td>
                      <td>{policy.uploaded_date?.split('T')[0] || 'N/A'}</td>
                      <td>
                        {policy.file_url ? (
                          <a href={policy.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                            View
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        <button type="button" className="action-btn edit-btn" onClick={() => openEdit(policy)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button type="button" className="action-btn delete-btn" onClick={() => deletePolicy(policy.policy_id).then(load)}>
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
        title="Edit Policy"
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

export default ManagerPoliciesView;
