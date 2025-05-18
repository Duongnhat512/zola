import { CalendarOutlined, IdcardOutlined, StopOutlined, TeamOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons'
import { Avatar, Button, Divider } from 'antd'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { cancelFriendRequest, createFriendRequest, deleteFriend, getRequestByUserIdAndUserFriendId } from '../../services/FriendService';
import { getPrivateConversation } from '../../services/Conversation';
import { setSelectedChat } from '../../redux/UserChatSlice';

const InfoFriend = ({ userInfo, handleBack, step }) => {
  const user = useSelector((state) => state.user.user);
  const [showMessage, setShowMessage] = useState(false);
  const [changeButton, setchangeButton] = useState(false);

  const handleRequestFriend = async () => {
    try {
      const response = await createFriendRequest(user.id, userInfo.id);
      if (response.code === 201) {
        // setStep("search"); // Quay lại bước tìm kiếm sau khi gửi yêu cầu
        setchangeButton("pending"); // Đặt nút thành "Đã gửi yêu cầu"
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

  const handleGetRequestFriendByUserIdAndUserFriendId = async () => {
    try {
      const response = await getRequestByUserIdAndUserFriendId(user.id, userInfo.id);
      console.log("Received friend requests:", response);
      if (response.data === null) {
        setchangeButton("add"); // Set button to "Add Friend"
        return;
      }
      if (response.code === 200) {
        // Check if the user is already a friend
        if (response.data.status === "pending") {
          setchangeButton("pending"); // Set button to "Unfriend"
        } else if (response.data.status === "accepted") {
          setchangeButton("accepted"); // Set button to "Unfriend"
        }
        else {
          setchangeButton("add"); // Set button to "Add Friend"
        }
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  }
  useEffect(() => {
    if (step === "info") {
      handleGetRequestFriendByUserIdAndUserFriendId();
    }
  }, [step, userInfo]); // Add userInfo as a dependency to re-fetch when it changes
  const handleCancelRequest = async () => {
    try {
      const response = await cancelFriendRequest(user.id, userInfo.id);
      if (response.code === 200) {
        setchangeButton("add"); // Quay lại bước tìm kiếm sau khi gửi yêu cầu
      } else {
        console.error("Không thể hủy gửi yêu cầu kết bạn:", response.message);
        setError("Không thể hủy gửi yêu cầu kết bạn.");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    }
    catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
    }
  }
  const handleDeleteFriend = async () => {
    try {
      const response = await deleteFriend(user.id, userInfo.id);
      if (response.code === 200) {
        setchangeButton("add"); // Quay lại bước tìm kiếm sau khi gửi yêu cầu
      } else {
        console.error("Không thể hủy gửi yêu cầu kết bạn:", response.message);
        setError("Không thể hủy gửi yêu cầu kết bạn.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
    }
  }
  return (
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
          backgroundImage: `url('${userInfo?.avt || "/default-avatar.jpg"
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
          src={userInfo.avt || "/default-avatar.jpg"}
          className="border-2 border-white shadow"
        />
        <p className="text-lg font-semibold mt-2">
          {userInfo.fullname || "N/A"}
        </p>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-center mt-4 gap-3">
        {changeButton === "pending" && (
          <Button onClick={handleCancelRequest}>Hủy lời mời</Button>
        )}

        {changeButton === "add" && (
          <Button onClick={handleRequestFriend}>Kết bạn</Button>
        )}

        {changeButton === "accepted" && (
          <Button onClick={handleDeleteFriend}>Hủy kết bạn</Button>
        )}

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
  )
}

export default InfoFriend;