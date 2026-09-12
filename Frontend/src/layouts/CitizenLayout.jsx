import {Link,Outlet,useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../context/AuthContext';
import AiAssistant from '../components/AiAssistant';
import Footer from '../components/Footer';
import LanguageToggle from '../components/LanguageToggle';
import brandMark from '../assets/brand-mark.png';

export default function CitizenLayout(){
 const {t}=useTranslation('citizen');
 const {user,logout}=useAuth(); const location=useLocation();
 const initials=(user?.name||'C').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
 return <div className="shell" style={{display:'flex',flexDirection:'column'}}><header className="app-nav"><div className="nav-inner"><Link className="brand" to="/dashboard"><img src={brandMark} alt="SmartCity" className="brand-mark" /><span>SmartCity</span></Link><nav className="nav-links"><Link className={location.pathname==='/dashboard'?'active':''} to="/dashboard">{t('nav.dashboard')}</Link><Link className={location.pathname==='/grievance/new'?'active':''} to="/grievance/new">{t('nav.reportIssue')}</Link></nav><div className="nav-user"><LanguageToggle /><div className="avatar">{initials}</div><span className="user-name">{user?.name}</span><button className="ghost-btn mobile-hide" onClick={logout}>{t('nav.signOut')}</button></div></div></header><main className="container page" style={{flex:1}}><Outlet/></main><Footer/><AiAssistant/></div>
}
