// src/components/StatusModal.jsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function StatusModal({ status, message, onClose, hideConfirmButton = false, autoCloseMs = null, onAutoClose = null }) {
  const [displayStatus, setDisplayStatus] = useState(null);
  const [displayMessage, setDisplayMessage] = useState('');
  const [closing, setClosing] = useState(false);

  // ควบคุมการเข้า/ออกอย่างนุ่มนวล: ตอนปิดจะ fade out ก่อน 250ms ค่อยเอาออกจริง
  useEffect(() => {
    if (status) {
      setDisplayStatus(status);
      setDisplayMessage(message);
      setClosing(false);
    } else if (displayStatus) {
      setClosing(true);
      const t = setTimeout(() => setDisplayStatus(null), 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ปิดอัตโนมัติหลังสำเร็จ ถ้ากำหนด autoCloseMs ไว้
  useEffect(() => {
    if (status === 'success' && autoCloseMs) {
      const t = setTimeout(() => {
        onClose && onClose();
        onAutoClose && onAutoClose();
      }, autoCloseMs);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, autoCloseMs]);

  if (!displayStatus) return null;

  return createPortal(
    <div className={`status-modal-overlay ${closing ? 'closing' : ''}`}>
      <div className={`status-modal-box ${closing ? 'closing' : ''}`}>
        {displayStatus === 'loading' && (
          <>
            <div className="status-icon-ring loading">
              <div className="spinner-ring"></div>
            </div>
            <h3 className="status-modal-title">กำลังดำเนินการ</h3>
            <p className="status-modal-text">กรุณารอสักครู่...</p>
          </>
        )}

        {displayStatus === 'success' && (
          <>
            <div className="status-icon-ring success">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="24" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3 className="status-modal-title success">สำเร็จ!</h3>
            <p className="status-modal-text">{displayMessage || 'ส่งข้อมูลเรียบร้อยแล้ว'}</p>
            {!hideConfirmButton && (
              <button className="status-modal-close success" onClick={onClose}>ตกลง</button>
            )}
          </>
        )}

        {displayStatus === 'error' && (
          <>
            <div className="status-icon-ring error">
              <svg className="crossmark" viewBox="0 0 52 52">
                <circle className="crossmark-circle" cx="26" cy="26" r="24" fill="none" />
                <path className="crossmark-line1" fill="none" d="M17 17 L35 35" />
                <path className="crossmark-line2" fill="none" d="M35 17 L17 35" />
              </svg>
            </div>
            <h3 className="status-modal-title error">ไม่สำเร็จ</h3>
            <p className="status-modal-text">{displayMessage || 'เกิดข้อผิดพลาด เนื่องจากข้อมูลไม่ถูกต้องหรือผิดพลาด กรุณาลองใหม่'}</p>
            {!hideConfirmButton && (
              <button className="status-modal-close error" onClick={onClose}>ลองใหม่</button>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}