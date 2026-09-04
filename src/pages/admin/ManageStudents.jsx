// src/pages/admin/ManageStudents.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, avatarUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ImageCropper from '../../components/ImageCropper';
import StatusModal from '../../components/StatusModal';

const DEPT_LIST = [
  'สาขาวิชาการบัญชี', 'สาขาวิชาการตลาด', 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล',
  'สาขาวิชาดิจิทัลกราฟิก', 'สาขาวิชาภาษาต่างประเทศธุรกิจบริการ', 'สาขาวิชาเทคโนโลยีสารสนเทศ',
  'สาขาวิชาโลจิสติกส์', 'สาขาวิชาการท่องเที่ยว', 'สาขาวิชาภาษาและการจัดการธุรกิจระหว่างประเทศ',
  'สาขาวิชาการจัดการโลจิสติกส์และซัพพลายเชน', 'สาขาวิชาการจัดการธุรกิจค้าปลีก',
];

const emptyForm = {
  role: 'student', username: '', password: '', first_name: '', last_name: '',
  email: '', student_code: '', education_level: '', department: '',
  phone: '', blood_type: '', chronic_disease: '', position: '', avatar: '', nickname: '',
};

export default function ManageStudents() {
  const [list, setList] = useState([]);
  const [filters, setFilters] = useState({ student_code: '', filter_level: '', filter_dept: '' });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [cropperFile, setCropperFile] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // แสดง Popup สำเร็จ (StatusModal จะจัดการ fade out + ปิดเองอัตโนมัติให้)
  const showSuccessPopup = (message) => {
    setModalStatus('success');
    setModalMessage(message);
  };

  const load = (f = filters) => {
    const qs = new URLSearchParams(f).toString();
    api.get(`/admin/manage_students.php?${qs}`).then(setList);
  };
  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { e.preventDefault(); load(); };
  const clearSearch = () => { const f = { student_code: '', filter_level: '', filter_dept: '' }; setFilters(f); load(f); };

  const handleStudentCodeSearch = (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    setFilters({ ...filters, student_code: numericOnly });
  };

  const handlePasswordChange = (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    setForm({ ...form, password: numericOnly });
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
      const res = await api.uploadFile('/admin/upload_avatar.php', croppedFile);
      setForm((f) => ({ ...f, avatar: res.url }));
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const startEdit = (s) => {
    setShowAddForm(false);
    setEditing(s.user_id);
    setForm({
      role: s.role, username: s.username, password: '',
      first_name: s.role === 'student' ? s.student_first_name : s.first_name,
      last_name: s.role === 'student' ? s.student_last_name : s.last_name,
      email: s.email || '', student_code: s.student_code || '',
      education_level: s.education_level || '', department: s.department || '',
      phone: s.phone || '', blood_type: s.blood_type || '', chronic_disease: s.chronic_disease || '',
      position: s.position || '', avatar: s.avatar || '', nickname: s.nickname || '',
    });
  };
  const cancelEdit = () => { setEditing(null); setForm(emptyForm); };
  const cancelAdd = () => { setShowAddForm(false); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const action = editing ? 'edit' : 'add';
      const payload = editing ? { ...form, action, user_id: editing } : { ...form, action };
      const res = await api.post('/admin/manage_students.php', payload);
      showSuccessPopup(res.message);
      cancelEdit();
      cancelAdd();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันลบสมาชิกคนนี้?')) return;
    try {
      const res = await api.del(`/admin/manage_students.php?id=${id}`);
      showSuccessPopup(res.message);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRowClick = (s) => {
    if (s.role === 'student') {
      navigate(`/admin/search-history?view=${s.user_id}`);
    }
  };

  const renderForm = () => (
    <div className="slide-panel">
      <h3 style={{ marginTop: 0 }}>{editing ? `แก้ไขข้อมูล: ${form.username}` : 'เพิ่มสมาชิกใหม่'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--line)', fontSize: 34, color: 'var(--blue)',
          }}>
            {form.avatar ? (
              <img src={avatarUrl(form.avatar)} alt="รูปโปรไฟล์" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '👤'}
          </div>
          <div>
            <label style={{ marginTop: 0 }}>รูปโปรไฟล์</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              {form.avatar && !avatarUploading && (
                <a href="#" className="btn-delete-row" onClick={(e) => { e.preventDefault(); setForm({ ...form, avatar: '' }); }}>ลบรูป</a>
              )}
            </div>
            {avatarUploading && <p style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 0' }}>กำลังอัปโหลด...</p>}
            {avatarError && <p style={{ fontSize: 13, color: 'var(--error)', margin: '8px 0 0' }}>{avatarError}</p>}
          </div>
        </div>

        <div className="field-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 20 }}>
          <div>
            <label>เลือกขอบเขตของบัญชี</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">User (นักเรียน/นักศึกษา)</option>
              <option value="nurse">Admin</option>
            </select>
          </div>
          {form.role === 'nurse' && (
            <div>
              <label>ตำแหน่ง</label>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="เช่น พยาบาลวิชาชีพ" />
            </div>
          )}
          <div>
            <label>ชื่อผู้ใช้ (Username)</label>
            <input maxLength={7} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div>
            <label>{editing ? 'รหัสผ่านใหม่ (เว้นว่าง = ไม่เปลี่ยน)' : 'รหัสผ่าน'}</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={5} value={form.password} onChange={handlePasswordChange} required={!editing} />
          </div>
        </div>

        <div className="field-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
          <div>
            <label>ชื่อ</label>
            <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div>
            <label>นามสกุล</label>
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
          </div>
          {form.role === 'student' && (
            <div>
              <label>ชื่อเล่น</label>
              <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="เช่น สเตฟาน" />
            </div>
          )}
        </div>

        {form.role === 'student' && (
          <>
            <div className="field-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 8, marginBottom: 20 }}>
              <div>
                <label>อีเมล</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label>รหัสนักเรียน/นักศึกษา</label>
                <input maxLength={5} value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value })} />
              </div>
              {editing && (
                <>
                  <div>
                    <label>เบอร์โทร</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label>กรุ๊ปเลือด</label>
                    <input maxLength={4} value={form.blood_type} onChange={(e) => setForm({ ...form, blood_type: e.target.value })} />
                  </div>
                  <div>
                    <label>โรคประจำตัว</label>
                    <input value={form.chronic_disease} onChange={(e) => setForm({ ...form, chronic_disease: e.target.value })} />
                  </div>
                </>
              )}
            </div>

            <div className="field-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div>
                <label>ระดับชั้น</label>
                <select value={form.education_level} onChange={(e) => setForm({ ...form, education_level: e.target.value })}>
                  <option value="">-- เลือกระดับชั้น --</option>
                  <option value="ปวช.">ปวช.</option>
                  <option value="ปวส.">ปวส.</option>
                  <option value="ปวส.พิเศษ">ปวส.พิเศษ</option>
                </select>
              </div>
              <div>
                <label>สาขาวิชา</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">-- เลือกสาขาวิชา --</option>
                  {DEPT_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, alignItems: 'center' }}>
          <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); editing ? cancelEdit() : cancelAdd(); }}>« ย้อนกลับ</a>
          <button type="submit" style={{ width: 'auto', margin: 0, padding: '13px 32px' }}>{editing ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก'}</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="admin-panel">
      <ImageCropper file={cropperFile} onCancel={() => setCropperFile(null)} onConfirm={handleCropConfirm} />
      <StatusModal
        status={modalStatus}
        message={modalMessage}
        onClose={() => setModalStatus(null)}
        hideConfirmButton
        autoCloseMs={1800}
      />

      <h2>จัดการสมาชิก</h2>
      {error && <p className="alert-error">{error}</p>}

      {(editing || showAddForm) ? (
        renderForm()
      ) : (
        <>
          <h3 style={{ marginTop: 0 }}>ค้นหาสมาชิก</h3>
          <form onSubmit={handleSearch}>
            <div className="field-row">
              <div>
                <label>รหัสนักศึกษา</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  value={filters.student_code}
                  onChange={handleStudentCodeSearch}
                  placeholder="กรอกรหัสนักศึกษา"
                />
              </div>
              <div>
                <label>ระดับชั้น</label>
                <select value={filters.filter_level} onChange={(e) => setFilters({ ...filters, filter_level: e.target.value })}>
                  <option value="">-- ทั้งหมด --</option>
                  <option value="ปวช.">ปวช.</option>
                  <option value="ปวส.">ปวส.</option>
                  <option value="ปวส.พิเศษ">ปวส.พิเศษ</option>
                </select>
              </div>
              <div>
                <label>สาขาวิชา</label>
                <select value={filters.filter_dept} onChange={(e) => setFilters({ ...filters, filter_dept: e.target.value })}>
                  <option value="">-- ทั้งหมด --</option>
                  {DEPT_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit">ค้นหา</button>
                <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); clearSearch(); }}>ล้างการค้นหา</a>
              </div>
            </div>
          </form>

          <h3>รายชื่อสมาชิกทั้งหมด ({list.length} คน) — คลิกที่แถวเพื่อดูประวัติ (เฉพาะ User)</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th></th>
                <th>Username</th>
                <th>ตำแหน่ง</th>
                <th>ชื่อ-สกุล (ชื่อเล่น)</th>
                <th>ระดับชั้น/สาขา</th>
                <th>
                  <div className="th-with-add">
                    <span>จัดการ</span>
                    <button
                      type="button"
                      className="btn-add-circle"
                      title="เพิ่มสมาชิกใหม่"
                      onClick={(e) => { e.stopPropagation(); setShowAddForm(true); setForm(emptyForm); }}
                    >+</button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const name = s.role === 'student'
                  ? `${s.student_first_name || ''} ${s.student_last_name || ''}`.trim()
                  : `${s.first_name || ''} ${s.last_name || ''}`.trim();
                const clickable = s.role === 'student';
                const roleDisplay = s.role === 'student' ? 'User' : (s.position || 'Admin');
                return (
                  <tr
                    key={s.user_id}
                    onClick={() => handleRowClick(s)}
                    className={clickable ? 'row-clickable' : ''}
                  >
                    <td>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
                        background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: 'var(--blue)',
                      }}>
                        {s.avatar ? (
                          <img src={avatarUrl(s.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : '👤'}
                      </div>
                    </td>
                    <td>{s.username}</td>
                    <td>{roleDisplay}</td>
                    <td>{name || '-'}{s.role === 'student' && s.nickname ? ` (${s.nickname})` : ''}</td>
                    <td>{[s.education_level, s.department].filter(Boolean).join(' ') || '-'}</td>
                    <td>
                      <a href="#" className="btn-edit-row" onClick={(e) => { e.stopPropagation(); e.preventDefault(); startEdit(s); }}>แก้ไข</a>{' '}
                      {s.user_id === user?.user_id ? (
                        <span style={{ color: '#aaa', fontSize: 13 }}>(บัญชีของคุณ)</span>
                      ) : (
                        <a href="#" className="btn-delete-row" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete(s.user_id); }}>ลบ</a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <Link to="/admin/dashboard" style={{ display: 'block', marginTop: 24 }}>« กลับหน้าหลัก</Link>
    </div>
  );
}