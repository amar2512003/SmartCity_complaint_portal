import GoogleMapPreview from './GoogleMapPreview';
import { useTranslation } from 'react-i18next';

export default function MapLink({ lat, lng, address, source }) {
  const { t } = useTranslation('common');
  if (lat == null || lng == null) return <span className="no-photo">—</span>;
  return (
    <div className="location-cell" title={address || ''}>
      {source === 'manual' && <small>{t('shared.manuallyCorrected')}</small>}
      {address && <div className="location-address">{address}</div>}
      <GoogleMapPreview lat={lat} lng={lng} alt={address || t('shared.mapPreview')} />
    </div>
  );
}
