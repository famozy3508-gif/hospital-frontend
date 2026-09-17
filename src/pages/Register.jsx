// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, FIELD_PATTERNS } from '../api/client';
import StatusModal from '../components/StatusModal';

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2F33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    student_code: '', first_name: '', last_name: '', email: '',
    username: '', password: '', confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ username: '', student_code: '', email: '' });
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const numericOnlyUpdate = (key) => (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '');
    setForm({ ...form, [key]: numericOnly });
    if (fieldErrors[key]) setFieldErrors({ ...fieldErrors, [key]: '' });
  };

  const handleUsernameChange = (e) => {
    const filtered = e.target.value.replace(/[^A-Za-z0-9_.-]/g, '');
    setForm({ ...form, username: filtered });
    if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' });
  };

  const handleEmailChange = (e) => {
    const filtered = e.target.value.replace(/[^A-Za-z0-9@._+-]/g, '');
    setForm({ ...form, email: filtered });
    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
  };

  // เช็คซ้ำตอนออกจากช่อง (onBlur) - ตรวจรูปแบบก่อนเสมอ ถ้ารูปแบบยังผิด/ว่างไม่ต้องยิง API เปล่าๆ
  // ถ้าเช็คไม่สำเร็จ (เช่นโดน rate limit ชั่วคราว) ปล่อยผ่านเงียบๆ เพราะตอนกดสมัครจริง backend ยังตรวจซ้ำอีกชั้นอยู่แล้ว
  const checkFieldAvailable = async (field, value) => {
    if (!value || !FIELD_PATTERNS[field].test(value)) return;
    try {
      const res = await api.checkAvailable(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: res.available ? '' : res.message }));
    } catch {
      // เงียบไว้ ไม่ block ผู้ใช้
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (fieldErrors.username || fieldErrors.student_code || fieldErrors.email) {
      setError('กรุณาแก้ไขข้อมูลที่ซ้ำก่อนสมัครสมาชิก');
      return;
    }
    try {
      const data = await api.post('/auth/register.php', form);
      setModalStatus('success');
      setModalMessage(data.message || 'สมัครสมาชิกเรียบร้อยแล้ว');
    } catch (err) {
      setError(err.message);
    }
  };

  const eyeButtonStyle = {
    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
    width: 34, height: 34, margin: 0, padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', boxShadow: 'none', cursor: 'pointer',
  };

  return (
    <div className="form-container">
      <StatusModal
        status={modalStatus}
        message={modalMessage}
        onClose={() => setModalStatus(null)}
        hideConfirmButton
        autoCloseMs={1800}
        onAutoClose={() => navigate('/login')}
      />

      <h2>สมัครสมาชิก (นักเรียน/นักศึกษา)</h2>
      {error && <p className="alert-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>รหัสนักเรียน/นักศึกษา</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          value={form.student_code}
          onChange={numericOnlyUpdate('student_code')}
          onBlur={(e) => checkFieldAvailable('student_code', e.target.value)}
          placeholder="กรุณากรอกข้อมูล"
          className={fieldErrors.student_code ? 'input-error' : ''}
          required
        />
        {fieldErrors.student_code && <p className="field-error-text">{fieldErrors.student_code}</p>}

        <label>ชื่อ</label>
        <input value={form.first_name} onChange={update('first_name')} placeholder="กรุณากรอกข้อมูล" required />

        <label>นามสกุล</label>
        <input value={form.last_name} onChange={update('last_name')} placeholder="กรุณากรอกข้อมูล" required />

        <label>อีเมล</label>
        <input
          type="email"
          value={form.email}
          onChange={handleEmailChange}
          onBlur={(e) => checkFieldAvailable('email', e.target.value)}
          placeholder="กรุณากรอกอีเมล เช่น example@gmail.com"
          className={fieldErrors.email ? 'input-error' : ''}
          required
        />
        {fieldErrors.email && <p className="field-error-text">{fieldErrors.email}</p>}

        <label>ชื่อผู้ใช้ (Username)</label>
        <input
          maxLength={7}
          value={form.username}
          onChange={handleUsernameChange}
          onBlur={(e) => checkFieldAvailable('username', e.target.value)}
          placeholder="กรุณากรอกข้อมูล"
          className={fieldErrors.username ? 'input-error' : ''}
          required
        />
        {fieldErrors.username && <p className="field-error-text">{fieldErrors.username}</p>}

        <label>รหัสผ่าน</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            value={form.password}
            onChange={numericOnlyUpdate('password')}
            placeholder="กรุณากรอกรหัสผ่าน 5 ตัว"
            required
            style={{ paddingRight: 46 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={eyeButtonStyle}
            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <label>ยืนยันรหัสผ่าน</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            value={form.confirm_password}
            onChange={numericOnlyUpdate('confirm_password')}
            placeholder="กรุณากรอกรหัสผ่าน 5 ตัวอีกครั้ง"
            required
            style={{ paddingRight: 46 }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={eyeButtonStyle}
            aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <button type="submit">สมัครสมาชิก</button>
      </form>
      <p>มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link></p>
    </div>
  );
}