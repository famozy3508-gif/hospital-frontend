// src/pages/admin/ManageAppointments.jsx
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
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const STATUS_LABEL = { pending: 'รอถึงกำหนด', completed: 'เสร็จสิ้นแล้ว', cancelled: 'ยกเลิกแล้ว' };
const currentYearBE = new Date().getFullYear() + 543;

const emptyForm = { student_id: '', day: '', month: '', year: '', hour: '', minute: '', reason: '', status: 'pending' };
const emptyPickerFilters = { student_code: '', filter_level: '', filter_dept: '' };

export default function ManageAppointments() {
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [filters, setFilters] = useState({ student_code: '', filter_level: '', filter_dept: '' });
  const [hasSearched, setHasSearched] = useState(false);

  const [pickerFilters, setPickerFilters] = useState(emptyPickerFilters);
  const [pickerSearched, setPickerSearched] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  // ===== รายการนัดหมายที่ "รอสร้าง" (ตะกร้า) — เพิ่มได้หลายคน แล้วค่อยกดสร้างทีเดียว =====
  const [draftList, setDraftList] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null); // null = กำลังเพิ่มใหม่, ไม่ null = กำลังแก้ไขรายการในตะกร้า

  const loadStudentsForPicker = (f = {}) => {
    const qs = new URLSearchParams({ mode: 'students', ...f }).toString();
    api.get(`/admin/manage_appointments.php?${qs}`).then(setStudents);
  };
  const loadAppointments = (f = {}) => {
    const qs = new URLSearchParams(f).toString();
    api.get(`/admin/manage_appointments.php?${qs}`).then(setAppointments);
  };

  useEffect(() => { loadStudentsForPicker(); loadAppointments(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const isFiltered = !!(filters.student_code || filters.filter_level || filters.filter_dept);
    setHasSearched(isFiltered);
    loadAppointments(filters);
  };
  const clearSearch = () => {
    const f = { student_code: '', filter_level: '', filter_dept: '' };
    setFilters(f);
    setHasSearched(false);
    loadAppointments();
  };
  const handleTopSearchCode = (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    setFilters({ ...filters, student_code: numericOnly });
  };

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

  // ===== เพิ่ม/แก้ไข รายการในตะกร้า (ยังไม่ส่งไป backend) =====
  const handleDraftFormSubmit = (e) => {
    e.preventDefault();
    if (!form.student_id || !form.day || !form.month || !form.year || form.hour === '' || form.minute === '') {
      setError('กรุณาเลือกนักเรียนและระบุวันเวลานัดหมายให้ครบก่อนเพิ่มลงรายการ');
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
    setForm({
      student_id: item.student_id, day: item.day, month: item.month, year: item.year,
      hour: item.hour, minute: item.minute, reason: item.reason, status: item.status,
    });
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

  // ===== กดสร้างนัดหมายทั้งหมดในตะกร้าทีเดียว =====
  const handleSubmitAllDrafts = async () => {
    if (draftList.length === 0) return;
    setModalStatus('loading');
    setModalMessage('');

    let successCount = 0;
    let failCount = 0;

    for (const item of draftList) {
      try {
        await api.post('/admin/manage_appointments.php', { ...item, action: 'add' });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    if (failCount === 0) {
      setModalStatus('success');
      setModalMessage(`สร้างนัดหมายสำเร็จทั้งหมด ${successCount} รายการ (ส่งแจ้งเตือนในเว็บ + อีเมลให้ทุกคนแล้ว)`);
    } else {
      setModalStatus('error');
      setModalMessage(`สร้างสำเร็จ ${successCount} รายการ แต่ล้มเหลว ${failCount} รายการ กรุณาตรวจสอบและลองใหม่เฉพาะรายการที่ล้มเหลว`);
    }

    setDraftList([]);
    setForm(emptyForm);
    setEditingDraftId(null);
    clearPickerSearch();
    setShowAddForm(false);
    loadAppointments(hasSearched ? filters : {});
  };

  // ===== แก้ไข/ลบ/เปลี่ยนสถานะ นัดหมายที่มีอยู่แล้วในระบบ (ทีละรายการ) =====
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setModalStatus('loading');
    try {
      const res = await api.post('/admin/manage_appointments.php', { ...form, action: 'edit', appointment_id: editing });
      setModalStatus('success');
      setModalMessage(res.message || 'แก้ไขนัดหมายเรียบร้อยแล้ว');
      setForm(emptyForm);
      setEditing(null);
      loadAppointments(hasSearched ? filters : {});
    } catch (err) {
      setModalStatus('error');
      setModalMessage('เกิดข้อผิดพลาด เนื่องจากข้อมูลไม่ถูกต้องหรือผิดพลาด กรุณาลองใหม่');
    }
  };

  const startEdit = (a) => {
    setShowAddForm(false);
    setDraftList([]);
    setEditingDraftId(null);
    const d = new Date(a.appointment_datetime);
    setEditing(a.appointment_id);
    setForm({
      day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() + 543,
      hour: d.getHours(), minute: d.getMinutes(), reason: a.reason, status: a.status,
    });
  };
  const cancelEdit = () => { setEditing(null); setForm(emptyForm); };
  const cancelAdd = () => {
    setShowAddForm(false);
    setForm(emptyForm);
    setDraftList([]);
    setEditingDraftId(null);
    clearPickerSearch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันลบนัดหมายนี้?')) return;
    await api.del(`/admin/manage_appointments.php?id=${id}`);
    loadAppointments(hasSearched ? filters : {});
  };

  const changeStatus = async (id, action, confirmMsg) => {
    if (!window.confirm(confirmMsg)) return;
    await api.post('/admin/manage_appointments.php', { action, appointment_id: id });
    loadAppointments(hasSearched ? filters : {});
  };

  const renderEditForm = () => (
    <div className="slide-panel">
      <h3 style={{ marginTop: 0 }}>แก้ไขนัดหมาย</h3>
      <form onSubmit={handleEditSubmit}>
        <div className="field-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
          <div>
            <label>วัน</label>
            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} required>
              {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
          </div>
          <div>
            <label>เดือน</label>
            <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required>
              {THAI_MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label>ปี (พ.ศ.)</label>
            <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required>
              {[currentYearBE - 1, currentYearBE, currentYearBE + 1, currentYearBE + 2].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 20 }}>
          <div>
            <label>ชั่วโมง</label>
            <select value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })} required>
              {[...Array(24)].map((_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label>นาที</label>
            <select value={form.minute} onChange={(e) => setForm({ ...form, minute: e.target.value })} required>
              {[...Array(60)].map((_, m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>

        <div className="reason-field-wide">
          <label>เหตุผล</label>
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>

        <div style={{ maxWidth: 300, marginBottom: 20 }}>
          <label>สถานะ</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="pending">รอถึงกำหนด</option>
            <option value="completed">เสร็จสิ้นแล้ว</option>
            <option value="cancelled">ยกเลิกแล้ว</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); cancelEdit(); }}>« ย้อนกลับ</a>
          <button type="submit" style={{ width: 'auto', margin: 0, padding: '13px 32px' }}>บันทึกการแก้ไข</button>
        </div>
      </form>
    </div>
  );

  const renderAddForm = () => (
    <div className="slide-panel">
      <h3 style={{ marginTop: 0 }}>สร้างนัดหมายใหม่ {draftList.length > 0 && `— รอสร้าง ${draftList.length} รายการ`}</h3>

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

        <div style={{ marginTop: pickerSearched ? 0 : 16, marginBottom: 20 }}>
          <label>เลือกนักเรียน</label>
          <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
            <option value="">-- เลือกนักเรียน --</option>
            {students.map((s) => (
              <option key={s.user_id} value={s.user_id}>{s.student_code} - {s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>

        <div className="field-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
          <div>
            <label>วัน</label>
            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
              <option value="">วัน</option>
              {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
          </div>
          <div>
            <label>เดือน</label>
            <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
              <option value="">เดือน</option>
              {THAI_MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label>ปี (พ.ศ.)</label>
            <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
              <option value="">ปี</option>
              {[currentYearBE, currentYearBE + 1, currentYearBE + 2].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="field-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 20 }}>
          <div>
            <label>ชั่วโมง</label>
            <select value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })}>
              <option value="">ชม.</option>
              {[...Array(24)].map((_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label>นาที</label>
            <select value={form.minute} onChange={(e) => setForm({ ...form, minute: e.target.value })}>
              <option value="">นาที</option>
              {[...Array(60)].map((_, m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
        </div>

        <div className="reason-field-wide">
          <label>เหตุผล</label>
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="เช่น ติดตามอาการ, ตรวจสุขภาพประจำปี" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); editingDraftId ? cancelEditDraft() : cancelAdd(); }}>
            « {editingDraftId ? 'ยกเลิกการแก้ไข' : 'ย้อนกลับ'}
          </a>
          <button type="submit" style={{ width: 'auto', margin: 0, padding: '13px 32px' }}>
            {editingDraftId ? 'บันทึกการแก้ไขรายการ' : '+ เพิ่มลงรายการ'}
          </button>
        </div>
      </form>

      {/* ===== ตะกร้ารายการที่รอสร้าง ===== */}
      {draftList.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3>รายการที่รอสร้าง ({draftList.length} คน)</h3>
          {draftList.map((item) => (
            <div className="info-box" key={item._draftId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <strong>{item._label}</strong><br />
                📅 {item.day}/{item.month}/{item.year} เวลา {String(item.hour).padStart(2,'0')}:{String(item.minute).padStart(2,'0')} น.<br />
                เหตุผล: {item.reason || '-'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <a href="#" className="btn-edit-row" onClick={(e) => { e.preventDefault(); editDraft(item); }}>แก้ไข</a>
                <a href="#" className="btn-delete-row" onClick={(e) => { e.preventDefault(); removeDraft(item._draftId); }}>ลบออก</a>
              </div>
            </div>
          ))}

          <button type="button" className="btn-submit-all" onClick={handleSubmitAllDrafts}>
            ✅ สร้างนัดหมายทั้งหมด ({draftList.length} รายการ)
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-panel">
      <StatusModal status={modalStatus} message={modalMessage} onClose={() => setModalStatus(null)} />
      <h2>จัดการนัดหมาย</h2>
      {success && <p className="alert-success">{success}</p>}

      {editing ? renderEditForm() : showAddForm ? renderAddForm() : (
        <>
          <h3 style={{ marginTop: 0 }}>ค้นหานัดหมายที่เคยสร้างไว้</h3>
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
                  onChange={handleTopSearchCode}
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
          {hasSearched && (
            <p style={{ fontSize: 14, color: '#555', marginTop: 10 }}>✅ ค้นหาแล้ว — พบ {appointments.length} รายการที่ตรงกับเงื่อนไข</p>
          )}

          <h3 style={{ marginTop: 30 }}>
            <div className="th-with-add">
              <span>นัดหมายล่าสุด ({appointments.length} รายการ)</span>
              <button
                type="button"
                className="btn-add-circle"
                title="สร้างนัดหมายใหม่ (เพิ่มได้หลายคน)"
                onClick={() => { setShowAddForm(true); setForm(emptyForm); setDraftList([]); setEditingDraftId(null); clearPickerSearch(); }}
              >+</button>
            </div>
          </h3>

          {appointments.length === 0 ? <p>ไม่พบนัดหมาย</p> : appointments.map((a) => (
            <div className={`appt-card status-${a.status}`} key={a.appointment_id}>
              <div>
                📅 {new Date(a.appointment_datetime).toLocaleString('th-TH')} - <strong>{a.student_code} {a.first_name} {a.last_name}</strong><br />
                เหตุผล: {a.reason}<br />
                สถานะ: <strong>{STATUS_LABEL[a.status]}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <a href="#" className="btn-edit-row" onClick={(e) => { e.preventDefault(); startEdit(a); }}>แก้ไข</a>
                <a href="#" className="btn-delete-row" onClick={(e) => { e.preventDefault(); handleDelete(a.appointment_id); }}>ลบ</a>
                {a.status === 'pending' && (
                  <>
                    <a href="#" className="btn-outline-small" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                       onClick={(e) => { e.preventDefault(); changeStatus(a.appointment_id, 'complete', 'ยืนยันว่านักเรียนมาตามนัดแล้ว?'); }}>✅ มาตามนัดแล้ว</a>
                    <a href="#" className="btn-outline-small" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                       onClick={(e) => { e.preventDefault(); changeStatus(a.appointment_id, 'cancel', 'ยืนยันยกเลิกนัดหมายนี้?'); }}>❌ ยกเลิกนัด</a>
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      <Link to="/admin/dashboard" style={{ display: 'block', marginTop: 24 }}>« กลับหน้าหลัก</Link>
    </div>
  );
}