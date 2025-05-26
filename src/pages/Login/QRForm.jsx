import React, { useEffect, useState } from "react";
import axios from "axios";
import { getQrSession, loginQR } from "../../services/UserService";
import { QRCodeCanvas } from "qrcode.react";

export default function QRForm({ setIsQR, isQR }) {
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    // Gọi API tạo session QR khi mount
    const createQrSession = async () => {
      try {
        const response = await loginQR();
        console.log("QR session response:", response);

        if (response.sessionId) {
          setSessionId(response.sessionId);
          setStatus("pending");
        } else {
          console.error("Không thể tạo mã QR, vui lòng thử lại sau.");
        }
      } catch (error) {
        console.error("Lỗi khi tạo mã QR:", error);
      }
    };
    createQrSession();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const response = await getQrSession(sessionId);
        console.log("QR session status:", response);
        if (!isMounted) return;
        if (response.status === "authenticated") {
          setStatus("authenticated");
          clearInterval(interval);
          if (response.token) {
            localStorage.setItem("accessToken", response.token);
            window.location.reload();
          }
        } else if (response.status === "expired") {
          setStatus("expired");
          clearInterval(interval);
        } else {
          setStatus("pending");
        }
      } catch (error) {
        console.error("Error fetching QR session:", error);
      }
    }, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  return (
    <div>
      <div className="flex">
        <p className="text-center text-gray-600 mb-6 flex-3">
          Mở ứng dụng Zalo trên điện thoại và quét mã QR bên dưới để đăng nhập
        </p>
      </div>
      <div className="flex flex-col items-center justify-center mb-6 border rounded-lg p-4 bg-white shadow-md">
        {sessionId ? (
          <QRCodeCanvas value={sessionId} size={160} />
        ) : (
          <div>Đang tạo mã QR...</div>
        )}
        <div className="text-center text-blue-600">Chỉ dùng để đăng nhập</div>
        <div className="text-center text-gray-600">T1 Zola trên máy tính</div>
        {status === "authenticated" && (
          <div className="text-green-600 font-bold mt-2">Đăng nhập thành công!</div>
        )}
      </div>
      <div className="text-center">
        <button
          className="text-blue-500 text-sm font-medium hover:underline"
          onClick={() => setIsQR(!isQR)}
        >
          Đăng nhập qua mật khẩu
        </button>
      </div>
    </div>
  );
}