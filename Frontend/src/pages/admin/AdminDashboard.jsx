import { useEffect, useState } from 'react';
import { getAllGrievances, updateStatus } from '../../api/grievance.api';
import PhotoThumb from '../../components/PhotoThumb';
import MapLink from '../../components/MapLink';
import MunicipalBadge from '../../components/MunicipalBadge';

const label = (s) => s.replace('_', ' ');

const WEST_BENGAL_DISTRICTS = [
  'All Districts',
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
  const [items, setItems] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await getAllGrievances();
      setItems(r.data.data);
      setMsg('');
    } catch (e) {
      setMsg('Could not load grievances.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = async (id, status) => {
    try {
      await updateStatus(id, status);
      load();
    } catch (e) {
      setMsg('Could not update status.');
    }
  };

  // Filter grievances according to selected district
  const filteredItems =
    selectedDistrict === 'All Districts'
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
          <h1>Grievance desk</h1>
          <p>
            Review and move citizen reports through the resolution workflow.
          </p>
        </div>

        <div className="admin-pill">
          ● Operations online
        </div>
      </div>

      <div className="stat-grid">
        <div className="panel stat">
          <div className="stat-top">
            <span>Awaiting review</span>
            <span className="stat-icon">◷</span>
          </div>

          <div className="stat-number">
            {pending}
          </div>
        </div>

        <div className="panel stat">
          <div className="stat-top">
            <span>Being handled</span>
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
            <h3>Citizen reports</h3>

            <span>
              {filteredItems.length} total grievance
              {filteredItems.length !== 1 ? 's' : ''}
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
              ↻ Refresh
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

            <strong>No reports found</strong>

            <p>
              {selectedDistrict === 'All Districts'
                ? 'New citizen grievances will appear here.'
                : `No grievances found for ${selectedDistrict} district.`}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>ID</th>
                  <th>Citizen</th>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Notify</th>
                  <th>Status</th>
                  <th>Update</th>
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
                      {g.category}
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
                        {label(g.status)}
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
                          Pending
                        </option>

                        <option value="in_progress">
                          In progress
                        </option>

                        <option value="resolved">
                          Resolved
                        </option>

                        <option value="rejected">
                          Rejected
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