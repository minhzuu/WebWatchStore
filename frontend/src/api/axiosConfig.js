import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 30000, // Increase timeout to 30 seconds for payment processing
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để handle token expired
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is an expected 404 error that should be suppressed (e.g., user hasn't reviewed product)
    const isExpected404 = 
      error.response?.status === 404 && 
      (originalRequest?.suppressError404 || originalRequest?.url?.includes('/reviews/user/'));
    
    // Don't log expected 404 errors - silently handle them
    // These are normal business logic, not actual errors

    // Nếu lỗi là token expired
    // Do not try refresh for auth endpoints (login/register/refresh-token)
    const isAuthRequest =
      originalRequest?.url && originalRequest.url.includes("/auth");
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(
          "http://localhost:8080/api/auth/refresh-token",
          { refreshToken }
        );

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Refresh token failed:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // redirect login
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
