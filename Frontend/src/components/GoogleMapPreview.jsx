const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Small static Google Maps thumbnail with a marker, wrapped in a link that
// opens the full location in Google Maps. Falls back to a plain coordinate
// line if no VITE_GOOGLE_MAPS_API_KEY is configured, so the app still works
// without the key (just without the visual preview).
export default function GoogleMapPreview({ lat, lng, alt, className = '' }) {
  if (lat == null || lng == null) return null;

  const width = 400;
  const height = 160;
  const scale = 2; // retina
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const staticMapUrl = API_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=${width}x${height}&scale=${scale}&maptype=roadmap&markers=color:0xff6a1a%7C${lat},${lng}&key=${API_KEY}`
    : null;

  return (
    <a
      className={`geo-map-preview ${className}`.trim()}
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      title={alt || 'View on Google Maps'}
    >
      {staticMapUrl ? (
        <img src={staticMapUrl} alt={alt || 'Map preview'} loading="lazy" width={width} height={height} />
      ) : (
        <div className="geo-map-preview-fallback">
          🗺 {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      )}
      <span className="geo-map-preview-pin">📍</span>
    </a>
  );
}
