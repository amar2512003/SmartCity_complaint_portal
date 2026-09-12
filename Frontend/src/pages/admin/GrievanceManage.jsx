import {useTranslation} from 'react-i18next';
export default function GrievanceManage(){const {t}=useTranslation('admin');return <div className="card"><h1>{t('grievanceManage.heading')}</h1><p>{t('grievanceManage.text')}</p></div>}
