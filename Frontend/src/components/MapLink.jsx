import { useTranslation } from 'react-i18next';

export default function MapLink({ lat, lng, address }) {
  const { t } = useTranslation('common');
  if (lat == null || lng == null) return <span className="no-photo">—</span>;
  return (
    <div className="location-cell" title={address || ''}>
      {address && <div className="location-address">{address}</div>}
      <a className="map-link" href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">
        📍 {t('shared.viewOnMaps')}
      </a>
    </div>
  );
}
