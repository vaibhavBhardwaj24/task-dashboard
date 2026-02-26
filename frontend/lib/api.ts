import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const res = await axios.post('http://localhost:5000/auth/refresh', {
                    token: refreshToken,
                });

                localStorage.setItem('accessToken', res.data.accessToken);

                // For refresh we don't return new refresh token usually from /refresh but we could add logic if it does
                return api(originalRequest);
            } catch (err) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
