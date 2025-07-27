import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window === 'undefined') {
          throw new Error('Not in browser');
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await authClient.refreshToken(refreshToken);

        // Update tokens
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API client
export const authClient = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password
    });
    return response.data.data;
  },

  async register(email: string, password: string, fullName: string) {
    const response = await apiClient.post('/api/auth/register', {
      email,
      password,
      fullName
    });
    return response.data.data;
  },

  async logout(refreshToken?: string) {
    await apiClient.post('/api/auth/logout', {
      refreshToken
    });
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post('/api/auth/refresh', {
      refreshToken
    });
    return response.data.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data.data;
  }
};

// Application API client
export const applicationClient = {
  async getApplications() {
    const response = await apiClient.get('/api/applications');
    return response.data.data;
  },

  async getApplication(id: string) {
    const response = await apiClient.get(`/api/applications/${id}`);
    return response.data.data;
  },

  async createApplication(data: any) {
    const response = await apiClient.post('/api/applications', data);
    return response.data.data;
  },

  async updateApplication(id: string, data: any) {
    const response = await apiClient.put(`/api/applications/${id}`, data);
    return response.data.data;
  },

  async deleteApplication(id: string) {
    const response = await apiClient.delete(`/api/applications/${id}`);
    return response.data.data;
  }
};

// Dashboard API client
export const dashboardClient = {
  async getStats() {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data.data;
  }
};

export default apiClient;