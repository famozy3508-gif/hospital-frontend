// src/pages/student/VisitHistory.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function VisitHistory() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/student/visit_history.php').then(setList); }, []);

  return (
    <div className="form-container">
      <Link to="/student/dashboard" className="btn-back-panel" style={{ display: 'inline-block', marginBottom: 20 }}>
        « ย้อนกลับ
      </Link>

      <h2>ประวัติการเข้ารับบริการห้องพยาบาล</h2>
      {list.length === 0 ? <p>ยังไม่มีประวัติการเข้ารับบริการ</p> : list.map((v) => (
        <div className="info-box" key={v.visit_id}>
          📅 <strong>{new Date(v.visit_datetime).toLocaleString('th-TH')} น.</strong><br />
          อาการ: {v.symptoms}<br />
          การวินิจฉัย: {v.diagnosis}<br />
          การรักษา: {v.treatment}<br />
          ยาที่ได้รับ: {v.medicine_given}
          {v.notes && <><br />หมายเหตุ: {v.notes}</>}
        </div>
      ))}
    </div>
  );
}