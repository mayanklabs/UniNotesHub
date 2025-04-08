import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { fetchProfile } from '@/utils/api/pyqApi';

export const useProfileStore = create((set) => ({
  profileUpdate: { name: '', profilePhoto: null },

  setProfileName: (name) =>
    set((state) => ({
      profileUpdate: { ...state.profileUpdate, name },
    })),

  setProfilePhoto: (profilePhoto) =>
    set((state) => ({
      profileUpdate: { ...state.profileUpdate, profilePhoto },
    })),

  resetProfileUpdate: () =>
    set({ profileUpdate: { name: '', profilePhoto: null } }),

  updateUserProfile: (updatedData) => {
    set(() => {
      const { user } = useAuthStore.getState();
      const newUser = {
        ...user,
        name: updatedData.name || user?.name,
        profilePhoto: updatedData.profile_picture || user?.profilePhoto,
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      useAuthStore.getState().setAuth(
        newUser,
        localStorage.getItem('token'),
        localStorage.getItem('refreshToken')
      );
      return { profileUpdate: { name: '', profilePhoto: null } };
    });
  },

  loadProfileFromLocalStorage: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      set({
        profileUpdate: {
          name: user.name || '',
          profilePhoto: user.profilePhoto || null,
        },
      });
      useAuthStore.getState().setAuth(
        user,
        localStorage.getItem('token'),
        localStorage.getItem('refreshToken')
      );
    }
  },

  fetchLatestProfile: async () => {
    try {
      const data = await fetchProfile();
      const updatedUser = {
        name: data.name || '',
        profilePhoto: data.profile_picture || null,
        email: data.email || useAuthStore.getState().user?.email,
      };
      set({ profileUpdate: { name: updatedUser.name, profilePhoto: updatedUser.profilePhoto } });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      useAuthStore.getState().setAuth(
        updatedUser,
        localStorage.getItem('token'),
        localStorage.getItem('refreshToken')
      );
    } catch (error) {
      console.error("Failed to fetch latest profile:", error);
      if (error.message.includes("Authentication failed")) {
        window.location.href = "/login";
      }
    }
  },
}));