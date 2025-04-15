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
import { getUserById, getUserSdt } from "../../services/UserService";
import { createFriendRequest } from "../../services/FriendService";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "../../redux/UserChatSlice";
import { getPrivateConversation } from "../../services/Conversation";

const { Option } = Select;

const AddFriendModal = ({ onClose, visible = true, isModalVisible }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState("search");
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [userInfo, setUserInfo] = useState({}); // Thông tin người dùng tìm thấy
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const suggestedFriends = [
    { name: "Cường Repair", source: "Từ số điện thoại" },
    { name: "Minh Thư", source: "Từ số điện thoại" },
    { name: "Quang Hải", source: "Từ số điện thoại" },
  ];
  const handleSearch = () => {
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Số điện thoại không hợp lệ!");
      setShowMessage(true); // Hiển thị thông báo lỗi
      setTimeout(() => setShowMessage(false), 3000); // Ẩn thông báo sau 3 giây
      return;
    }
    setError("");
    handleGetUser();
  };
  const handleGetUser = async () => {
    try {
      const response = await getUserSdt(phoneNumber);
      if (response.code === 200) {
        setUserInfo(response.user);
        setStep("info");
      } else {
        console.error("Không tìm thấy người dùng với số điện thoại này.");
        setError("Không tìm thấy người dùng với số điện thoại này.");

        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      setError("Không tìm thấy người dùng với số điện thoại này.");

      setShowMessage(true);
    }
  };
  const handleBack = () => {
    setStep("search");
  };
  const handleRequestFriend = async () => {
    try {
      const response = await createFriendRequest(user.id, userInfo.id);

      if (response.code === 201) {
        setStep("search"); // Quay lại bước tìm kiếm sau khi gửi yêu cầu
      } else {
        console.error("Không thể gửi yêu cầu kết bạn:", response.message);
        setError("Không thể gửi yêu cầu kết bạn.");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
    }
  };

  const handleMessageClick = async () => {
    try {
      // Fetch conversation data if it exists
      const response = await getPrivateConversation(user.id, userInfo.id);
      console.log("Private conversation response:", response);

      let chatData;

      // Prepare chat data based on conversation response
      if (response.status === "success") {
        if (response.conversation === null) {
          // No existing conversation, create new chat data
          chatData = {
            conversation_id: null,
            list_user_id: [userInfo.id],
            list_message: [],
            user: userInfo,
          };
        } else {
          // Use existing conversation data
          chatData = {
            ...response.conversation,
            user: userInfo,
          };
        }

        // Dispatch to Redux store - change the structure to match what your action creator expects
        dispatch(setSelectedChat(chatData));

        // Close the modal
        onClose();

        // Navigation will happen automatically if your app is set up to listen to the Redux store
      } else {
        console.error("Error fetching conversation:", response.message);
      }
    } catch (error) {
      console.error("Error setting up conversation:", error);
    }
  };
  return (
    <div>
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
                <h2 className="text-xl font-semibold text-gray-800">
                  Thêm bạn
                </h2>
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
                  className={`rounded-lg ${error ? "border-red-500" : ""}`}
                  prefix={
                    <PhoneOutlined className="text-gray-400 transform rotate-[95deg] transition-transform duration-300" />
                  }
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
                          <p className="text-xs text-gray-500">
                            {friend.source}
                          </p>
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

            {/* Background */}
            <div
              className="bg-gray-100 rounded-lg p-2"
              style={{
                backgroundImage: `url('${
                  userInfo?.avt || "https://via.placeholder.com/300"
                }')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "200px",
              }}
            ></div>

            {/* Avatar và tên */}
            <div className="flex flex-col items-center -mt-10">
              <Avatar
                size={64}
                src={userInfo.avt || "https://via.placeholder.com/150"}
                className="border-2 border-white shadow"
              />
              <p className="text-lg font-semibold mt-2">
                {userInfo.fullname || "N/A"}
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-center mt-4 gap-3">
              <Button onClick={handleRequestFriend}> Kết bạn </Button>
              <Button type="primary" onClick={handleMessageClick}>
                Nhắn tin
              </Button>
            </div>

            <Divider />

            {/* Thông tin cá nhân */}
            <div className="mt-6 px-4">
              <p className="text-gray-500 font-medium mb-1">
                Thông tin cá nhân
              </p>
              <div className="flex items-center justify-between border-b py-2">
                <span className="flex items-center gap-2 text-gray-600">
                  <UserOutlined />
                  Giới tính
                </span>
                <span>{userInfo.gender === "male" ? "Nam" : "Nữ"}</span>
              </div>
              <div className="flex items-center justify-between border-b py-2">
                <span className="flex items-center gap-2 text-gray-600">
                  <CalendarOutlined />
                  Ngày sinh
                </span>
                <span>{userInfo.dob || "N/A"}</span>
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
    </div>
  );
};

export default AddFriendModal;
