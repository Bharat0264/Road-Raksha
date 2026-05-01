import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ReportDamage() {
  const { API, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const cameraRef = useRef();

  const [form, setForm] = useState({
    title: '', description: '', damageType: '', severity: '',
    address: '', city: '', state: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => { getLocation(); }, []);

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const d = await r.json();
          setForm(f => ({
            ...f,
            address: d.display_name?.split(',').slice(0,3).join(',') || '',
            city: d.address?.city || d.address?.town || d.address?.village || '',
            state: d.address?.state || ''
          }));
        } catch {}
        setLocLoading(false);
      },
      () => { toast.error('Could not get location. Please enter manually.'); setLocLoading(false); }
    );
  };

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error('Image must be under 10MB');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Please upload a photo of the damage');
    if (!location) return toast.error('Location is required');
    if (!form.damageType) return toast.error('Please select damage type');
    if (!form.severity) return toast.error('Please select severity');

    setSubmitting(true);
    const toastId = toast.loading('Analyzing image with AI...');

    try {
      const fd = new FormData();
      fd.append('image', image);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('lat', location.lat);
      fd.append('lng', location.lng);

      toast.loading('Submitting report...', { id: toastId });
      const { data } = await axios.post(`${API}/reports`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Report submitted successfully! 🎉', { id: toastId });
      updateUser({ points: (data.report.user?.points || 0) + data.pointsEarned });
      setSubmitResult(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed';
      if (err.response?.status === 422) {
        toast.error('⚠️ ' + msg, { id: toastId, duration: 5000 });
      } else {
        toast.error(msg, { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitResult) return (
    <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: 48 }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Report Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your damage report has been sent to the authorities.</p>
        
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Ticket ID</p>
          <p style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>{submitResult.report.ticketId}</p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          <div className="points-chip">+{submitResult.pointsEarned} Points Earned! ⭐</div>
          {submitResult.newBadges?.map(b => (
            <div key={b.name} className="badge-chip">{b.icon} {b.name} Unlocked!</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/my-reports/${submitResult.report._id}`)}>
            Track Ticket →
          </button>
          <button className="btn btn-outline" onClick={() => { setSubmitResult(null); setImage(null); setImagePreview(null); setForm({ title:'',description:'',damageType:'',severity:'',address:'',city:'',state:'' }); }}>
            Report Another
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <h1>🚧 Report Road Damage</h1>
        <p>Upload a photo, confirm location, and submit — we'll handle the rest.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>📸 Photo Evidence</h3>
          {imagePreview ? (
            <div>
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => fileRef.current?.click()}>Change Photo</button>
                <button type="button" className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--danger)' }} onClick={() => { setImage(null); setImagePreview(null); }}>Remove</button>
              </div>
            </div>
          ) : (
            <div className="image-upload-area" onClick={() => fileRef.current?.click()}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Click to upload or take photo</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>JPG, PNG, WEBP up to 10MB</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                <button type="button" className="btn btn-outline" style={{ fontSize: 13 }} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>📁 Browse Files</button>
                <button type="button" className="btn btn-outline" style={{ fontSize: 13 }} onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}>📷 Camera</button>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
        </div>

        {/* Details */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>📝 Damage Details</h3>
          <div className="form-group">
            <label>Report Title</label>
            <input type="text" placeholder="e.g. Large pothole on MG Road" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Damage Type</label>
              <select value={form.damageType} onChange={e => setForm({...form, damageType: e.target.value})} required>
                <option value="">Select type</option>
                <option value="pothole">🕳️ Pothole</option>
                <option value="crack">↯ Road Crack</option>
                <option value="flooding">💧 Flooding</option>
                <option value="broken_barrier">🚧 Broken Barrier</option>
                <option value="landslide">🏔️ Landslide</option>
                <option value="other">❓ Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} required>
                <option value="">Select severity</option>
                <option value="low">🟢 Low — Minor inconvenience</option>
                <option value="medium">🟡 Medium — Causing disruption</option>
                <option value="high">🟠 High — Dangerous to vehicles</option>
                <option value="critical">🔴 Critical — Immediate hazard</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Describe the damage in detail — size, depth, traffic impact, etc." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>📍 Location</h3>
            <button type="button" className="btn btn-outline" style={{ fontSize: 13, padding: '8px 14px' }} onClick={getLocation} disabled={locLoading}>
              {locLoading ? 'Getting...' : '↻ Refresh Location'}
            </button>
          </div>
          {location ? (
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 13, color: 'var(--text-muted)' }}>
              📍 Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
            </div>
          ) : (
            <div style={{ background: '#fef3c7', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 13, color: '#92400e' }}>
              ⚠️ Location not detected. Please enable GPS or enter manually below.
            </div>
          )}
          <div className="form-group">
            <label>Address / Landmark</label>
            <input type="text" placeholder="e.g. Near CMBT Bus Stand, Koyambedu" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input type="text" placeholder="Chennai" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" placeholder="Tamil Nadu" value={form.state} onChange={e => setForm({...form, state: e.target.value})} required />
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={submitting} style={{ fontSize: 17, padding: '16px' }}>
          {submitting ? '🤖 AI is analyzing your image...' : '🚀 Submit Report'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          🤖 Your image will be analyzed by AI to verify it shows road damage. You'll earn points for valid reports!
        </p>
      </form>
    </div>
  );
}
