import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8001',
});

// 1. Lägg till token i varje request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Fånga 401-fel och logga ut användaren
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Skicka till inloggning
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
