import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ALL_STATUSES = [
  { key: 'submitted', label: 'Report Submitted', icon: '📨', desc: 'Your report has been received and logged in our system.' },
  { key: 'under_review', label: 'Under Review', icon: '🔍', desc: 'Authorities are reviewing your report for assessment.' },
  { key: 'assigned', label: 'Team Assigned', icon: '👷', desc: 'A repair team has been assigned to this issue.' },
  { key: 'work_in_progress', label: 'Repair Underway', icon: '🚧', desc: 'The repair team is actively working on fixing this damage.' },
  { key: 'resolved', label: 'Issue Resolved', icon: '✅', desc: 'The road damage has been repaired and verified.' },
];

function TicketDetail({ id, onBack }) {
  const { API } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/reports/${id}`)
      .then(r => setReport(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, API]);

  if (loading) return (
    <div>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16, borderRadius: 12 }} />)}
    </div>
  );
  if (!report) return <div>Report not found</div>;

  const currentIdx = ALL_STATUSES.findIndex(s => s.key === report.currentStatus);
  const isRejected = report.currentStatus === 'rejected';

  return (
    <div className="fade-in">
      <button className="btn btn-ghost" style={{ marginBottom: 20, padding: '8px 0' }} onClick={onBack}>
        ← Back to Reports
      </button>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div>
          {/* Header card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{report.ticketId}</div>
                <h2 style={{ fontSize: 22, marginBottom: 8 }}>{report.title}</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`status-badge status-${report.currentStatus}`}>{report.currentStatus.replace(/_/g,' ')}</span>
                  <span className={`status-badge severity-${report.severity}`}>{report.severity}</span>
                  <span className="status-badge" style={{ background: '#f0fdf4', color: '#15803d' }}>{report.damageType.replace('_',' ')}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="points-chip">+{report.pointsAwarded} pts</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{report.description}</p>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>📍 {report.location.address || `${report.location.city}, ${report.location.state}`}</span>
              <span>📅 {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {report.emailSent && <span style={{ color: 'var(--success)' }}>✉️ Authority notified</span>}
            </div>
          </div>

          {/* Ticket Timeline */}
          <div className="card">
            <h3 style={{ fontSize: 17, marginBottom: 24 }}>🎯 Ticket Progress</h3>
            {isRejected ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: 20, color: '#991b1b' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>❌</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Report Rejected</div>
                <div style={{ fontSize: 14 }}>{report.ticketFlow?.find(t => t.status === 'rejected')?.description || 'This report was rejected by the authority.'}</div>
              </div>
            ) : (
              <div className="ticket-timeline">
                {ALL_STATUSES.map((step, i) => {
                  const done = i < currentIdx;
                  const active = i === currentIdx;
                  const pending = i > currentIdx;
                  const flowItem = report.ticketFlow?.find(t => t.status === step.key);

                  return (
                    <div key={step.key} className="timeline-step">
                      <div className="timeline-dot-wrap">
                        <div className={`timeline-dot ${done ? 'done' : active ? 'active' : 'pending'}`}>
                          {done ? '✓' : active ? step.icon : '○'}
                        </div>
                        {i < ALL_STATUSES.length - 1 && (
                          <div className={`timeline-line ${done ? 'done' : ''}`} />
                        )}
                      </div>
                      <div className="timeline-content">
                        <h4 style={{ color: pending ? 'var(--text-muted)' : 'var(--text)', fontWeight: active ? 700 : 500 }}>
                          {step.label}
                          {active && <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>CURRENT</span>}
                        </h4>
                        <p style={{ color: pending ? 'var(--border)' : 'var(--text-muted)', fontSize: 13 }}>
                          {flowItem?.description || step.desc}
                        </p>
                        {flowItem && (
                          <time>{new Date(flowItem.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Image + AI */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <img src={report.imageUrl} alt="Damage" style={{ width: '100%', borderRadius: 10, marginBottom: 14 }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Reported damage photo</div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: 14, marginBottom: 12 }}>🤖 AI Analysis</h4>
            {report.aiAnalysis ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13 }}>Confidence</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>{report.aiAnalysis.confidence}%</span>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 99, height: 6, marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--success)', height: '100%', width: `${report.aiAnalysis.confidence}%`, borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{report.aiAnalysis.reasoning}</div>
              </div>
            ) : <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Analysis not available</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyReports() {
  const { API } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/reports/my`)
      .then(r => setReports(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API]);

  if (id) return <TicketDetail id={id} onBack={() => navigate('/my-reports')} />;

  const filtered = filter === 'all' ? reports : reports.filter(r => r.currentStatus === filter);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>📋 My Reports</h1>
          <p>{reports.length} total reports submitted</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/report')}>+ New Report</button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'submitted', 'under_review', 'assigned', 'work_in_progress', 'resolved'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Reports' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
          <h3>{filter === 'all' ? 'No reports yet' : `No ${filter.replace(/_/g,' ')} reports`}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 24 }}>Start by reporting road damage in your area</p>
          {filter === 'all' && <button className="btn btn-primary" onClick={() => navigate('/report')}>Report Damage →</button>}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(r => (
            <div key={r._id} className="card report-card" onClick={() => navigate(`/my-reports/${r._id}`)}>
              <img src={r.imageUrl} alt={r.title} />
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{r.ticketId}</div>
              <h4 style={{ fontSize: 15, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.title}</h4>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                <span className={`status-badge status-${r.currentStatus}`}>{r.currentStatus.replace(/_/g,' ')}</span>
                <span className={`status-badge severity-${r.severity}`}>{r.severity}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                📍 {r.location.city || r.location.address?.split(',')[0]} · {new Date(r.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
