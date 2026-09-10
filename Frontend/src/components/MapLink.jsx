export default function MapLink({ lat, lng, address }) {
  if (lat == null || lng == null) return <span className="no-photo">—</span>;
  return (
    <div className="location-cell" title={address || ''}>
      {address && <div className="location-address">{address}</div>}
      <a className="map-link" href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">
        📍 View on map
      </a>
    </div>
  );
}
