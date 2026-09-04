// src/pages/student/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, avatarUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import ConfirmModal from '../../components/ConfirmModal';

export default function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    api.get('/student/dashboard_summary.php').then(setSummary).catch(console.error);
  }, []);

  if (!summary) return <LoadingScreen />;

  return (
    <div className="dashboard-container">
      <ConfirmModal
        open={showLogoutConfirm}
        title="ออกจากระบบ"
        message="คุณต้องการออกจากระบบใช่หรือไม่?"
        confirmText="ตกลง"
        cancelText="ยกเลิก"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
      />

      <div className="student-topbar">
        {summary.avatar ? (
          <img
            className="student-topbar-avatar"
            src={avatarUrl(summary.avatar)}
            alt="รูปโปรไฟล์"
          />
        ) : (
          <div className="student-topbar-avatar-fallback">👤</div>
        )}

        <div className="student-topbar-info">
          <div className="student-topbar-greeting">สวัสดี,</div>
          <div className="student-topbar-name">
            {summary.first_name} {summary.last_name}
          </div>
          {summary.nickname && (
            <div className="student-topbar-nickname">ชื่อเล่น: {summary.nickname}</div>
          )}
          {summary.student_code && (
            <div className="student-topbar-code">รหัสนักศึกษา: {summary.student_code}</div>
          )}
        </div>

        <div className="student-topbar-actions">
          <Link to="/student/notifications">🔔 แจ้งเตือนใหม่: {summary.unread_count}</Link>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLogoutConfirm(true); }}>ออกจากระบบ</a>
        </div>
      </div>

      {summary.next_appointment ? (
        <div className="alert-box">
          📅 <strong>นัดหมายถัดไป:</strong>{' '}
          {new Date(summary.next_appointment.appointment_datetime).toLocaleString('th-TH')}
          <br />เหตุผล: {summary.next_appointment.reason}
        </div>
      ) : (
        <div className="info-box">ไม่มีนัดหมายที่ต้องเข้าพบในขณะนี้</div>
      )}

      <div className="menu-grid">
        <Link to="/student/profile">
          <span className="menu-emoji-bg">👤</span>
          <span className="menu-label">ข้อมูลส่วนตัว</span>
        </Link>
        <Link to="/student/allergy">
          <span className="menu-emoji-bg">💊</span>
          <span className="menu-label">ประวัติแพ้ยา</span>
        </Link>
        <Link to="/student/appointments">
          <span className="menu-emoji-bg">📅</span>
          <span className="menu-label">นัดหมายทั้งหมด</span>
        </Link>
        <Link to="/student/notifications">
          <span className="menu-emoji-bg">🔔</span>
          <span className="menu-label">การแจ้งเตือน</span>
        </Link>
        <Link to="/student/login-history">
          <span className="menu-emoji-bg">🕘</span>
          <span className="menu-label">ประวัติการเข้าใช้งาน</span>
        </Link>
        <Link to="/student/visit-history">
          <span className="menu-emoji-bg">🏥</span>
          <span className="menu-label">ประวัติการเข้ารับบริการ</span>
        </Link>
      </div>
    </div>
  );
}