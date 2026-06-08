import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, large }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className={`modal-window ${large ? 'large' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Закрити">✕</button>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
