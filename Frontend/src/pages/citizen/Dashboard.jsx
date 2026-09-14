import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyGrievances } from '../../api/grievance.api';
import { useAuth } from '../../context/AuthContext';
import PhotoThumb from '../../components/PhotoThumb';
import MapLink from '../../components/MapLink';
import MunicipalBadge from '../../components/MunicipalBadge';

function AnimatedGreeting({ name }) {
  const [text, setText] = useState('');

  const firstName = name?.split(' ')[0] || 'there';

  useEffect(() => {
    const english = `Hello, ${firstName}.`;
    const bengali = `নমস্কার, ${firstName}.`;

    let index = 0;
    let typeTimer;
    let bengaliTimer;
    let englishTimer;

    // Type "Hello, Name."
    typeTimer = setInterval(() => {
      index += 1;
      setText(english.slice(0, index));

      if (index >= english.length) {
        clearInterval(typeTimer);

        // Short pause before Bengali
        bengaliTimer = setTimeout(() => {
          setText(`🙏 ${bengali}`);

          // Short pause before returning to English
          englishTimer = setTimeout(() => {
            setText(english);
          }, 550);
        }, 300);
      }
    }, 100);

    return () => {
      clearInterval(typeTimer);
      clearTimeout(bengaliTimer);
      clearTimeout(englishTimer);
    };
  }, [firstName]);

  return (
    <h1>
      {text.startsWith('🙏') ? '' : '👋 '}
      {text}
    </h1>
  );
}
export default function Dashboard() {
  const { t } = useTranslation(['citizen', 'common']);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getMyGrievances();
        setItems(r.data.data);
        setMsg('');
      } catch (e) {
        setMsg(t('dashboard.loadError'));
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      const r = await getMyGrievances();
      setItems(r.data.data);
      setMsg('');
    } catch (e) {
      setMsg(t('dashboard.loadError'));
    }
  };

  const pending = items.filter(
    (x) => x.status === 'pending'
  ).length;

  const progress = items.filter(
    (x) => x.status === 'in_progress'
  ).length;

  const resolved = items.filter(
    (x) => x.status === 'resolved'
  ).length;

  return (
    <>
      <div className="hero-row">
        <div>
          <span
            className="eyebrow"
            style={{ color: 'var(--primary)' }}
          >
            {t('dashboard.eyebrow')}
          </span>

          <AnimatedGreeting name={user?.name} />

          <p>
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="actions">
          <button
            className="ghost-btn"
            onClick={load}
          >
            ↻ {t('dashboard.refresh')}
          </button>

          <Link
            className="button"
            to="/grievance/new"
          >
            ＋ {t('dashboard.reportIssue')}
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="panel stat">
          <div className="stat-top">
            <span>{t('dashboard.stats.pending')}</span>
            <span className="stat-icon">◷</span>
          </div>

          <div className="stat-number">
            {pending}
          </div>
        </div>

        <div className="panel stat">
          <div className="stat-top">
            <span>{t('dashboard.stats.inProgress')}</span>
            <span className="stat-icon">↗</span>
          </div>

          <div className="stat-number">
            {progress}
          </div>
        </div>

        <div className="panel stat">
          <div className="stat-top">
            <span>{t('dashboard.stats.resolved')}</span>
            <span className="stat-icon">✓</span>
          </div>

          <div className="stat-number">
            {resolved}
          </div>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>{t('dashboard.tableHeading')}</h3>

            <span>
              {t('dashboard.reportCount', { count: items.length })}
            </span>
          </div>

          <span>{t('dashboard.liveStatus')}</span>
        </div>

        {msg && (
          <div
            className="message error"
            style={{ margin: 16 }}
          >
            {msg}
          </div>
        )}

        {items.length === 0 && !msg ? (
          <div className="empty">
            <div className="empty-icon">⌁</div>

            <strong>{t('dashboard.empty.title')}</strong>

            <p>
              {t('dashboard.empty.text')}
            </p>

            <Link
              className="button"
              to="/grievance/new"
            >
              {t('dashboard.empty.cta')}
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('dashboard.table.photo')}</th>
                  <th>{t('dashboard.table.issue')}</th>
                  <th>{t('dashboard.table.category')}</th>
                  <th>{t('dashboard.table.location')}</th>
                  <th>{t('dashboard.table.routedTo')}</th>
                  <th>{t('dashboard.table.status')}</th>
                </tr>
              </thead>

              <tbody>
                {items.map((g) => (
                  <tr key={g.id}>
                    <td data-label={t('dashboard.table.photo')}>
                      <PhotoThumb src={g.photo} />
                    </td>

                    <td
                      data-label={t('dashboard.table.issue')}
                      className="title-cell"
                    >
                      <Link to={`/grievance/${g.id}`}>{g.title}</Link>
                    </td>

                    <td data-label={t('dashboard.table.category')}>
                      {t(`categories.${g.category}`, { ns: 'common', defaultValue: g.category })}
                    </td>

                    <td
                      data-label={t('dashboard.table.location')}
                      className="location-cell"
                    >
                      <MapLink
                        lat={g.latitude}
                        lng={g.longitude}
                        address={g.location_address}
                      />
                    </td>

                    <td
                      data-label={t('dashboard.table.routedTo')}
                      className="location-cell"
                    >
                      <MunicipalBadge
                        body={g.municipal_body}
                        district={g.municipal_district}
                      />
                    </td>

                    <td data-label={t('dashboard.table.status')}>
                      <span
                        className={`status ${g.status}`}
                      >
                        {t(`statuses.${g.status}`, { ns: 'common', defaultValue: g.status.replace('_', ' ') })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
