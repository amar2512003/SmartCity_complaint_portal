import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyGrievances } from '../../api/grievance.api';
import { useAuth } from '../../context/AuthContext';
import PhotoThumb from '../../components/PhotoThumb';
import MapLink from '../../components/MapLink';
import MunicipalBadge from '../../components/MunicipalBadge';

const label = (s) => s.replace('_', ' ');

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
        setMsg('Could not load your grievances.');
      }
    };

    load();
  }, []);

  const load = async () => {
    try {
      const r = await getMyGrievances();
      setItems(r.data.data);
      setMsg('');
    } catch (e) {
      setMsg('Could not load your grievances.');
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
            Citizen dashboard
          </span>

          <AnimatedGreeting name={user?.name} />

          <p>
            Here’s the latest on the issues you’ve reported.
          </p>
        </div>

        <div className="actions">
          <button
            className="ghost-btn"
            onClick={load}
          >
            ↻ Refresh
          </button>

          <Link
            className="button"
            to="/grievance/new"
          >
            ＋ Report an issue
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="panel stat">
          <div className="stat-top">
            <span>Pending</span>
            <span className="stat-icon">◷</span>
          </div>

          <div className="stat-number">
            {pending}
          </div>
        </div>

        <div className="panel stat">
          <div className="stat-top">
            <span>In progress</span>
            <span className="stat-icon">↗</span>
          </div>

          <div className="stat-number">
            {progress}
          </div>
        </div>

        <div className="panel stat">
          <div className="stat-top">
            <span>Resolved</span>
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
            <h3>Your grievances</h3>

            <span>
              {items.length} report
              {items.length !== 1 ? 's' : ''} submitted
            </span>
          </div>

          <span>Live status</span>
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

            <strong>No grievances yet</strong>

            <p>
              When you report a civic issue, it will appear here.
            </p>

            <Link
              className="button"
              to="/grievance/new"
            >
              Report your first issue
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Routed to</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((g) => (
                  <tr key={g.id}>
                    <td data-label="Photo">
                      <PhotoThumb src={g.photo} />
                    </td>

                    <td
                      data-label="Issue"
                      className="title-cell"
                    >
                      {g.title}
                    </td>

                    <td data-label="Category">
                      {g.category}
                    </td>

                    <td
                      data-label="Location"
                      className="location-cell"
                    >
                      <MapLink
                        lat={g.latitude}
                        lng={g.longitude}
                        address={g.location_address}
                      />
                    </td>

                    <td
                      data-label="Routed to"
                      className="location-cell"
                    >
                      <MunicipalBadge
                        body={g.municipal_body}
                        district={g.municipal_district}
                      />
                    </td>

                    <td data-label="Status">
                      <span
                        className={`status ${g.status}`}
                      >
                        {label(g.status)}
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