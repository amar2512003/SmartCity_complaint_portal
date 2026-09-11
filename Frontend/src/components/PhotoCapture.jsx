import { useEffect, useRef, useState } from 'react';
import { assignMunicipalBody } from '../utils/municipalBody';

function formatCoord(n) { return Math.abs(n).toFixed(5) + '°'; }
function coordLabel(lat, lng) {
  return `${formatCoord(lat)} ${lat >= 0 ? 'N' : 'S'}, ${formatCoord(lng)} ${lng >= 0 ? 'E' : 'W'}`;
}

// Build a human-readable "street, locality, city, district, state - pincode" string
// from a Nominatim (OpenStreetMap) address breakdown.
function buildAddress(a) {
  if (!a) return '';
  const street = [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean).join(' ');
  const locality = a.suburb || a.neighbourhood || a.quarter || a.residential;
  const city = a.city || a.town || a.village || a.municipality;
  const district = a.county || a.state_district || a.city_district;
  const state = a.state;
  const parts = [street, locality, city, district, state].filter(Boolean);
  const unique = [...new Set(parts)];
  let str = unique.join(', ');
  if (a.postcode) str += (str ? ' - ' : '') + a.postcode;
  return str;
}

async function reverseGeocode(lat, lng) {
  try {
    // accept-language=en is required here — without it, Nominatim can return
    // locality names in the area's local script (e.g. Bengali) instead of
    // Latin script, which silently breaks the municipal-body name matching
    // in utils/municipalBody.js and misroutes the report.
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=en`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return { address: data.address || null, formatted: buildAddress(data.address) || data.display_name || '' };
  } catch {
    return null;
  }
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  let wordsUsed = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      wordsUsed += line.split(' ').length;
      line = words[i];
      if (lines.length === maxLines) { line = ''; break; }
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) { lines.push(line); wordsUsed += line.split(' ').length; }
  if (wordsUsed < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (ctx.measureText(last + '…').width > maxWidth && last.length > 1) last = last.slice(0, -1);
    lines[lines.length - 1] = last + '…';
  }
  return lines;
}

// Resize + compress a source (video frame or image) onto a canvas, optionally burning a
// geotag stamp (address / coordinates + timestamp) into the bottom of the frame.
function toStampedDataUrl(source, sw, sh, geo, maxWidth = 1024, quality = 0.75) {
  const scale = Math.min(1, maxWidth / sw);
  const w = Math.round(sw * scale), h = Math.round(sh * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, w, h);

  if (geo && geo.lat != null) {
    const pad = Math.max(10, Math.round(w * 0.025));
    const bigSize = Math.max(11, Math.round(w * 0.03));
    const smallSize = Math.max(9, Math.round(w * 0.024));
    ctx.font = `700 ${bigSize}px 'DM Sans', sans-serif`;
    const maxTextWidth = w - pad * 2;

    let addressLines = [];
    if (geo.address) addressLines = wrapText(ctx, geo.address, maxTextWidth, 2);

    const metaText = `📍 ${coordLabel(geo.lat, geo.lng)}  ·  ±${Math.round(geo.accuracy || 0)}m  ·  ${geo.timestamp}`;
    const lineGap = 4;
    const bigLineH = bigSize + lineGap;
    const smallLineH = smallSize + lineGap;
    const barH = pad * 2 + (addressLines.length ? addressLines.length * bigLineH + smallLineH : bigLineH);

    const grad = ctx.createLinearGradient(0, h - barH, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,.66)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - barH, w, barH);

    ctx.textBaseline = 'bottom';
    let y = h - pad;
    if (addressLines.length) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = `500 ${smallSize}px 'DM Sans', sans-serif`;
      ctx.fillText(metaText, pad, y);
      y -= smallLineH;
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${bigSize}px 'DM Sans', sans-serif`;
      for (let i = addressLines.length - 1; i >= 0; i--) {
        ctx.fillText(i === 0 ? `📍 ${addressLines[i]}` : addressLines[i], pad, y);
        y -= bigLineH;
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${bigSize}px 'DM Sans', sans-serif`;
      ctx.fillText(metaText, pad, y);
    }
  }
  return canvas.toDataURL('image/jpeg', quality);
}

export default function PhotoCapture({ value, onChange, onLocationChange, label = 'Photo evidence', required = false }) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [facing, setFacing] = useState('environment');
  const [camError, setCamError] = useState('');
  const [starting, setStarting] = useState(false);
  const [geo, setGeo] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | locating | ready | error
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const geoRef = useRef(null); // latest geo, read synchronously at capture time

  const stopStream = (s) => { (s || stream)?.getTracks()?.forEach((t) => t.stop()); };

  const locate = () => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const base = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
          address: '',
        };
        geoRef.current = base; setGeo(base); // show coordinates immediately while address resolves
        const geocoded = await reverseGeocode(base.lat, base.lng);
        const muni = assignMunicipalBody(geocoded?.address);
        const full = { ...base, address: geocoded?.formatted || '', muni };
        geoRef.current = full; setGeo(full); setGeoStatus('ready');
        onLocationChange?.({
          latitude: full.lat,
          longitude: full.lng,
          locationAccuracy: full.accuracy,
          locationAddress: full.address || null,
          municipalBody: muni.municipalBody || null,
          municipalDistrict: muni.district || null,
        });
      },
      () => { geoRef.current = null; setGeoStatus('error'); onLocationChange?.(null); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  const startCamera = async (mode = facing) => {
    setCamError(''); setStarting(true);
    stopStream();
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: false });
      setStream(s); setFacing(mode);
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
    } catch (e) {
      setCamError('Camera unavailable. You can upload a picture instead.');
    } finally { setStarting(false); }
  };

  const openCamera = () => { setOpen(true); startCamera('environment'); locate(); };
  const closeCamera = () => { stopStream(); setStream(null); setOpen(false); setCamError(''); };
  const flipCamera = () => startCamera(facing === 'environment' ? 'user' : 'environment');

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const dataUrl = toStampedDataUrl(v, v.videoWidth, v.videoHeight, geoRef.current);
    onChange(dataUrl);
    closeCamera();
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    locate();
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        // give geolocation + reverse geocoding a moment to resolve so the upload path is stamped too
        setTimeout(() => onChange(toStampedDataUrl(img, img.width, img.height, geoRef.current)), 1400);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => () => stopStream(), []); // eslint-disable-line

  return (
    <div className="photo-capture">
      <label>{label}{required && <span className="required-mark"> *</span>}</label>
      {value ? (
        <div className="photo-preview">
          <img src={value} alt="Captured evidence" />
          <div className="photo-preview-actions">
            <button type="button" className="ghost-btn" onClick={openCamera}>↻ Retake</button>
            <button type="button" className="ghost-btn danger-ghost" onClick={() => { onChange(''); setGeo(null); setGeoStatus('idle'); onLocationChange?.(null); }}>✕ Remove</button>
          </div>
        </div>
      ) : (
        <div className="photo-dropzone">
          <div className="photo-dropzone-icon">📷</div>
          <strong>Add a photo of the issue</strong>
          <p>A picture helps the city team understand and act faster.</p>
          <div className="photo-dropzone-actions">
            <button type="button" className="primary-btn" onClick={openCamera}>📸 Click a picture</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
        </div>
      )}

      {value && geoStatus !== 'idle' && (
        <div className={`geo-badge geo-${geoStatus}`}>
          {geoStatus === 'locating' && <>📡 Getting your location…</>}
          {geoStatus === 'ready' && geo && (
            <div>
              <div>📍 {geo.address || coordLabel(geo.lat, geo.lng)}</div>
              <span>{coordLabel(geo.lat, geo.lng)} · ±{Math.round(geo.accuracy)}m · via OpenStreetMap</span>
              {geo.muni?.municipalBody && geo.muni?.confidence !== 'district' && (
                <div className="muni-line">🏛 Notify: <strong>{geo.muni.municipalBody}</strong></div>
              )}
              {geo.muni?.municipalBody && geo.muni?.confidence === 'district' && (
                <div className="muni-line muni-warn">🏛 Notify: <strong>{geo.muni.municipalBody}</strong> (district-level match — please verify address)</div>
              )}
              {!geo.muni?.municipalBody && geo.muni?.options && (
                <div className="muni-line muni-warn">🏛 {geo.muni.district} district — multiple bodies, please confirm: {geo.muni.options.join(', ')}</div>
              )}
              {!geo.muni?.municipalBody && !geo.muni?.options && geo.muni?.confidence === 'out-of-state' && (
                <div className="muni-line muni-warn">🏛 Outside West Bengal — municipal body not applicable</div>
              )}
              {!geo.muni?.municipalBody && !geo.muni?.options && geo.muni?.confidence === 'none' && (
                <div className="muni-line muni-warn">🏛 Municipal body could not be identified for this location</div>
              )}
            </div>
          )}
          {geoStatus === 'error' && <>⚠ Couldn't get your location. <button type="button" className="text-btn" onClick={locate}>Try again</button></>}
        </div>
      )}

      {open && (
        <div className="camera-modal" role="dialog" aria-modal="true">
          <div className="camera-modal-inner">
            <button type="button" className="camera-close" onClick={closeCamera} aria-label="Close camera">✕</button>
            <div className="camera-stage">
              {camError ? (
                <div className="camera-fallback">
                  <p>{camError}</p>
                  <button type="button" className="primary-btn" onClick={() => fileInputRef.current?.click()}>Choose a photo</button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} className="camera-video" playsInline muted />
                  {starting && <div className="camera-loading">Starting camera…</div>}
                  <div className={`geo-pill geo-${geoStatus}`}>
                    {geoStatus === 'locating' && '📡 Locating…'}
                    {geoStatus === 'ready' && '📍 Address found'}
                    {geoStatus === 'error' && '⚠ Location unavailable'}
                  </div>
                </>
              )}
            </div>
            {!camError && (
              <div className="camera-controls">
                <button type="button" className="camera-flip" onClick={flipCamera} title="Switch camera">⟳</button>
                <button type="button" className="shutter-btn" onClick={capture} aria-label="Capture photo" />
                <span className="camera-flip-spacer" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}