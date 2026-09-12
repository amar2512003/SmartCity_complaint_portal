import {createContext,useContext,useState} from 'react'; import {useNavigate} from 'react-router-dom'; import i18n from '../i18n';
// On login, sync the UI to the citizen's saved `preferred_language` (from
// the backend `users` table — see Sprint 3/8) so a citizen who set Bengali
// on one device lands in Bengali on any other device too, even before they
// touch the LanguageToggle. Only citizens carry this field; admin logins
// don't include it, so this is a no-op for admins.
const AuthContext=createContext(); export function AuthProvider({children}){const navigate=useNavigate();const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('user'))}catch{return null}});const login=(data)=>{localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));setUser(data.user);if(data.user.preferred_language&&data.user.preferred_language!==i18n.resolvedLanguage){i18n.changeLanguage(data.user.preferred_language)}navigate(data.user.role==='admin'?'/admin':'/dashboard')};const logout=()=>{localStorage.clear();setUser(null);navigate('/citizen/login')};return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>} export const useAuth=()=>useContext(AuthContext);
