import { useState } from "react";
import { Modal, Input, Select, Avatar } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  CloseOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const AddFriendModal = ({ onClose, visible = true }) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const suggestedFriends = [
    { name: "Cường Repair", source: "Từ số điện thoại" },
    { name: "Minh Thư", source: "Từ số điện thoại" },
    { name: "Quang Hải", source: "Từ số điện thoại" },
  ];

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      className="rounded-xl overflow-hidden"
      closeIcon={null}
      centered
    >
      <div className="p-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Thêm bạn</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

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
              <PhoneOutlined className="text-gray-400  transform rotate-[95deg] transition-transform duration-300" />
            }
          />
        </div>

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
                    <p className="font-medium text-gray-800">{friend.name}</p>
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

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-medium text-gray-700"
          >
            Hủy
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center font-medium">
            <SearchOutlined className="mr-1" />
            Tìm kiếm
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddFriendModal;
