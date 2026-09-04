// src/api/client.js
// ตัวเชื่อม API กลาง ใช้เรียก PHP backend ทุกจุด

// ===== ตอนพัฒนา (localhost) ใช้บรรทัดนี้ =====
// export const API_BASE = 'http://localhost/hospital-system-v2/backend/api';

// ===== ตอนมีโดเมน/โฮสติ้งจริงแล้ว ให้คอมเมนต์บรรทัดบนออก แล้วเปิดใช้บรรทัดนี้แทน =====
export const API_BASE = 'https://hospitalback-end.onrender.com/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // สำคัญมาก: ส่ง session cookie ไปด้วยทุกครั้ง
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
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
      credentials: 'include',
      body: formData, // ไม่ต้องตั้ง Content-Type เอง เบราว์เซอร์จะใส่ boundary ให้อัตโนมัติ
    });
    let data;
    try { data = await res.json(); } catch { throw new Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง'); }
    if (!res.ok) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');
    return data;
  },
};