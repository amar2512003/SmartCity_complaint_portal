export default function MunicipalBadge({ body, district }) {
  if (body) return <span className="muni-chip" title={district ? `${district} district` : ''}>🏛 {body}</span>;
  if (district) return <span className="muni-chip muni-chip-warn" title="Multiple bodies in this district — verify from the address/photo">🏛 {district} — verify</span>;
  return <span className="no-photo">—</span>;
}
