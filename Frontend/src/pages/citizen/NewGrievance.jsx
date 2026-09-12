import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createGrievance } from '../../api/grievance.api';
import Message from '../../components/Message';
import PhotoCapture from '../../components/PhotoCapture';
import victoriaMemorial from '../../assets/victoria-memorial.png';

const CATEGORY_VALUES = [
  'Road',
  'Water',
  'Drainage / Waterlogging',
  'Sewage',
  'Garbage',
  'Sanitation / Public Toilet',
  'Street Light',
  'Traffic & Parking',
  'Stray Animals',
  'Illegal Construction / Encroachment',
  'Fallen Tree / Storm Damage',
  'Public Property Damage',
  'Mosquito Breeding / Pest Control',
  'Noise Pollution',
  'Other',
];

function ordinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Date/time badge is shown in the active UI language: Bengali locale gives
// Bengali weekday/month names (and Bengali numerals) via Intl; English keeps
// the original "25th Sep '26" ordinal-day style, which has no clean Bengali
// equivalent.
function formatReportDate(date, lang) {
  if (lang === 'bn') {
    return date.toLocaleDateString('bn-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  }
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day}${ordinalSuffix(day)} ${month} '${year}`;
}

function formatReportTime(date, lang) {
  return date.toLocaleTimeString(lang === 'bn' ? 'bn-IN' : 'en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDayLabel(date, lang) {
  return date.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-US', { weekday: 'short' }).toUpperCase();
}

export default function NewGrievance() {
  const { t, i18n } = useTranslation(['citizen', 'common']);
  const lang = i18n.resolvedLanguage || 'en';

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
      setMsg(t('grievanceForm.errors.photoRequired'));
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

      setMsg(t('grievanceForm.success'));

      setTimeout(() => nav('/dashboard'), 700);
    } catch (e) {
      setErr(true);
      setMsg(
        e.response?.data?.message ||
          t('grievanceForm.errors.submitFailed')
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
            {t('grievanceForm.eyebrow')}
          </span>

          <h1>
            {t('grievanceForm.headingLine1')}
            <br />
            {t('grievanceForm.headingLine2Prefix')}<span>{t('grievanceForm.headingHighlight')}</span>
          </h1>

          <p className="grievance-intro-text">
            {t('grievanceForm.introText')}
          </p>

          <div className="grievance-features">

            <div className="grievance-feature">
              <div className="feature-icon">
                📷
              </div>

              <div>
                <strong>{t('grievanceForm.features.photo.title')}</strong>
                <span>
                  {t('grievanceForm.features.photo.text')}
                </span>
              </div>
            </div>

            <div className="grievance-feature">
              <div className="feature-icon">
                📍
              </div>

              <div>
                <strong>{t('grievanceForm.features.location.title')}</strong>
                <span>
                  {t('grievanceForm.features.location.text')}
                </span>
              </div>
            </div>

            <div className="grievance-feature">
              <div className="feature-icon">
                🏛
              </div>

              <div>
                <strong>{t('grievanceForm.features.routing.title')}</strong>
                <span>
                  {t('grievanceForm.features.routing.text')}
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
                {t('grievanceForm.formStep')}
              </span>

              <h2>
                {t('grievanceForm.formHeading')}
              </h2>

              <p>
                {t('grievanceForm.formSubtitle')}
              </p>
            </div>

            <div className="report-number">
              <span>{formatDayLabel(now, lang)}</span>
              <strong>{formatReportDate(now, lang)}</strong>
              <small>{formatReportTime(now, lang)}</small>
            </div>

          </div>


          <form onSubmit={submit}>

            <div className="form-grid">

              {/* ISSUE TITLE */}
              <div className="field">

                <label>
                  {t('grievanceForm.fields.titleLabel')}
                  <span className="required">*</span>
                </label>

                <input
                  placeholder={t('grievanceForm.fields.titlePlaceholder')}
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
                  {t('grievanceForm.fields.categoryLabel')}
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
                  {CATEGORY_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t(`categories.${value}`, { ns: 'common', defaultValue: value })}
                    </option>
                  ))}
                </select>

              </div>


              {/* DESCRIPTION */}
              <div className="field full-field">

                <div className="label-row">
                  <label>
                    {t('grievanceForm.fields.descriptionLabel')}
                    <span className="required">*</span>
                  </label>

                  <span className="field-hint">
                    {t('grievanceForm.fields.descriptionHint')}
                  </span>
                </div>

                <textarea
                  placeholder={t('grievanceForm.fields.descriptionPlaceholder')}
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
                    {t('grievanceForm.locationConfirmed.title')}
                  </strong>

                  <span>
                    {t('grievanceForm.locationConfirmed.text')}
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
                {t('grievanceForm.cancel')}
              </button>

              <button
                className="primary-btn submit-report-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  t('grievanceForm.submitting')
                ) : (
                  <>
                    {t('grievanceForm.submit')}
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
