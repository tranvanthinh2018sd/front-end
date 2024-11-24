import axiosInstance from "@/utils/axiosInstance";  // import your axios instance

export const handleLogout = () => async (dispatch) => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await axiosInstance.post("/auth/logout", { token: refreshToken });
    }
    
    // Clear tokens and dispatch logout action
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // Redirect to login or perform additional logout actions
    dispatch({ type: "LOGOUT" });
  } catch (error) {
    console.error("Logout failed:", error);
    // Handle error if needed
  }
};
