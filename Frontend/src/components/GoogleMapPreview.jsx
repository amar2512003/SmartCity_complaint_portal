import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

const LOAD_TIMEOUT_MS = 6000;

// Small locked-down Google Map preview (Maps JavaScript API, not the Static
// Maps API — the JS API is the one that tends to already be enabled on demo
// keys). Renders a real interactive google.maps.Map instance but with all
// gestures/controls turned off so it reads as a plain preview thumbnail.
// Wrapped in a link so clicking/tapping it opens the full location in
// Google Maps.
//
// Mobile hardening:
// - `.geo-map-canvas` has pointer-events:none AND touch-action:none so the
//   live map can never capture a touch/scroll/pinch gesture from the page,
//   even if gestureHandling:'none' misbehaves on a given mobile browser.
// - A hard timeout falls back to the plain coordinate box if the script or
//   tiles never become ready (slow mobile data, key restrictions that
//   reject the mobile browser's referrer, etc.) instead of hanging on
//   "Loading map…" forever.
// - google.maps.event.trigger(map, 'resize') is fired a tick after creation
//   because mobile layouts can finish sizing the container a frame later
//   than desktop, which otherwise leaves the map rendered at 0×0.
export default function GoogleMapPreview({ lat, lng, alt, className = '' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    if (lat == null || lng == null) return undefined;
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (!cancelled) setStatus((current) => (current === 'ready' ? current : 'error'));
    }, LOAD_TIMEOUT_MS);

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

          // Fix the "blank map on mobile" case: if the container's final
          // size wasn't settled at construction time, tell the map to
          // remeasure once the browser has finished laying out this frame.
          requestAnimationFrame(() => {
            if (cancelled || !mapRef.current) return;
            maps.event.trigger(mapRef.current, 'resize');
            mapRef.current.setCenter(position);
          });
        } else {
          mapRef.current.setCenter(position);
          markerRef.current.setPosition(position);
        }

        clearTimeout(timeoutId);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
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
