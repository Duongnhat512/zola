import React, { useState } from "react";
import { Input, Button, Form, Radio, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { registerUser, sendOtp } from "../../services/UserService";

function Register() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [serverOtp, setServerOtp] = useState("");
  const [otpExpireTime, setOtpExpireTime] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [formMessage, setFormMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSendOtp = async () => {
    try {
      let res = await sendOtp(phoneNumber);

      if (res && res.status === "success") {
        setFormMessage("OTP đã được gửi thành công!");
        setMessageType("success");
        setServerOtp(res.otp);
        setOtpExpireTime(Date.now() + 120 * 1000);
        setCountdown(120);
        setStep(2);

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

  const handleVerifyOtp = async () => {
    if (Date.now() > otpExpireTime) {
      setFormMessage("OTP đã hết hạn. Vui lòng gửi lại OTP.");
      setMessageType("error");
      return;
    }

    if (otp === serverOtp) {
      setFormMessage("Xác nhận OTP thành công!");
      setMessageType("success");
      setStep(3);
    } else {
      setFormMessage("OTP không chính xác. Vui lòng thử lại.");
      setMessageType("error");
    }
  };

  const handleRegister = async (values) => {
    const { fullname, password, dob, gender } = values;
    const data = {
      username: phoneNumber,
      phone: phoneNumber,
      password,
      fullname,
      dob: dob.format("DD/MM/YYYY"),
      gender,
      status: "Online",
    };

    try {
      console.log("Registering user with data:", data);

      let res = await registerUser(data);
      console.log("Register response:", res);

      setFormMessage("Đăng ký thành công!");
      setMessageType("success");
      navigate("/login");
    } catch (error) {
      setFormMessage("Đăng ký thất bại. Vui lòng thử lại.");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Đăng ký tài khoản Zola
        </h1>

        {step === 1 && (
          <div>
            <Form layout="vertical">
              <Form.Item
                label="Số điện thoại"
                required
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải đủ 10 số!",
                  },
                ]}
                validateStatus={
                  phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)
                    ? "error"
                    : ""
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
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                />
              </Form.Item>
              <Button
                type="primary"
                block
                onClick={handleSendOtp}
                disabled={!/^[0-9]{10}$/.test(phoneNumber)}
              >
                Gửi OTP
              </Button>
              {formMessage && (
                <p
                  className={`mt-2 text-center ${messageType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {formMessage}
                </p>
              )}
            </Form>
          </div>
        )}

        {step === 2 && (
          <div>
            <Form layout="vertical">
              <Form.Item
                label="Nhập mã OTP"
                required
                rules={[
                  { required: true, message: "Vui lòng nhập mã OTP!" },
                  {
                    pattern: /^[0-9]{4,6}$/,
                    message: "OTP phải là 4-6 số!",
                  },
                ]}
                validateStatus={
                  otp && !/^[0-9]{4,6}$/.test(otp) ? "error" : ""
                }
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
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                />
              </Form.Item>
              <div className="flex justify-between">
                <Button onClick={() => setStep(1)}>Quay lại</Button>
                <Button
                  type="primary"
                  onClick={handleVerifyOtp}
                  disabled={countdown === 0 || !/^[0-9]{4,6}$/.test(otp)}
                >
                  Xác nhận OTP
                </Button>
              </div>
              <p className="text-center text-gray-600 mt-2">
                {countdown > 0
                  ? `OTP sẽ hết hạn sau ${countdown} giây`
                  : "OTP đã hết hạn. Vui lòng gửi lại OTP."}
              </p>
              {formMessage && (
                <p
                  className={`mt-2 text-center ${messageType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {formMessage}
                </p>
              )}
            </Form>
          </div>
        )}

        {step === 3 && (
          <div>
            <Form form={form} layout="vertical" onFinish={handleRegister}>
              <Form.Item
                label="Họ và tên"
                name="fullname"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  {
                    pattern: /^[A-Za-zÀ-ỹà-ỹ\s.'-]{2,50}$/,
                    message: "Họ tên chỉ chứa chữ cái, khoảng trắng, dấu và dài 2-50 ký tự!",
                  },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  {
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&.#_-]{8,}$/,
                    message:
                      "Mật khẩu tối thiểu 8 ký tự, gồm chữ và số, có thể có ký tự đặc biệt!",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Radio.Group>
                  <Radio value="male">Nam</Radio>
                  <Radio value="female">Nữ</Radio>
                </Radio.Group>
              </Form.Item>
              <div className="flex justify-between">
                <Button onClick={() => setStep(2)}>Quay lại</Button>
                <Button type="primary" htmlType="submit">
                  Đăng ký
                </Button>
              </div>
              {formMessage && (
                <p
                  className={`mt-2 text-center ${messageType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {formMessage}
                </p>
              )}
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;