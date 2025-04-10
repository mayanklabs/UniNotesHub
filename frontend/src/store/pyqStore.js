// src/store/pyqStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchPyqs, fetchUserPyqs, updateUserPyq, deleteUserPyq } from '@/utils/api/pyqApi';

const usePyqStore = create(
  persist(
    (set, get) => ({
      pyqs: [],
      userPyqs: [],
      programs: [],
      branches: [],
      courses: [],
      ratings: {},
      isUploading: false,
      error: null,
      selectedPath: {
        universityId: null,
        programId: null,
        branchId: null,
        courseId: null,
      },

      setSelectedPath: (path) => set((state) => ({ selectedPath: { ...state.selectedPath, ...path } })),
      setPrograms: (programs) => set({ programs }),
      setBranches: (branches) => set({ branches }),
      setCourses: (courses) => set({ courses }),
      setPyqs: (pyqs) => set({ pyqs }),
      setUserPyqs: (userPyqs) => set({ userPyqs }),
      setRatings: (pyqId, ratings) => set((state) => ({ ratings: { ...state.ratings, [pyqId]: ratings } })),
      setUploading: (status) => set({ isUploading: status }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      addPyq: (pyq) => set((state) => ({
        pyqs: [...state.pyqs, { ...pyq, fileUrl: pyq.file_url }],
        userPyqs: [...state.userPyqs, { ...pyq, fileUrl: pyq.file_url }],
      })),

      fetchPyqsForPath: async (universityId, programId, branchId, courseId) => {
        try {
          const data = await fetchPyqs(universityId, programId, branchId, courseId);
          const pyqsWithUrls = data.map(pyq => ({ ...pyq, fileUrl: pyq.file_url }));
          set({ pyqs: pyqsWithUrls });
          // Removed fetchPyqRatings logic since it's not needed for QuestionsList
        } catch (error) {
          set({ error: error.message || "Failed to fetch PYQs" });
        }
      },

      fetchUserPyqs: async () => {
        try {
          const data = await fetchUserPyqs();
          set({ userPyqs: data.map(pyq => ({ ...pyq, fileUrl: pyq.file_url })) });
        } catch (error) {
          set({ error: error.message || "Failed to fetch user's PYQs" });
        }
      },

      updateUserPyq: async (pyqId, formData) => {
        try {
          const updatedPyq = await updateUserPyq(pyqId, formData);
          set((state) => ({
            userPyqs: state.userPyqs.map(pyq =>
              pyq.id === pyqId ? { ...pyq, ...updatedPyq, fileUrl: updatedPyq.file_url } : pyq
            ),
          }));
        } catch (error) {
          set({ error: error.message || "Failed to update PYQ" });
        }
      },

      deleteUserPyq: async (pyqId) => {
        try {
          await deleteUserPyq(pyqId);
          set((state) => ({
            userPyqs: state.userPyqs.filter(pyq => pyq.id !== pyqId),
          }));
        } catch (error) {
          set({ error: error.message || "Failed to delete PYQ" });
        }
      },
    }),
    {
      name: 'pyq-storage',
      partialize: (state) => ({ selectedPath: state.selectedPath }),
    }
  )
);

export default usePyqStore;