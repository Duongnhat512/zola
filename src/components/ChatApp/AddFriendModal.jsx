import { useState } from "react";
import { Modal, Input, Select, Avatar, Button, Divider } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  CloseOutlined,
  PhoneOutlined,
  TeamOutlined,
  ShareAltOutlined,
  StopOutlined,
  WarningOutlined,
  CalendarOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const AddFriendModal = ({ onClose, visible = true }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState("search"); // "search" hoặc "info"

  const suggestedFriends = [
    { name: "Cường Repair", source: "Từ số điện thoại" },
    { name: "Minh Thư", source: "Từ số điện thoại" },
    { name: "Quang Hải", source: "Từ số điện thoại" },
  ];
  const handleSearch = () => {
    // Chuyển sang bước hiển thị thông tin tài khoản
    setStep("info");
  };

  const handleBack = () => {
    // Quay lại bước nhập số điện thoại
    setStep("search");
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null} // Loại bỏ footer mặc định
      width={400}
      className="rounded-xl overflow-hidden bg-white shadow-lg flex flex-col"
      closeIcon={null}
      centered
    >
      {step === "search" ? (
        <div className="flex flex-col h-[760px]">
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Thêm bạn</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Input Section */}
            <div className="mb-6">
              <Input
                addonBefore={
                  <Select defaultValue="+84" className="w-20">
                    <Option value="+84">+84</Option>
                    <Option value="+1">+1</Option>
                    <Option value="+65">+65</Option>
                  </Select>
                }
                placeholder="Số điện thoại"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                size="large"
                className="rounded-lg"
                prefix={
                  <PhoneOutlined className="text-gray-400 transform rotate-[95deg] transition-transform duration-300" />
                }
              />
            </div>

            {/* Suggested Friends */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">
                Có thể bạn quen
              </p>
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {suggestedFriends.map((friend, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Avatar
                        icon={<UserOutlined />}
                        className="bg-blue-100 text-blue-500 flex items-center justify-center mr-3"
                        size={40}
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {friend.name}
                        </p>
                        <p className="text-xs text-gray-500">{friend.source}</p>
                      </div>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors text-sm">
                      Kết bạn
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-2 border-t">
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-medium text-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center font-medium"
            >
              <SearchOutlined className="mr-1" />
              Tìm kiếm
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-[760px]">
          <div className="px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Thông tin tài khoản
              </h2>
              <button
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>
          <div
            className="bg-gray-100 rounded-lg p-2"
            style={{
              backgroundImage: `url('https://via.placeholder.com/300')`, // Ảnh mặc định
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
              height: "200px",
            }}
          ></div>
          <div className="flex flex-col items-center -mt-10">
            <Avatar
              size={64}
              src="https://i.pravatar.cc/150?img=12"
              className="border-2 border-white shadow"
            />
            <p className="text-lg font-semibold mt-2">Trần Long</p>
          </div>
          <div className="flex justify-center mt-4 gap-3">
            <Button> Kết bạn </Button>
            <Button type="primary"> Nhắn tin </Button>
          </div>
          <Divider />
          {/* Thông tin cá nhân */}
          <div className="mt-6 px-4">
            <p className="text-gray-500 font-medium mb-1">Thông tin cá nhân</p>
            <div className="flex items-center justify-between border-b py-2">
              <span className="flex items-center gap-2 text-gray-600">
                <UserOutlined />
                Giới tính
              </span>
              <span>Nam</span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="flex items-center gap-2 text-gray-600">
                <CalendarOutlined />
                Ngày sinh
              </span>
              <span>05 tháng 09, 1977</span>
            </div>
          </div>
          <Divider />
          {/* Các hành động khác */}
          <div className="mt-2 px-4 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-blue-500 cursor-pointer">
              <TeamOutlined />
              Nhóm chung (0)
            </div>
            <div className="flex items-center gap-2 text-blue-500 cursor-pointer">
              <IdcardOutlined />
              Chia sẻ danh thiếp
            </div>
            <div className="flex items-center gap-2 text-red-500 cursor-pointer">
              <StopOutlined />
              Chặn tin nhắn và cuộc gọi
            </div>
            <div className="flex items-center gap-2 text-red-500 cursor-pointer">
              <WarningOutlined />
              Báo xấu
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddFriendModal;
