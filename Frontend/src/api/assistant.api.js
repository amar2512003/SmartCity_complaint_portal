import api from './axiosInstance';
// `lang` is sent explicitly in the chat payload (in addition to the
// X-App-Lang header every request already carries — see axiosInstance.js)
// so assistant.controller.js can build the "respond in Bengali/English"
// line for the LLM system prompt without depending on header parsing.
export const sendChatMessage = (messages, lang) => api.post('/assistant/chat', { messages, lang });
