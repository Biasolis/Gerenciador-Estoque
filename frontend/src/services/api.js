import axios from 'axios';

// Cria uma instância do axios
const api = axios.create({
  // CORREÇÃO: Usamos um caminho relativo. O navegador enviará as chamadas
  // para o mesmo domínio da página, e o Nginx cuidará do resto.
  baseURL: '/api',
});

// Interceptor: Roda ANTES de cada requisição ser enviada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
