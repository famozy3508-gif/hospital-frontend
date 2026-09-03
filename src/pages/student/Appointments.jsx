// src/pages/student/Appointments.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const STATUS_LABEL = { pending: 'รอถึงกำหนด', completed: 'เสร็จสิ้นแล้ว', cancelled: 'ยกเลิกแล้ว' };

export default function Appointments() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/appointments.php').then(setList); }, []);

  return (
    <div className="form-container">
      <Link to="/student/dashboard" className="btn-back-panel" style={{ display: 'inline-block', marginBottom: 20 }}>
        « ย้อนกลับ
      </Link>

      <h2>นัดหมายทั้งหมด</h2>
      {list.length === 0 ? <p>ยังไม่มีประวัติการนัดหมาย</p> : list.map((a) => (
        <div className="info-box" key={a.appointment_id}>
          📅 {new Date(a.appointment_datetime).toLocaleString('th-TH')} น.<br />
          เหตุผล: {a.reason}<br />
          สถานะ: <strong>{STATUS_LABEL[a.status] || a.status}</strong>
        </div>
      ))}
    </div>
  );
}