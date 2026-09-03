// src/pages/admin/SendNotification.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatusModal from '../../components/StatusModal';

const DEPT_LIST = [
  'สาขาวิชาการบัญชี', 'สาขาวิชาการตลาด', 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล',
  'สาขาวิชาดิจิทัลกราฟิก', 'สาขาวิชาภาษาต่างประเทศธุรกิจบริการ', 'สาขาวิชาเทคโนโลยีสารสนเทศ',
  'สาขาวิชาโลจิสติกส์', 'สาขาวิชาการท่องเที่ยว', 'สาขาวิชาภาษาและการจัดการธุรกิจระหว่างประเทศ',
  'สาขาวิชาการจัดการโลจิสติกส์และซัพพลายเชน', 'สาขาวิชาการจัดการธุรกิจค้าปลีก',
];
const emptyPickerFilters = { student_code: '', filter_level: '', filter_dept: '' };

export default function SendNotification() {
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [pickerFilters, setPickerFilters] = useState(emptyPickerFilters);
  const [pickerSearched, setPickerSearched] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  const loadStudentsForPicker = (f = {}) => {
    const qs = new URLSearchParams({ mode: 'students', ...f }).toString();
    api.get(`/admin/send_notification.php?${qs}`).then(setStudents);
  };
  const loadNotifications = () => api.get('/admin/send_notification.php').then(setNotifications);
  useEffect(() => { loadStudentsForPicker(); loadNotifications(); }, []);

  const handlePickerCode = (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    setPickerFilters({ ...pickerFilters, student_code: numericOnly });
  };
  const handlePickerSearch = (e) => {
    e.preventDefault();
    const isFiltered = !!(pickerFilters.student_code || pickerFilters.filter_level || pickerFilters.filter_dept);
    setPickerSearched(isFiltered);
    loadStudentsForPicker(pickerFilters);
  };
  const clearPickerSearch = () => {
    setPickerFilters(emptyPickerFilters);
    setPickerSearched(false);
    loadStudentsForPicker();
  };

  const selected = students.find((s) => String(s.user_id) === String(studentId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (broadcastMode) {
      if (!window.confirm('ยืนยันส่งประกาศนี้ถึงนักเรียนทุกคนที่มีอีเมลในระบบ?\n\nการกระทำนี้จะส่งอีเมลจริงไปหาทุกคนทันที')) return;
    } else {
      if (selected && !window.confirm(`ยืนยันส่งแจ้งเตือนถึง:\n${selected.student_code} ${selected.first_name} ${selected.last_name}\nอีเมล: ${selected.email || 'ไม่มีอีเมลในระบบ'}\n\nต้องการส่งหรือไม่?`)) return;
    }

    setModalStatus('loading');
    setModalMessage('');
    try {
      const payload = broadcastMode ? { broadcast: true, message } : { student_id: studentId, message };
      const res = await api.post('/admin/send_notification.php', payload);
      setModalStatus('success');
      setModalMessage(res.message || 'ส่งแจ้งเตือนเรียบร้อยแล้ว');
      setStudentId(''); setMessage(''); setBroadcastMode(false);
      clearPickerSearch();
      setShowForm(false);
      loadNotifications();
    } catch (err) {
      setModalStatus('error');
      setModalMessage('เกิดข้อผิดพลาด เนื่องจากข้อมูลไม่ถูกต้องหรือผิดพลาด กรุณาลองใหม่');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setStudentId(''); setMessage(''); setBroadcastMode(false);
    clearPickerSearch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันลบแจ้งเตือนนี้?')) return;
    await api.del(`/admin/send_notification.php?id=${id}`);
    loadNotifications();
  };

  return (
    <div className="admin-panel">
      <StatusModal status={modalStatus} message={modalMessage} onClose={() => setModalStatus(null)} />

      {!showForm && (
        <Link to="/admin/dashboard" style={{ display: 'block', marginBottom: 24 }}>« ย้อนกลับ</Link>
      )}
      <h2>ส่งแจ้งเตือนถึงนักเรียน</h2>

      {showForm ? (
        <div className="slide-panel">
          <h3 style={{ marginTop: 0 }}>ส่งแจ้งเตือนใหม่</h3>
          <form onSubmit={handleSubmit}>
            <div className="info-box" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                 onClick={() => { setBroadcastMode(!broadcastMode); setStudentId(''); }}>
              <input type="checkbox" checked={broadcastMode} onChange={() => {}} style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <span><strong>📢 ส่งเป็นประกาศ</strong> — ส่งข้อความนี้ถึงนักเรียนทุกคนที่มีอีเมลในระบบ (เหมือนส่งข่าวสาร)</span>
            </div>

            {!broadcastMode && (
              <>
                <label>ค้นหานักเรียน</label>
                <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr auto auto', alignItems: 'center', marginBottom: 8 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                    value={pickerFilters.student_code}
                    onChange={handlePickerCode}
                    placeholder="รหัสนักศึกษา"
                  />
                  <select value={pickerFilters.filter_level} onChange={(e) => setPickerFilters({ ...pickerFilters, filter_level: e.target.value })}>
                    <option value="">-- ระดับชั้น --</option>
                    <option value="ปวช.">ปวช.</option>
                    <option value="ปวส.">ปวส.</option>
                    <option value="ปวส.พิเศษ">ปวส.พิเศษ</option>
                  </select>
                  <select value={pickerFilters.filter_dept} onChange={(e) => setPickerFilters({ ...pickerFilters, filter_dept: e.target.value })}>
                    <option value="">-- สาขาวิชา --</option>
                    {DEPT_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button type="button" className="btn-inline-search" onClick={handlePickerSearch} style={{ margin: 0 }}>ค้นหา</button>
                  {pickerSearched && (
                    <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); clearPickerSearch(); }} style={{ whiteSpace: 'nowrap' }}>ล้าง</a>
                  )}
                </div>
                {pickerSearched && (
                  <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 16px' }}>✅ ค้นหาแล้ว — พบ {students.length} คน</p>
                )}

                <label style={{ marginTop: pickerSearched ? 0 : 16 }}>เลือกนักเรียน</label>
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
                  <option value="">-- เลือกนักเรียน --</option>
                  {students.map((s) => (
                    <option key={s.user_id} value={s.user_id}>{s.student_code} - {s.first_name} {s.last_name}</option>
                  ))}
                </select>

                {selected && (
                  <div className="info-box" style={{ marginTop: 16 }}>📧 อีเมลที่จะส่งถึง: <strong>{selected.email || 'ไม่มีอีเมลในระบบ'}</strong></div>
                )}
              </>
            )}

            {broadcastMode && (
              <div className="alert-box">📢 ข้อความนี้จะถูกส่งเป็นอีเมลและแจ้งเตือนในเว็บ ให้กับนักเรียน<strong>ทุกคนที่มีอีเมลลงทะเบียนไว้</strong> กรุณาตรวจสอบข้อความให้ถูกต้องก่อนส่ง</div>
            )}

            <div className="reason-field-wide">
              <label>ข้อความแจ้งเตือน</label>
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="เช่น กรุณามาพบห้องพยาบาลเพื่อรับยาต่อเนื่อง" required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); cancelForm(); }}>« ย้อนกลับ</a>
              <button type="submit" style={{ width: 'auto', margin: 0, padding: '13px 32px' }}>
                {broadcastMode ? '📢 ส่งประกาศให้ทุกคน' : 'ส่งแจ้งเตือน'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <h3 style={{ marginTop: 0 }}>
            <div className="th-with-add">
              <span>แจ้งเตือนที่ส่งล่าสุด ({notifications.length} รายการ)</span>
              <button
                type="button"
                className="btn-add-circle"
                title="ส่งแจ้งเตือนใหม่"
                onClick={() => setShowForm(true)}
              >+</button>
            </div>
          </h3>

          {notifications.length === 0 ? <p>ยังไม่มีแจ้งเตือนที่ส่ง</p> : notifications.map((n) => (
            <div className="info-box" key={n.notification_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                🔔 {n.message}<br />
                ถึง: <strong>{n.student_code} {n.first_name} {n.last_name}</strong> | <small>{new Date(n.created_at).toLocaleString('th-TH')} น.</small> | {n.is_read ? '✅ อ่านแล้ว' : '⬜ ยังไม่อ่าน'}
              </div>
              <a href="#" className="btn-delete-row" onClick={(e) => { e.preventDefault(); handleDelete(n.notification_id); }}>ลบ</a>
            </div>
          ))}
        </>
      )}

      {!showForm && (
        <Link to="/admin/dashboard" style={{ display: 'block', marginTop: 24 }}>« กลับหน้าหลัก</Link>
      )}
    </div>
  );
}