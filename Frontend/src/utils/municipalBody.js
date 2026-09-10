import { WB_MUNICIPAL_BODIES } from '../data/wbMunicipalBodies';

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .replace(/ municipality$| municipal corporation$| notified area authority$/, '')
    .replace(/ district$/, '')
    .trim();
}

// Nominatim sometimes returns English-translated or differently-ordered district
// names; map them to the canonical names used in WB_MUNICIPAL_BODIES.
const DISTRICT_ALIASES = {
  'west midnapore': 'paschim medinipur', 'west medinipur': 'paschim medinipur',
  'east midnapore': 'purba medinipur', 'east medinipur': 'purba medinipur',
  'west burdwan': 'paschim bardhaman', 'west bardhaman': 'paschim bardhaman',
  'east burdwan': 'purba bardhaman', 'east bardhaman': 'purba bardhaman', burdwan: 'purba bardhaman',
  'south dinajpur': 'dakshin dinajpur',
  'north dinajpur': 'uttar dinajpur',
  '24 parganas north': 'north 24 parganas',
  '24 parganas south': 'south 24 parganas',
};
function normalizeDistrict(s) {
  const n = normalize(s);
  return DISTRICT_ALIASES[n] || n;
}

/**
 * Given a Nominatim `address` breakdown, find the nearest/matching West Bengal
 * municipal body so the admin knows who to notify.
 * Returns { municipalBody, district, confidence } or
 * { municipalBody: null, district, options, confidence: 'district-multi' } or
 * { municipalBody: null, district: null, confidence: 'none' } or
 * { municipalBody: null, district: null, confidence: 'out-of-state' }
 */
export function assignMunicipalBody(address) {
  if (!address) return { municipalBody: null, district: null, confidence: 'none' };

  const state = normalize(address.state);
  if (state && !state.includes('west bengal')) {
    return { municipalBody: null, district: null, confidence: 'out-of-state' };
  }

  const localityCandidates = [
    address.city, address.town, address.village, address.municipality,
    address.suburb, address.city_district, address.neighbourhood,
  ].filter(Boolean);

  // Exact bare-name match first
  for (const cand of localityCandidates) {
    const norm = normalize(cand);
    if (!norm) continue;
    const hit = WB_MUNICIPAL_BODIES.find((b) => normalize(b.base) === norm);
    if (hit) return { municipalBody: hit.name, district: hit.district, confidence: 'exact' };
  }

  // Loose substring match (either direction)
  for (const cand of localityCandidates) {
    const norm = normalize(cand);
    if (!norm) continue;
    const hit = WB_MUNICIPAL_BODIES.find((b) => {
      const bn = normalize(b.base);
      return bn.includes(norm) || norm.includes(bn);
    });
    if (hit) return { municipalBody: hit.name, district: hit.district, confidence: 'approx' };
  }

  // District-level fallback
  const districtCandidates = [address.state_district, address.county, address.city_district].filter(Boolean);
  for (const cand of districtCandidates) {
    const norm = normalizeDistrict(cand);
    if (!norm) continue;
    const inDistrict = WB_MUNICIPAL_BODIES.filter((b) => normalize(b.district) === norm);
    if (inDistrict.length === 1) {
      return { municipalBody: inDistrict[0].name, district: inDistrict[0].district, confidence: 'district' };
    }
    if (inDistrict.length > 1) {
      return { municipalBody: null, district: inDistrict[0].district, options: inDistrict.map((b) => b.name), confidence: 'district-multi' };
    }
  }

  return { municipalBody: null, district: null, confidence: 'none' };
}
