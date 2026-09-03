// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(username, password);
      navigate(data.role === 'student' ? '/student/dashboard' : '/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '');
    setPassword(numericOnly);
  };

  const eyeButtonStyle = {
    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
    width: 34, height: 34, margin: 0, padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', boxShadow: 'none', cursor: 'pointer',
  };

  return (
    <div className="form-container">
      <img src="/UDOMM.png" alt="โลโก้วิทยาลัย" style={{ width: 140, height: 140, display: 'block', margin: '0 auto 20px', borderRadius: '50%', boxShadow: '0 12px 28px rgba(30,78,140,0.22)', border: '3px solid #fff' }} />
      <h2>เข้าสู่ระบบ</h2>
      {error && <p className="alert-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>ชื่อผู้ใช้ (Username)</label>
        <input
          type="text"
          maxLength={7}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="กรุณากรอกชื่อผู้ใช้"
          required
        />

        <label>รหัสผ่าน</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            value={password}
            onChange={handlePasswordChange}
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

        <button type="submit">เข้าสู่ระบบ</button>
      </form>
      <p>ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link></p>
    </div>
  );
}