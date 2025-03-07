import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const getCsrfToken = async () => {
  try {
    const response = await api.get('/csrf-token/');
    const csrfToken = response.data.csrfToken;
    api.defaults.headers['X-CSRFToken'] = csrfToken;
    return csrfToken;
  } catch (error) {
    throw error.response?.data || { error: "CSRF Token fetch failed" };
  }
};

export const registerUser = async (data) => {
  try {
    await getCsrfToken();
    const response = await api.post('/register/', {
      name: data.name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmpassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Registration failed" };
  }
};

export const loginUser = async (data) => {
  try {
    await getCsrfToken();
    const response = await api.post('/login/', {
      email: data.email,
      password: data.password,
    });
    const userData = response.data.user || {};
    return {
      user: {
        name: userData.name || '',
        email: userData.email || data.email,
        profilePhoto: userData.profile_picture || null,
      },
      token: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  } catch (error) {
    throw error.response?.data || { error: "Login failed" };
  }
};

export const logoutUser = async () => {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) {
    useAuthStore.getState().logout();
    return;
  }
  try {
    await getCsrfToken();
    await api.post('/logout/', { refresh: refreshToken });
  } catch (error) {
    throw error.response?.data || { error: "Logout failed" };
  } finally {
    useAuthStore.getState().logout();
    window.location.href = "/";
  }
};

export const requestPasswordReset = async (email) => {
  try {
    await getCsrfToken();
    const response = await api.post('/password/reset/request/', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to send reset link" };
  }
};

export const confirmPasswordReset = async (uidb64, token, newPassword, confirmPassword) => {
  try {
    await getCsrfToken();
    const response = await api.post(`/password/reset/confirm/${uidb64}/${token}/`, {
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Failed to reset password" };
  }
};