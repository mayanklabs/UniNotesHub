// src/utils/api/ratingApi.js
import axios from 'axios';
import { refreshAuthToken } from '@/store/authStore';
import { API_URL } from '../../config';

const getAuthHeaders = async (token = null) => {
  let authToken = token || localStorage.getItem('token');
  if (!authToken) {
    authToken = await refreshAuthToken();
    if (!authToken) throw new Error('No authentication token found. Please log in.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };
};

const apiRequest = async (method, url, data = null, token = null, requireAuth = true) => {
  try {
    let headers = { 'Content-Type': 'application/json' };
    if (requireAuth) {
      headers = await getAuthHeaders(token);
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios({
      method,
      url,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && requireAuth) {
      const newToken = await refreshAuthToken();
      if (newToken) {
        return await apiRequest(method, url, data, newToken, requireAuth);
      }
      throw new Error('Authentication failed. Please log in again.');
    }
    const errorMessage = error.response?.data?.detail || error.message || 'API request failed';
    const errorDetails = {
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage,
    };
    throw new Error(JSON.stringify(errorDetails));
  }
};

export const fetchCommentsForQuestion = async (pyqId, token = null) => {
  const data = await apiRequest('get', `${API_URL}/pyqs/${pyqId}/ratings/`, null, token, false);
  console.log(`Fetched comments for pyqId ${pyqId}:`, data); // Debug
  return data;
};

export const saveCommentToBackend = async (pyqId, commentObj, token) => {
  const payload = {
    pyq: pyqId,
    rating: commentObj.rating,
    comment: commentObj.text
  };
  return apiRequest('post', `${API_URL}/pyqs/${pyqId}/rate/`, payload, token, true);
};

export const updateCommentInBackend = async (pyqId, commentId, text, rating, token) => {
  const payload = { comment: text, rating };
  return apiRequest('patch', `${API_URL}/ratings/${commentId}/`, payload, token, true);
};

export const deleteCommentFromBackend = async (pyqId, commentId, token) => {
  if (!commentId) {
    console.error("deleteCommentFromBackend: commentId is undefined");
    throw new Error("Cannot delete comment: No valid ID provided");
  }
  console.log(`Deleting comment with ID: ${commentId} for pyqId: ${pyqId}`); // Debug
  return apiRequest('delete', `${API_URL}/ratings/${commentId}/`, null, token, true);
};
