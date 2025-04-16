// src/store/ratingStore.js
import { create } from 'zustand';
import { 
  fetchCommentsForQuestion, 
  saveCommentToBackend, 
  updateCommentInBackend, 
  deleteCommentFromBackend 
} from '@/utils/api/ratingApi';

const useRatingStore = create((set, get) => ({
  comments: {}, // { pyqId: [comment1, comment2, ...] }
  loadingComments: false,
  error: null,

  fetchComments: async (pyqId, token) => {
    set({ loadingComments: true, error: null });
    try {
      console.log(`Fetching comments for pyqId: ${pyqId}, token: ${token || 'none'}`);
      const commentsData = await fetchCommentsForQuestion(pyqId, token);
      console.log(`Comments fetched for pyqId ${pyqId}:`, commentsData);
      if (!Array.isArray(commentsData)) {
        throw new Error("Invalid comments data: Expected an array");
      }
      set((state) => ({
        comments: { ...state.comments, [pyqId]: commentsData },
      }));
    } catch (error) {
      console.error(`Error fetching comments for pyqId ${pyqId}:`, error);
      set({ error: error.message || 'Failed to fetch comments' });
    } finally {
      set({ loadingComments: false });
    }
  },

  addComment: async (pyqId, commentObj, token) => {
    set({ error: null });
    try {
      const newComment = await saveCommentToBackend(pyqId, commentObj, token);
      set((state) => ({
        comments: {
          ...state.comments,
          [pyqId]: [...(state.comments[pyqId] || []), newComment],
        },
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to add comment' });
      throw error;
    }
  },

  updateComment: async (pyqId, commentId, text, rating, token) => {
    set({ error: null });
    try {
      const updatedComment = await updateCommentInBackend(pyqId, commentId, text, rating, token);
      set((state) => ({
        comments: {
          ...state.comments,
          [pyqId]: state.comments[pyqId].map((c) =>
            c.id === commentId ? { ...c, comment: text, rating } : c
          ),
        },
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to update comment' });
      throw error;
    }
  },

  deleteComment: async (pyqId, commentId, token) => {
    set({ error: null });
    if (!commentId) {
      const errorMsg = "deleteComment: commentId is undefined";
      console.error(errorMsg);
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
    try {
      console.log(`Deleting comment ${commentId} for pyqId ${pyqId}`); // Debug
      await deleteCommentFromBackend(pyqId, commentId, token);
      set((state) => ({
        comments: {
          ...state.comments,
          [pyqId]: state.comments[pyqId].filter((c) => c.id !== commentId),
        },
      }));
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      set({ error: error.message || 'Failed to delete comment' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useRatingStore;