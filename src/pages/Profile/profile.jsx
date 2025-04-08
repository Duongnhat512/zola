import { EditTwoTone } from "@ant-design/icons";
import { Button, Image, Modal, Input, Radio, Select, Form } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { decodedToken, updateUser } from "../../services/UserService";
import { login, setLoading } from "../../redux/UserSlice";

const Profile = ({ isModalOpen, setModalOpen }) => {
  const isAuthenticated = useSelector((state) => state.user.authenticated);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch(); // Redux dispatch function
  const [modalContent, setModalContent] = useState("profile"); // State to manage modal content
  const [form] = Form.useForm(); // Ant Design form instance
  const initAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const res = await decodedToken();
        if (res?.user) {
          dispatch(login(res.user));
        }
      } catch (err) {
        console.error("Token không hợp lệ hoặc đã hết hạn.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    dispatch(setLoading(false)); // Kết thúc loading
  };
  const handleUpdateClick = () => {
    setModalContent("update"); // Switch to update content
    form.setFieldsValue({
      fullname: user?.fullname,
      gender: user?.gender,
      day: user?.dob?.split("/")[0],
      month: user?.dob?.split("/")[1],
      year: user?.dob?.split("/")[2],
    });
  };
  const formatDate = (dateString) => {
    console.log(dateString);
    const [day, month, year] = dateString.split("/");
    // Ensure the date is properly formatted
    const date = new Date(`${year}-${month}-${day}`);
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    // This will return the format as 23/04/2025
    return date.toLocaleDateString("en-GB", options).replace(/\//g, "/");
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalContent("profile"); // Reset to profile content
  };

  const handleUpdateSubmit = async (values) => {
    let username = user.username;
    let fullname = values.fullname;
    let dob = `${values.day}/${String(values.month).padStart(2, "0")}/${String(
      values.year
    ).padStart(2, "0")}`;
    let gender = values.gender;

    const res = await updateUser(username, fullname, dob, gender);
    initAuth(); // Refresh user data after update

    setModalContent("profile"); // Switch back to profile content
  };

  return (
    <>
      {/* Main Modal */}
      <Modal
        title={
          modalContent === "profile"
            ? "Thông tin tài khoản"
            : "Cập nhật thông tin"
        }
        open={isModalOpen}
        width={400}
        onCancel={handleModalClose}
        centered
        footer={
          modalContent === "update" ? (
            <div style={{ textAlign: "right" }}>
              <Button
                onClick={() => setModalContent("profile")}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                Cập nhật
              </Button>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <Button className="border-0 text-xl" onClick={handleUpdateClick}>
                <EditTwoTone /> Cập nhật
              </Button>
            </div>
          )
        }
        className="rounded-2xl"
      >
        {modalContent === "profile" && (
          <div>
            <Image width="100%" height={200} src={user?.avt} />
            <div className="flex gap-5 items-center ml-6 relative bottom-5">
              <Image
                width={80}
                height={80}
                className="border-2"
                style={{ borderRadius: "50%" }}
                src={user?.avt}
              />
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-xl">
                  {user?.fullname || "Người dùng"}{" "}
                </h1>
                <Button
                  className="border-0 text-sm"
                  onClick={handleUpdateClick}
                >
                  <EditTwoTone />
                </Button>
              </div>
            </div>
            <div className="border-separate"></div>
            <div>
              <div className=" text-xl">Thông tin cá nhân</div>
              <table className="table-auto border-collapse w-full mt-4">
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Giới tính</td>
                    <td className="px-4 py-2">{user?.gender}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Ngày sinh</td>
                    <td className="px-4 py-2">{formatDate(user?.dob)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Điện thoại</td>
                    <td className="px-4 py-2">(+84) {user?.username}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {modalContent === "update" && (
          <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
            {/* Fullname */}
            <Form.Item
              label="Tên hiển thị"
              name="fullname"
              rules={[
                { required: true, message: "Vui lòng nhập tên hiển thị!" },
              ]}
            >
              <Input placeholder="Nhập tên hiển thị" />
            </Form.Item>

            {/* Gender */}
            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
              </Radio.Group>
            </Form.Item>

            {/* Date of Birth */}
            <Form.Item label="Ngày sinh">
              <div className="flex gap-2">
                <Form.Item
                  name="day"
                  rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
                  noStyle
                >
                  <Select placeholder="Ngày" style={{ width: "33%" }}>
                    {Array.from({ length: 31 }, (_, i) => (
                      <Select.Option key={i + 1} value={i + 1}>
                        {i + 1}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="month"
                  rules={[{ required: true, message: "Vui lòng chọn tháng!" }]}
                  noStyle
                >
                  <Select placeholder="Tháng" style={{ width: "33%" }}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <Select.Option key={i + 1} value={i + 1}>
                        {i + 1}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="year"
                  rules={[{ required: true, message: "Vui lòng chọn năm!" }]}
                  noStyle
                >
                  <Select placeholder="Năm" style={{ width: "33%" }}>
                    {Array.from(
                      { length: 100 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <Select.Option key={year} value={year}>
                        {year}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default Profile;
