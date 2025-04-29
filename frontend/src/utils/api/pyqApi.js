// src/utils/api/pyqApi.js
import axios from "axios";
import { refreshAuthToken } from "@/store/authStore";
import { API_URL } from '../../config';

const getAuthHeaders = async () => {
  let token = localStorage.getItem("token");
  if (!token) {
    token = await refreshAuthToken();
    if (!token) throw new Error("No authentication token found. Please log in.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const apiRequest = async (method, url, data = null, headers = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshAuthToken();
      if (newToken) {
        return await apiRequest(method, url, data, { ...headers, Authorization: `Bearer ${newToken}` });
      }
      throw new Error("Authentication failed. Please log in again.");
    }
    throw new Error(error.response?.data?.detail || "API request failed");
  }
};

export const fetchUniversities = async (query = '') => {
  console.log('Fetching universities with query:', query);
  return apiRequest('get', `${API_URL}/universities/universities/?q=${encodeURIComponent(query)}`);
};

export const fetchPrograms = async (universityId) => {
  console.log('Fetching programs for universityId:', universityId);
  return apiRequest('get', `${API_URL}/universities/programs/?university=${universityId}`);
};

export const fetchBranches = async (programId) => {
  console.log('Fetching branches for programId:', programId);
  return apiRequest('get', `${API_URL}/universities/branches/?program=${programId}`);
};

export const fetchCourses = async (branchId) => {
  console.log('Fetching courses for branchId:', branchId);
  return apiRequest('get', `${API_URL}/universities/courses/?branch=${branchId}`);
};

export const fetchPyqs = async (universityId, programId, branchId, courseId) => {
  console.log('Fetching PYQs for:', { universityId, programId, branchId, courseId });
  return apiRequest('get', `${API_URL}/pyqs/university/${universityId}/program/${programId}/branch/${branchId}/courses/${courseId}/`);
};

export const fetchSearchSuggestions = async (query) => {
  console.log('Fetching suggestions with query:', query);
  return apiRequest('get', `${API_URL}/pyqs/suggestions/?q=${encodeURIComponent(query)}`);
};

export const uploadPyq = async (formData) => {
  return apiRequest('post', `${API_URL}/pyqs/upload/`, formData, {
    ...(await getAuthHeaders()),
    "Content-Type": "multipart/form-data",
  });
};

export const fetchUserPyqs = async () => {
  return apiRequest('get', `${API_URL}/pyqs/myuploads/`, null, await getAuthHeaders());
};

export const updateUserPyq = async (pyqId, formData) => {
  return apiRequest('put', `${API_URL}/pyqs/myuploads/${pyqId}/`, formData, {
    ...(await getAuthHeaders()),
    "Content-Type": "multipart/form-data",
  });
};

export const deleteUserPyq = async (pyqId) => {
  return apiRequest('delete', `${API_URL}/pyqs/myuploads/${pyqId}/`, null, await getAuthHeaders());
};

export const fetchComments = async (pyqId) => {
  const data = await apiRequest('get', `${API_URL}/pyqs/${pyqId}/ratings/`);
  console.log(`Fetched comments for pyqId ${pyqId}:`, data);
  return data;
};

export const ratePyq = async (pyqId, rating, comment) => {
  return apiRequest('post', `${API_URL}/pyqs/${pyqId}/rate/`, { rating, comment }, await getAuthHeaders());
};

export const updateComment = async (commentId, rating, comment) => {
  return apiRequest('patch', `${API_URL}/pyqs/ratings/${commentId}/`, { rating, comment }, await getAuthHeaders());
};

export const deleteComment = async (commentId) => {
  if (!commentId) {
    console.error("deleteComment: commentId is undefined");
    throw new Error("Cannot delete comment: No valid ID provided");
  }
  console.log(`Deleting comment with ID: ${commentId}`);
  return apiRequest('delete', `${API_URL}/universities/ratings/${commentId}/`, null, await getAuthHeaders());
};

export const fetchProfile = async () => {
  return apiRequest('get', `${API_URL}/auth/users/profile/`, null, await getAuthHeaders());
};
