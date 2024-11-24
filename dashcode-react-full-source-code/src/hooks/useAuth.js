import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const navigate = useNavigate(); // Khởi tạo hook useNavigate

  // Hàm điều hướng đến trang login khi gặp lỗi hết hạn token
  const handleUnauthorized = () => {
    navigate("/login");
  };

  return {
    handleUnauthorized,  // Trả về hàm này để sử dụng ở các nơi khác
  };
};

export default useAuth;
