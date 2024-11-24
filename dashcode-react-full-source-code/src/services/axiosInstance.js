import axios from 'axios';
import useAuth from '@/hooks/useAuth';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        try {
          const response = await axiosInstance.post("/refresh", {
            refreshToken,
          });

          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } catch (error) {
          const { handleUnauthorized } = useAuth();
          handleUnauthorized();  // Điều hướng đến trang đăng nhập
          return Promise.reject(error);
        }
      } else {
        const { handleUnauthorized } = useAuth();
        handleUnauthorized();  // Điều hướng đến trang đăng nhập
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// import axios from "axios";
// // import { useHistory } from "react-router-dom";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_APP_API_URL,
//   timeout: 10000,
// });

// // const useAuth = () => {
// // const history = useHistory();

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = "aaaaaaaaaaa";
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     if (error?.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const refreshToken = localStorage.getItem("refreshToken");
//       if (refreshToken) {
//         try {
//           const response = await axiosInstance.post("/refresh-token", {
//             refreshToken,
//           });
//           const newAccessToken = response.data.accessToken;
//           localStorage.setItem("accessToken", newAccessToken);
//           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//           return axiosInstance(originalRequest);
//         } catch (error) {
//           // history.push("/login");
//           // toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
//           return Promise.reject(error);
//         }
//       } else {
//         // Nếu không có refresh token, đẩy người dùng đến trang đăng nhập và hiển thị toast
//         // history.push("/login");
//         // toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
//         return Promise.reject(error);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
