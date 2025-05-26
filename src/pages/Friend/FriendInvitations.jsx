import React, { useEffect, useState } from "react";
import { Avatar, Button, Empty, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  createFriendRequest,
  getReceivedFriendRequests,
  getRequestByUserIdAndUserFriendId,
  getRequestFriend,
  rejectFriendRequest,
} from "../../services/FriendService";
import { useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";
import InfoFriend from "../../components/ChatApp/InfoFriend";
import { getPrivateConversation } from "../../services/Conversation";
import socket from "../../services/Socket";

const FriendInvitations = () => {
  const user = useSelector((state) => state.user.user);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModalFriend, setOpenModalFriend] = useState(false);

  const [changeButton, setchangeButton] = useState(false);

  const [userInfo, setUserInfo] = useState(null)
  const [step, setStep] = useState("info");

  const handleBack = () => {
    setOpenModalFriend(false);
  }
  const openInfoFriend = (user_friend_id) => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserById(user_friend_id);
        if (response.status === "success") {
          setUserInfo(response.user); // Assuming the user data is in response.data.user
        } else {
          console.error("Failed to fetch user info:", response.message);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setOpenModalFriend(true);
      }
    };
    fetchUserInfo();
  }
  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      try {
        const resSent = await getRequestFriend(user.id);
        if (resSent.code === 200 && Array.isArray(resSent.data)) {
          const detailedUsers = await Promise.all(
            resSent.data.map(async (request) => {
              try {
                const userDetail = await getUserById(request.user_friend_id);

                return userDetail?.user || null; // Ensure safe access to data
              } catch (error) {
                console.error(
                  "Error fetching user details for received invitations:",
                  error
                );
                return null;
              }
            })
          );
          setSentInvitations(detailedUsers.filter((user) => user !== null)); // Filter out null values
        }

        const resReceived = await getReceivedFriendRequests(user.id); // Replace with actual API for sent requests
        if (resReceived.code === 200 && Array.isArray(resReceived.data)) {
          const detailedUsers = await Promise.all(
            resReceived.data.map(async (request) => {
              try {
                const userDetail = await getUserById(request.user_id);
                return userDetail?.user || null; // Ensure safe access to data
              } catch (error) {
                console.error(
                  "Error fetching user details for sent invitations:",
                  error
                );
                return null;
              }
            })
          );
          setReceivedInvitations(detailedUsers.filter((user) => user !== null)); // Filter out null values
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, [user.id]);

  useEffect(() => {
    const handleCreateFriendRequest = async (data) => {
      console.log("Received friend request:", data);
      if (data.code === 200) {
        const receiver = await getUserById(data.to);
        if (receiver) {
          setSentInvitations((prev) => [...prev, receiver.user]);
        }
      } else {
        console.error("Failed to send friend request:", data.message);
      }
    };
    socket.on("friend_request_sent", handleCreateFriendRequest);
    return () => {
      socket.off("friend_request_sent", handleCreateFriendRequest);
    };
  }, [socket])

  useEffect(() => {
    const handleFriendRequest = async (data) => {
      console.log("Received friend request:", data);
      if (data.message) {
        const sender = await getUserById(data.from);
        console.log('====================================');
        console.log(sender);
        console.log('====================================');
        if (sender) {
          setReceivedInvitations((prev) => [...prev, sender.user]);
        }
      } else {
        console.error("Failed to send friend request:", data.message);
      }
    };

    socket.on("new_friend_request", handleFriendRequest);

    return () => {
      socket.off("new_friend_request", handleFriendRequest);
    };
  }, [socket])
  const handleWithdraw = async (id) => {
    socket.emit("cancel_friend_request", {
      user_id: user.id,
      user_friend_id: id
    })
  };
  useEffect(() => {
    const handleWithdraw = (data) => {
      if (data.code === 200 && data.from) {
        const acceptedId = data.from;
        console.log('====================================');
        console.log(acceptedId);
        console.log('====================================');

        // Loại bỏ lời mời kết bạn đã được chấp nhận khỏi danh sách
        setReceivedInvitations((prevInvitations) =>
          prevInvitations.filter((inv) => inv.id !== acceptedId)
        );
      }
    };
    socket.on("friend_request_deleted_notify", handleWithdraw);
    return () => {
      socket.off("friend_request_deleted_notify", handleWithdraw);
    };
  }, [socket]);
  useEffect(() => {
    const handleWithdraw = (data) => {
      if (data.code === 200 && data.data?.user_friend_id) {
        const acceptedId = data.data.user_friend_id;
        console.log('====================================');
        console.log(acceptedId);
        console.log('====================================');
        // Loại bỏ lời mời kết bạn đã được chấp nhận khỏi danh sách
        setSentInvitations((prevInvitations) =>
          prevInvitations.filter((inv) => inv.id !== acceptedId)
        );
      }
    };
    socket.on("friend_request_deleted", handleWithdraw);

    return () => {
      socket.off("friend_request_deleted", handleWithdraw);
    };
  }, [socket]);

  const handleAccept = async (id) => {
    const user_friend = await getUserById(id);
    console.log(user_friend);

    socket.emit("accept_friend_request", {
      user: user,
      user_friend: user_friend.user
    });
  };
  useEffect(() => {
    const handleAccept = (data) => {
      if (data.code === 200 && data.data?.result?.user_id) {
        const acceptedId = data.data.result.user_id;
        // Loại bỏ lời mời kết bạn đã được chấp nhận khỏi danh sách
        setReceivedInvitations((prevInvitations) =>
          prevInvitations.filter((inv) => inv.id !== acceptedId)
        );
      }
    };

    socket.on("friend_request_accepted", handleAccept);

    return () => {
      socket.off("friend_request_accepted", handleAccept);
    };
  }, [socket]);

  useEffect(() => {
    const handleAccept = (data) => {
      if (data.status === "success" && data.from) {
        const acceptedId = data.from;
        // Loại bỏ lời mời kết bạn đã được chấp nhận khỏi danh sách
        setSentInvitations((prevInvitations) =>
          prevInvitations.filter((inv) => inv.id !== acceptedId)
        );
      }
    };
    socket.on("friend_request_accepted_notify", handleAccept);

    return () => {
      socket.off("friend_request_accepted_notify", handleAccept);
    };
  }, [socket])

  const handleReject = async (id) => {
    socket.emit("reject_friend_request", {
      user_id: user.id,
      user_friend_id: id
    });
  };
  useEffect(() => {
    const handleReject = (data) => {
      if (data.code === 200 && data.data?.user_friend_id) {
        const acceptedId = data.data.user_friend_id;
        // Loại bỏ lời mời kết bạn đã bị từ chối
        setReceivedInvitations((prevInvitations) =>
          prevInvitations.filter((inv) => inv.id !== acceptedId)
        );
      }
    };
    socket.on("friend_request_rejected", handleReject);
    return () => {
      socket.off("friend_request_rejected", handleReject);
    };
  }, [socket]);

  useEffect(() => {
    const handleReject = (data) => {
      if (data.code === 200 && data.from) {
        const acceptedId = data.from;
        // Loại bỏ lời mời kết bạn đã bị từ chối
        setSentInvitations((prevInvitations) =>
          prevInvitations.filter((inv) => inv.id !== acceptedId)
        );
      }
    };

    socket.on("friend_request_rejected", handleReject);

    return () => {
      socket.off("friend_request_rejected", handleReject);
    };
  }, [socket])




  const renderInvitations = (invitations, isReceived) => {
    if (invitations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span>Không có lời mời nào</span>}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex flex-col items-center hover:cursor-pointer bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex flex-col items-center hover:cursor-pointer"
              onClick={() => openInfoFriend(invitation.id)}
            >
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={invitation.avatar}
                className="mb-3"
              />
              <p className="text-sm font-medium text-gray-800 mb-2">
                {invitation.fullname}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {isReceived ? "Đã gửi lời mời cho bạn" : "Bạn đã gửi lời mời"}
              </p>
            </div>
            {!isReceived ? (
              <Button
                type="default"
                className="w-full"
                onClick={() => handleWithdraw(invitation.id)}
              >
                Thu hồi lời mời
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAccept(invitation.id)}
                  type="primary"
                  className="w-full"
                >
                  Đồng ý
                </Button>
                <Button
                  onClick={() => handleReject(invitation.id)}
                  type="default"
                  className="w-full"
                >
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <h1 className="text-xl font-semibold mb-4">Lời mời kết bạn</h1>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane
          tab={`Lời mời đã gửi (${sentInvitations.length})`}
          key="1"
        >
          {renderInvitations(sentInvitations, false)}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={`Lời mời nhận được (${receivedInvitations.length})`}
          key="2"
        >
          {renderInvitations(receivedInvitations, true)}
        </Tabs.TabPane>
      </Tabs>

      {openModalFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-2 rounded-2xl shadow-lg max-w-md w-full">
            <InfoFriend
              userInfo={userInfo}
              handleBack={handleBack}
              step={step}
              isReceiveInvitation={true}
            />
          </div>
        </div>
      )}
    </div>

  );
};

export default FriendInvitations;
