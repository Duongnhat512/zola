import { useState } from "react";
import { Modal, Input, Avatar, Button, Radio, Upload, Divider } from "antd";
import {
  UserOutlined,
  CloseOutlined,
  SearchOutlined,
  PlusOutlined,
  CameraOutlined,
} from "@ant-design/icons";

const AddGroupModal = ({ onClose, visible = true }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const contacts = [
    { name: "Nguyễn Nhật Dương", avatar: null },
    { name: "Đạt", avatar: null },
    { name: "Bảo", avatar: null },
    { name: "Công túa :33", avatar: null },
    { name: "Võ Phước Hậu", avatar: null },
    { name: "Ánh Vân", avatar: null },
  ];

  // Group contacts by first letter
  const groupedContacts = contacts.reduce((acc, contact) => {
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  const handleContactSelect = (e) => {
    const value = e.target.value;
    if (selectedContacts.includes(value)) {
      setSelectedContacts(selectedContacts.filter((item) => item !== value));
    } else {
      setSelectedContacts([...selectedContacts, value]);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active === id
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal
      title={
        <div className="text-2xl font-semibold text-center pt-3">Tạo nhóm</div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="rounded-xl overflow-hidden my-1"
      closeIcon={
        <CloseOutlined className="text-gray-500 hover:text-gray-700 transition-colors text-xl" />
      }
      centered
    >
      <div className="px-6 pb-6">
        {/* Group Name Input with Upload */}
        <div className="flex items-center mb-8 pt-3">
          <div className="relative mr-5">
            <Avatar
              icon={<UserOutlined />}
              className="bg-blue-100 text-blue-500"
              size={70}
            />
            <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 border-2 border-white">
              <CameraOutlined className="text-sm text-gray-600" />
            </div>
          </div>
          <Input
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            size="large"
            className="rounded-lg text-lg h-12"
          />
        </div>

        {/* Search Input */}
        <div className="mb-5 relative">
          <Input
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="large"
            className="rounded-lg pl-10 h-12 text-base"
          />
          <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>

        {/* Tabs for Categories */}
        <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar">
          <TabButton id="all" label="Tất cả" active={activeTab} />
          <TabButton id="customers" label="Khách hàng" active={activeTab} />
          <TabButton id="work" label="Công việc" active={activeTab} />
          <TabButton id="friends" label="Bạn bè" active={activeTab} />
          <TabButton id="later" label="Trả lời sau" active={activeTab} />
        </div>

        <p className="text-base text-gray-600 mb-3 font-medium">
          Trò chuyện gần đây
        </p>

        {/* Contact List */}
        <div className="max-h-80 overflow-y-auto mb-6 pr-2">
          {Object.keys(groupedContacts)
            .sort()
            .map((letter) => (
              <div key={letter} className="mb-3">
                {letter !== "A" && letter !== "B" && (
                  <div className="text-sm text-gray-500 py-1 font-medium">
                    {letter}
                  </div>
                )}
                {letter === "A" && (
                  <div className="text-sm text-gray-500 py-1 font-medium">
                    A
                  </div>
                )}
                {letter === "B" && (
                  <div className="text-sm text-gray-500 py-1 font-medium">
                    B
                  </div>
                )}
                {groupedContacts[letter].map((contact) => (
                  <div
                    key={contact.name}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <Avatar
                        icon={<UserOutlined />}
                        className="bg-blue-100 text-blue-500 flex items-center justify-center mr-4"
                        size={48}
                      />
                      <p className="font-medium text-gray-800 text-base">
                        {contact.name}
                      </p>
                    </div>
                    <Radio
                      value={contact.name}
                      checked={selectedContacts.includes(contact.name)}
                      onChange={handleContactSelect}
                      className="scale-125"
                    />
                  </div>
                ))}
              </div>
            ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between pt-3">
          <Button
            onClick={onClose}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 h-11 rounded-lg font-medium text-base"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 h-11 rounded-lg font-medium text-base"
            disabled={!groupName || selectedContacts.length === 0}
          >
            Tạo nhóm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddGroupModal;
