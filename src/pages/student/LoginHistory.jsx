// src/pages/student/LoginHistory.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function LoginHistory() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/login_history.php').then(setList); }, []);

  return (
    <div className="form-container">
      <Link to="/student/dashboard" className="btn-back-panel" style={{ display: 'inline-block', marginBottom: 20 }}>
        « ย้อนกลับ
      </Link>

      <h2>ประวัติการเข้าใช้งานระบบ</h2>
      {list.length === 0 ? <p>ไม่พบประวัติการเข้าใช้งาน</p> : (
        <table style={{ width: '100%' }}>
          <thead><tr><th>วันเวลาเข้าใช้</th><th>IP Address</th></tr></thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.log_id}>
                <td>{new Date(l.login_time).toLocaleString('th-TH')}</td>
                <td>{l.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}