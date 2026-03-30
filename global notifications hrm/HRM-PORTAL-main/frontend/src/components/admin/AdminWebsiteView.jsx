import React, { useEffect, useState } from 'react';
import {
  addFeature,
  addPricing,
  deleteFeature,
  deletePricing,
  getAboutSettings,
  getContactSettings,
  getFeatures,
  getHeaderSettings,
  getPricing,
  updateAboutSettings,
  updateContactSettings,
  updateHeaderSettings,
} from '../../services/settingsService';

const AdminWebsiteView = () => {
  const [headerForm, setHeaderForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    showButton: true,
    backgroundImage: null,
  });
  const [headerPreview, setHeaderPreview] = useState('');
  const [aboutForm, setAboutForm] = useState({ title: '', description: '', mission: '', vision: '' });
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    address: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
  });
  const [features, setFeatures] = useState([]);
  const [featureForm, setFeatureForm] = useState({ icon: '✨', title: '', description: '' });
  const [pricing, setPricing] = useState([]);
  const [pricingForm, setPricingForm] = useState({ planName: '', price: '', features: '', isPopular: false });

  const loadSettings = async () => {
    try {
      const [headerRes, aboutRes, contactRes, featureRes, pricingRes] = await Promise.allSettled([
        getHeaderSettings(),
        getAboutSettings(),
        getContactSettings(),
        getFeatures(),
        getPricing(),
      ]);
      if (headerRes.status === 'fulfilled' && headerRes.value?.success && headerRes.value?.data) {
        const data = headerRes.value.data;
        setHeaderForm((prev) => ({
          ...prev,
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          buttonText: data.buttonText || '',
          buttonLink: data.buttonLink || '',
          showButton: data.showButton !== false,
        }));
        setHeaderPreview(data.backgroundImage || '');
      }
      if (aboutRes.status === 'fulfilled' && aboutRes.value?.success && aboutRes.value?.data) {
        setAboutForm((prev) => ({ ...prev, ...aboutRes.value.data }));
      }
      if (contactRes.status === 'fulfilled' && contactRes.value?.success && contactRes.value?.data) {
        setContactForm((prev) => ({ ...prev, ...contactRes.value.data }));
      }
      if (featureRes.status === 'fulfilled' && featureRes.value?.success && featureRes.value?.data) {
        setFeatures(featureRes.value.data);
      }
      if (pricingRes.status === 'fulfilled' && pricingRes.value?.success && pricingRes.value?.data) {
        setPricing(pricingRes.value.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleHeaderSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', headerForm.title);
    formData.append('subtitle', headerForm.subtitle);
    formData.append('description', headerForm.description);
    formData.append('buttonText', headerForm.buttonText);
    formData.append('buttonLink', headerForm.buttonLink);
    formData.append('showButton', headerForm.showButton);
    if (headerForm.backgroundImage) formData.append('backgroundImage', headerForm.backgroundImage);
    try {
      const res = await updateHeaderSettings(formData);
      if (res.success) {
        alert('Settings saved successfully!');
        setHeaderPreview(res.data?.backgroundImage || headerPreview);
      }
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to save header settings.');
    }
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAboutSettings(aboutForm);
      alert('About settings saved.');
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to save about settings.');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateContactSettings(contactForm);
      alert('Contact settings saved.');
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to save contact settings.');
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    try {
      await addFeature(featureForm);
      setFeatureForm({ icon: '✨', title: '', description: '' });
      loadSettings();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to add feature.');
    }
  };

  const handlePricingSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPricing({
        planName: pricingForm.planName,
        price: pricingForm.price,
        features: pricingForm.features.split(',').map((item) => item.trim()).filter(Boolean),
        isPopular: pricingForm.isPopular,
      });
      setPricingForm({ planName: '', price: '', features: '', isPopular: false });
      loadSettings();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to add pricing plan.');
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-h1">Website Settings</h1>
        <p className="page-sub">Configure your public website sections</p>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Header Settings</div>
        </div>
        <div className="panel-body">
          <form onSubmit={handleHeaderSubmit}>
            <label className="form-label">Header Title</label>
            <input className="input" value={headerForm.title} onChange={(e) => setHeaderForm((prev) => ({ ...prev, title: e.target.value }))} required />
            <label className="form-label">Header Sub Title</label>
            <input className="input" value={headerForm.subtitle} onChange={(e) => setHeaderForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
            <label className="form-label">Header Description</label>
            <textarea className="input" rows={4} value={headerForm.description} onChange={(e) => setHeaderForm((prev) => ({ ...prev, description: e.target.value }))} />
            <label className="form-label">Header Background Image</label>
            <input className="input" type="file" onChange={(e) => setHeaderForm((prev) => ({ ...prev, backgroundImage: e.target.files?.[0] || null }))} />
            {headerPreview && <img src={headerPreview} alt="Header BG" style={{ maxHeight: 100, borderRadius: 4, marginBottom: 16 }} />}
            <label className="form-label">Header Button Text</label>
            <input className="input" value={headerForm.buttonText} onChange={(e) => setHeaderForm((prev) => ({ ...prev, buttonText: e.target.value }))} />
            <label className="form-label">Header Button Link</label>
            <input className="input" value={headerForm.buttonLink} onChange={(e) => setHeaderForm((prev) => ({ ...prev, buttonLink: e.target.value }))} />
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={headerForm.showButton} onChange={(e) => setHeaderForm((prev) => ({ ...prev, showButton: e.target.checked }))} />
              Show Header Button
            </label>
            <button type="submit" className="btn btn-solid">
              Save Header Settings
            </button>
          </form>
        </div>
      </div>

      <div className="panel mt">
        <div className="panel-head">
          <div className="panel-title">About Settings</div>
        </div>
        <div className="panel-body">
          <form onSubmit={handleAboutSubmit}>
            <label className="form-label">About Title</label>
            <input className="input" value={aboutForm.title} onChange={(e) => setAboutForm((prev) => ({ ...prev, title: e.target.value }))} required />
            <label className="form-label">About Description</label>
            <textarea className="input" rows={4} value={aboutForm.description} onChange={(e) => setAboutForm((prev) => ({ ...prev, description: e.target.value }))} />
            <div className="grid grid-2" style={{ padding: 0 }}>
              <div>
                <label className="form-label">Our Mission</label>
                <textarea className="input" rows={3} value={aboutForm.mission} onChange={(e) => setAboutForm((prev) => ({ ...prev, mission: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Our Vision</label>
                <textarea className="input" rows={3} value={aboutForm.vision} onChange={(e) => setAboutForm((prev) => ({ ...prev, vision: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-solid" style={{ marginTop: 16 }}>
              Save About Settings
            </button>
          </form>
        </div>
      </div>

      <div className="panel mt">
        <div className="panel-head">
          <div className="panel-title">Contact & Social Settings</div>
        </div>
        <div className="panel-body">
          <form onSubmit={handleContactSubmit}>
            <div className="grid grid-2" style={{ padding: 0 }}>
              <div>
                <label className="form-label">Email Address</label>
                <input className="input" value={contactForm.email} onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input className="input" value={contactForm.phone} onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
            </div>
            <label className="form-label">Physical Address</label>
            <textarea className="input" rows={2} value={contactForm.address} onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))} />
            <h4 style={{ margin: '20px 0 10px 0' }}>Social Media Links</h4>
            <div className="grid grid-2" style={{ padding: 0 }}>
              <div>
                <label className="form-label">Facebook URL</label>
                <input className="input" value={contactForm.facebook} onChange={(e) => setContactForm((prev) => ({ ...prev, facebook: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Twitter URL</label>
                <input className="input" value={contactForm.twitter} onChange={(e) => setContactForm((prev) => ({ ...prev, twitter: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">LinkedIn URL</label>
                <input className="input" value={contactForm.linkedin} onChange={(e) => setContactForm((prev) => ({ ...prev, linkedin: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Instagram URL</label>
                <input className="input" value={contactForm.instagram} onChange={(e) => setContactForm((prev) => ({ ...prev, instagram: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-solid">
              Save Contact Settings
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-2" style={{ padding: 0, marginTop: 24 }}>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Features</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleFeatureSubmit} style={{ marginBottom: 16 }}>
              <label className="form-label">Icon</label>
              <input className="input" value={featureForm.icon} onChange={(e) => setFeatureForm((prev) => ({ ...prev, icon: e.target.value }))} />
              <label className="form-label">Title</label>
              <input className="input" value={featureForm.title} onChange={(e) => setFeatureForm((prev) => ({ ...prev, title: e.target.value }))} required />
              <label className="form-label">Description</label>
              <textarea className="input" rows={3} value={featureForm.description} onChange={(e) => setFeatureForm((prev) => ({ ...prev, description: e.target.value }))} />
              <button type="submit" className="btn btn-solid">
                Add Feature
              </button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {features.length === 0 ? (
                <li>No features configured.</li>
              ) : (
                features.map((feature) => (
                  <li key={feature._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, border: '1px solid var(--border)', borderRadius: 4 }}>
                    <span>
                      {feature.icon} <strong>{feature.title}</strong>
                    </span>
                    <button type="button" className="btn btn-outline" style={{ borderColor: '#fca5a5', color: '#b91c1c', padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => deleteFeature(feature._id).then(loadSettings)}>
                      Del
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Pricing</div>
          </div>
          <div className="panel-body">
            <form onSubmit={handlePricingSubmit} style={{ marginBottom: 16 }}>
              <label className="form-label">Plan Name</label>
              <input className="input" value={pricingForm.planName} onChange={(e) => setPricingForm((prev) => ({ ...prev, planName: e.target.value }))} required />
              <label className="form-label">Price</label>
              <input className="input" type="number" value={pricingForm.price} onChange={(e) => setPricingForm((prev) => ({ ...prev, price: e.target.value }))} required />
              <label className="form-label">Features (comma separated)</label>
              <input className="input" value={pricingForm.features} onChange={(e) => setPricingForm((prev) => ({ ...prev, features: e.target.value }))} />
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={pricingForm.isPopular} onChange={(e) => setPricingForm((prev) => ({ ...prev, isPopular: e.target.checked }))} />
                Mark as popular
              </label>
              <button type="submit" className="btn btn-solid">
                Add Plan
              </button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pricing.length === 0 ? (
                <li>No pricing plans configured.</li>
              ) : (
                pricing.map((plan) => (
                  <li key={plan._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, border: '1px solid var(--border)', borderRadius: 4 }}>
                    <span>
                      <strong>{plan.planName}</strong> - ${plan.price}
                    </span>
                    <button type="button" className="btn btn-outline" style={{ borderColor: '#fca5a5', color: '#b91c1c', padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => deletePricing(plan._id).then(loadSettings)}>
                      Del
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsiteView;
