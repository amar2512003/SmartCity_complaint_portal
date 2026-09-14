import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhotoCapture from './PhotoCapture';
import Message from './Message';
import { resolveGrievance } from '../api/grievance.api';

// Wraps the existing PhotoCapture component (which already handles camera +
// geolocation + reverse geocoding) to collect the admin's on-site proof
// photo. The actual before/after location match is verified server-side —
// see backend/src/controllers/admin.controller.js#resolve — this component
// just surfaces the mismatch error the API sends back if the admin isn't
// close enough to the reported site.
export default function ResolveGrievanceModal({ grievanceId, onClose, onResolved }) {
  const { t } = useTranslation('admin');
  const [photo, setPhoto] = useState('');
  const [loc, setLoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!photo || !loc) {
      setError(t('resolveModal.errors.photoRequired'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const r = await resolveGrievance(grievanceId, {
        photo,
        latitude: loc.latitude,
        longitude: loc.longitude,
        locationAccuracy: loc.locationAccuracy,
        locationAddress: loc.locationAddress,
      });
      onResolved(r.data.data);
    } catch (e) {
      setError(e.response?.data?.message || t('resolveModal.errors.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="camera-modal" role="dialog" aria-modal="true">
      <div className="resolve-modal-card">
        <button
          type="button"
          className="camera-close resolve-modal-close"
          onClick={onClose}
          aria-label={t('resolveModal.close')}
        >
          ✕
        </button>

        <h3>{t('resolveModal.heading')}</h3>
        <p className="resolve-modal-subtitle">{t('resolveModal.subtitle')}</p>

        <PhotoCapture
          value={photo}
          onChange={setPhoto}
          onLocationChange={setLoc}
          label={t('resolveModal.photoLabel')}
          required
        />

        <Message text={error} error />

        <div className="resolve-modal-footer">
          <button type="button" className="ghost-btn" onClick={onClose} disabled={submitting}>
            {t('resolveModal.cancel')}
          </button>
          <button type="button" className="primary-btn" onClick={submit} disabled={submitting || !photo}>
            {submitting ? t('resolveModal.submitting') : t('resolveModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
