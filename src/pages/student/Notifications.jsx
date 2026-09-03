// src/pages/student/Notifications.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function Notifications() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/notifications.php').then(setList); }, []);

  return (
    <div className="form-container">
      <Link to="/student/dashboard" className="btn-back-panel" style={{ display: 'inline-block', marginBottom: 20 }}>
        « ย้อนกลับ
      </Link>

      <h2>การแจ้งเตือน</h2>
      {list.length === 0 ? <p>ยังไม่มีการแจ้งเตือน</p> : list.map((n) => (
        <div className="alert-box" key={n.notification_id}>
          🔔 {n.message}<br />
          <small>{new Date(n.created_at).toLocaleString('th-TH')} น.</small>
        </div>
      ))}
    </div>
  );
}