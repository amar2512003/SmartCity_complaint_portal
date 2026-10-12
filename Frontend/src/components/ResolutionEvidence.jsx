import { useTranslation } from 'react-i18next';
import PhotoThumb from './PhotoThumb';

export default function ResolutionEvidence({ report, compact = false }) {
  const { t, i18n } = useTranslation('citizen');
  return (
    <section className={`resolution-evidence${compact ? ' evidence-compact' : ''}`} aria-label={t('evidence.heading')}>
      {!compact && <div className="evidence-heading"><h3>{t('evidence.heading')}</h3><p>{t('evidence.hint')}</p></div>}
      <div className="evidence-pair">
        {[['before', report.photo], ['after', report.resolution_photo]].map(([phase, src]) => (
          <div className={`evidence-photo evidence-${phase}`} key={phase}>
            <span className="evidence-label">{t(`evidence.${phase}`)}</span>
            {src ? <PhotoThumb src={src} alt={`${t(`evidence.${phase}`)}: ${report.title}`} /> : <div className="evidence-placeholder">{phase === 'after' ? t(report.status === 'resolved' ? 'evidence.missing' : 'evidence.pending') : '—'}</div>}
          </div>
        ))}
      </div>
      {!compact && report.resolved_at && <p className="evidence-date">{t('grievanceDetail.resolvedOn', { date: new Date(report.resolved_at).toLocaleDateString(i18n.resolvedLanguage === 'bn' ? 'bn-IN' : 'en-IN') })}</p>}
    </section>
  );
}
