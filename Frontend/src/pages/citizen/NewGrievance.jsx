import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGrievance } from '../../api/grievance.api';
import Message from '../../components/Message';
import PhotoCapture from '../../components/PhotoCapture';
import victoriaMemorial from '../../assets/victoria-memorial.png';

function ordinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatReportDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day}${ordinalSuffix(day)} ${month} '${year}`;
}

function formatReportTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDayLabel(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

export default function NewGrievance() {
  const [f, setF] = useState({
    title: '',
    category: 'Road',
    description: '',
  });

  const [photo, setPhoto] = useState('');
  const [loc, setLoc] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    setErr(false);

    if (!photo) {
      setErr(true);
      setMsg('Please add a photo of the issue before submitting.');
      return;
    }

    setMsg('');
    setLoading(true);

    try {
      await createGrievance({
        ...f,
        photo,
        ...(loc || {}),
      });

      setMsg('Your grievance was submitted successfully.');

      setTimeout(() => nav('/dashboard'), 700);
    } catch (e) {
      setErr(true);
      setMsg(
        e.response?.data?.message ||
          'Could not submit the grievance.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-grievance-page">

      <div className="grievance-shell">

        {/* LEFT SIDE */}
        <aside className="grievance-intro">

          <span className="eyebrow">
            CIVIC REPORT
          </span>

          <h1>
            Help make
            <br />
            your city <span>better.</span>
          </h1>

          <p className="grievance-intro-text">
            Report a civic issue with enough detail for the
            concerned team to understand and act quickly.
          </p>

          <div className="grievance-features">

            <div className="grievance-feature">
              <div className="feature-icon">
                📷
              </div>

              <div>
                <strong>Photo evidence</strong>
                <span>
                  Show the issue exactly as you found it.
                </span>
              </div>
            </div>

            <div className="grievance-feature">
              <div className="feature-icon">
                📍
              </div>

              <div>
                <strong>Precise location</strong>
                <span>
                  Your location helps identify the exact spot.
                </span>
              </div>
            </div>

            <div className="grievance-feature">
              <div className="feature-icon">
                🏛
              </div>

              <div>
                <strong>Smart routing</strong>
                <span>
                  Your report is routed to the relevant authority.
                </span>
              </div>
            </div>

          </div>

          {/* VICTORIA MEMORIAL */}
          <img
            src={victoriaMemorial}
            alt=""
            className="victoria-memorial"
          />

          {/* CITY DECORATION */}
          <div className="grievance-city-art">
            <div className="city-sun"></div>
            <div className="city-building building-one"></div>
            <div className="city-building building-two"></div>
            <div className="city-building building-three"></div>
            <div className="city-building building-four"></div>
            <div className="city-ground"></div>
          </div>

        </aside>


        {/* RIGHT SIDE */}
        <main className="grievance-form-card">

          <div className="grievance-form-header">

            <div>
              <span className="form-step">
                REPORT DETAILS
              </span>

              <h2>
                Tell us what happened
              </h2>

              <p>
                Add the issue details below.
              </p>
            </div>

            <div className="report-number">
              <span>{formatDayLabel(now)}</span>
              <strong>{formatReportDate(now)}</strong>
              <small>{formatReportTime(now)}</small>
            </div>

          </div>


          <form onSubmit={submit}>

            <div className="form-grid">

              {/* ISSUE TITLE */}
              <div className="field">

                <label>
                  Issue title
                  <span className="required">*</span>
                </label>

                <input
                  placeholder="e.g. Pothole on Main Road"
                  value={f.title}
                  onChange={(e) =>
                    setF({
                      ...f,
                      title: e.target.value,
                    })
                  }
                  required
                />

              </div>


              {/* CATEGORY */}
              <div className="field">

                <label>
                  Category
                  <span className="required">*</span>
                </label>

                <select
                  value={f.category}
                  onChange={(e) =>
                    setF({
                      ...f,
                      category: e.target.value,
                    })
                  }
                >
                  <option>Road</option>
                  <option>Water</option>
                  <option>Drainage / Waterlogging</option>
                  <option>Sewage</option>
                  <option>Garbage</option>
                  <option>Sanitation / Public Toilet</option>
                  <option>Street Light</option>
                  <option>Traffic & Parking</option>
                  <option>Stray Animals</option>
                  <option>Illegal Construction / Encroachment</option>
                  <option>Fallen Tree / Storm Damage</option>
                  <option>Public Property Damage</option>
                  <option>Mosquito Breeding / Pest Control</option>
                  <option>Noise Pollution</option>
                  <option>Other</option>
                </select>

              </div>


              {/* DESCRIPTION */}
              <div className="field full-field">

                <div className="label-row">
                  <label>
                    Description
                    <span className="required">*</span>
                  </label>

                  <span className="field-hint">
                    Be specific
                  </span>
                </div>

                <textarea
                  placeholder="Describe what happened, where it is, and anything else the city team should know..."
                  value={f.description}
                  onChange={(e) =>
                    setF({
                      ...f,
                      description: e.target.value,
                    })
                  }
                  required
                />

              </div>


              {/* PHOTO */}
              <div className="field full-field">

                <div className="photo-capture-wrapper">
                  <PhotoCapture
                    value={photo}
                    onChange={setPhoto}
                    onLocationChange={setLoc}
                    required
                  />
                </div>

              </div>

            </div>


            {/* LOCATION CONFIRMATION */}
            {loc && (
              <div className="location-confirmation">

                <div className="location-check">
                  ✓
                </div>

                <div>
                  <strong>
                    Location captured
                  </strong>

                  <span>
                    Your report will include the exact location
                    and municipal routing information.
                  </span>
                </div>

              </div>
            )}


            {/* FORM FOOTER */}
            <div className="grievance-form-footer">

              <button
                className="ghost-btn"
                type="button"
                onClick={() => nav('/dashboard')}
              >
                Cancel
              </button>

              <button
                className="primary-btn submit-report-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  'Submitting…'
                ) : (
                  <>
                    Submit report
                    <span>→</span>
                  </>
                )}
              </button>

            </div>

          </form>

          <Message
            text={msg}
            error={err}
          />

        </main>

      </div>

    </div>
  );
}