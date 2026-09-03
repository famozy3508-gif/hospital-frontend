// src/components/ConfirmModal.jsx
// Popup ยืนยันการกระทำ (เช่น ออกจากระบบ) — ปุ่มยกเลิกสีขาว, ยืนยันสีแดง
import { createPortal } from 'react-dom';

export default function ConfirmModal({ open, title, message, confirmText = 'ตกลง', cancelText = 'ยกเลิก', onConfirm, onCancel }) {
  if (!open) return null;

  return createPortal(
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-box">
        <div className="confirm-modal-icon">🚪</div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-text">{message}</p>
        <div className="confirm-modal-actions">
          <button type="button" className="confirm-modal-cancel" onClick={onCancel}>{cancelText}</button>
          <button type="button" className="confirm-modal-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}