// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, API_BASE } from '../../api/client';
import AdminSidebar from '../../components/AdminSidebar';
import LoadingScreen from '../../components/LoadingScreen';

const UPLOAD_BASE = API_BASE.replace(/\/api$/, '');
const DONUT_COLORS = ['#1E4E8C', '#2B6CB0', '#4C93D6', '#7FB2E5', '#B7D4EF', '#DDE7F1'];

function DonutChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return <p style={{ color: '#9AA0A6' }}>ยังไม่มีข้อมูลโรคประจำตัวในระบบ</p>;

  let cumulative = 0;
  const gradientParts = data.map((d, i) => {
    const start = (cumulative / total) * 360;
    cumulative += d.count;
    const end = (cumulative / total) * 360;
    return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="donut-wrap">
      <div className="donut-chart" style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}></div>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div className="donut-legend-item" key={d.label}>
            <span className="donut-legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}></span>
            <span className="donut-legend-label">{d.label}</span>
            <span className="donut-legend-count">{d.count} คน</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      {data.map((d, i) => (
        <div className="bar-chart-row" key={i}>
          <div className="bar-chart-label">{d.month}</div>
          <div className="bar-chart-track">
            <div className="bar-chart-fill" style={{ width: `${(d.count / max) * 100}%` }}>
              {d.count > 0 && <span className="bar-chart-value">{d.count}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// การ์ดกราฟแบบย่อ/ขยายได้ กดลูกศรแล้วเหลือแค่หัวข้อ
function CollapsibleChartCard({ title, children }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>{title}</h3>
        <button
          type="button"
          className={`chart-collapse-btn ${collapsed ? 'collapsed' : ''}`}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'ขยาย' : 'ย่อ'}
        >
          ▼
        </button>
      </div>
      {!collapsed && children}
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard_summary.php')
      .then(setSummary)
      .catch((err) => setLoadError(err.message));
  }, []);

  if (loadError) {
    return (
      <div className="form-container">
        <p className="alert-error">เกิดข้อผิดพลาด: {loadError}</p>
        <a href="/login" style={{ display: 'block', marginTop: 20 }}>« กลับไปหน้าเข้าสู่ระบบ</a>
      </div>
    );
  }
  if (!summary) return <LoadingScreen />;

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="dashboard-header">
        {summary.nurse_avatar ? (
          <img src={`${UPLOAD_BASE}/uploads/avatars/${summary.nurse_avatar}`} alt="รูปโปรไฟล์" />
        ) : (
          <div style={{
            width: 96, height: 96, borderRadius: '50%', border: '3px solid #fff',
            boxShadow: '0 10px 24px rgba(30,78,140,0.2)', background: 'var(--blue-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--blue)',
          }}>👤</div>
        )}
        <div>
          <div className="greeting-small">สวัสดี,</div>
          <div className="greeting-name">{summary.nurse_position} {summary.nurse_name}</div>
        </div>
      </div>

      <div className="stat-grid">
        <Link to="/admin/manage-students" className="stat-box">
          <span className="stat-label-badge">นักเรียนทั้งหมด</span>
          <div className="stat-divider"></div>
          <strong>{summary.total_students}</strong>คน
        </Link>
        <Link to="/admin/manage-appointments" className="stat-box">
          <span className="stat-label-badge">นัดหมายทั้งหมด</span>
          <div className="stat-divider"></div>
          <strong>{summary.total_appointments}</strong>ราย
        </Link>
        <Link to="/admin/manage-appointments" className="stat-box">
          <span className="stat-label-badge">นัดหมายที่รอดำเนินการ</span>
          <div className="stat-divider"></div>
          <strong>{summary.pending_appointments}</strong>ราย
        </Link>
      </div>

      <CollapsibleChartCard title="📊 สัดส่วนโรคประจำตัวของนักเรียน">
        <DonutChart data={summary.disease_distribution} />
      </CollapsibleChartCard>

      <CollapsibleChartCard title="📅 จำนวนนักเรียนเข้ารับบริการรายวัน (7 วันล่าสุด)">
        <BarChart data={summary.daily_visits} />
      </CollapsibleChartCard>

      <CollapsibleChartCard title="📈 จำนวนนักเรียนเข้ารับบริการรายเดือน (6 เดือนล่าสุด)">
        <BarChart data={summary.monthly_visits} />
      </CollapsibleChartCard>
    </div>
  );
}