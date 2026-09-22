import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

// Small locked-down Google Map preview (Maps JavaScript API, not the Static
// Maps API — the JS API is the one that tends to already be enabled on demo
// keys). Renders a real interactive google.maps.Map instance but with all
// gestures/controls turned off so it reads as a plain preview thumbnail.
// Wrapped in a link so clicking it opens the full location in Google Maps.
export default function GoogleMapPreview({ lat, lng, alt, className = '' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    if (lat == null || lng == null) return undefined;
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const position = { lat, lng };

        if (!mapRef.current) {
          mapRef.current = new maps.Map(containerRef.current, {
            center: position,
            zoom: 16,
            disableDefaultUI: true,
            gestureHandling: 'none',
            keyboardShortcuts: false,
            clickableIcons: false,
            disableDoubleClickZoom: true,
          });
          markerRef.current = new maps.Marker({ position, map: mapRef.current });
        } else {
          mapRef.current.setCenter(position);
          markerRef.current.setPosition(position);
        }
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (lat == null || lng == null) return null;

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <a
      className={`geo-map-preview ${className}`.trim()}
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      title={alt || 'View on Google Maps'}
    >
      {status !== 'error' && <div ref={containerRef} className="geo-map-canvas" aria-label={alt || 'Map preview'} />}
      {status === 'loading' && (
        <div className="geo-map-preview-fallback geo-map-preview-loading">🗺 Loading map…</div>
      )}
      {status === 'error' && (
        <div className="geo-map-preview-fallback">
          🗺 {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      )}
    </a>
  );
}
