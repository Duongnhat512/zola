import React from "react";

export default function QRForm({ setIsQR, isQR }) {
  return (
    <div>
      <div className="flex">
        <p className="text-center text-gray-600 mb-6 flex-3">
          Mở ứng dụng Zalo trên điện thoại và quét mã QR bên dưới để đăng nhập
        </p>
      </div>

      <div className="flex flex-col items-center justify-center mb-6 border rounded-lg p-4 bg-white shadow-md">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
          alt="QR Code"
          className="w-40 h-40"
        />
        <div className="text-center text-blue-600">Chỉ dùng để đăng nhập</div>
        <div className="text-center text-gray-600">T1 Zola trên máy tính</div>
      </div>
      <div className="text-center">
        <button
          className="text-blue-500 text-sm font-medium hover:underline"
          onClick={() => {
            setIsQR(!isQR); // Toggle to password login
          }}
        >
          Đăng nhập qua mật khẩu
        </button>
      </div>
    </div>
  );
}
