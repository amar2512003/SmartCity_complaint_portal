import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PhotoThumb({ src, alt }) {
  const { t } = useTranslation('common');
  const displayAlt = alt ?? t('shared.reportedIssuePhoto');
  const [open, setOpen] = useState(false);
  if (!src) return <span className="no-photo">—</span>;
  return (
    <>
      <button type="button" className="thumb-btn" onClick={() => setOpen(true)}>
        <img src={src} alt={displayAlt} />
      </button>
      {open && (
        <div className="camera-modal" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="camera-close" onClick={() => setOpen(false)} aria-label={t('shared.close')}>✕</button>
            <img src={src} alt={displayAlt} />
          </div>
        </div>
      )}
    </>
  );
}
