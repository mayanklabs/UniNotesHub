import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  signupInput: { name: '', email: '', password: '', confirmpassword: '' },
  loginInput: { email: '', password: '' },
  isAuthenticated: false,
  user: null, // Will hold current user data (e.g., { name, email, profilePhoto })

  // Profile update state
  profileUpdate: {
    name: '',
    profilePhoto: null, // File object or URL 
  },

  // Existing auth actions
  setSignupInput: (name, value) =>
    set((state) => ({
      signupInput: { ...state.signupInput, [name]: value },
    })),
  setLoginInput: (name, value) =>
    set((state) => ({
      loginInput: { ...state.loginInput, [name]: value },
    })),
  setAuth: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
  resetSignupInput: () =>
    set({
      signupInput: { name: '', email: '', password: '', confirmpassword: '' },
    }),
  resetLoginInput: () => set({ loginInput: { email: '', password: '' } }),

  // Profile update actions
  setProfileName: (name) =>
    set((state) => ({
      profileUpdate: { ...state.profileUpdate, name },
    })),
  setProfilePhoto: (file) =>
    set((state) => ({
      profileUpdate: { ...state.profileUpdate, profilePhoto: file },
    })),
  resetProfileUpdate: () =>
    set({ profileUpdate: { name: '', profilePhoto: null } }),
  updateUserProfile: (updatedData) =>
    set((state) => ({
      user: { ...state.user, ...updatedData }, // Merge updated data into user
    })),
}));