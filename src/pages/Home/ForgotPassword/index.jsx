import React, { useState } from "react";
import { Input, Button, Form } from "antd";
import { resetPassword, sendOtpForgot } from "../../../services/UserService";

function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [otpExpireTime, setOtpExpireTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [formMessage, setFormMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [form] = Form.useForm();

  // Gửi OTP
  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setFormMessage("Số điện thoại phải đủ 10 số!");
      setMessageType("error");
      return;
    }
    try {
      let res = await sendOtpForgot(phoneNumber);
      console.log(res);
      
      if (res && res.status === "success") {
        setFormMessage("OTP đã được gửi thành công!");
        setMessageType("success");
        setServerOtp(res.otp);
        setOtpExpireTime(Date.now() + 120 * 1000);
        setCountdown(120);
        setOtpSent(true);

        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setFormMessage("Gửi OTP thất bại. Vui lòng thử lại.");
        setMessageType("error");
      }
    } catch (error) {
      setFormMessage("Gửi OTP thất bại. Vui lòng thử lại.");
      setMessageType("error");
    }
  };

  // Đổi mật khẩu mới
  const handleResetPassword = async (values) => {
    const { otp: otpInput, password } = values;
    if (!otpSent) {
      setFormMessage("Vui lòng gửi OTP trước!");
      setMessageType("error");
      return;
    }
    if (Date.now() > otpExpireTime) {
      setFormMessage("OTP đã hết hạn. Vui lòng gửi lại OTP.");
      setMessageType("error");
      return;
    }
    if (otpInput !== serverOtp) {
      setFormMessage("OTP không chính xác. Vui lòng thử lại.");
      setMessageType("error");
      return;
    }
    try {
      let res = await resetPassword(phoneNumber,otp,password);
      console.log(res);
      
      if (res && res.status === "success") {
        setFormMessage("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        setMessageType("success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setFormMessage("Đổi mật khẩu thất bại. Vui lòng thử lại.");
        setMessageType("error");
      }
    } catch (error) {
      setFormMessage("Đổi mật khẩu thất bại. Vui lòng thử lại.");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Quên mật khẩu
        </h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResetPassword}
          autoComplete="off"
        >
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Số điện thoại phải đủ 10 số!",
              },
            ]}
            validateStatus={
              phoneNumber && !/^[0-9]{10}$/.test(phoneNumber) ? "error" : ""
            }
            help={
              phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)
                ? "Số điện thoại phải đủ 10 số!"
                : ""
            }
          >
            <Input
              placeholder="Nhập số điện thoại"
              value={phoneNumber}
              maxLength={10}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            />
          </Form.Item>
          <Button
            type="primary"
            onClick={handleSendOtp}
            disabled={!/^[0-9]{10}$/.test(phoneNumber) || countdown > 0}
            style={{ marginBottom: 16 }}
          >
            {countdown > 0 ? `Gửi lại OTP (${countdown}s)` : "Gửi OTP"}
          </Button>
          <Form.Item
            label="Mã OTP"
            name="otp"
            rules={[
              { required: true, message: "Vui lòng nhập mã OTP!" },
              {
                pattern: /^[0-9]{4,6}$/,
                message: "OTP phải là 4-6 số!",
              },
            ]}
            validateStatus={otp && !/^[0-9]{4,6}$/.test(otp) ? "error" : ""}
            help={
              otp && !/^[0-9]{4,6}$/.test(otp)
                ? "OTP phải là 4-6 số!"
                : ""
            }
          >
            <Input
              placeholder="Nhập mã OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.#_-]{8,}$/,
                message:
                  "Mật khẩu tối thiểu 8 ký tự, gồm chữ và số, có thể có ký tự đặc biệt!",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ marginTop: 8 }}
          >
            Đổi mật khẩu
          </Button>
          {countdown > 0 && (
            <p className="text-center text-gray-600 mt-2">
              OTP sẽ hết hạn sau {countdown} giây
            </p>
          )}
          {formMessage && (
            <p
              className={`mt-2 text-center ${
                messageType === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formMessage}
            </p>
          )}
        </Form>
      </div>
    </div>
  );
}

export default ForgotPassword;