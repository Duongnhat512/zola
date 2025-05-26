import { useState } from "react";
import { LockClosedIcon, PhoneIcon } from "@heroicons/react/outline";

export const LoginForm = ({
  setIsQR,
  isQR,
  phoneNumber,
  password,
  setPhoneNumber,
  setPassword,
  handleLogin,
}) => {
  // Cho phép: SĐT 10 số hoặc nhập đúng chữ "admin"
  const isPhoneValid = /^\d{10}$/.test(phoneNumber) || phoneNumber === "admin";
  const isPasswordValid = password.length > 0;
  const canLogin = isPhoneValid && isPasswordValid;

  return (
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
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
          maxLength={10}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        onClick={canLogin ? handleLogin : (e) => e.preventDefault()}
        className={`w-full font-semibold py-2 rounded-lg text-white ${
          canLogin
            ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        disabled={!canLogin}
      >
        Đăng nhập với mật khẩu
      </button>

      <div className="text-center text-gray-600 mb-4 flex items-center justify-between">
        <a href="forgot" className="text-blue-500 text-sm hover:underline">
          Quên mật khẩu
        </a>
        <a href="/register" className="text-blue-500 text-sm hover:underline">
          Đăng ký
        </a>
      </div>

      <div className="text-center">
        <a
          className="text-blue-500 text-sm font-medium hover:underline"
          onClick={() => setIsQR(!isQR)}
        >
          Đăng nhập qua mã QR
        </a>
      </div>
    </form>
  );
};