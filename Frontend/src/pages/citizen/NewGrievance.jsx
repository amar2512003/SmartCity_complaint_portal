import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createGrievance } from '../../api/grievance.api';
import Message from '../../components/Message';
import PhotoCapture from '../../components/PhotoCapture';

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

export default function NewGrievance() {
  const { t } = useTranslation(['citizen', 'common']);

  const [f, setF] = useState({
    title: '',
    category: 'Road',
    description: '',
  });

  const [photo, setPhoto] = useState('');
  const [loc, setLoc] = useState(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    setErr(false);

    if (!photo) {
      setErr(true);
      setMsg(t('grievanceForm.errors.photoRequired'));
      return;
    }

    if (locationBusy || !loc?.locationConfirmed) {
      setErr(true); setMsg(t('photoCapture.confirmRequired')); return;
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

  const detailsReady = f.title.trim().length >= 3 && f.description.trim().length >= 5;
  const checks = [detailsReady, Boolean(photo), Boolean(loc?.locationConfirmed) && !locationBusy];

  return (
    <div className="report-workspace">
      <header className="report-heading">
        <span className="eyebrow">{t('grievanceForm.eyebrow')}</span>
        <h1>{t('reportFlow.heading')}</h1>
        <p>{t('reportFlow.subtitle')}</p>
      </header>
      <div className="report-layout">
        <form className="report-form" onSubmit={submit}>
          <section className="report-section" aria-labelledby="details-heading">
            <div className="report-section-heading"><span>01</span><div><h2 id="details-heading">{t('reportFlow.details')}</h2><p>{t('reportFlow.detailsHint')}</p></div></div>
            <div className="field">
              <label htmlFor="issue-category">{t('grievanceForm.fields.categoryLabel')} <span className="required">*</span></label>
              <div className="category-shortcuts" role="group" aria-label={t('grievanceForm.fields.categoryLabel')}>
                {['Road', 'Water', 'Garbage', 'Street Light'].map((category, index) => <button key={category} type="button" aria-pressed={f.category === category} onClick={() => setF({ ...f, category })}><span aria-hidden="true">{['↗', '≈', '♧', '☀'][index]}</span>{t(`categories.${category}`, { ns: 'common' })}</button>)}
              </div>
              <select id="issue-category" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
                {CATEGORY_VALUES.map(value => <option key={value} value={value}>{t(`categories.${value}`, { ns: 'common', defaultValue: value })}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="issue-title">{t('grievanceForm.fields.titleLabel')} <span className="required">*</span></label>
              <input id="issue-title" minLength={3} required placeholder={t('grievanceForm.fields.titlePlaceholder')} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="issue-description">{t('grievanceForm.fields.descriptionLabel')} <span className="required">*</span></label>
              <textarea id="issue-description" minLength={5} required placeholder={t('grievanceForm.fields.descriptionPlaceholder')} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
            </div>
          </section>
          <section className="report-section" aria-labelledby="evidence-heading">
            <div className="report-section-heading"><span>02</span><div><h2 id="evidence-heading">{t('reportFlow.evidence')}</h2><p>{t('reportFlow.evidenceHint')}</p></div></div>
            <PhotoCapture value={photo} onChange={setPhoto} onLocationChange={setLoc} onBusyChange={setLocationBusy} required />
          </section>
          <div className="report-submit-area">
            <Message text={msg} error={err} />
            <p>{t('reportFlow.submitHint')}</p>
            <div className="report-actions">
              <button className="ghost-btn" type="button" onClick={() => nav('/dashboard')}>{t('grievanceForm.cancel')}</button>
              <button className="primary-btn" type="submit" disabled={loading || locationBusy}>{loading ? t('grievanceForm.submitting') : t('grievanceForm.submit')} <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </form>
        <aside className="report-guide">
          <div className="report-checklist">
            <span className="eyebrow">{t('reportFlow.checklist')}</span>
            <h2>{t('reportFlow.progress', { count: checks.filter(Boolean).length })}</h2>
            <div className="report-progress" role="progressbar" aria-label={t('reportFlow.checklist')} aria-valuemin={0} aria-valuemax={3} aria-valuenow={checks.filter(Boolean).length}><span style={{ width: `${checks.filter(Boolean).length / 3 * 100}%` }} /></div>
            <ul>{['detailsCheck', 'photoCheck', 'locationCheck'].map((key, i) => <li key={key} className={checks[i] ? 'complete' : ''}><span aria-hidden="true">{checks[i] ? '✓' : String(i + 1).padStart(2, '0')}</span>{t(`reportFlow.${key}`)}{checks[i] && <span className="sr-only"> ✓</span>}</li>)}</ul>
          </div>
          <div className="report-trust"><span className="report-trust-icon" aria-hidden="true">✓</span><h3>{t('reportFlow.proofTitle')}</h3><p>{t('reportFlow.proofText')}</p><div className="report-proof-labels"><span>{t('evidence.before')}</span><span aria-hidden="true">→</span><span>{t('evidence.after')}</span></div></div>
          <p className="report-help">{t('reportFlow.routingHint')}</p>
        </aside>
      </div>
    </div>
  );
}
