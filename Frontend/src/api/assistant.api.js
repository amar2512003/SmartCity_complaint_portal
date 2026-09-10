import api from './axiosInstance';
export const sendChatMessage = (messages) => api.post('/assistant/chat', { messages });
