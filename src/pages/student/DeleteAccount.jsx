// src/pages/student/DeleteAccount.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatusModal from '../../components/StatusModal';

export default function DeleteAccount() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '');
    setPassword(numericOnly);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/student/delete_account.php', { password });
      // ห้ามเคลียร์ token ตรงนี้ - ถ้าเคลียร์ตอนนี้ `user` ใน AuthContext จะหายทันที ทำให้ ProtectedRoute
      // เด้งออกจากหน้านี้ก่อนที่ StatusModal จะทันโชว์เลย ต้องรอให้ modal แสดงจน autoCloseMs ครบก่อน
      // ค่อยเคลียร์ token แล้ว navigate (ดู onAutoClose ด้านล่าง)
      setModalStatus('success');
      setModalMessage('ลบบัญชีผู้ใช้เรียบร้อยแล้ว');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAutoClose = async () => {
    // เรียกตอนนี้เท่านั้น (หลัง popup แสดงครบเวลาแล้ว) เพราะ logout() ยิง API + เคลียร์ token/user
    // ถ้าเคลียร์ก่อนหน้านี้จะทำให้ popup ถูกถอดออกก่อนผู้ใช้ทันเห็น
    await logout();
    navigate('/login');
  };

  return (
    <div className="form-container">
      <StatusModal
        status={modalStatus}
        message={modalMessage}
        onClose={() => setModalStatus(null)}
        hideConfirmButton
        autoCloseMs={1800}
        onAutoClose={handleAutoClose}
      />

      <h2>ลบบัญชีผู้ใช้ถาวร</h2>
      {error && <p className="alert-error">{error}</p>}
      <p style={{ color: '#c53030', fontWeight: 'bold' }}>⚠️ คำเตือน: การลบบัญชีเป็นการดำเนินการถาวร ไม่สามารถกู้คืนได้</p>
      <form onSubmit={handleSubmit}>
        <label>กรุณาพิมพ์รหัสผ่านเพื่อยืนยันตัวตน</label>
        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={5} value={password} onChange={handlePasswordChange} required />
        <button type="submit" style={{ background: '#c53030' }}>ยืนยันลบบัญชีถาวร</button>
      </form>
      <Link to="/student/profile" style={{ display: 'block', marginTop: 20 }}>« ยกเลิก กลับไปหน้าข้อมูลส่วนตัว</Link>
    </div>
  );
}
