import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, API } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🚧</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            RoadCare
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.6, maxWidth: 320 }}>
            Report road damage, track fixes, and make your city's roads safer for everyone.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
            {['🏆 Earn Badges', '📍 Live Map', '📊 Track Progress', '⚡ AI Analysis'].map(f => (
              <span key={f} style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box fade-in">
          <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to continue reporting road damage</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            New to RoadCare?{' '}
            <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
