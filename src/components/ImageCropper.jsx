// src/components/ImageCropper.jsx
// Popup สำหรับลากปรับตำแหน่ง + ซูมรูปก่อนตัดเป็นวงกลม แล้วส่งไฟล์ที่ตัดแล้วกลับไปให้ผู้เรียกใช้
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const FRAME = 260; // ขนาดกรอบที่แสดงบนจอ (px)
const OUTPUT = 320; // ขนาดไฟล์รูปผลลัพธ์ที่จะอัปโหลด (px)

export default function ImageCropper({ file, onCancel, onConfirm }) {
  const [imageSrc, setImageSrc] = useState('');
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, offX: 0, offY: 0 });

  // โหลดไฟล์ที่เลือกมาเป็น data URL สำหรับแสดงตัวอย่าง
  useEffect(() => {
    if (!file) { setImageSrc(''); return; }
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [file]);

  const onImgLoad = (e) => {
    setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  // สเกลพื้นฐานที่ทำให้รูปคลุมกรอบพอดี (เหมือน object-fit: cover) แล้วคูณด้วยระดับซูมที่ผู้ใช้เลือก
  const baseScale = natural.w && natural.h ? Math.max(FRAME / natural.w, FRAME / natural.h) : 1;
  const displayScale = baseScale * zoom;
  const dispW = natural.w * displayScale;
  const dispH = natural.h * displayScale;

  const maxOffsetX = Math.max(0, (dispW - FRAME) / 2);
  const maxOffsetY = Math.max(0, (dispH - FRAME) / 2);
  const clamp = (val, max) => Math.min(max, Math.max(-max, val));

  // เวลาซูมเปลี่ยน ต้องบีบตำแหน่งเดิมให้ไม่หลุดขอบกรอบ
  useEffect(() => {
    setOffset((o) => ({ x: clamp(o.x, maxOffsetX), y: clamp(o.y, maxOffsetY) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, natural.w, natural.h]);

  const handlePointerDown = (e) => {
    setDragging(true);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, offX: offset.x, offY: offset.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setOffset({
        x: clamp(dragStart.current.offX + dx, maxOffsetX),
        y: clamp(dragStart.current.offY + dy, maxOffsetY),
      });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, maxOffsetX, maxOffsetY]);

  const imgTopLeftX = FRAME / 2 - dispW / 2 + offset.x;
  const imgTopLeftY = FRAME / 2 - dispH / 2 + offset.y;

  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');

    // แปลงพิกัดจากกรอบที่เห็นบนจอ กลับไปเป็นตำแหน่งจริงบนรูปต้นฉบับ
    const sx = (0 - imgTopLeftX) / displayScale;
    const sy = (0 - imgTopLeftY) / displayScale;
    const sSize = FRAME / displayScale;

    ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      onConfirm(croppedFile);
    }, 'image/jpeg', 0.92);
  };

  if (!file) return null;

  return createPortal(
    <div className="crop-modal-overlay">
      <div className="crop-modal-box">
        <h3 className="crop-modal-title">ปรับตำแหน่งรูปโปรไฟล์</h3>
        <p className="crop-modal-hint">ลากรูปเพื่อเลื่อนตำแหน่ง และใช้แถบเลื่อนเพื่อซูมเข้า-ออก</p>

        <div
          className="crop-frame"
          onPointerDown={handlePointerDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="ตัวอย่างรูปที่จะครอป"
              onLoad={onImgLoad}
              draggable={false}
              style={{
                position: 'absolute',
                left: imgTopLeftX,
                top: imgTopLeftY,
                width: dispW,
                height: dispH,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          )}
          <div className="crop-circle-mask"></div>
        </div>

        <div className="crop-zoom-row">
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </div>

        <div className="crop-actions">
          <button type="button" className="btn-back-panel" onClick={onCancel}>ยกเลิก</button>
          <button type="button" className="status-modal-close success" onClick={handleConfirm}>✅ บันทึกรูปนี้</button>
        </div>
      </div>
    </div>,
    document.body
  );
}