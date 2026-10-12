import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyGrievances } from '../../api/grievance.api';
import { useAuth } from '../../context/AuthContext';
import ReportDate from '../../components/ReportDate';
import KolkataRiverScene from '../../components/KolkataRiverScene';

function AnimatedGreeting({ name }) {
  const { i18n } = useTranslation();
  const bengaliUI = i18n.resolvedLanguage === 'bn';
  const firstName = name?.trim().split(/\s+/)[0] || (bengaliUI ? 'নাগরিক' : 'neighbour');
  const [phase, setPhase] = useState('hello');

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let namaskarTimer;
    let returnTimer;
    const start = () => {
      clearTimeout(namaskarTimer);
      clearTimeout(returnTimer);
      if (motion.matches) {
        setPhase(bengaliUI ? 'namaskar' : 'hello');
        return;
      }
      setPhase('hello');
      namaskarTimer = setTimeout(() => setPhase('namaskar'), 800);
      if (!bengaliUI) returnTimer = setTimeout(() => setPhase('hello'), 1800);
    };
    start();
    motion.addEventListener('change', start);
    return () => {
      clearTimeout(namaskarTimer);
      clearTimeout(returnTimer);
      motion.removeEventListener('change', start);
    };
  }, [firstName, bengaliUI]);

  return (
    <h1 aria-label={`${bengaliUI ? 'নমস্কার' : 'Hello'}, ${firstName}.`}>
      <span key={phase} className="dashboard-greeting" aria-hidden="true">
        <span className="greeting-salutation" lang={phase === 'namaskar' ? 'bn' : 'en'}>
          <span className="greeting-gesture">{phase === 'namaskar' ? '🙏' : '👋'}</span>{' '}
          {phase === 'namaskar' ? 'নমস্কার, ' : 'Hello, '}
        </span>
        <em>{firstName}.</em>
      </span>
    </h1>
  );
}
export default function Dashboard() {
  const { t } = useTranslation(['citizen', 'common']);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const r = await getMyGrievances();
      setItems(r.data.data);
      setMsg('');
    } catch (e) {
      setMsg(t('dashboard.loadError'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
      <div className="hero-row dashboard-hero">
        <div className="dashboard-welcome">
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
              onClick={load} disabled={loading}
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
        <KolkataRiverScene />
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

        </div>

        {msg && (
          <div
            className="message error"
            style={{ margin: 16 }}
          >
            {msg}
          </div>
        )}

        {loading ? <div className="loading-state" role="status">{t('dashboard.loading')}</div> : items.length === 0 && !msg ? (
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
          <ul className="citizen-report-list" aria-label={t('dashboard.tableHeading')}>
            {items.map(g => (
              <li key={g.id} className="citizen-report-row">
                <div className="citizen-report-summary">
                  <h3>{g.title}</h3>
                  <p><span>{t('dashboard.submitted')} </span><ReportDate value={g.created_at} /></p>
                </div>
                <Link className="ghost-btn track-status-button" to={`/grievance/${g.id}`} aria-label={`${t('dashboard.trackStatus')}: ${g.title}`}>
                  {t('dashboard.trackStatus')} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
