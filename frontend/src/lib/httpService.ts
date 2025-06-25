import axios from 'axios';

const isProduction = import.meta.env.VITE_SOFTWARE_END === 'production';
const apiBaseUrl = isProduction ? '/api' : 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json'
    },
    validateStatus: (status) => {
        if(status === 401) {
            return false;
        }
        return true
    }
})

axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access_token');

    if(accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config;
}, (error) => Promise.reject(error));

// handle response interceptor later here for refresh token logic


export default axiosInstance;