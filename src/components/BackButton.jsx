// src/components/BackButton.jsx
import { Link } from 'react-router-dom';

export default function BackButton({ to }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block', marginTop: 20, padding: 15, background: '#fff',
        color: '#2B6CB0', textDecoration: 'none', borderRadius: 8, fontWeight: 'bold',
        textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      กลับหน้าหลัก
    </Link>
  );
}
