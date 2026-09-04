// src/pages/student/Profile.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, avatarUrl } from '../../api/client';
import LoadingScreen from '../../components/LoadingScreen';
import ImageCropper from '../../components/ImageCropper';
import StatusModal from '../../components/StatusModal';

const DEPT_LIST = [
  'สาขาวิชาการบัญชี', 'สาขาวิชาการตลาด', 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล',
  'สาขาวิชาดิจิทัลกราฟิก', 'สาขาวิชาภาษาต่างประเทศธุรกิจบริการ', 'สาขาวิชาเทคโนโลยีสารสนเทศ',
  'สาขาวิชาโลจิสติกส์', 'สาขาวิชาการท่องเที่ยว', 'สาขาวิชาภาษาและการจัดการธุรกิจระหว่างประเทศ',
  'สาขาวิชาการจัดการโลจิสติกส์และซัพพลายเชน', 'สาขาวิชาการจัดการธุรกิจค้าปลีก',
];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [cropperFile, setCropperFile] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const load = () => api.get('/student/profile.php').then((data) => { setProfile(data); setForm({ ...data, password: '' }); });
  useEffect(() => { load(); }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePhoneChange = (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setForm({ ...form, phone: numericOnly });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setCropperFile(file);
    e.target.value = '';
  };

  const handleCropConfirm = async (croppedFile) => {
    setCropperFile(null);
    setAvatarUploading(true);
    setAvatarError('');
    try {
      const res = await api.uploadFile('/student/upload_avatar.php', croppedFile);
      setForm((f) => ({ ...f, avatar: res.url }));
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/student/profile.php', form);
      setModalStatus('success');
      setModalMessage(res.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!form) return <LoadingScreen />;

  return (
    <div className="form-container">
      <ImageCropper file={cropperFile} onCancel={() => setCropperFile(null)} onConfirm={handleCropConfirm} />
      <StatusModal
        status={modalStatus}
        message={modalMessage}
        onClose={() => setModalStatus(null)}
        hideConfirmButton
        autoCloseMs={1800}
        onAutoClose={() => navigate('/student/dashboard')}
      />

      <h2>ข้อมูลส่วนตัว</h2>
      {error && <p className="alert-error">{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%', overflow: 'hidden',
          background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid #fff', boxShadow: '0 10px 24px rgba(30,78,140,0.18)', fontSize: 44, color: 'var(--blue)',
        }}>
          {form.avatar ? (
            <img src={avatarUrl(form.avatar)} alt="รูปโปรไฟล์" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '👤'}
        </div>
        <div className={`file-upload-wrap ${avatarUploading ? 'uploading' : ''}`}>
          <span className="file-upload-btn">
            📷 {form.avatar ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={avatarUploading}
            className="file-upload-input"
          />
        </div>
        {avatarUploading && <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>กำลังอัปโหลด...</p>}
        {avatarError && <p style={{ fontSize: 13, color: 'var(--error)', margin: 0 }}>{avatarError}</p>}
      </div>

      <label>รหัสนักเรียน/นักศึกษา</label>
      <input value={profile.student_code || ''} disabled />

      <form onSubmit={handleSubmit}>
        <label>ชื่อ</label>
        <input value={form.first_name || ''} onChange={update('first_name')} required />

        <label>นามสกุล</label>
        <input value={form.last_name || ''} onChange={update('last_name')} required />

        <label>ชื่อเล่น</label>
        <input value={form.nickname || ''} onChange={update('nickname')} placeholder="เช่น สเตฟาน" />

        <label>อีเมล</label>
        <input type="email" value={form.email || ''} onChange={update('email')} required />

        <label>เบอร์โทร</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={form.phone || ''}
          onChange={handlePhoneChange}
          required
        />

        <label>กรุ๊ปเลือด</label>
        <input maxLength={4} value={form.blood_type || ''} onChange={update('blood_type')} placeholder="เช่น A, B, AB, O" />

        <label>โรคประจำตัว</label>
        <input value={form.chronic_disease || ''} onChange={update('chronic_disease')} placeholder="ถ้าไม่มีให้เว้นว่างไว้" />

        <label>ระดับชั้น</label>
        <select value={form.education_level || ''} onChange={update('education_level')} required>
          <option value="">-- เลือกระดับชั้น --</option>
          <option value="ปวช.">ปวช.</option>
          <option value="ปวส.">ปวส.</option>
          <option value="ปวส.พิเศษ">ปวส.พิเศษ</option>
        </select>

        <label>สาขาวิชา</label>
        <select value={form.department || ''} onChange={update('department')} required>
          <option value="">-- เลือกสาขาวิชา --</option>
          {DEPT_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <label>รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={5} value={form.password} onChange={update('password')} placeholder="กรอกเฉพาะถ้าต้องการเปลี่ยนรหัสผ่าน" />

        <button type="submit">บันทึกข้อมูล</button>
      </form>

      <Link to="/student/dashboard" style={{ display: 'block', marginTop: 20 }}>« กลับหน้าหลัก</Link>
      <p style={{ textAlign: 'center' }}>
        <Link to="/student/delete-account" style={{ color: '#c53030', fontSize: 13 }}>ลบบัญชีผู้ใช้ถาวร</Link>
      </p>
    </div>
  );
}