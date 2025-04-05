import React, { useState } from "react";
import { PhoneIcon, LockClosedIcon } from "@heroicons/react/outline"; // Import Heroicons
import QRForm from "./QRForm";
import { LoginForm } from "./LoginForm";
import { LoginUser } from "../../services/UserService";

function Login() {
  const [isQR, setIsQR] = useState(true); // State to toggle between QR and password login
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state
  const [phoneNumber, setPhoneNumber] = useState(""); // State to manage phone number input
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = {
        username: phoneNumber,
        password: password,
      };
      setIsLoading(true);
      const res = await LoginUser(data);
      setIsLoading(false);

      if (res) {
        console.log("Đăng nhập thành công");
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại sau.");
      }
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng thử lại sau.", err);
    }
  };
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

        {/* Form đăng nhập */}
        {isQR ? (
          <LoginForm
            setIsQR={setIsQR}
            isQR={isQR}
            phoneNumber={phoneNumber}
            password={password}
            setIsLoading={setIsLoading}
            setPhoneNumber={setPhoneNumber}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
        ) : (
          <QRForm setIsQR={setIsQR} isQR={isQR} />
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
