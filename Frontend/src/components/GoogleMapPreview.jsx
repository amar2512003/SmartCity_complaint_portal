import { useTranslation } from 'react-i18next';

// Lazy iframe avoids one JS map instance per report and works without a JS API key.
// Keep the external link available if Google is blocked/offline.
export default function GoogleMapPreview({ lat, lng, alt, className = '' }) {
  const { t } = useTranslation('common');
  if (lat == null || lng == null || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng)) || Math.abs(Number(lat)) > 90 || Math.abs(Number(lng)) > 180) return null;
  const position = `${Number(lat)},${Number(lng)}`;
  return (
    <div className={`location-map ${className}`}>
      <iframe className="geo-map-preview" title={alt || t('shared.mapPreview')}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(position)}&z=16&output=embed`}
        loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(position)}`} target="_blank" rel="noreferrer">
        📍 {t('shared.viewOnMaps')}
      </a>
    </div>
  );
}
