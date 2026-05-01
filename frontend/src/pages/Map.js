import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const severityColors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

const createCustomIcon = (severity) => L.divIcon({
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    background:${severityColors[severity] || '#6366f1'};
    border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function DamageMap() {
  const { API } = useAuth();
  const [reports, setReports] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(p => setUserPos([p.coords.latitude, p.coords.longitude]));
    axios.get(`${API}/reports/nearby`)
      .then(r => setReports(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API]);

  const center = userPos || [13.0827, 80.2707]; // Default: Chennai
  const filtered = filter === 'all' ? reports : reports.filter(r => r.severity === filter);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🗺️ Damage Map</h1>
        <p>View all reported road damage in your area</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Active', val: reports.length, color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Critical', val: reports.filter(r=>r.severity==='critical').length, color: '#ef4444', bg: '#fef2f2' },
          { label: 'High', val: reports.filter(r=>r.severity==='high').length, color: '#f97316', bg: '#fff7ed' },
          { label: 'Resolved', val: 0, color: 'var(--success)', bg: '#ecfdf5' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, color: s.color, padding: '10px 18px', borderRadius: 10, fontWeight: 700 }}>
            <div style={{ fontSize: 20 }}>{s.val}</div>
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Severity filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'critical', 'high', 'medium', 'low'].map(f => (
          <button key={f} className={`btn ${filter===f?'btn-primary':'btn-ghost'}`}
            style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setFilter(f)}>
            {f==='all' ? 'All' : f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {Object.entries(severityColors).map(([sev, col]) => (
            <span key={sev} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: col, display: 'inline-block' }} />
              {sev}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Map */}
        <div className="map-container" style={{ height: 520 }}>
          {!loading && (
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {/* User location */}
              {userPos && (
                <>
                  <Marker position={userPos} icon={L.divIcon({ html: '<div style="width:16px;height:16px;background:#1a56db;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(26,86,219,0.3)"></div>', className:'', iconSize:[16,16], iconAnchor:[8,8] })}>
                    <Popup><b>You are here</b></Popup>
                  </Marker>
                  <Circle center={userPos} radius={2000} pathOptions={{ color: '#1a56db', fillColor: '#1a56db', fillOpacity: 0.05, weight: 1, dashArray: '5,5' }} />
                </>
              )}
              {/* Damage markers */}
              {filtered.map(r => (
                <Marker key={r._id} position={[r.location.lat, r.location.lng]}
                  icon={createCustomIcon(r.severity)}
                  eventHandlers={{ click: () => setSelected(r) }}>
                  <Popup>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 180 }}>
                      {r.imageUrl && <img src={r.imageUrl} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />}
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: severityColors[r.severity], marginBottom: 4 }}>{r.severity} — {r.damageType?.replace('_',' ')}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          {loading && <div style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>Loading map...</div>}
        </div>

        {/* Sidebar list */}
        <div style={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', padding: '0 4px' }}>{filtered.length} reports shown</div>
          {filtered.map(r => (
            <div key={r._id} className="card card-sm" style={{ cursor: 'pointer', border: selected?._id === r._id ? '2px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s' }}
              onClick={() => setSelected(r)}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: severityColors[r.severity], flexShrink: 0, marginTop: 4 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.location.city || 'Unknown'} · {r.damageType?.replace('_',' ')}</div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
              <p style={{ fontSize: 13 }}>No reports in this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
