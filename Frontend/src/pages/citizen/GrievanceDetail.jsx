import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GrievanceDetail() {
  const { t } = useTranslation('citizen');
  const { id } = useParams();

  return (
    <div className="form-panel panel">
      <span className="eyebrow" style={{ color: 'var(--primary)' }}>
        {t('grievanceDetail.reportNumber', { id })}
      </span>
      <h2>{t('grievanceDetail.heading')}</h2>
      <div className="empty" style={{ padding: '30px 0' }}>
        <div className="empty-icon">🗂️</div>
        <strong>{t('grievanceDetail.comingSoon')}</strong>
        <p>{t('grievanceDetail.comingSoonText')}</p>
        <Link className="button" to="/dashboard">
          {t('grievanceDetail.backToDashboard')}
        </Link>
      </div>
    </div>
  );
}
