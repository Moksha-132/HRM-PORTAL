import React, { useEffect, useState, useRef } from 'react';
import { getAppreciations, sendAppreciation, getEmployees, deleteAppreciation, addAppreciationComment } from '../../services/employeeService';

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

const EmployeeAppreciationsView = () => {
  const [appreciations, setAppreciations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Comment state
  const [commentingId, setCommentingId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  // Form State
  const [form, setForm] = useState({ title: '', description: '', recipient_id: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      const [resApps, resEmps] = await Promise.all([getAppreciations(), getEmployees()]);
      if (resApps.success) setAppreciations(resApps.data);
      if (resEmps.success) setEmployees(resEmps.data);
    } finally { setLoading(false); }
  };

  // Stats Logic
  const getMostPopularBadge = () => {
    if (appreciations.length === 0) return { label: 'None', count: 0 };
    const counts = {};
    appreciations.forEach(app => counts[app.title] = (counts[app.title] || 0) + 1);
    const popular = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return { label: popular, count: counts[popular] };
  };

  const popBadge = getMostPopularBadge();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  const nextBadge = () => setCarouselIndex(prev => Math.min(prev + 1, BADGES.length - 4));
  const prevBadge = () => setCarouselIndex(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await sendAppreciation(form);
      if (res.success) {
        setShowModal(false);
        setStep(1);
        setForm({ title: '', description: '', recipient_id: '' });
        loadData();
      }
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this badge?")) return;
    try {
      const res = await deleteAppreciation(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.error || "Failed to delete badge");
      }
    } catch (err) {
      alert("Error deleting badge");
    }
  };

  const handleAddComment = async (appId) => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await addAppreciationComment(appId, { content: commentText });
      if (res.success) {
        setCommentText('');
        setCommentingId(null);
        loadData();
      } else {
        alert(res.error || "Failed to add comment");
      }
    } catch (err) {
      alert("Error adding comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <div className="view" style={{ background: '#fcfcfc', minHeight: '100vh', padding: '20px' }}>
      
      {/* 1. TOP HEADER */}
      <div style={{ marginBottom: '30px', padding: '0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.4rem', color: '#adb5bd' }}>
             <i className="fa-solid fa-thumbs-up"></i>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#495057', fontWeight: 700 }}>Thanks</h1>
            <p style={{ margin: 0, color: '#868e96', fontSize: '0.9rem' }}>
              Thanks badges are a way of thanking colleagues for working extra hard or doing something extra special.
            </p>
          </div>
        </div>
      </div>

      {/* 2. GIVE THANKS BOX (BANNER) */}
      <div style={{ 
        background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', 
        padding: '24px 30px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ maxWidth: '70%' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#495057', fontWeight: 700 }}>Thank Your Colleagues</h2>
          <p style={{ margin: 0, color: '#868e96', fontSize: '0.85rem', lineHeight: '1.5' }}>
            Thank a colleague by awarding a unique badge of appreciation. Each badge endorses a different set of skills or qualities, and you can personalise the badge with a special message to say why you are giving it.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ 
            background: 'linear-gradient(to bottom, #6fa3d1 0%, #4b7eb0 100%)', 
            border: '1px solid #456e94', borderRadius: '4px', padding: '10px 24px', 
            fontWeight: 700, fontSize: '0.9rem', color: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          Give Thanks
        </button>
      </div>

      {/* 3. MOST POPULAR BADGE STATS */}
      <div style={{ 
        background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', 
        padding: '15px 25px', marginBottom: '24px', maxWidth: '300px', display: 'flex', alignItems: 'center', gap: '15px'
      }}>
        <div style={{ 
          width: '50px', height: '50px', borderRadius: '50%', background: '#e9ecef', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <img src={BADGES.find(b => b.label === popBadge.label)?.icon || '/badges/hard_worker.png'} style={{ width: '32px' }} alt="popular" />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#495057', fontWeight: 700 }}>Most Popular Badge:</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3182ce' }}>{popBadge.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#adb5bd' }}>{popBadge.count} badges awarded in total</div>
        </div>
      </div>

      {/* 4. ACTIVITY FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading feed...</div>
        ) : appreciations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#adb5bd' }}>No appreciation activity yet.</div>
        ) : (
          appreciations.map((app) => (
            <div key={app.appreciation_id} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              {/* Profile Pic Placeholder */}
              <div style={{ width: '45px', height: '45px', borderRadius: '4px', background: '#343a40', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <i className="fa-solid fa-user" style={{ fontSize: '1.2rem' }}></i>
              </div>
              
              {/* Content Panel */}
              <div style={{ 
                flex: 1, background: '#eff7fd', border: '1px solid #d0e3f0', borderRadius: '4px', 
                padding: '15px 20px', position: 'relative' 
              }}>
                {/* Arrow pointer bit */}
                <div style={{ 
                  position: 'absolute', left: '-8px', top: '15px', 
                  width: '15px', height: '15px', background: '#eff7fd', 
                  borderLeft: '1px solid #d0e3f0', borderBottom: '1px solid #d0e3f0', 
                  transform: 'rotate(45deg)' 
                }}></div>

                {/* Header text */}
                <div style={{ fontSize: '0.85rem', color: '#495057', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700 }}>{app.Recipient?.employee_name || 'Someone'}</span> received thanks from <span style={{ fontWeight: 700 }}>{app.Sender?.employee_name || 'Manager'}</span> - <span style={{ color: '#adb5bd' }}> {new Date(app.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>

                {/* Badge Reveal */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    <img src={BADGES.find(b => b.label === app.title)?.icon || '/badges/hard_worker.png'} style={{ width: '100%' }} alt="badge" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#495057', fontSize: '0.9rem' }}>{app.title}</div>
                    <div style={{ color: '#868e96', fontSize: '0.85rem', fontStyle: 'italic' }}>{app.description}</div>
                  </div>
                </div>

                {/* Comments Section */}
                {app.AppreciationComments && app.AppreciationComments.length > 0 && (
                  <div style={{ marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    {app.AppreciationComments.map(c => (
                      <div key={c.comment_id} style={{ fontSize: '0.85rem', marginBottom: '8px', padding: '8px', background: '#f8fafc', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#4a5568' }}>{c.commenter_name}: </span>
                        <span style={{ color: '#2d3748' }}>{c.content}</span>
                        <div style={{ fontSize: '0.7rem', color: '#a0aec0', marginTop: '2px' }}>{new Date(c.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                {commentingId === app.appreciation_id && (
                  <div style={{ marginTop: '10px' }}>
                    <textarea 
                      className="input" 
                      placeholder="Write a comment..." 
                      style={{ fontSize: '0.85rem', minHeight: '60px', padding: '10px', borderRadius: '8px' }}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                      <button 
                        onClick={() => setCommentingId(null)}
                        style={{ background: 'white', border: '1px solid #dee2e6', borderRadius: '5px', padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >Cancel</button>
                      <button 
                        onClick={() => handleAddComment(app.appreciation_id)}
                        disabled={commentSubmitting}
                        style={{ background: '#3b82f6', border: 'none', color: 'white', borderRadius: '5px', padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >{commentSubmitting ? '...' : 'Post'}</button>
                    </div>
                  </div>
                )}

                {/* Footer buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => {
                      setCommentingId(app.appreciation_id);
                      setCommentText('');
                    }}
                    style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '3px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: '#495057' }}
                  >Add Comment</button>
                  <button 
                    onClick={() => handleDelete(app.appreciation_id)}
                    style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '3px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', color: '#c53030' }}
                  >
                    <i className="fa-solid fa-trash-can" style={{ marginRight: '5px' }}></i>
                    Delete
                  </button>
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
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a202c' }}>Give Thanks</h2>
              <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.9rem' }}>Recognize excellence with a badge and a personalized message.</p>
              
              <button 
                onClick={() => setShowModal(false)} 
                title="Close"
                style={{ 
                  position: 'absolute', top: '24px', right: '32px', width: '36px', height: '36px', 
                  background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  color: '#1a202c'
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
                  <label style={{ display: 'block', marginBottom: '16px', fontWeight: 800, color: '#2d3748' }}>Select Colleague</label>
                  <select 
                    className="input" style={{ height: '56px', fontSize: '1rem', borderRadius: '12px' }}
                    value={form.recipient_id} onChange={(e) => setForm({...form, recipient_id: e.target.value})}
                  >
                    <option value="">Choose a person...</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>{emp.employee_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* STICKY FOOTER */}
            <div style={{ padding: '24px 40px', borderTop: '1px solid #f1f5f9', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: '16px', zIndex: 10 }}>
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} style={{ padding: '12px 32px', borderRadius: '40px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}>Back</button>
              )}
              {step < 3 ? (
                <button onClick={handleNext} disabled={!form.title || (step === 2 && !form.description)} style={{ padding: '12px 48px', borderRadius: '40px', border: 'none', background: '#3182ce', fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 6px 15px rgba(49, 130, 206, 0.2)' }}>Next Step</button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting || !form.recipient_id} style={{ padding: '12px 48px', borderRadius: '40px', border: 'none', background: '#3182ce', fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 6px 15px rgba(49, 130, 206, 0.2)' }}>{submitting ? '...' : 'Send Recognition'}</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalFadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default EmployeeAppreciationsView;
