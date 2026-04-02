import React, { useEffect, useState } from 'react';
import { getAppreciations, createAppreciation, getEmployees } from '../../services/managerService';

const BADGES = [
  { id: 'Ambassador', label: 'Ambassador', icon: '/badges/ambassador.png', color: '#3182ce' },
  { id: 'Cost Cutter', label: 'Cost Cutter', icon: '/badges/cost_cutter.png', color: '#3182ce' },
  { id: 'Creative', label: 'Creative', icon: '/badges/creative.png', color: '#3182ce' },
  { id: 'Customer Champion', label: 'Customer Champion', icon: '/badges/champion.png', color: '#3182ce' },
  { id: 'Hard Worker', label: 'Hard Worker', icon: '/badges/hard_worker.png', color: '#3182ce' },
  { id: 'Team Player', label: 'Team Player', icon: '/badges/team_player.png', color: '#3182ce' },
  { id: 'Problem Solver', label: 'Problem Solver', icon: '/badges/problem_solver.png', color: '#3182ce' },
  { id: 'Rising Star', label: 'Rising Star', icon: '/badges/rising_star.png', color: '#3182ce' }
];

const ManagerAppreciationsView = () => {
  const [appreciations, setAppreciations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // Form State
  const [form, setForm] = useState({ title: '', description: '', employee_id: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch concurrently but handle individually
      const [resApps, resEmps] = await Promise.all([
        getAppreciations().catch(err => ({ success: false, data: [] })),
        getEmployees().catch(err => ({ success: false, data: [] }))
      ]);

      if (resApps && resApps.success) {
        setAppreciations(resApps.data || []);
      }
      
      if (resEmps && resEmps.success) {
        // Ensure data is an array
        const empData = Array.isArray(resEmps.data) ? resEmps.data : [];
        setEmployees(empData);
      }
    } catch (err) {
      console.error("Failed to load Thanks module data:", err);
    } finally { 
      setLoading(false); 
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const nextBadge = () => setCarouselIndex(prev => Math.min(prev + 1, BADGES.length - 4));
  const prevBadge = () => setCarouselIndex(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createAppreciation(form);
      if (res.success) {
        setShowModal(false);
        setStep(1);
        setForm({ title: '', description: '', employee_id: '' });
        loadData();
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="view">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="page-h1" style={{ margin: 0 }}>Thanks</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Build team culture by appreciating outstanding performance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ background: '#3182ce', borderRadius: '12px', padding: '12px 24px', fontWeight: 600 }}>
          <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i> Recognize Employee
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : appreciations.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px' }}>
            <i className="fa-solid fa-award" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <h3 style={{ color: '#475569' }}>No appreciations yet</h3>
            <p style={{ color: '#94a3b8' }}>Start acknowledging your team's hard work!</p>
          </div>
        ) : (
          appreciations.map((app) => (
            <div key={app.appreciation_id} className="panel" style={{ borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={BADGES.find(b => b.label === app.title)?.icon || '/badges/ambassador.png'} alt={app.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3182ce', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{app.title}</div>
                  <h3 style={{ margin: '4px 0', fontSize: '1.1rem', color: '#1e293b' }}>
                    Recipient: {app.Recipient?.employee_name || 'Team Member'}
                  </h3>
                  <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span><i className="fas fa-user-edit" style={{ marginRight: '5px' }}></i> From: {app.Sender?.employee_name || 'Manager'}</span>
                    <span><i className="fas fa-calendar-alt" style={{ marginRight: '5px' }}></i> {new Date(app.date).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: '8px 0' }}>"{app.description}"</p>
                  
                  {/* Comments Section */}
                  {app.AppreciationComments && app.AppreciationComments.length > 0 && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Feedback from Team
                      </div>
                      {app.AppreciationComments.map(c => (
                        <div key={c.comment_id} style={{ fontSize: '0.85rem', marginBottom: '6px', padding: '10px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                          <span style={{ fontWeight: 700, color: '#475569' }}>{c.commenter_name}: </span>
                          <span style={{ color: '#64748b' }}>{c.content}</span>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                            {new Date(c.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(5px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '5vh 20px', zIndex: 10000
        }}>
          <div style={{ 
            width: '100%', maxWidth: '950px', maxHeight: '90vh', 
            background: 'white', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
            animation: 'modalFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            
            {/* STICKY HEADER */}
            <div style={{ padding: '24px 40px', borderBottom: '1px solid #f1f5f9', background: 'white', position: 'relative', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a202c' }}>Thanks</h2>
              <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.9rem' }}>Acknowledge your team's excellence with recognition badges.</p>
              
              {/* THE CLOSE (X) BUTTON */}
              <button 
                onClick={() => setShowModal(false)} 
                title="Close"
                style={{ 
                  position: 'absolute', top: '24px', right: '32px', width: '36px', height: '36px', 
                  background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  color: '#1a202c'
                }} 
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#fed7d7';
                  e.currentTarget.style.color = '#c53030';
                }} 
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#1a202c';
                }}
              >
                <i className="fa-solid fa-times" style={{ fontSize: '18px' }}></i>
              </button>
            </div>

            {/* Stepper Header */}
            <div style={{ background: '#f8fafc', display: 'flex', height: '60px', borderBottom: '1px solid #e2e8f0' }}>
              {[
                { n: 1, label: 'Choose a Badge' },
                { n: 2, label: 'Comment' },
                { n: 3, label: 'Select Person' }
              ].map((s, idx) => (
                <div key={s.n} style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  background: step === s.n ? 'white' : 'transparent',
                  position: 'relative',
                  paddingLeft: idx > 0 ? '25px' : '0',
                  clipPath: idx < 2 
                    ? 'polygon(0% 0%, 93% 0%, 100% 50%, 93% 100%, 0% 100%, 7% 50%)' 
                    : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 7% 50%)',
                  zIndex: 10 - idx
                }}>
                  <div style={{ 
                    width: '26px', height: '26px', borderRadius: '50%', 
                    background: step === s.n ? '#3182ce' : '#cbd5e0',
                    color: 'white', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{s.n}</div>
                  <span style={{ 
                    fontWeight: 800, 
                    color: step === s.n ? '#3182ce' : '#94a3b8', 
                    fontSize: '0.9rem' 
                  }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
              {step === 1 && (
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '0 40px' }}>
                    {BADGES.slice(carouselIndex, carouselIndex + 4).map(badge => (
                      <div key={badge.id} 
                        onClick={() => setForm({...form, title: badge.label})}
                        style={{ 
                          background: 'white', borderRadius: '12px', 
                          border: form.title === badge.label ? '2px solid #3182ce' : '1px solid #e2e8f0',
                          overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: form.title === badge.label ? '0 10px 20px rgba(49, 130, 206, 0.12)' : '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                        <div style={{ padding: '24px 16px', textAlign: 'center', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={badge.icon} alt={badge.label} style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain' }} />
                        </div>
                        <div style={{ 
                          background: '#f8fafc', padding: '12px 6px', fontSize: '0.8rem', fontWeight: 800, 
                          color: '#475569', borderTop: '1px solid #e2e8f0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em'
                        }}>
                          {badge.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={prevBadge} disabled={carouselIndex === 0} style={{ position: 'absolute', left: -10, top: '40%', border: 'none', background: 'none', cursor: 'pointer', opacity: carouselIndex === 0 ? 0.1 : 1 }}>
                    <i className="fa-solid fa-chevron-left" style={{ fontSize: '2rem', color: '#cbd5e0' }}></i>
                  </button>
                  <button onClick={nextBadge} disabled={carouselIndex >= BADGES.length - 4} style={{ position: 'absolute', right: -10, top: '40%', border: 'none', background: 'none', cursor: 'pointer', opacity: carouselIndex >= BADGES.length - 4 ? 0.1 : 1 }}>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '2rem', color: '#cbd5e0' }}></i>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ animation: 'fadeIn 0.3s', maxWidth: '700px', margin: '0 auto' }}>
                  <label style={{ display: 'block', marginBottom: '16px', fontWeight: 800, color: '#2d3748' }}>Add your message</label>
                  <textarea 
                    className="input" placeholder="What makes their contribution special?..." 
                    style={{ minHeight: '200px', padding: '20px', fontSize: '1rem', borderRadius: '12px' }}
                    value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  />
                </div>
              )}

              {step === 3 && (
                <div style={{ animation: 'fadeIn 0.3s', maxWidth: '600px', margin: '0 auto' }}>
                  <label style={{ display: 'block', marginBottom: '16px', fontWeight: 800, color: '#2d3748' }}>Select Team Member</label>
                  <select 
                    className="input" style={{ height: '56px', fontSize: '1rem', borderRadius: '12px' }}
                    value={form.employee_id} onChange={(e) => setForm({...form, employee_id: e.target.value})}
                  >
                    <option value="">{employees && employees.length > 0 ? 'Choose a person...' : 'No team members found'}</option>
                    {employees && employees.length > 0 && employees.filter(Boolean).map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_name} {emp.designation ? `(${emp.designation})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* STICKY FOOTER */}
            <div style={{ padding: '24px 40px', borderTop: '1px solid #f1f5f9', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: '16px', zIndex: 10 }}>
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  style={{ 
                    padding: '12px 32px', borderRadius: '40px', border: '1px solid #e2e8f0', background: 'white', 
                    fontWeight: 800, color: '#64748b', cursor: 'pointer' 
                  }}
                >Back</button>
              )}
              {step < 3 ? (
                <button 
                  onClick={handleNext} disabled={!form.title || (step === 2 && !form.description)}
                  style={{ 
                    padding: '12px 48px', borderRadius: '40px', border: 'none', background: '#3182ce', 
                    fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 6px 15px rgba(49, 130, 206, 0.2)' 
                  }}
                >Next Step</button>
              ) : (
                <button 
                  onClick={handleSubmit} disabled={submitting || !form.employee_id}
                  style={{ 
                    padding: '12px 48px', borderRadius: '40px', border: 'none', background: '#3182ce', 
                    fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 6px 15px rgba(49, 130, 206, 0.2)' 
                  }}
                >{submitting ? '...' : 'Send Recognition'}</button>
              )}
            </div>

            <style>{`
              @keyframes modalFadeUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAppreciationsView;
