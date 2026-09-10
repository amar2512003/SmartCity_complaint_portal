import api from './axiosInstance'; export const adminLogin=(data)=>api.post('/auth/admin/login',data);
