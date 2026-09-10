import { useState } from 'react';

export default function PhotoThumb({ src, alt = 'Reported issue photo' }) {
  const [open, setOpen] = useState(false);
  if (!src) return <span className="no-photo">—</span>;
  return (
    <>
      <button type="button" className="thumb-btn" onClick={() => setOpen(true)}>
        <img src={src} alt={alt} />
      </button>
      {open && (
        <div className="camera-modal" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="camera-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            <img src={src} alt={alt} />
          </div>
        </div>
      )}
    </>
  );
}
