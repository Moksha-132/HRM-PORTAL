import React, { useEffect, useState } from 'react';

const normalizeFieldValue = (field) => {
  if (field.value === undefined || field.value === null) {
    return '';
  }
  return field.value;
};

const EditModal = ({ isOpen, title, fields, onClose, onSave, saving }) => {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const next = {};
    fields.forEach((field) => {
      next[field.key] = normalizeFieldValue(field);
    });
    setValues(next);
  }, [fields, isOpen]);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(values);
  };

  if (!isOpen) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <label className="form-label">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="input"
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  {field.options?.map((opt) => {
                    const optionValue = typeof opt === 'object' ? opt.val : opt;
                    const optionLabel = typeof opt === 'object' ? opt.lab : opt;
                    return (
                      <option key={`${field.key}-${optionValue}`} value={optionValue}>
                        {optionLabel}
                      </option>
                    );
                  })}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="input"
                  rows={3}
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type={field.type || 'text'}
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-solid" style={{ marginLeft: 10 }} disabled={saving}>
              {saving ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
