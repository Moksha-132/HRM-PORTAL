import React, { useEffect, useMemo, useState } from 'react';
import { deleteLetter, getEmployees, getLetters, sendLetter, updateLetter } from '../../services/managerService';

const ManagerLettersView = () => {
  const [employees, setEmployees] = useState([]);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ employee_id: '', title: '', content: '' });
  const [sending, setSending] = useState(false);

  const [previewLetter, setPreviewLetter] = useState(null);
  const [editingLetter, setEditingLetter] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [empRes, letterRes] = await Promise.all([getEmployees(), getLetters()]);
      if (empRes.success) setEmployees(empRes.data || []);
      if (letterRes.success) setLetters(letterRes.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load letters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectableEmployees = useMemo(() => {
    const list = employees || [];
    return list.filter((e) => {
      const role = (e.role || '').toString().toLowerCase();
      const name = (e.employee_name || '').toString().toLowerCase();
      if (role.includes('manager')) return false;
      if (role.includes('admin')) return false;
      if (name === 'shnoor manager') return false;
      return true;
    });
  }, [employees]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.title.trim() || !form.content.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await sendLetter({ ...form, title: form.title.trim(), content: form.content.trim() });
      if (!res.success) throw new Error(res.error || 'Failed to send letter');
      setForm({ employee_id: '', title: '', content: '' });
      load();
    } catch (err) {
      setError(err?.message || 'Failed to send letter');
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (letter) => {
    setEditingLetter(letter);
    setEditTitle(letter?.title || '');
    setEditContent(letter?.content || '');
  };

  const handleSave = async () => {
    if (!editingLetter) return;
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await updateLetter(editingLetter.letter_id, { title: editTitle.trim(), content: editContent.trim() });
      if (!res.success) throw new Error(res.error || 'Update failed');
      setEditingLetter(null);
      setEditTitle('');
      setEditContent('');
      load();
    } catch (e) {
      setError(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this letter?')) return;
    setError('');
    try {
      const res = await deleteLetter(id);
      if (!res.success) throw new Error(res.error || 'Delete failed');
      load();
    } catch (e) {
      setError(e?.message || 'Delete failed');
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Letter Management</h1>
      </div>

      {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}

      <div className="grid grid-2" style={{ padding: 0 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Send New Letter</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSend}>
              <label className="form-label">Select Employee</label>
              <select className="input" value={form.employee_id} onChange={(e) => setForm((p) => ({ ...p, employee_id: e.target.value }))} required>
                <option value="">Select Employee</option>
                <option value="all">All Employees</option>
                {selectableEmployees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.employee_name}
                  </option>
                ))}
              </select>

              <label className="form-label">Letter Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Promotion Letter" required />

              <label className="form-label">Content (HTML allowed)</label>
              <textarea className="input" style={{ minHeight: 180 }} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required />

              <button type="submit" className="btn btn-solid" style={{ width: '100%' }} disabled={sending}>
                {sending ? 'Sending...' : 'Send Letter'}
              </button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Sent Letters</div>
          </div>
          <div className="table-wrap" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Sent To</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      Loading...
                    </td>
                  </tr>
                ) : letters.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      No letters found
                    </td>
                  </tr>
                ) : (
                  letters.map((l) => (
                    <tr key={l.letter_id}>
                      <td>
                        <strong>{l.title}</strong>
                      </td>
                      <td>{l.Recipient?.employee_name || 'N/A'}</td>
                      <td>
                        <span className={`badge ${l.status === 'Sent' ? 'bg-green' : 'bg-yellow'}`}>{l.status}</span>
                      </td>
                      <td>{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
                      <td>
                        <button type="button" className="btn btn-outline" onClick={() => setPreviewLetter(l)} style={{ marginRight: 8 }}>
                          Preview
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => handleEdit(l)} style={{ marginRight: 8 }}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => handleDelete(l.letter_id)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                          Delete
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

      {previewLetter && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{previewLetter.title}</h2>
              <button type="button" className="btn btn-outline" onClick={() => setPreviewLetter(null)}>
                Close
              </button>
            </div>
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 8,
                maxHeight: '70vh',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
              }}
              dangerouslySetInnerHTML={{ __html: previewLetter.content || '' }}
            />
          </div>
        </div>
      )}

      {editingLetter && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Edit Letter</h2>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditingLetter(null);
                  setEditTitle('');
                  setEditContent('');
                }}
                disabled={saving}
              >
                Close
              </button>
            </div>
            <label className="form-label">Title</label>
            <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <label className="form-label">Content (HTML allowed)</label>
            <textarea className="input" style={{ minHeight: 240 }} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditingLetter(null);
                  setEditTitle('');
                  setEditContent('');
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleSave} disabled={saving || !editTitle.trim() || !editContent.trim()}>
                {saving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerLettersView;

