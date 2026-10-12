import { useTranslation } from 'react-i18next';

export default function ReportDate({ value }) {
  const { t, i18n } = useTranslation('citizen');
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return <span>{t('dashboard.dateUnavailable')}</span>;
  return <time dateTime={date.toISOString()}>{date.toLocaleString(i18n.resolvedLanguage === 'bn' ? 'bn-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>;
}
