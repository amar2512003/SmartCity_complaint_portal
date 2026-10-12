import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyGrievances } from '../../api/grievance.api';
import ReportDate from '../../components/ReportDate';
import ResolutionEvidence from '../../components/ResolutionEvidence';
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

          <p className="report-submitted-date">{t('dashboard.submitted')} <ReportDate value={grievance.created_at} /></p>
          <section className="report-detail-section">
            <h3>{t('grievanceForm.fields.descriptionLabel')}</h3>
            <p className="grievance-detail-description">{grievance.description}</p>
          </section>

          <div className="grievance-detail-meta">
            <section className="report-detail-section">
              <h3>{t('dashboard.table.location')}</h3>
              <MapLink source={grievance.location_source} lat={grievance.latitude} lng={grievance.longitude} address={grievance.location_address} />
            </section>
            <section className="report-detail-section">
              <h3>{t('dashboard.table.routedTo')}</h3>
            <MunicipalBadge body={grievance.municipal_body} district={grievance.municipal_district} />
            </section>
          </div>

          <ResolutionEvidence report={grievance} />

          <Link className="ghost-btn" to="/dashboard" style={{ marginTop: 24, display: 'inline-block' }}>
            {t('grievanceDetail.backToDashboard')}
          </Link>
        </div>
      )}
    </div>
  );
}
