// src/pages/student/Allergy.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const SEVERITY_LABEL = { mild: 'เล็กน้อย', moderate: 'ปานกลาง', severe: 'รุนแรง' };

export default function Allergy() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ allergy_name: '', reaction: '', severity: 'mild' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/student/allergy.php').then(setList);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await api.post('/student/allergy.php', form);
      setSuccess(res.message);
      setForm({ allergy_name: '', reaction: '', severity: 'mild' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันลบรายการนี้?')) return;
    await api.del(`/student/allergy.php?id=${id}`);
    load();
  };

  return (
    <div className="form-container">
      <Link to="/student/dashboard" className="btn-back-panel" style={{ display: 'inline-block', marginBottom: 20 }}>
        « ย้อนกลับ
      </Link>

      <h2>ประวัติแพ้ยา</h2>
      {error && <p className="alert-error">{error}</p>}
      {success && <p className="alert-success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>ชื่อยา/สารที่แพ้</label>
        <input value={form.allergy_name} onChange={(e) => setForm({ ...form, allergy_name: e.target.value })} required />

        <label>อาการที่เกิดขึ้น</label>
        <input value={form.reaction} onChange={(e) => setForm({ ...form, reaction: e.target.value })} placeholder="เช่น ผื่นคัน, หายใจลำบาก" />

        <label>ความรุนแรง</label>
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
          <option value="mild">เล็กน้อย</option>
          <option value="moderate">ปานกลาง</option>
          <option value="severe">รุนแรง</option>
        </select>

        <button type="submit">เพิ่มรายการ</button>
      </form>

      <h3>รายการที่บันทึกไว้</h3>
      {list.length === 0 ? <p>ยังไม่มีข้อมูลการแพ้ยา</p> : list.map((a) => (
        <div className="info-box" key={a.allergy_id}>
          <strong>{a.allergy_name}</strong> (ความรุนแรง: {SEVERITY_LABEL[a.severity] || a.severity})<br />
          อาการ: {a.reaction}<br />
          <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(a.allergy_id); }}>ลบ</a>
        </div>
      ))}
    </div>
  );
}