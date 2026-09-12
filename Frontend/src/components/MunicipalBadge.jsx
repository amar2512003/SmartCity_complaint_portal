import { useTranslation } from 'react-i18next';

export default function MunicipalBadge({ body, district }) {
  const { t } = useTranslation('common');
  if (body) return <span className="muni-chip" title={district ? t('shared.districtSuffix', { district }) : ''}>🏛 {body}</span>;
  if (district) return <span className="muni-chip muni-chip-warn" title={t('shared.districtVerifyTooltip')}>🏛 {t('shared.districtVerify', { district })}</span>;
  return <span className="no-photo">—</span>;
}
