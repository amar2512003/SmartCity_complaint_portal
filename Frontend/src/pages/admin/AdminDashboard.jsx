import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllGrievances, updateStatus } from '../../api/grievance.api';
import PhotoThumb from '../../components/PhotoThumb';
import MapLink from '../../components/MapLink';
import MunicipalBadge from '../../components/MunicipalBadge';

const WEST_BENGAL_DISTRICTS = [
  'Alipurduar',
  'Bankura',
  'Paschim Bardhaman',
  'Purba Bardhaman',
  'Birbhum',
  'Cooch Behar',
  'Dakshin Dinajpur',
  'Darjeeling',
  'Hooghly',
  'Howrah',
  'Jalpaiguri',
  'Jhargram',
  'Kalimpong',
  'Kolkata',
  'Maldah',
  'Murshidabad',
  'Nadia',
  'North 24 Parganas',
  'Paschim Medinipur',
  'Purba Medinipur',
  'South 24 Parganas',
  'Uttar Dinajpur',
];

export default function AdminDashboard() {
  const { t } = useTranslation(['admin', 'common']);
  const ALL_DISTRICTS = t('dashboard.allDistricts');
  const [items, setItems] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(ALL_DISTRICTS);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await getAllGrievances();
      setItems(r.data.data);
      setMsg('');
    } catch (e) {
      setMsg(t('dashboard.loadError'));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = async (id, status) => {
    try {
      await updateStatus(id, status);
      load();
    } catch (e) {
      setMsg(t('dashboard.updateError'));
    }
  };

  // Filter grievances according to selected district
  const filteredItems =
    selectedDistrict === ALL_DISTRICTS
      ? items
      : items.filter(
          (g) =>
            g.municipal_district?.toLowerCase() ===
            selectedDistrict.toLowerCase()
        );

  // Statistics now reflect the selected district
  const pending = filteredItems.filter(
    (x) => x.status === 'pending'
  ).length;

  const progress = filteredItems.filter(
    (x) => x.status === 'in_progress'
  ).length;

  const resolved = filteredItems.filter(
    (x) => x.status === 'resolved'
  ).length;

  return (
    <>
      <div className="admin-banner">
        <div>
          <h1>{t('dashboard.heading')}</h1>
          <p>
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="admin-pill">
          ● {t('dashboard.operationsOnline')}
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
              {t('dashboard.reportCount', { count: filteredItems.length })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* District filter */}
            <select
              className="select-status"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                minWidth: '180px',
                height: '42px',
                cursor: 'pointer',
              }}
            >
              <option value={ALL_DISTRICTS}>{ALL_DISTRICTS}</option>
              {WEST_BENGAL_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <button
              className="ghost-btn"
              onClick={load}
            >
              ↻ {t('dashboard.refresh')}
            </button>
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

        {filteredItems.length === 0 && !msg ? (
          <div className="empty">
            <div className="empty-icon">⌁</div>

            <strong>{t('dashboard.empty.title')}</strong>

            <p>
              {selectedDistrict === ALL_DISTRICTS
                ? t('dashboard.empty.textAll')
                : t('dashboard.empty.textFiltered', { district: selectedDistrict })}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('dashboard.table.photo')}</th>
                  <th>{t('dashboard.table.id')}</th>
                  <th>{t('dashboard.table.citizen')}</th>
                  <th>{t('dashboard.table.issue')}</th>
                  <th>{t('dashboard.table.category')}</th>
                  <th>{t('dashboard.table.location')}</th>
                  <th>{t('dashboard.table.notify')}</th>
                  <th>{t('dashboard.table.status')}</th>
                  <th>{t('dashboard.table.update')}</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <PhotoThumb src={g.photo} />
                    </td>

                    <td>
                      #{g.id}
                    </td>

                    <td>
                      {g.citizen_name}
                    </td>

                    <td className="title-cell">
                      {g.title}
                    </td>

                    <td>
                      {t(`categories.${g.category}`, { ns: 'common', defaultValue: g.category })}
                    </td>

                    <td>
                      <MapLink
                        lat={g.latitude}
                        lng={g.longitude}
                        address={g.location_address}
                      />
                    </td>

                    <td>
                      <MunicipalBadge
                        body={g.municipal_body}
                        district={g.municipal_district}
                      />
                    </td>

                    <td>
                      <span
                        className={`status ${g.status}`}
                      >
                        {t(`statuses.${g.status}`, { ns: 'common', defaultValue: g.status.replace('_', ' ') })}
                      </span>
                    </td>

                    <td>
                      <select
                        className="select-status"
                        value={g.status}
                        onChange={(e) =>
                          change(g.id, e.target.value)
                        }
                      >
                        <option value="pending">
                          {t('statuses.pending', { ns: 'common' })}
                        </option>

                        <option value="in_progress">
                          {t('statuses.in_progress', { ns: 'common' })}
                        </option>

                        <option value="resolved">
                          {t('statuses.resolved', { ns: 'common' })}
                        </option>

                        <option value="rejected">
                          {t('statuses.rejected', { ns: 'common' })}
                        </option>
                      </select>
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
