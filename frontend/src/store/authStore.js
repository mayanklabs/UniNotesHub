import { create } from 'zustand';
import axios from 'axios';

// Standalone refreshToken function
export const refreshAuthToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    useAuthStore.setState({ isAuthenticated: false });
    return null;
  }
  try {
    const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
    const newToken = response.data.access;
    localStorage.setItem('token', newToken);
    useAuthStore.setState({ token: newToken, isAuthenticated: true });
    return newToken;
  } catch (error) {
    useAuthStore.setState({ isAuthenticated: false, token: null, refreshToken: null, user: null });
    localStorage.clear();
    return null;
  }
};

export const useAuthStore = create((set) => ({
  signupInput: { name: '', email: '', password: '', confirmpassword: '' },
  loginInput: { email: '', password: '' },
  resetInput: { email: '' },
  resetConfirmInput: { newPassword: '', confirmPassword: '' },
  
  isAuthenticated: !!localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,

  loading: false,
  loginErrors: {},
  signupErrors: {},
  resetErrors: {},
  resetSuccess: null,

  setSignupInput: (name, value) => set((state) => ({ signupInput: { ...state.signupInput, [name]: value } })),
  setLoginInput: (name, value) => set((state) => ({ loginInput: { ...state.loginInput, [name]: value } })),
  setResetInput: (name, value) => set((state) => ({ resetInput: { ...state.resetInput, [name]: value } })),
  setResetConfirmInput: (name, value) => set((state) => ({ resetConfirmInput: { ...state.resetConfirmInput, [name]: value } })),
  
  resetSignupInput: () => set({ signupInput: { name: '', email: '', password: '', confirmpassword: '' } }),
  resetLoginInput: () => set({ loginInput: { email: '', password: '' } }),
  resetResetInput: () => set({ resetInput: { email: '' } }),
  resetResetConfirmInput: () => set({ resetConfirmInput: { newPassword: '', confirmPassword: '' } }),

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    set({
      isAuthenticated: true,
      user,
      token,
      refreshToken,
      loginErrors: {},
      signupErrors: {},
      resetErrors: {},
      resetSuccess: null,
    });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set((state) => ({
      user: { ...state.user, ...updatedUser },
    }));
  },

  logout: () => {
    localStorage.clear();
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      signupInput: { name: '', email: '', password: '', confirmpassword: '' },
      loginInput: { email: '', password: '' },
      resetInput: { email: '' },
      resetConfirmInput: { newPassword: '', confirmPassword: '' },
      loginErrors: {},
      signupErrors: {},
      resetErrors: {},
      resetSuccess: null,
    });
    window.location.href = "/login";
  },

  setLoading: (loading) => set({ loading }),
  setLoginErrors: (errors) => set({ loginErrors: errors, signupErrors: {}, resetErrors: {}, resetSuccess: null }),
  setSignupErrors: (errors) => set({ signupErrors: errors, loginErrors: {}, resetErrors: {}, resetSuccess: null }),
  setResetErrors: (errors) => set({ resetErrors: errors, loginErrors: {}, signupErrors: {}, resetSuccess: null }),
  setResetSuccess: (message) => set({ resetSuccess: message, loginErrors: {}, signupErrors: {}, resetErrors: {} }),
  clearErrors: () => set({ loginErrors: {}, signupErrors: {}, resetErrors: {}, resetSuccess: null }),
}));