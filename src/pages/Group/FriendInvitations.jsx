import React, { useEffect, useState } from "react";
import { Avatar, Button, Empty, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  acceptFriendRequest,
  getReceivedFriendRequests,
  getRequestFriend,
  rejectFriendRequest,
} from "../../services/FriendService";
import { useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";

const FriendInvitations = () => {
  const user = useSelector((state) => state.user.user);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleWithdraw = (id) => {
    setSentInvitations(
      sentInvitations.filter((invitation) => invitation.id !== id)
    );
  };
  const handleAccept = async (id) => {
    try {
      const res = await acceptFriendRequest(user.id, id);
      (res);

      if (res.code === 200) {
        console.log("Accepted friend request successfully");
      } else {
        console.error("Failed to accept friend request", res.message);
      }
      setReceivedInvitations(
        receivedInvitations.filter((invitation) => invitation.id !== id)
      );
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };
  const handleReject = async (id) => {
    try {
      const res = await rejectFriendRequest(user.id, id);
      console.log(res);

      if (res.code === 200) {
        console.log("Reject friend request successfully");
      } else {
        console.error("Failed to reject friend request", res.message);
      }
      setReceivedInvitations(
        receivedInvitations.filter((invitation) => invitation.id !== id)
      );
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };

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
            className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200"
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
                  Chấp nhận
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
    </div>
  );
};

export default FriendInvitations;
