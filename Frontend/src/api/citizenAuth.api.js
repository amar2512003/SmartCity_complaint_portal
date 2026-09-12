import api from './axiosInstance';

export const sendCitizenSignupOtp = (data) => api.post('/auth/citizen/signup/send-otp', data);
export const verifyCitizenSignupOtp = (data) => api.post('/auth/citizen/signup/verify-otp', data);
export const sendCitizenLoginOtp = (data) => api.post('/auth/citizen/login/send-otp', data);
export const verifyCitizenLoginOtp = (data) => api.post('/auth/citizen/login/verify-otp', data);
export const updatePreferredLanguage = (language) => api.patch('/auth/citizen/preferred-language', { language });
