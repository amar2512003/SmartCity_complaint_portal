import {Link,Outlet,useLocation} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import AiAssistant from '../components/AiAssistant';
import Footer from '../components/Footer';

export default function CitizenLayout(){
 const {user,logout}=useAuth(); const location=useLocation();
 const initials=(user?.name||'C').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
 return <div className="shell" style={{display:'flex',flexDirection:'column'}}><header className="app-nav"><div className="nav-inner"><Link className="brand" to="/dashboard"><span className="brand-mark">⌂</span><span>SmartCity</span></Link><nav className="nav-links"><Link className={location.pathname==='/dashboard'?'active':''} to="/dashboard">My Dashboard</Link><Link className={location.pathname==='/grievance/new'?'active':''} to="/grievance/new">Report an Issue</Link></nav><div className="nav-user"><div className="avatar">{initials}</div><span className="user-name">{user?.name}</span><button className="ghost-btn mobile-hide" onClick={logout}>Sign out</button></div></div></header><main className="container page" style={{flex:1}}><Outlet/></main><Footer/><AiAssistant/></div>
}