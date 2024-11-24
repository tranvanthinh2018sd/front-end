import axiosInstance from '@/services/axiosInstance';
import { jwtDecode } from "jwt-decode"; // Sử dụng named import


class AuthenticationService {
  // Phương thức login để lấy token và lưu vào localStorage
  async login(username, password) {
    try {
      const response = await axiosInstance.post("/auth/token", { username, password });
      const token = response.data.result.token;
      // Lưu token vào localStorage
      localStorage.setItem("token", token);

      return token;
    } catch (error) {
      throw new Error("Login failed. Please check your credentials.");
    }
  }

  static getUserRole() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.roles || []; // Trả về danh sách role
      } catch (error) {
        console.error("Giải mã token thất bại:", error);
      }
    }
    return [];
  }
  

  // Phương thức logout để xóa token khỏi localStorage
  logout() {
    localStorage.removeItem("token");
  }

  // Kiểm tra xem người dùng đã đăng nhập hay chưa
  isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  // Lấy token từ localStorage
  getToken() {
    return localStorage.getItem("token");
  }
  
}

export default new AuthenticationService();
