import axios from "axios";

const isLocalhost = window.location.hostname === 'localhost';
const axiosClient = axios.create({
    baseURL: isLocalhost ? "http://localhost:5000/api" : "https://eatdish.net/api",
});
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('eatdish_user_id');
            localStorage.removeItem('eatdish_user_role');
            localStorage.removeItem('eatdish_user_premium');
            window.location.href = '/login-register?expired=true';
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;