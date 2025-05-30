import { CalendarOutlined, IdcardOutlined, StopOutlined, TeamOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons'
import { Avatar, Button, Divider } from 'antd'
import React, { use, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { cancelFriendRequest, createFriendRequest, deleteFriend, getRequestByUserIdAndUserFriendId } from '../../services/FriendService';
import { getPrivateConversation } from '../../services/Conversation';
import { setSelectedChat } from '../../redux/UserChatSlice';
import socket from '../../services/Socket';

const InfoFriend = ({ userInfo, handleBack, step, setSelectedChat, setUserInfo }) => {
  const user = useSelector((state) => state.user.user);
  const [showMessage, setShowMessage] = useState(false);
  const [changeButton, setchangeButton] = useState(false);

  const handleRequestFriend = async () => {
    socket.emit("send_friend_request", {
      user_id: user.id,
      user_friend_id: userInfo.id,
    })
  };
  useEffect(() => {
    socket.on("friend_request_sent", (data) => {
      console.log("Received friend request:", data);
      if (data.code === 200) {
        setchangeButton("pending");
      } else {
        console.error("Failed to send friend request:", data.message);
        setError("Failed to send friend request.");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    });

    return () => {
      socket.off("friend_request_sent");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("new_friend_request", (data) => {
      console.log("Received friend request:", data);
      if (data.from) {
        setchangeButton("pending");
      } else {
        console.error("Failed to send friend request:", data.message);
        setError("Failed to send friend request.");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    });

    return () => {
      socket.off("new_friend_request");
    };
  }, [socket]);
  const fetchUserDetails = async (chat, friendId) => {
    console.log("Fetching user details...", chat);
    chat.name = userInfo.fullname || "N/A";
    chat.avatar = userInfo.avt || "/default-avatar.jpg";

    setSelectedChat(chat);
  };
  const handleFindConversation = async (userId, friend) => {
    setUserInfo(friend);
    try {
      const response = await getPrivateConversation(userId, friend.id);
      console.log("Private conversation response:", response);
      if (response.status === "success") {
        // Handle successful conversation retrieval
        handleBack();
        if (response.newConversation) {
          console.log("newConversation  : " + response.newConversation);
          setSelectedChat({
            conversation_id: response.newConversation.id,
            list_user_id: response.newConversation.members,
            list_message: [],
            avatar: response.newConversation.avatar,
            name: response.newConversation.name,
            created_by: response.newConversation.created_by,
            unread_count: 0,
            is_unread: false,
          });
          // setChats((prevChats) =>
          //   prevChats.map((c) =>
          //     c.conversation_id === response.conversation.conversation_id
          //       ? { ...c, unread_count: 0 }
          //       : c
          //   )
          // );
        } else {
          console.log("Conversation : " + response.conversation);

          setSelectedChat(response.conversation);

          // setChats((prevChats) =>
          //   prevChats.map((c) =>
          //     c.conversation_id === response.conversation.conversation_id
          //       ? { ...c, unread_count: 0 }
          //       : c
          //   )
          // );
        }
        fetchUserDetails(response.conversation, friend.id);
      } else {
        console.error("Error fetching conversation:", response.message);
      }

    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const handleGetRequestFriendByUserIdAndUserFriendId = async () => {
    userInfo.id = userInfo.id || userInfo.user_friend_id;
    if (!userInfo.id) {
      console.error("User ID is not defined");
      return;
    }
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
          if (response.data.user_id !== user.id) {
            setchangeButton("approve"); // Set button to "Unfriend"
          }
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
  }, [step, userInfo]);

  const handleAccept = async () => {
    socket.emit("accept_friend_request", {
      user: user,
      user_friend: userInfo,
    });
  };
  useEffect(() => {
    const handleAccept = (data) => {

      if (data.code === 200 && data.data?.result?.user_id) {
        // Cập nhật trạng thái của nút
        setchangeButton("accepted");
        // Cập nhật danh sách bạn bè
      }
    };

    socket.on("friend_request_accepted", handleAccept);

    return () => {
      socket.off("friend_request_accepted", handleAccept);
    };
  }, [socket]);

  useEffect(() => {
    const handleAccept = (data) => {
      console.log('====================================');
      console.log(data);
      console.log('====================================');
      if (data.status === "success" && data.from) {
        setchangeButton("accepted");
      }
    };
    socket.on("friend_request_accepted_notify", handleAccept);

    return () => {
      socket.off("friend_request_accepted_notify", handleAccept);
    };
  }, [socket])

  const handleWithdraw = async () => {
    socket.emit("cancel_friend_request", {
      user_id: user.id,
      user_friend_id: userInfo.id
    })
  };
  useEffect(() => {
    const handleWithdraw = (data) => {
      if (data.code === 200 && data.data?.user_friend_id) {
        // Loại bỏ lời mời kết bạn đã được chấp nhận khỏi danh sách
        setchangeButton("add");
      }
    };
    socket.on("friend_request_deleted", handleWithdraw);

    return () => {
      socket.off("friend_request_deleted", handleWithdraw);
    };
  }, [socket]);
  useEffect(() => {
    const handleWithdraw = (data) => {
      if (data.code === 200 && data.from) {
        // Loại bỏ lời mời kết bạn đã được chấp nhận khỏi danh sách
        setchangeButton("add");
      }
    };
    socket.on("friend_request_deleted_notify", handleWithdraw);

    return () => {
      socket.off("friend_request_deleted_notify", handleWithdraw);
    };
  }, [socket]);


  const handleDeleteFriend = async () => {
    socket.emit("delete_friend", {
      user_id: user.id,
      user_friend_id: userInfo.id
    })
  }
  useEffect(() => {
    const handleDeleteFriend = (data) => {
      console.log('====================================');
      console.log(data);
      console.log('====================================');
      if (data.code === 200) {
        setchangeButton("add")
      }
    };
    socket.on("friend_deleted", handleDeleteFriend);

    return () => {
      socket.off("friend_deleted", handleDeleteFriend);
    };
  }, [socket])
  useEffect(() => {
    const handleDeleteFriend = (data) => {
      if (data.code === 200) {
        setchangeButton("add")
      }
    };
    socket.on("friend_deleted_notify", handleDeleteFriend);

    return () => {
      socket.off("friend_deleted_notify", handleDeleteFriend);
    };
  }, [socket])
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
        {changeButton === "approve" && (
          <Button onClick={handleAccept}>Chấp nhận</Button>
        )}
        {changeButton === "pending" && (
          <Button onClick={handleWithdraw}>Hủy lời mời</Button>
        )}

        {changeButton === "add" && (
          <Button onClick={handleRequestFriend}>Kết bạn</Button>
        )}

        {changeButton === "accepted" && (
          <Button onClick={handleDeleteFriend}>Hủy kết bạn</Button>
        )}

        <Button type="primary" onClick={() => handleFindConversation(user.id, userInfo)}>
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