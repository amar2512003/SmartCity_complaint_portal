import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyGrievances } from '../../api/grievance.api';
import PhotoThumb from '../../components/PhotoThumb';
import MapLink from '../../components/MapLink';
import MunicipalBadge from '../../components/MunicipalBadge';

// There's no single-grievance API endpoint yet — the citizen's full list
// already carries every field this page needs, so we fetch that and find
// the one we want. If a dedicated GET /grievances/:id is added later, swap
// the load() body below for that call.
export default function GrievanceDetail() {
  const { t } = useTranslation(['citizen', 'common']);
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | found | not-found | error

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await getMyGrievances();
        if (cancelled) return;
        const match = r.data.data.find((g) => String(g.id) === String(id));
        if (match) {
          setGrievance(match);
          setStatus('found');
        } else {
          setStatus('not-found');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="form-panel panel grievance-detail-panel">
      <span className="eyebrow" style={{ color: 'var(--primary)' }}>
        {t('grievanceDetail.reportNumber', { id })}
      </span>
      <h2>{t('grievanceDetail.heading')}</h2>

      {status === 'loading' && (
        <div className="empty" style={{ padding: '30px 0' }}>
          <p>{t('grievanceDetail.loading')}</p>
        </div>
      )}

      {(status === 'not-found' || status === 'error') && (
        <div className="empty" style={{ padding: '30px 0' }}>
          <div className="empty-icon">🗂️</div>
          <strong>{status === 'not-found' ? t('grievanceDetail.notFound') : t('grievanceDetail.loadError')}</strong>
          <Link className="button" to="/dashboard">
            {t('grievanceDetail.backToDashboard')}
          </Link>
        </div>
      )}

      {status === 'found' && grievance && (
        <div className="grievance-detail-body">
          <div className="grievance-detail-head">
            <div>
              <h3 className="title-cell">{grievance.title}</h3>
              <span>{t(`categories.${grievance.category}`, { ns: 'common', defaultValue: grievance.category })}</span>
            </div>
            <span className={`status ${grievance.status}`}>
              {t(`statuses.${grievance.status}`, { ns: 'common', defaultValue: grievance.status.replace('_', ' ') })}
            </span>
          </div>

          <p className="grievance-detail-description">{grievance.description}</p>

          <div className="grievance-detail-meta">
            <MapLink lat={grievance.latitude} lng={grievance.longitude} address={grievance.location_address} />
            <MunicipalBadge body={grievance.municipal_body} district={grievance.municipal_district} />
          </div>

          <div className="before-after-grid">
            <div className="before-after-card">
              <span className="before-after-label">{t('grievanceDetail.beforePhoto')}</span>
              <PhotoThumb src={grievance.photo} alt={t('grievanceDetail.beforePhoto')} />
            </div>

            <div className="before-after-card">
              <span className="before-after-label">{t('grievanceDetail.afterPhoto')}</span>
              {grievance.resolution_photo ? (
                <>
                  <PhotoThumb src={grievance.resolution_photo} alt={t('grievanceDetail.afterPhoto')} />
                  {grievance.resolved_at && (
                    <span className="before-after-timestamp">
                      {t('grievanceDetail.resolvedOn', { date: new Date(grievance.resolved_at).toLocaleDateString() })}
                    </span>
                  )}
                </>
              ) : (
                <div className="before-after-pending">
                  <span className="no-photo">—</span>
                  <p>{t('grievanceDetail.notResolvedYet')}</p>
                </div>
              )}
            </div>
          </div>

          <Link className="ghost-btn" to="/dashboard" style={{ marginTop: 24, display: 'inline-block' }}>
            {t('grievanceDetail.backToDashboard')}
          </Link>
        </div>
      )}
    </div>
  );
}
