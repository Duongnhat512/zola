import React, { useEffect, useState } from "react";
import { Avatar, Button, Empty, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getRequestFriend } from "../../services/FriendService";
import { useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";

const FriendInvitations = () => {
  const user = useSelector((state) => state.user.user);
  const [sentInvitations, setSentInvitations] = useState([
    { id: 1, name: "Nguyễn Văn A", avatar: "https://example.com/avatar1.jpg" },
    { id: 2, name: "Nguyễn Văn B", avatar: "https://example.com/avatar2.jpg" },
    { id: 3, name: "Nguyễn Văn C", avatar: "https://example.com/avatar3.jpg" },
    { id: 4, name: "Nguyễn Văn D", avatar: "https://example.com/avatar4.jpg" },
    { id: 5, name: "Nguyễn Văn E", avatar: "https://example.com/avatar5.jpg" },
    { id: 6, name: "Nguyễn Văn F", avatar: "https://example.com/avatar6.jpg" },
    { id: 7, name: "Nguyễn Văn G", avatar: "https://example.com/avatar7.jpg" },
    { id: 8, name: "Nguyễn Văn H", avatar: "https://example.com/avatar8.jpg" },
    { id: 9, name: "Nguyễn Văn I", avatar: "https://example.com/avatar9.jpg" },
  ]);
  const [receivedInvitations, setReceivedInvitations] = useState([
    { id: 1, name: "Nguyễn Văn A", avatar: "https://example.com/avatar1.jpg" },
    { id: 2, name: "Nguyễn Văn B", avatar: "https://example.com/avatar2.jpg" },
    { id: 3, name: "Nguyễn Văn C", avatar: "https://example.com/avatar3.jpg" },
    { id: 4, name: "Nguyễn Văn D", avatar: "https://example.com/avatar4.jpg" },
    { id: 5, name: "Nguyễn Văn E", avatar: "https://example.com/avatar5.jpg" },
    { id: 6, name: "Nguyễn Văn F", avatar: "https://example.com/avatar6.jpg" },
    { id: 7, name: "Nguyễn Văn G", avatar: "https://example.com/avatar7.jpg" },
    { id: 8, name: "Nguyễn Văn H", avatar: "https://example.com/avatar8.jpg" },
    { id: 9, name: "Nguyễn Văn I", avatar: "https://example.com/avatar9.jpg" },
  ]);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const resReceived = await getRequestFriend(user.id);
        if (resReceived.code === 200 && Array.isArray(resReceived.data)) {
          // const detailedUsers = await Promise.all(
          //   resReceived.data.map(async (request) => {
          //     try {
          //       const userDetail = await getUserById(request.user_friend_id);
          //       return userDetail.data;
          //     } catch (error) {
          //       console.error("Error fetching user details:", error);
          //       return null;
          //     }
          //   })
          // );
          setReceivedInvitations(resReceived.data); // Assuming resReceived.data contains the invitations
        }
        const resSent = await getRequestFriend(user.id); // Replace with actual API for sent requests
        if (resSent.code === 200 && Array.isArray(resSent.data)) {
          const detailedUsers = await Promise.all(
            resSent.data.map(async (request) => {
              try {
                const userDetail = await getUserById(request.user_friend_id);
                return userDetail.data;
              } catch (error) {
                console.error("Error fetching user details:", error);
                return null;
              }
            })
          );
          setSentInvitations(resSent.data);
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };

    fetchInvitations();
  }, [user.id]);

  const handleWithdraw = (id) => {
    setSentInvitations(
      sentInvitations.filter((invitation) => invitation.id !== id)
    );
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
              {invitation.name}
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
                <Button type="primary" className="w-full">
                  Chấp nhận
                </Button>
                <Button type="default" className="w-full">
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
    <div className="flex flex-col h-full bg-gray-100 p-6">
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
