import axiosInstance from "./axiosInstance";
import "react-toastify/dist/ReactToastify.css";
class ApiClient {
  get = async (url, params) => {
    try {
      const response = await axiosInstance.get(url, { params });
      return response.data;
    } catch (error) {
      return {
        succeeded: false,
        code: 1,
        message: error.toString(),
      };
    }
  };
  post = async (url, data) => {

    try {
      const response = await axiosInstance.post(url, data);
      return response.data;
    } catch (error) {
      return {
        succeeded: false,
        code: 1,
        message: error.toString(),
      };
    }
  };
  put = async (url, data) => {
    try {
      const response = await axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      return {
        succeeded: false,
        code: 1,
        message: error.toString(),
      };
    }
  };
  delete = async (url) => {
    try {
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      return {
        succeeded: false,
        code: 1,
        message: error.toString(),
      };
    }
  };
}

const apiClient = new ApiClient();

export default apiClient;
