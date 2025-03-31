// src/utils/api/pyqApi.js
import axios from "axios";
import { refreshAuthToken } from "@/store/authStore";

const API_URL = "http://localhost:8000/api/";

const getAuthHeaders = async () => {
  let token = localStorage.getItem("token");
  if (!token) {
    token = await refreshAuthToken();
    if (!token) throw new Error("No authentication token found. Please log in.");
  }
  return {
    "Content-Type": "multipart/form-data",
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

export const uploadPyq = async (formData) => {
  return apiRequest('post', `${API_URL}pyqs/upload/`, formData, await getAuthHeaders());
};

export const fetchUserPyqs = async () => {
  return apiRequest('get', `${API_URL}pyqs/myuploads/`, null, await getAuthHeaders());
};

export const updateUserPyq = async (pyqId, formData) => {
  return apiRequest('put', `${API_URL}pyqs/myuploads/${pyqId}/`, formData, await getAuthHeaders());
};

export const deleteUserPyq = async (pyqId) => {
  return apiRequest('delete', `${API_URL}pyqs/myuploads/${pyqId}/`, null, await getAuthHeaders());
};

export const fetchPyqs = async (universityId, programId, branchId, courseId) => {
  return apiRequest('get', `${API_URL}pyqs/university/${universityId}/program/${programId}/branch/${branchId}/courses/${courseId}/`);
};

export const fetchPrograms = async (universityId) => {
  return apiRequest('get', `${API_URL}universities/${universityId}/programs/`);
};

export const fetchBranches = async (programId) => {
  return apiRequest('get', `${API_URL}programs/${programId}/branches/`);
};

export const fetchCourses = async (branchId) => {
  return apiRequest('get', `${API_URL}branches/${branchId}/courses/`);
};

export const fetchProfile = async () => {
  return apiRequest('get', `${API_URL}users/profile/`, null, await getAuthHeaders());
};