import axios from 'axios';

const api = axios.create({
  baseURL:"http://localhost:8000", // replace with your backend URL
  withCredentials: true, // only if you're using cookies
});

// 🟢 Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // or sessionStorage or your auth context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
