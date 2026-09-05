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
const emptyForm = { student_id: '', message: '' };

export default function SendNotification() {
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [pickerFilters, setPickerFilters] = useState(emptyPickerFilters);
  const [pickerSearched, setPickerSearched] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  // ===== รายการแจ้งเตือนที่ "รอส่ง" (ตะกร้า) — เพิ่มได้หลายคน แล้วค่อยกดส่งทีเดียว (โหมดส่งเป็นประกาศไม่ใช้ตะกร้านี้) =====
  const [draftList, setDraftList] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null); // null = กำลังเพิ่มใหม่, ไม่ null = กำลังแก้ไขรายการในตะกร้า

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

  const selected = students.find((s) => String(s.user_id) === String(form.student_id));

  const toggleBroadcastMode = () => {
    setBroadcastMode(!broadcastMode);
    setForm(emptyForm);
    setDraftList([]);
    setEditingDraftId(null);
    setError('');
    clearPickerSearch();
  };

  // ===== เพิ่ม/แก้ไข รายการในตะกร้า (ยังไม่ส่งไป backend) =====
  const handleDraftFormSubmit = (e) => {
    e.preventDefault();
    if (!form.student_id || !form.message.trim()) {
      setError('กรุณาเลือกนักเรียนและกรอกข้อความแจ้งเตือนให้ครบก่อนเพิ่มลงรายการ');
      return;
    }
    setError('');
    const selectedStudent = students.find((s) => String(s.user_id) === String(form.student_id));
    const label = selectedStudent ? `${selectedStudent.student_code} - ${selectedStudent.first_name} ${selectedStudent.last_name}` : `รหัส ${form.student_id}`;

    if (editingDraftId) {
      // แก้ไขรายการเดิมในตะกร้า
      setDraftList(draftList.map((d) => d._draftId === editingDraftId ? { ...form, _draftId: editingDraftId, _label: label } : d));
      setEditingDraftId(null);
    } else {
      // เพิ่มรายการใหม่
      setDraftList([...draftList, { ...form, _draftId: Date.now(), _label: label }]);
    }

    // เคลียร์ฟอร์มทั้งหมดให้กรอกคนถัดไปใหม่เสมอ (ไม่คงค่าเดิมไว้แล้ว)
    setForm(emptyForm);
    clearPickerSearch();
  };

  const editDraft = (item) => {
    setEditingDraftId(item._draftId);
    setForm({ student_id: item.student_id, message: item.message });
    setError('');
  };
  const cancelEditDraft = () => {
    setEditingDraftId(null);
    setForm(emptyForm);
  };

  const removeDraft = (draftId) => {
    setDraftList(draftList.filter((d) => d._draftId !== draftId));
    if (editingDraftId === draftId) cancelEditDraft();
  };

  // ===== กดส่งแจ้งเตือนทั้งหมดในตะกร้าทีเดียว =====
  const handleSubmitAllDrafts = async () => {
    if (draftList.length === 0) return;
    setModalStatus('loading');
    setModalMessage('');

    let successCount = 0;
    let failCount = 0;

    for (const item of draftList) {
      try {
        await api.post('/admin/send_notification.php', { student_id: item.student_id, message: item.message });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    if (failCount === 0) {
      setModalStatus('success');
      setModalMessage(`ส่งแจ้งเตือนสำเร็จทั้งหมด ${successCount} รายการ`);
    } else {
      setModalStatus('error');
      setModalMessage(`ส่งสำเร็จ ${successCount} รายการ แต่ล้มเหลว ${failCount} รายการ กรุณาตรวจสอบและลองใหม่เฉพาะรายการที่ล้มเหลว`);
    }

    setDraftList([]);
    setForm(emptyForm);
    setEditingDraftId(null);
    clearPickerSearch();
    setShowForm(false);
    loadNotifications();
  };

  // ===== โหมดส่งเป็นประกาศให้ทุกคน (ส่งทันทีทีละครั้ง ไม่ใช้ตะกร้า) =====
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('ยืนยันส่งประกาศนี้ถึงนักเรียนทุกคนที่มีอีเมลในระบบ?\n\nการกระทำนี้จะส่งอีเมลจริงไปหาทุกคนทันที')) return;

    setModalStatus('loading');
    setModalMessage('');
    try {
      const res = await api.post('/admin/send_notification.php', { broadcast: true, message: broadcastMessage });
      setModalStatus('success');
      setModalMessage(res.message || 'ส่งประกาศเรียบร้อยแล้ว');
      cancelForm();
      loadNotifications();
    } catch (err) {
      setModalStatus('error');
      setModalMessage('เกิดข้อผิดพลาด เนื่องจากข้อมูลไม่ถูกต้องหรือผิดพลาด กรุณาลองใหม่');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setBroadcastMessage('');
    setBroadcastMode(false);
    setDraftList([]);
    setEditingDraftId(null);
    setError('');
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
          <h3 style={{ marginTop: 0 }}>
            ส่งแจ้งเตือนใหม่ {!broadcastMode && draftList.length > 0 && `— รอส่ง ${draftList.length} รายการ`}
          </h3>

          <div className="info-box" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
               onClick={toggleBroadcastMode}>
            <input type="checkbox" checked={broadcastMode} onChange={() => {}} style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <span><strong>📢 ส่งเป็นประกาศ</strong> — ส่งข้อความนี้ถึงนักเรียนทุกคนที่มีอีเมลในระบบ (เหมือนส่งข่าวสาร)</span>
          </div>

          {broadcastMode ? (
            <form onSubmit={handleBroadcastSubmit}>
              <div className="alert-box">📢 ข้อความนี้จะถูกส่งเป็นอีเมลและแจ้งเตือนในเว็บ ให้กับนักเรียน<strong>ทุกคนที่มีอีเมลลงทะเบียนไว้</strong> กรุณาตรวจสอบข้อความให้ถูกต้องก่อนส่ง</div>

              <div className="reason-field-wide">
                <label>ข้อความแจ้งเตือน</label>
                <input value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="เช่น กรุณามาพบห้องพยาบาลเพื่อรับยาต่อเนื่อง" required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); cancelForm(); }}>« ย้อนกลับ</a>
                <button type="submit" style={{ width: 'auto', margin: 0, padding: '13px 32px' }}>📢 ส่งประกาศให้ทุกคน</button>
              </div>
            </form>
          ) : (
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

              <form onSubmit={handleDraftFormSubmit}>
                {error && <p className="alert-error">{error}</p>}
                {editingDraftId && (
                  <p className="alert-success">📝 กำลังแก้ไขรายการที่เพิ่มไว้ — แก้ข้อมูลแล้วกด "บันทึกการแก้ไขรายการ" ด้านล่าง</p>
                )}

                <label style={{ marginTop: pickerSearched ? 0 : 16 }}>เลือกนักเรียน</label>
                <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">-- เลือกนักเรียน --</option>
                  {students.map((s) => (
                    <option key={s.user_id} value={s.user_id}>{s.student_code} - {s.first_name} {s.last_name}</option>
                  ))}
                </select>

                {selected && (
                  <div className="info-box" style={{ marginTop: 16 }}>📧 อีเมลที่จะส่งถึง: <strong>{selected.email || 'ไม่มีอีเมลในระบบ'}</strong></div>
                )}

                <div className="reason-field-wide">
                  <label>ข้อความแจ้งเตือน</label>
                  <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="เช่น กรุณามาพบห้องพยาบาลเพื่อรับยาต่อเนื่อง" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); editingDraftId ? cancelEditDraft() : cancelForm(); }}>
                    « {editingDraftId ? 'ยกเลิกการแก้ไข' : 'ย้อนกลับ'}
                  </a>
                  <button type="submit" style={{ width: 'auto', margin: 0, padding: '13px 32px' }}>
                    {editingDraftId ? 'บันทึกการแก้ไขรายการ' : '+ เพิ่มลงรายการ'}
                  </button>
                </div>
              </form>

              {/* ===== ตะกร้ารายการที่รอส่ง ===== */}
              {draftList.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <h3>รายการที่รอส่ง ({draftList.length} คน)</h3>
                  {draftList.map((item) => (
                    <div className="info-box" key={item._draftId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div>
                        <strong>{item._label}</strong><br />
                        ข้อความ: {item.message}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <a href="#" className="btn-edit-row" onClick={(e) => { e.preventDefault(); editDraft(item); }}>แก้ไข</a>
                        <a href="#" className="btn-delete-row" onClick={(e) => { e.preventDefault(); removeDraft(item._draftId); }}>ลบออก</a>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="btn-submit-all" onClick={handleSubmitAllDrafts}>
                    ✅ ส่งแจ้งเตือนทั้งหมด ({draftList.length} รายการ)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <h3 style={{ marginTop: 0 }}>
            <div className="th-with-add">
              <span>แจ้งเตือนที่ส่งล่าสุด ({notifications.length} รายการ)</span>
              <button
                type="button"
                className="btn-add-circle"
                title="ส่งแจ้งเตือนใหม่ (เพิ่มได้หลายคน)"
                onClick={() => { setShowForm(true); setForm(emptyForm); setBroadcastMessage(''); setBroadcastMode(false); setDraftList([]); setEditingDraftId(null); clearPickerSearch(); }}
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
