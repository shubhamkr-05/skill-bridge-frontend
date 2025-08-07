import axios from 'axios';

const api = axios.create({
  //baseURL:"http://localhost:8000", // replace with your backend URL
  baseURL:"https://nidaan-6jyx.onrender.com", 
  withCredentials: true, // only if you're using cookies
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/users/refresh-token"); // refreshes tokens
        return api(originalRequest); // retry original request
      } catch (err) {
        // refresh failed → force logout
        localStorage.removeItem("user");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
