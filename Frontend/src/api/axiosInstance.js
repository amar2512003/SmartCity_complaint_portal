import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5001/api'});
api.interceptors.request.use(config=>{
  const token=localStorage.getItem('token');
  if(token)config.headers.Authorization=`Bearer ${token}`;
  // Mirrors the active UI language (set by the LanguageToggle / i18next-browser-languagedetector,
  // stored under the same 'sc_lang' key) so the backend can localize error messages, validation
  // messages, and emails — see backend/src/middleware/locale.middleware.js.
  const lang=localStorage.getItem('sc_lang');
  if(lang)config.headers['X-App-Lang']=lang;
  return config
});
export default api;
