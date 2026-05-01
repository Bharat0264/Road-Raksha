import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli','Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

const ALL_BADGE_INFO = [
  { name: 'Road Watcher', icon: '👀', pts: 10, desc: 'Submit your first valid report' },
  { name: 'Responsible Citizen', icon: '🏆', pts: 50, desc: 'Reach 50 points' },
  { name: 'Community Hero', icon: '🦸', pts: 100, desc: 'Reach 100 points' },
  { name: 'Road Guardian', icon: '🛡️', pts: 250, desc: 'Reach 250 points' },
  { name: 'City Champion', icon: '🌟', pts: 500, desc: 'Reach 500 points' },
];

export default function Profile() {
  const { user, updateUser, API } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', mobile: user?.mobile||'', city: user?.city||'', state: user?.state||'' });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/auth/profile`, form);
      updateUser({ name: data.name, mobile: data.mobile, city: data.city, state: data.state });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally { setSaving(false); }
  };

  const nextBadge = ALL_BADGE_INFO.find(b => (user?.points || 0) < b.pts && !user?.badges?.find(ub => ub.name === b.name));
  const progress = nextBadge ? Math.min(100, ((user?.points || 0) / nextBadge.pts) * 100) : 100;

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account and view your achievements</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left - Profile + Edit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar + info */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 800, fontFamily: 'Syne' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <span className="points-chip">⭐ {user?.points || 0} Points</span>
              {user?.badges?.length > 0 && (
                <span className="badge-chip">{user.badges[user.badges.length-1]?.icon} {user.badges[user.badges.length-1]?.name}</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              📍 {user?.city}, {user?.state} · 📱 {user?.mobile}
            </div>
          </div>

          {/* Edit form */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16 }}>Edit Profile</h3>
              {!editing && <button className="btn btn-outline" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => setEditing(true)}>Edit</button>}
            </div>
            {['name','mobile','city'].map(k => (
              <div className="form-group" key={k}>
                <label>{k.charAt(0).toUpperCase()+k.slice(1)}</label>
                <input type="text" value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} disabled={!editing} />
              </div>
            ))}
            <div className="form-group">
              <label>State</label>
              <select value={form.state} onChange={e => setForm({...form,state:e.target.value})} disabled={!editing}>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {editing && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        {/* Right - Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Points Progress */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a, #1a56db)', color: 'white' }}>
            <h3 style={{ fontSize: 16, opacity: 0.8, marginBottom: 8 }}>Points Progress</h3>
            <div style={{ fontFamily: 'Syne', fontSize: 48, fontWeight: 900 }}>{user?.points || 0}</div>
            {nextBadge ? (
              <>
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
                  {nextBadge.pts - (user?.points||0)} pts to unlock {nextBadge.icon} {nextBadge.name}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                  <div style={{ background: 'white', height: '100%', width: `${progress}%`, borderRadius: 99, transition: 'width 1s' }} />
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>🌟 Maximum level achieved!</div>
            )}
          </div>

          {/* All Badges */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>🏅 All Badges</h3>
            {ALL_BADGE_INFO.map(badge => {
              const earned = user?.badges?.find(b => b.name === badge.name);
              return (
                <div key={badge.name} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'center', opacity: earned ? 1 : 0.4 }}>
                  <div style={{ fontSize: 28, width: 44, height: 44, background: earned ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'var(--bg)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {badge.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{badge.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{badge.desc}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{badge.pts} points required</div>
                  </div>
                  {earned ? (
                    <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>Earned ✓</span>
                  ) : (
                    <span style={{ fontSize: 11, background: 'var(--bg)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 99 }}>Locked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
