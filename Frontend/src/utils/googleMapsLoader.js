// Loads the Google Maps JavaScript API script exactly once, however many
// components ask for it, and hands back the `google.maps` namespace once
// ready. Uses the JS API (not the Static Maps API) because that's the one
// already enabled/working on most Maps keys, including demo/trial keys.
let loadPromise = null;

export function loadGoogleMaps() {
  if (loadPromise) return loadPromise;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'));

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    const callbackName = '__smartcityGoogleMapsInit';
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null; // allow a retry on a future call
      reject(new Error('Failed to load the Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
