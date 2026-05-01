import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli','Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

export default function Signup() {
  const { login, API } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', city: '', state: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/signup`, { 
        name: form.name, email: form.email, mobile: form.mobile, 
        city: form.city, state: form.state, password: form.password 
      });
      login(data.token, data.user);
      toast.success(`Welcome to RoadCare, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🛣️</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>Join RoadCare</h1>
          <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.7, maxWidth: 320 }}>
            Be a responsible citizen. Report road damage, earn points, and help build safer communities.
          </p>
          <div style={{ marginTop: 40 }}>
            {[{ icon: '📸', text: 'Upload damage photos' }, { icon: '🤖', text: 'AI verifies your report' }, { icon: '📧', text: 'Authorities are notified' }, { icon: '🏆', text: 'You earn badges & points' }].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, textAlign: 'left' }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box fade-in">
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
          <h2>Create your account</h2>
          <p className="sub">Start making your roads safer today</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Ravi Kumar" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="ravi@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="tel" placeholder="+91 9876543210" value={form.mobile} onChange={set('mobile')} required pattern="[0-9+\s\-]{10,15}" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" placeholder="Chennai" value={form.city} onChange={set('city')} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <select value={form.state} onChange={set('state')} required>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
