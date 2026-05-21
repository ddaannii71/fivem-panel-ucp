import axios from 'axios';

// En desarrollo usa las rutas relativas (proxy), en producción usa VITE_API_URL
const baseURL = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_API_URL 
  : '';

const api = axios.create({
  baseURL: baseURL
});

export default api;
