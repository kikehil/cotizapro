const auth = {
    setToken(token) {
        localStorage.setItem('accessToken', token);
    },
    setRefreshToken(token) {
        localStorage.setItem('refreshToken', token);
    },
    getToken() {
        return localStorage.getItem('accessToken');
    },
    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    },
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    hasPermission(permission) {
        const user = this.getUser();
        if (!user) return false;
        if (user.rol === 'ADMIN') return true;
        const permisos = user.permisos || [];
        return permisos.includes(permission);
    },
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },
    checkAuth() {
        const token = this.getToken();
        const path = window.location.pathname;
        
        if (!token && path !== '/login' && !path.includes('/public')) {
            window.location.href = '/login';
        }

        if (token && path === '/login') {
            window.location.href = '/';
        }
    }
};

// Initialize auth check
auth.checkAuth();

// Setup axios interceptor for auth
axios.interceptors.request.use(
    config => {
        const token = auth.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = auth.getRefreshToken();
                const res = await axios.post('/api/auth/refresh', { refreshToken });
                if (res.status === 200) {
                    auth.setToken(res.data.accessToken);
                    return axios(originalRequest);
                }
            } catch (err) {
                auth.logout();
            }
        }
        return Promise.reject(error);
    }
);







