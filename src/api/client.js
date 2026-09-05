// src/api/client.js
// ตัวเชื่อม API กลาง ใช้เรียก PHP backend ทุกจุด

// ===== ตอนพัฒนา (localhost) ใช้บรรทัดนี้ =====
// export const API_BASE = 'http://localhost/hospital-system-v2/backend/api';

// ===== ตอนมีโดเมน/โฮสติ้งจริงแล้ว ให้คอมเมนต์บรรทัดบนออก แล้วเปิดใช้บรรทัดนี้แทน =====
export const API_BASE = 'https://hospitalback-end.onrender.com/api';

const UPLOAD_BASE = API_BASE.replace(/\/api$/, '');

// รูปโปรไฟล์ใหม่เก็บเป็น URL เต็มจาก Cloudinary อยู่แล้ว (ขึ้นต้นด้วย http)
// ส่วนข้อมูลเก่าก่อนย้ายมาใช้ Cloudinary ยังเป็นแค่ชื่อไฟล์ ต้องต่อ path เดิมให้
export function avatarUrl(avatar) {
  if (!avatar) return '';
  return avatar.startsWith('http') ? avatar : `${UPLOAD_BASE}/uploads/avatars/${avatar}`;
}

// ===== Token-based auth (แทน PHP session cookie) =====
// เดิมใช้ session cookie ข้ามโดเมน (Vercel <-> Render) แต่มือถือ (Safari/Chrome mobile) บล็อก
// third-party cookie ทำให้ล็อกอินค้าง จึงเก็บ token ไว้ใน localStorage แล้วแนบไปกับทุก request
// ผ่าน Authorization: Bearer <token> แทน ซึ่งไม่ผูกกับนโยบาย cookie ของเบราว์เซอร์เลย
const TOKEN_KEY = 'auth_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage ใช้ไม่ได้ (เช่น private mode) - ปล่อยผ่าน แค่ต้องล็อกอินใหม่ทุกครั้งที่รีเฟรชหน้า
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // เช่นเดียวกับด้านบน
  }
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: authHeaders({
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (ไม่ใช่ JSON)');
  }

  if (!res.ok) {
    throw new Error(data.error || 'เกิดข้อผิดพลาด');
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  // อัปโหลดไฟล์แบบ multipart/form-data (ใช้กับรูปโปรไฟล์)
  uploadFile: async (path, file, fieldName = 'avatar') => {
    const formData = new FormData();
    formData.append(fieldName, file);
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(), // ไม่ตั้ง Content-Type เอง เบราว์เซอร์จะใส่ boundary ให้อัตโนมัติ
      body: formData,
    });
    let data;
    try { data = await res.json(); } catch { throw new Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง'); }
    if (!res.ok) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');
    return data;
  },
};