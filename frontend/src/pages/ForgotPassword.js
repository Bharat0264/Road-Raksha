import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP+new pass
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending OTP');
    } finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { email, otp: form.otp, newPassword: form.newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🔐</div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Reset Password</h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.7, maxWidth: 300 }}>
            Don't worry! We'll send a one-time password to your registered email.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box fade-in">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', marginBottom: 24 }}>
            ← Back to login
          </Link>
          {step === 1 ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
              <h2>Forgot Password?</h2>
              <p className="sub">Enter your email to receive a reset OTP</p>
              <form onSubmit={sendOTP}>
                <div className="form-group">
                  <label>Registered Email</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
              <h2>Check your email</h2>
              <p className="sub">We sent a 6-digit OTP to {email}</p>
              <form onSubmit={resetPassword}>
                <div className="form-group">
                  <label>OTP Code</label>
                  <input type="text" placeholder="123456" value={form.otp} onChange={e => setForm({...form, otp: e.target.value})} maxLength={6} required style={{ letterSpacing: 8, fontSize: 20, textAlign: 'center' }} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} minLength={6} required />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password →'}
                </button>
                <button type="button" className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setStep(1)}>
                  ← Change email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
