// src/pages/student/DeleteAccount.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function DeleteAccount() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { refresh } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('ยืนยันลบบัญชีถาวร? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    setError('');
    try {
      await api.post('/student/delete_account.php', { password });
      await refresh();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>ลบบัญชีผู้ใช้ถาวร</h2>
      {error && <p className="alert-error">{error}</p>}
      <p style={{ color: '#c53030', fontWeight: 'bold' }}>⚠️ คำเตือน: การลบบัญชีเป็นการดำเนินการถาวร ไม่สามารถกู้คืนได้</p>
      <form onSubmit={handleSubmit}>
        <label>กรุณาพิมพ์รหัสผ่านเพื่อยืนยันตัวตน</label>
        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={5} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" style={{ background: '#c53030' }}>ยืนยันลบบัญชีถาวร</button>
      </form>
      <Link to="/student/profile" style={{ display: 'block', marginTop: 20 }}>« ยกเลิก กลับไปหน้าข้อมูลส่วนตัว</Link>
    </div>
  );
}
