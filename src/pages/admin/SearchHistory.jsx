// src/pages/admin/SearchHistory.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, API_BASE, avatarUrl, getToken } from '../../api/client';
import LoadingScreen from '../../components/LoadingScreen';

const SEVERITY_LABEL = { mild: 'เล็กน้อย', moderate: 'ปานกลาง', severe: 'รุนแรง' };
const STATUS_LABEL = { pending: 'รอถึงกำหนด', completed: 'เสร็จสิ้นแล้ว', cancelled: 'ยกเลิกแล้ว' };

export default function SearchHistory() {
  const [searchParams] = useSearchParams();
  const viewId = searchParams.get('view');

  const [detail, setDetail] = useState(null);
  const [allergyForm, setAllergyForm] = useState({ allergy_name: '', reaction: '', severity: 'mild' });
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [msg, setMsg] = useState('');

  const loadDetail = (id) => api.get(`/admin/search_history.php?view=${id}`).then(setDetail);

  useEffect(() => {
    if (viewId) loadDetail(viewId);
  }, [viewId]);

  const handleAllergySubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editingAllergy) {
        await api.post('/admin/search_history.php', { action: 'edit_allergy', allergy_id: editingAllergy, ...allergyForm });
        setMsg('แก้ไขประวัติแพ้ยาเรียบร้อยแล้ว');
      } else {
        await api.post('/admin/search_history.php', { action: 'add_allergy', student_id_target: viewId, ...allergyForm });
        setMsg('เพิ่มรายการแพ้ยาเรียบร้อยแล้ว');
      }
      setAllergyForm({ allergy_name: '', reaction: '', severity: 'mild' });
      setEditingAllergy(null);
      loadDetail(viewId);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const startEditAllergy = (a) => {
    setEditingAllergy(a.allergy_id);
    setAllergyForm({ allergy_name: a.allergy_name, reaction: a.reaction, severity: a.severity });
  };

  const deleteAllergy = async (id) => {
    if (!window.confirm('ยืนยันลบรายการแพ้ยานี้?')) return;
    await api.del(`/admin/search_history.php?allergy_id=${id}`);
    loadDetail(viewId);
  };

  if (!detail) return <LoadingScreen />;

  const { student, allergies, visits, appointments } = detail;

  return (
    <div className="form-container" style={{ maxWidth: 750 }}>
      <Link to="/admin/manage-students" className="btn-back-panel" style={{ display: 'inline-block', marginBottom: 20 }}>
        « กลับไปดูรายชื่อทั้งหมด
      </Link>

      <h2>ประวัตินักเรียน / นักศึกษา</h2>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div style={{
          width: 150, height: 150, borderRadius: '50%', overflow: 'hidden',
          background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid #fff', boxShadow: '0 10px 24px rgba(30,78,140,0.18)', fontSize: 58, color: 'var(--blue)',
        }}>
          {student.avatar ? (
            <img src={avatarUrl(student.avatar)} alt="รูปโปรไฟล์" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '👤'}
        </div>
        <p style={{ margin: '10px 0 0', fontWeight: 700, color: 'var(--ink)', fontSize: 17 }}>
          {student.first_name} {student.last_name}
        </p>
      </div>

      {msg && <p className="alert-success">{msg}</p>}

      <h3>ข้อมูลนักเรียน</h3>
      <div className="info-box">
        <strong>{student.student_code} - {student.first_name} {student.last_name}</strong><br />
        ระดับชั้น/สาขา: {student.education_level || '-'} {student.department || ''}<br />
        กรุ๊ปเลือด: {student.blood_type || '-'} | โรคประจำตัว: {student.chronic_disease || 'ไม่มี'}<br />
        เบอร์โทร: {student.phone || '-'} | อีเมล: {student.email || '-'}
      </div>

      <h3>ประวัติแพ้ยา ({allergies.length} รายการ)</h3>

      {editingAllergy ? (
        <div className="info-box">
          <strong>แก้ไขรายการแพ้ยา</strong>
          <form onSubmit={handleAllergySubmit} style={{ marginTop: 10 }}>
            <label>ชื่อยา/สารที่แพ้</label>
            <input value={allergyForm.allergy_name} onChange={(e) => setAllergyForm({ ...allergyForm, allergy_name: e.target.value })} required />
            <label>อาการที่เกิดขึ้น</label>
            <input value={allergyForm.reaction} onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })} />
            <label>ความรุนแรง</label>
            <select value={allergyForm.severity} onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}>
              <option value="mild">เล็กน้อย</option>
              <option value="moderate">ปานกลาง</option>
              <option value="severe">รุนแรง</option>
            </select>
            <button type="submit">บันทึกการแก้ไข</button>
          </form>
          <p><a href="#" onClick={(e) => { e.preventDefault(); setEditingAllergy(null); }}>« ยกเลิก</a></p>
        </div>
      ) : (
        <div className="info-box">
          <strong>เพิ่มรายการแพ้ยาใหม่</strong>
          <form onSubmit={handleAllergySubmit} style={{ marginTop: 10 }}>
            <label>ชื่อยา/สารที่แพ้</label>
            <input value={allergyForm.allergy_name} onChange={(e) => setAllergyForm({ ...allergyForm, allergy_name: e.target.value })} placeholder="เช่น เพนิซิลลิน" required />
            <label>อาการที่เกิดขึ้น</label>
            <input value={allergyForm.reaction} onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })} placeholder="เช่น ผื่นคัน" />
            <label>ความรุนแรง</label>
            <select value={allergyForm.severity} onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}>
              <option value="mild">เล็กน้อย</option>
              <option value="moderate">ปานกลาง</option>
              <option value="severe">รุนแรง</option>
            </select>
            <button type="submit">เพิ่มรายการ</button>
          </form>
        </div>
      )}

      {allergies.length === 0 ? <p>ไม่มีข้อมูลการแพ้ยา</p> : allergies.map((a) => (
        <div className="alert-box" key={a.allergy_id}>
          <strong>{a.allergy_name}</strong> ({SEVERITY_LABEL[a.severity]})<br />
          อาการ: {a.reaction}<br />
          <a href="#" onClick={(e) => { e.preventDefault(); startEditAllergy(a); }}>แก้ไข</a>{' | '}
          <a href="#" onClick={(e) => { e.preventDefault(); deleteAllergy(a.allergy_id); }}>ลบ</a>
        </div>
      ))}

      <h3>ประวัติการเข้ารับบริการ ({visits.length} ครั้ง)</h3>
      {visits.length === 0 ? <p>ยังไม่มีประวัติการรักษา</p> : visits.map((v) => (
        <div className="info-box" key={v.visit_id}>
          📅 {new Date(v.visit_datetime).toLocaleString('th-TH')} น.<br />
          อาการ: {v.symptoms}<br />
          วินิจฉัย: {v.diagnosis} | ยา: {v.medicine_given}
        </div>
      ))}

      <h3>นัดหมาย ({appointments.length} รายการ)</h3>
      {appointments.length === 0 ? <p>ไม่มีนัดหมาย</p> : appointments.map((ap) => (
        <div className="info-box" key={ap.appointment_id}>
          📅 {new Date(ap.appointment_datetime).toLocaleString('th-TH')} น. - {ap.reason} ({STATUS_LABEL[ap.status]})
        </div>
      ))}

      <p style={{ marginTop: 15 }}>
        {/* ลิงก์นี้เปิดผ่านการนำทางตรงๆ ของเบราว์เซอร์ แนบ Authorization header ไม่ได้
            เลยต้องส่ง token ผ่าน query string แทน (backend รองรับ fallback นี้ไว้แล้ว) */}
        <a href={`${API_BASE}/admin/export_pdf.php?student_id=${viewId}&token=${encodeURIComponent(getToken() || '')}`}
           target="_blank" rel="noreferrer"
           style={{ background: '#2B6CB0', color: '#fff', padding: '8px 16px', borderRadius: 6, textDecoration: 'none' }}>
          📄 ส่งออกเป็น PDF
        </a>
      </p>
      <Link to="/admin/dashboard" style={{ display: 'block', marginTop: 20 }}>« กลับหน้าหลัก</Link>
    </div>
  );
}