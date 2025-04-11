// src/store/pyqStore.js
import { create } from "zustand";
import {
  fetchPrograms,
  fetchBranches,
  fetchCourses,
  fetchPyqs,
  fetchUserPyqs,
  updateUserPyq,
  deleteUserPyq,
} from "@/utils/api/pyqApi";

const usePyqStore = create((set, get) => ({
  selectedPath: {
    universityId: "",
    programId: "",
    branchId: "",
    courseId: "",
  },

  programs: [],
  branches: [],
  courses: [],
  pyqs: [],
  userPyqs: [],

  isUploading: false,
  error: null,

  setPrograms: (programs) => set({ programs }),
  setBranches: (branches) => set({ branches }),
  setCourses: (courses) => set({ courses }),
  setUploading: (isUploading) => set({ isUploading }),
  setError: (error) => set({ error }),
  setSelectedPath: (path) =>
    set({ selectedPath: { ...get().selectedPath, ...path } }),

  addPyq: (pyq) =>
    set((state) => ({
      pyqs: [pyq, ...state.pyqs],
      userPyqs: [pyq, ...state.userPyqs],
      selectedPath: {
        universityId: pyq.university || state.selectedPath.universityId,
        programId: pyq.program || state.selectedPath.programId,
        branchId: pyq.branch || state.selectedPath.branchId,
        courseId: pyq.course || state.selectedPath.courseId,
      },
    })),

  resetFormState: () =>
    set({
      selectedPath: { universityId: "", programId: "", branchId: "", courseId: "" },
      programs: [],
      branches: [],
      courses: [],
      error: null,
    }),

  fetchPyqsForPath: async (universityId, programId, branchId, courseId) => {
    try {
      const data = await fetchPyqs(universityId, programId, branchId, courseId);
      set({ pyqs: data });
    } catch (error) {
      set({ error: error.message || "Failed to fetch PYQs" });
    }
  },

  fetchUserPyqs: async () => {
    try {
      const data = await fetchUserPyqs();
      console.log("fetchUserPyqs response:", data);
      set({ userPyqs: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("fetchUserPyqs error:", error);
      set({ error: error.message || "Failed to fetch user PYQs", userPyqs: [] });
    }
  },

  updateUserPyq: async (pyqId, formData) => {
    try {
      const updatedPyq = await updateUserPyq(pyqId, formData);
      set((state) => ({
        userPyqs: state.userPyqs.map((pyq) =>
          pyq.id === pyqId ? { ...pyq, ...updatedPyq } : pyq
        ),
      }));
    } catch (error) {
      set({ error: error.message || "Failed to update PYQ" });
      throw error;
    }
  },

  deleteUserPyq: async (pyqId) => {
    try {
      await deleteUserPyq(pyqId);
      console.log("deleteUserPyq successful, pyqId:", pyqId);
      set((state) => ({
        userPyqs: state.userPyqs.filter((pyq) => pyq.id !== pyqId),
      }));
    } catch (error) {
      console.error("deleteUserPyq error:", error);
      set({ error: error.message || "Failed to delete PYQ" });
      throw error;
    }
  },

  fetchPrograms: async (universityId) => {
    try {
      const data = await fetchPrograms(universityId);
      set({ programs: data });
    } catch (error) {
      set({ error: error.message || "Failed to fetch programs" });
    }
  },

  fetchBranches: async (programId) => {
    try {
      const data = await fetchBranches(programId);
      set({ branches: data });
    } catch (error) {
      set({ error: error.message || "Failed to fetch branches" });
    }
  },

  fetchCourses: async (branchId) => {
    try {
      const data = await fetchCourses(branchId);
      set({ courses: data });
    } catch (error) {
      set({ error: error.message || "Failed to fetch courses" });
    }
  },
}));

export default usePyqStore;