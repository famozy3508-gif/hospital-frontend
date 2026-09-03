// src/pages/admin/Statistics.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

function BarChart({ data, labelKey }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 110, fontSize: 13, textAlign: 'right', flexShrink: 0 }}>{item[labelKey]}</div>
          <div style={{ flex: 1, background: '#EAF2FB', borderRadius: 4, height: 22, overflow: 'hidden' }}>
            <div style={{ background: '#2B6CB0', height: '100%', width: `${(item.count / max) * 100}%`, transition: 'width 0.4s' }} />
          </div>
          <div style={{ width: 30, fontSize: 13, color: '#555' }}>{item.count}</div>
        </div>
      ))}
    </div>
  );
}

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/admin/stats.php').then(setStats).catch((e) => setError(e.message)); }, []);

  if (error) return <div className="form-container"><p className="alert-error">{error}</p></div>;
  if (!stats) return <p style={{ textAlign: 'center', marginTop: 60 }}>กำลังโหลด...</p>;

  return (
    <div className="form-container" style={{ maxWidth: 800 }}>
      <h2>สถิติภาพรวม</h2>

      <div className="stat-grid">
        <div className="stat-box"><strong>{stats.total_students}</strong>นักเรียนทั้งหมด</div>
        <div className="stat-box"><strong>{stats.visits_this_month}</strong>เข้ารับบริการเดือนนี้</div>
        <div className="stat-box"><strong>{stats.pending_appointments}</strong>นัดหมายที่รอถึงกำหนด</div>
      </div>

      <h3>อาการที่พบบ่อยที่สุด (Top 5)</h3>
      {stats.top_symptoms.length === 0 ? <p>ยังไม่มีข้อมูล</p> : <BarChart data={stats.top_symptoms} labelKey="symptoms" />}

      <h3 style={{ marginTop: 25 }}>สัดส่วนความรุนแรงของการแพ้ยา</h3>
      <BarChart data={stats.allergy_severity} labelKey="label" />

      <h3 style={{ marginTop: 25 }}>จำนวนการเข้ารับบริการ 6 เดือนล่าสุด</h3>
      <BarChart data={stats.monthly_visits} labelKey="month" />

      <Link to="/admin/dashboard" style={{ display: 'block', marginTop: 20 }}>« กลับหน้าหลัก</Link>
    </div>
  );
}
