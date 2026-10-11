import { readFileSync } from 'node:fs';

// Snapshot of West Bengal AMRUT ULB boundaries. See data/README.md.
const features = [
  ...JSON.parse(readFileSync(new URL('../data/wb-municipal-boundaries.json', import.meta.url))).features,
  ...JSON.parse(readFileSync(new URL('../data/kolkata-boundary.json', import.meta.url))).features,
];
const polygons = geometry => geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
export function validCoordinates(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}
function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i], [bx, by] = ring[j];
    if (((ay > y) !== (by > y)) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}
export function contains(geometry, lat, lng) {
  return polygons(geometry).some(rings => inRing(lng, lat, rings[0]) && !rings.slice(1).some(r => inRing(lng, lat, r)));
}
// Local planar distance is sufficient for an accuracy/boundary guard (metres).
function edgeDistance(geometry, lat, lng) {
  const sx = 111320 * Math.cos(lat * Math.PI / 180), sy = 111320;
  let min = Infinity;
  for (const rings of polygons(geometry)) for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const ax = (ring[i][0] - lng) * sx, ay = (ring[i][1] - lat) * sy;
      const bx = (ring[i + 1][0] - lng) * sx, by = (ring[i + 1][1] - lat) * sy;
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
      min = Math.min(min, Math.hypot(ax + t * dx, ay + t * dy));
    }
  }
  return min;
}
export function routeMunicipality(latitude, longitude, accuracy) {
  const result = { municipalBody: null, district: null, confidence: 'review', reason: 'outside_coverage', source: 'WB AMRUT ULB snapshot 2026-10-11' };
  if (!validCoordinates(latitude, longitude)) return { ...result, reason: 'missing_location' };
  const matches = features.filter(f => contains(f.geometry, latitude, longitude));
  if (matches.length !== 1) return { ...result, reason: matches.length ? 'overlapping_boundaries' : 'outside_coverage' };
  const f = matches[0];
  // Keep near-edge/low accuracy reports for review instead of claiming certainty.
  const margin = Math.max(20, Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : 0);
  if (edgeDistance(f.geometry, latitude, longitude) <= margin) return { ...result, reason: 'boundary_uncertainty' };
  return { ...result, source: f.properties.source || result.source, municipalBody: f.properties.name, district: f.properties.district, confidence: 'boundary', reason: 'within_boundary' };
}
