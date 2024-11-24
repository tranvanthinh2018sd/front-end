  import axiosInstance from "./axiosInstance";
  import * as jwt_decode from 'jwt-decode';

  class UserService {
    async getUsers() {
      try {
        const response = await axiosInstance.get("/users", {
          headers: { Authorization: `Bearer ${this.getToken()}` },
        });
        return response.data.result;
      } catch (error) {
        console.error("Có lỗi khi lấy danh sách người dùng:", error);
        throw new Error("Không thể lấy danh sách người dùng.");
      }
    }

    async getUserById(userId) {
      try {
        const token = this.getToken();
        const response = await axiosInstance.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.result; // Đảm bảo API trả về dữ liệu ở `result`
      } catch (error) {
        console.error("Có lỗi khi lấy thông tin người dùng:", error);
        throw new Error("Không thể lấy thông tin người dùng.");
      }
    }
    

    async fetchUserInfo() {
      try {
        const token = this.getToken();
        if (!token) {
          throw new Error("Token không tồn tại");
        }

        const response = await axiosInstance.get("/users/my-info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userInfo = response.data.result;
        if (!userInfo || !userInfo.roles) {
          throw new Error("Phản hồi không có thông tin về roles của người dùng");
        }

        return userInfo.roles.map((role) => role.name);
      } catch (error) {
        console.error("Có lỗi khi lấy thông tin người dùng:", error);
        throw new Error("Không thể lấy thông tin người dùng.");
      }
    }
    async getRoles() {
      try {
        const token = this.getToken();
        if (!token) {
          throw new Error("Token không tồn tại");
        }
    
        const response = await axiosInstance.get("/roles", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        const roles = response.data.result;
        if (!roles || roles.length === 0) {
          throw new Error("Không tìm thấy vai trò nào.");
        }
    
        return roles; // Trả về toàn bộ role object (id và name)
      } catch (error) {
        console.error("Có lỗi khi lấy danh sách vai trò:", error);
        throw new Error("Không thể lấy danh sách vai trò.");
      }
    }    

    getToken() {
      return localStorage.getItem("token");
    }

    async getUserRoles() {
      const roles = await this.fetchUserInfo();
      return roles;
    }

    async updateUser(userId, userData) {
      try {
        const token = this.getToken();
        const response = await axiosInstance.put(`/users/${userId}`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.result;
      } catch (error) {
        console.error("Có lỗi khi cập nhật thông tin người dùng:", error);
        throw new Error("Không thể cập nhật thông tin người dùng.");
      }
    }

    async deleteUser(userId) {
      try {
        const token = this.getToken();
        const response = await axiosInstance.delete(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.result;
      } catch (error) {
        console.error("Có lỗi khi xóa người dùng:", error);
        throw new Error("Không thể xóa người dùng.");
      }
    }
    async getAllEmployees() {
      try {
          const token = this.getToken();
          const response = await axiosInstance.get(`/api/employees`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          return response.data;  // Trả về dữ liệu nhân viên
      } catch (error) {
          console.error("Error fetching employees:", error);
          throw new Error("Không thể lấy thông tin nhân viên.");
      }
  }
  async createUser(userData) {
    try {
      const token = this.getToken(); // Lấy token từ localStorage
      const response = await axiosInstance.post(`/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.result; // Trả về dữ liệu kết quả từ API
    } catch (error) {
      console.error("Có lỗi khi tạo người dùng mới:", error);
      throw new Error("Không thể tạo người dùng mới.");
    }
  }
    logout() {
      localStorage.removeItem("token");
    }

    isLoggedIn() {
      return !!localStorage.getItem("token"); // Double negation for a boolean check
    }

    getUserRole() { // Removed duplicate method (use getUserRoles instead)
    }
  }
  
  export default new UserService();