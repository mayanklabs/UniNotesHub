import axios from "axios";

const API_URL = "http://localhost:8000/api";
const tokenRefreshEndpoint = `${API_URL}/token/refresh/`;

// Function to get tokens from local storage
const getTokens = () => {
    return {
        access: localStorage.getItem("accessToken"),
        refresh: localStorage.getItem("refreshToken"),
    };
};

// Function to save new tokens
const saveTokens = (access, refresh) => {
    localStorage.setItem("accessToken", access);
    if (refresh) {
        localStorage.setItem("refreshToken", refresh);
    }
};

// Function to remove tokens (e.g., if refresh fails)
const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};

// Function to refresh access token
const refreshAccessToken = async () => {
    try {
        const { refresh } = getTokens();
        if (!refresh) throw new Error("No refresh token found.");

        const response = await axios.post(tokenRefreshEndpoint, { refresh });
        const { access, refresh: newRefresh } = response.data;

        // Save new tokens
        saveTokens(access, newRefresh);
        return access;
    } catch (error) {
        console.error("Token refresh failed:", error.response?.data || error.message);
        clearTokens(); // Remove invalid tokens
        window.location.href = "/login"; // Redirect to login page
        throw new Error("Session expired. Please log in again.");
    }
};

// Function to update user profile
export const updateProfile = async (profileData) => {
    let { access } = getTokens();

    try {
        const response = await axios.put(`${API_URL}/users/profile/`, profileData, {
            headers: { Authorization: `Bearer ${access}` },
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            console.warn("Token expired, attempting refresh...");
            try {
                access = await refreshAccessToken();
                // Retry the request with new access token
                const response = await axios.put(`${API_URL}/users/profile/`, profileData, {
                    headers: { Authorization: `Bearer ${access}` },
                });
                return response.data;
            } catch (retryError) {
                console.error("Failed to update profile after token refresh:", retryError);
                throw new Error("Profile update failed. Please try again.");
            }
        } else {
            console.error("Profile update error:", error.response?.data || error.message);
            throw new Error("Profile update failed.");
        }
    }
};
