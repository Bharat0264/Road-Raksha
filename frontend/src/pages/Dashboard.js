import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-${status}`}>
    {status.replace(/_/g, ' ')}
  </span>
);

export default function Dashboard() {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/reports/stats/dashboard`)
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API]);

  const statCards = [
    { label: 'Total Reports', value: stats?.total || 0, icon: '📋', color: '#dbeafe', iconBg: '#1a56db' },
    { label: 'Resolved', value: stats?.resolved || 0, icon: '✅', color: '#dcfce7', iconBg: '#10b981' },
    { label: 'In Progress', value: stats?.pending || 0, icon: '⏳', color: '#fef3c7', iconBg: '#f59e0b' },
    { label: 'Points Earned', value: stats?.points || 0, icon: '⭐', color: '#f3e8ff', iconBg: '#7c3aed' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's what's happening with your road reports today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/report')}>
          + Report Damage
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map(stat => (
          <div key={stat.label} className="card stat-card">
            <div className="stat-icon" style={{ background: stat.color, color: stat.iconBg }}>
              {stat.icon}
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: 36, width: 60 }} />
            ) : (
              <div className="stat-val">{stat.value}</div>
            )}
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Recent Reports */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 17 }}>Recent Reports</h3>
            <button className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }} onClick={() => navigate('/my-reports')}>View all</button>
          </div>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12, borderRadius: 10 }} />)
          ) : stats?.recentReports?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
              <p>No reports yet. <button className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 8px' }} onClick={() => navigate('/report')}>Report now →</button></p>
            </div>
          ) : (
            stats?.recentReports?.map(r => (
              <div key={r._id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => navigate(`/my-reports/${r._id}`)}>
                <img src={r.imageUrl} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge status={r.currentStatus} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.ticketId}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Badges & Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f, #1a56db)', color: 'white' }}>
            <h3 style={{ fontSize: 16, marginBottom: 4, opacity: 0.8 }}>Your Points</h3>
            <div style={{ fontFamily: 'Syne', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>
              {stats?.points || 0}
            </div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
              {stats?.points >= 500 ? '🌟 City Champion level' : 
               stats?.points >= 250 ? '🛡️ Road Guardian level' :
               stats?.points >= 100 ? '🦸 Community Hero level' :
               stats?.points >= 50 ? '🏆 Responsible Citizen level' :
               '👀 Road Watcher level'}
            </div>
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <div style={{ background: 'white', height: '100%', width: `${Math.min(100, (stats?.points || 0) / 5)}%`, borderRadius: 99, transition: 'width 1s' }} />
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>{Math.max(0, 500 - (stats?.points || 0))} pts to City Champion</div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 17, marginBottom: 16 }}>🏅 Your Badges</h3>
            {loading ? (
              <div className="skeleton" style={{ height: 60 }} />
            ) : stats?.badges?.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                <div style={{ fontSize: 36 }}>🎯</div>
                <p style={{ fontSize: 13, marginTop: 8 }}>Submit your first report to earn badges!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {stats?.badges?.map((badge, i) => (
                  <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24 }}>{badge.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{badge.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/report')}>📸 Report New Damage</button>
          <button className="btn btn-outline" onClick={() => navigate('/map')}>🗺️ View Damage Map</button>
          <button className="btn btn-outline" onClick={() => navigate('/my-reports')}>📋 My Reports</button>
          <button className="btn btn-ghost" onClick={() => navigate('/profile')}>👤 Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
