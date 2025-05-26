import React, { useEffect, useState } from "react";
import { PhoneIcon, LockClosedIcon } from "@heroicons/react/outline"; // Import Heroicons
import QRForm from "./QRForm";
import { LoginForm } from "./LoginForm";
import { LoginUser } from "../../services/UserService";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, setLoading } from "../../redux/UserSlice"; // Import the login and setLoading actions from UserSlice

function Login() {
  const [isQR, setIsQR] = useState(true); // State to toggle between QR and password login
  const [phoneNumber, setPhoneNumber] = useState(""); // State to manage phone number input
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading); // Lấy trạng thái loading từ Redux
  const authenticated = useSelector((state) => state.user.authenticated); // Lấy thông tin người dùng từ Redux

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = {
        username: phoneNumber,
        password: password,
      };
      dispatch(setLoading(true)); // Bắt đầu loading
      const res = await LoginUser(data);
      dispatch(setLoading(false)); // Kết thúc loading

      if (res && res.status === "success") {
        dispatch(login(res.user)); // Lưu thông tin người dùng vào Redux
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        if (socket && res.user?.id) {
          window.socket.emit("get_conversations", { user_id: res.user.id });
        }
        // navigate("/"); // Chuyển hướng về trang Home
        navigate("/"); // Chuyển về Home
        window.location.reload();
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại sau.");
      }
    } catch (err) {
      dispatch(setLoading(false)); // Kết thúc loading nếu có lỗi
      setError("Đăng nhập thất bại. Vui lòng thử lại sau.");
    }
  };
  useEffect(() => {
    if (authenticated) {
      navigate("/"); // Chuyển hướng về trang Home nếu đã đăng nhập
    }
  }, [navigate]);
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {/* Logo */}
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
          Zalo
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Đăng nhập tài khoản Zalo
          <br />
          để kết nối với ứng dụng Zalo Web
        </p>

        {/* Hiển thị loader khi đang loading */}
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="loader"></div>
            <p className="mt-4 text-lg text-gray-700">Đang xử lý...</p>
          </div>
        ) : (
          <>
            {/* Form đăng nhập */}
            {isQR ? (
              <LoginForm
                setIsQR={setIsQR}
                isQR={isQR}
                phoneNumber={phoneNumber}
                password={password}
                setPhoneNumber={setPhoneNumber}
                setPassword={setPassword}
                handleLogin={handleLogin}
              />
            ) : (
              <QRForm setIsQR={setIsQR} isQR={isQR} />
            )}
          </>
        )}

        {/* Quảng cáo Zalo PC */}
        <div className="bg-blue-50 mt-6 p-4 rounded-lg flex items-center justify-between text-sm text-gray-600">
          <div>
            <p className="font-medium">
              Nâng cao hiệu quả công việc với Zalo PC
            </p>
            <p>
              Gửi file lớn lên đến 1 GB, chụp màn hình, gọi video và nhiều tiện
              ích hơn nữa
            </p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-semibold">
            Tải ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
