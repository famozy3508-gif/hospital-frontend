// src/components/AdminSidebar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="เปิดเมนู">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)}></div>}

      <div className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-top">
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="ปิดเมนู">×</button>
          <img src="/UDOMM.png" alt="โลโก้วิทยาลัย" className="sidebar-logo" />
          <span className="sidebar-title">Menu</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/manage-students" onClick={() => setOpen(false)}>👥 จัดการสมาชิก</Link>
          <Link to="/admin/manage-visits" onClick={() => setOpen(false)}>📋 บันทึกการเข้ารับบริการ</Link>
          <Link to="/admin/manage-appointments" onClick={() => setOpen(false)}>📅 จัดการนัดหมาย</Link>
          <Link to="/admin/send-notification" onClick={() => setOpen(false)}>🔔 ส่งแจ้งเตือน</Link>
        </nav>

        <div className="sidebar-footer">
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>🚪 ออกจากระบบ</a>
        </div>
      </div>
    </>
  );
}