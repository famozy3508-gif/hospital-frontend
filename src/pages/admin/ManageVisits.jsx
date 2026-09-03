// src/pages/admin/ManageVisits.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const DEPT_LIST = [
  'สาขาวิชาการบัญชี', 'สาขาวิชาการตลาด', 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล',
  'สาขาวิชาดิจิทัลกราฟิก', 'สาขาวิชาภาษาต่างประเทศธุรกิจบริการ', 'สาขาวิชาเทคโนโลยีสารสนเทศ',
  'สาขาวิชาโลจิสติกส์', 'สาขาวิชาการท่องเที่ยว', 'สาขาวิชาภาษาและการจัดการธุรกิจระหว่างประเทศ',
  'สาขาวิชาการจัดการโลจิสติกส์และซัพพลายเชน', 'สาขาวิชาการจัดการธุรกิจค้าปลีก',
];

const emptyForm = { student_id: '', symptoms: '', diagnosis: '', treatment: '', medicine_given: '', notes: '' };
const emptyPickerFilters = { student_code: '', filter_level: '', filter_dept: '' };

export default function ManageVisits() {
  const [students, setStudents] = useState([]);
  const [visits, setVisits] = useState([]);
  const [filters, setFilters] = useState({ student_code: '', filter_level: '', filter_dept: '' });
  const [hasSearched, setHasSearched] = useState(false);

  const [pickerFilters, setPickerFilters] = useState(emptyPickerFilters);
  const [pickerSearched, setPickerSearched] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStudentsForPicker = (f = {}) => {
    const qs = new URLSearchParams({ mode: 'students', ...f }).toString();
    api.get(`/admin/manage_visits.php?${qs}`).then(setStudents);
  };
  const loadVisits = (f = {}) => {
    const qs = new URLSearchParams(f).toString();
    api.get(`/admin/manage_visits.php?${qs}`).then(setVisits);
  };

  useEffect(() => { loadStudentsForPicker(); loadVisits(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const isFiltered = !!(filters.student_code || filters.filter_level || filters.filter_dept);
    setHasSearched(isFiltered);
    loadVisits(filters);
  };
  const clearSearch = () => {
    const f = { student_code: '', filter_level: '', filter_dept: '' };
    setFilters(f);
    setHasSearched(false);
    loadVisits();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const action = editing ? 'edit' : 'add';
      const payload = editing ? { ...form, action, visit_id: editing } : { ...form, action };
      const res = await api.post('/admin/manage_visits.php', payload);
      setSuccess(res.message);
      setForm(emptyForm);
      clearPickerSearch();
      setEditing(null);
      setShowAddForm(false);
      loadVisits(hasSearched ? filters : {});
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (v) => {
    setShowAddForm(false);
    setEditing(v.visit_id);
    setForm({ student_id: '', symptoms: v.symptoms, diagnosis: v.diagnosis, treatment: v.treatment, medicine_given: v.medicine_given, notes: v.notes });
  };
  const cancelEdit = () => { setEditing(null); setForm(emptyForm); };
  const cancelAdd = () => { setShowAddForm(false); setForm(emptyForm); clearPickerSearch(); };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันลบรายการนี้?')) return;
    await api.del(`/admin/manage_visits.php?id=${id}`);
    loadVisits(hasSearched ? filters : {});
  };

  const renderForm = () => (
    <div className="slide-panel">
      {editing && <h3 style={{ marginTop: 0 }}>แก้ไขรายการ (Visit ID: {editing})</h3>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {!editing && (
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
              <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 16px' }}>
                ✅ ค้นหาแล้ว — พบ {students.length} คน
              </p>
            )}

            <label style={{ marginTop: pickerSearched ? 0 : 16 }}>เลือกนักเรียน</label>
            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required>
              <option value="">-- เลือกนักเรียน --</option>
              {students.map((s) => (
                <option key={s.user_id} value={s.user_id}>{s.student_code} - {s.first_name} {s.last_name}</option>
              ))}
            </select>
          </>
        )}

        <label>อาการ</label>
        <input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} required />

        <label>การวินิจฉัย</label>
        <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />

        <label>การรักษา</label>
        <input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />

        <label>ยาที่ได้รับ</label>
        <input value={form.medicine_given} onChange={(e) => setForm({ ...form, medicine_given: e.target.value })} />

        <label>หมายเหตุ</label>
        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center' }}>
          <button type="submit">{editing ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button>
          <a href="#" className="btn-back-panel" onClick={(e) => { e.preventDefault(); editing ? cancelEdit() : cancelAdd(); }}>« ย้อนกลับ</a>
        </div>
      </form>
    </div>
  );

  return (
    <div className="admin-panel">
      <h2>บันทึกการเข้ารับบริการ</h2>
      {error && <p className="alert-error">{error}</p>}
      {success && <p className="alert-success">{success}</p>}

      {(editing || showAddForm) ? (
        renderForm()
      ) : (
        <>
          <h3 style={{ marginTop: 0 }}>ค้นหาประวัติที่เคยบันทึกไว้</h3>
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
                  <option value="">-- เลือกระดับชั้น --</option>
                  <option value="ปวช.">ปวช.</option>
                  <option value="ปวส.">ปวส.</option>
                  <option value="ปวส.พิเศษ">ปวส.พิเศษ</option>
                </select>
              </div>
              <div>
                <label>สาขาวิชา</label>
                <select value={filters.filter_dept} onChange={(e) => setFilters({ ...filters, filter_dept: e.target.value })}>
                  <option value="">-- เลือกสาขาวิชา --</option>
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
            <p style={{ fontSize: 14, color: '#555', marginTop: 10 }}>
              ✅ ค้นหาแล้ว — พบ {visits.length} รายการที่ตรงกับเงื่อนไข
            </p>
          )}

          <h3 style={{ marginTop: 30 }}>
            <div className="th-with-add">
              <span>ประวัติล่าสุด ({visits.length} รายการ)</span>
              <button
                type="button"
                className="btn-add-circle"
                title="บันทึกครั้งใหม่"
                onClick={() => { setShowAddForm(true); setForm(emptyForm); clearPickerSearch(); }}
              >+</button>
            </div>
          </h3>

          {visits.length === 0 ? <p>ไม่พบประวัติการบันทึก</p> : visits.map((v) => (
            <div className="info-box" key={v.visit_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                📅 {new Date(v.visit_datetime).toLocaleString('th-TH')} - <strong>{v.student_code} {v.first_name} {v.last_name}</strong><br />
                อาการ: {v.symptoms}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <a href="#" className="btn-edit-row" onClick={(e) => { e.preventDefault(); startEdit(v); }}>แก้ไข</a>
                <a href="#" className="btn-delete-row" onClick={(e) => { e.preventDefault(); handleDelete(v.visit_id); }}>ลบ</a>
              </div>
            </div>
          ))}
        </>
      )}

      <Link to="/admin/dashboard" style={{ display: 'block', marginTop: 24 }}>« กลับหน้าหลัก</Link>
    </div>
  );
}