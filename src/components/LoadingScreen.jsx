// src/components/LoadingScreen.jsx
import { createPortal } from 'react-dom';

export default function LoadingScreen({ text = 'กำลังโหลด...' }) {
  return createPortal(
    <div className="loading-screen-overlay">
      <div className="loading-screen-content">
        <div className="spinner-ring"></div>
        <p className="loading-screen-text">{text}</p>
      </div>
    </div>,
    document.body
  );
}