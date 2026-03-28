import React, { useEffect, useMemo, useState } from 'react';
import { getLetters, updateLetter } from '../../services/employeeService';

const downloadHtml = (filename, html) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const EmployeeLettersView = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [previewLetter, setPreviewLetter] = useState(null);
  const [editingLetter, setEditingLetter] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLetters();
      if (res.success) setLetters(res.data || []);
      else setError(res.error || 'Failed to load letters');
    } catch (e) {
      setError(e?.message || 'Failed to load letters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => letters || [], [letters]);

  const handleEdit = (letter) => {
    setEditingLetter(letter);
    setEditContent(letter?.content || '');
  };

  const handleSave = async () => {
    if (!editingLetter) return;
    const trimmed = editContent.trim();
    if (!trimmed) return;
    setSaving(true);
    setError('');
    try {
      const res = await updateLetter(editingLetter.letter_id, { content: trimmed });
      if (!res.success) throw new Error(res.error || 'Update failed');
      setEditingLetter(null);
      setEditContent('');
      load();
    } catch (e) {
      setError(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">My Letters</h1>
      </div>

      {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Letters Received</div>
        </div>
        <div className="table-wrap" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>From</th>
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
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    No letters found
                  </td>
                </tr>
              ) : (
                rows.map((l) => (
                  <tr key={l.letter_id}>
                    <td>
                      <strong>{l.title}</strong>
                    </td>
                    <td>{l.Sender?.employee_name || 'N/A'}</td>
                    <td>
                      <span className={`badge ${l.status === 'Sent' ? 'bg-green' : 'bg-yellow'}`}>
                        {l.status === 'Sent' ? 'Received' : l.status}
                      </span>
                    </td>
                    <td>{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
                    <td>
                      <button type="button" className="btn btn-outline" onClick={() => setPreviewLetter(l)} style={{ marginRight: 8 }}>
                        Preview
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => handleEdit(l)} style={{ marginRight: 8 }}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-solid"
                        onClick={() =>
                          downloadHtml(
                            `${(l.title || 'letter').replace(/\s+/g, '_')}.html`,
                            `<!doctype html><html><head><meta charset="utf-8"><title>${l.title || 'Letter'}</title></head><body>${l.content || ''}</body></html>`
                          )
                        }
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                  setEditContent('');
                }}
                disabled={saving}
              >
                Close
              </button>
            </div>
            <label className="form-label">Title</label>
            <input className="input" value={editingLetter.title || ''} readOnly />
            <label className="form-label">Content (HTML allowed)</label>
            <textarea className="input" style={{ minHeight: 240 }} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditingLetter(null);
                  setEditContent('');
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-solid" onClick={handleSave} disabled={saving || !editContent.trim()}>
                {saving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLettersView;

