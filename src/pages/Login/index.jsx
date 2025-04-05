import React, { useState } from "react";
import { PhoneIcon, LockClosedIcon } from "@heroicons/react/outline"; // Import Heroicons
import QRForm from "./QRForm";

function Login() {
  const [isQR, setIsQR] = useState(true); // State to toggle between QR and password login
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
          <form className="space-y-4">
            {/* Input số điện thoại */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className=" px-4 flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="0123456789"
                className="flex-1 px-4 py-2 outline-none"
              />
            </div>

            {/* Input mật khẩu */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className=" px-4 flex items-center text-sm text-gray-600">
                <LockClosedIcon className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="password"
                placeholder="Mật khẩu"
                className="flex-1 px-4 py-2 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
            >
              Đăng nhập với mật khẩu
            </button>

            <div className="text-center">
              <a href="#" className="text-blue-500 text-sm hover:underline">
                Quên mật khẩu
              </a>
            </div>

            <div className="text-center">
              <a
                href="#"
                className="text-blue-500 text-sm font-medium hover:underline"
                onClick={() => setIsQR(!isQR)} // Toggle to QR login
              >
                Đăng nhập qua mã QR
              </a>
            </div>
          </form>
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
