import React, { useState, useEffect } from "react";
import { Input, Avatar, List, Divider, Select, Button, Menu, Dropdown, message, Modal } from "antd";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import { deleteFriend, getListFriend } from "../../services/FriendService";
import { useDispatch, useSelector } from "react-redux";
import { getUserById, getUsersByListUserId } from "../../services/UserService";
import { setLoading } from "../../redux/UserSlice";
import { getPrivateConversation } from "../../services/Conversation";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import InfoFriend from "../../components/ChatApp/InfoFriend";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import InfoGroup from "../Group/InfoGroup";
import socket from "../../services/Socket";

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const user = useSelector((state) => state.user.user);
  const [userInfo, setUserInfo] = useState(null);
  const [openModalFriend, setOpenModalFriend] = useState(false);
  const [step, setStep] = useState("info");
  const [chats, setChats] = useState([]);
  const [isInfoGroupVisible, setIsInfoGroupVisible] = useState(false);
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
  const [infoPermissions, setInfoPermissions] = useState(null);
  const [isModalAddMemberVisible, setIsModalAddMemberVisible] = useState(false);
  const handleBack = () => {
    console.log('====================================');
    console.log("hehe");
    console.log('====================================');
    setOpenModalFriend(false);
  }
  const fetchConversations = () => {
    console.log('====================================');
    console.log('No log')
    console.log('====================================');
  };
  useEffect(() => {

    const fetchFriends = async () => {
      try {
        const response = await getListFriend(user.id);
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friend list:", error);
      }
    };

    fetchFriends();
  }, [user.id]);

  const filteredFriends = friends
    .filter((friend) =>
      friend.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "A-Z") {
        return a.fullname?.localeCompare(b.fullname || "");
      } else {
        return b.fullname?.localeCompare(a.fullname || "");
      }
    });


  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.fullname.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {});

  const handleFindConversation = async (userId, friend) => {
    setUserInfo(friend);
    try {
      const response = await getPrivateConversation(userId, friend.user_friend_id);
      console.log("Private conversation response:", response);
      if (response.status === "success") {
        // Handle successful conversation retrieval
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
          setChats((prevChats) =>
            prevChats.map((c) =>
              c.conversation_id === response.conversation.conversation_id
                ? { ...c, unread_count: 0 }
                : c
            )
          );
        } else {
          console.log("Conversation : " + response.conversation);

          setSelectedChat(response.conversation);

          setChats((prevChats) =>
            prevChats.map((c) =>
              c.conversation_id === response.conversation.conversation_id
                ? { ...c, unread_count: 0 }
                : c
            )
          );
        }
        fetchUserDetails(response.conversation, friend.user_friend_id); // Fetch user details for the conversation
      } else {
        console.error("Error fetching conversation:", response.message);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };
  const fetchUserDetails = async (chat, friendId) => {
    console.log("Fetching user details...", chat);
    friends.forEach((friend) => {
      if (friend.user_friend_id === friendId) {
        chat.name = friend.fullname;
        chat.avatar = friend.avt;
      }
    }
    );

    setSelectedChat(chat);
  };
  const handleViewInfo = (friend) => {
    setUserInfo(friend);
    setOpenModalFriend(true); // nếu bạn đang dùng modal
  };
  const handleDeleteFriend = async (friend) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa bạn',
      text: `Bạn có muốn xóa ${friend.fullname} khỏi danh sách bạn bè không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    console.log('====================================');
    console.log(friend);
    console.log('====================================');

    if (result.isConfirmed) {
      try {
        socket.emit("delete_friend", {
          user_id: user.id,
          user_friend_id: friend.user_friend_id,
        });
        toast.success('Đã xóa bạn thành công');
      } catch (error) {
        console.error('Lỗi khi xóa bạn:', error);
        toast.error('Đã xảy ra lỗi khi xóa bạn');
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      {selectedChat === null ? (
        <div className="flex-1 bg-white p-6">
          <h1 className="text-xl font-semibold mb-4">Danh sách bạn bè</h1>
          <div className="flex justify-between items-center mb-4">
            <span>Bạn bè ({friends.length})</span>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm bạn"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md"
              />
              <Select
                value={sortOrder}
                onChange={(value) => setSortOrder(value)}
                className="rounded-md"
              >
                <Select.Option value="A-Z">Tên (A-Z)</Select.Option>
                <Select.Option value="Z-A">Tên (Z-A)</Select.Option>
              </Select>
            </div>
          </div>

          {Object.keys(groupedFriends).map((letter) => (
            <div key={letter}>
              <Divider orientation="left">{letter}</Divider>
              <List
                dataSource={groupedFriends[letter]}
                renderItem={(friend) => {
                  const menu = (
                    <Menu>
                      <Menu.Item key="info" onClick={() => handleViewInfo(friend)}>
                        Xem thông tin
                      </Menu.Item>
                      <Menu.Item key="remove" onClick={() => handleDeleteFriend(friend)}>
                        Xóa bạn
                      </Menu.Item>
                    </Menu>
                  );

                  return (
                    <List.Item className="flex items-center gap-4 justify-between">
                      <div
                        onClick={() => handleFindConversation(user.id, friend)}
                        className="flex flex-1 items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
                      >
                        <Avatar size={40} icon={<UserOutlined />} src={friend.avt} />
                        <span>{friend.fullname}</span>
                      </div>

                      <Dropdown overlay={menu} trigger={['click']}>
                        <MoreOutlined className="text-xl cursor-pointer hover:text-gray-600" />
                      </Dropdown>
                    </List.Item>
                  );
                }}
              />
            </div>
          ))}

        </div>

      ) : (
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          input={input}
          setMessages={setMessages}
          setInput={setInput}
          setChats={setChats}
          setIsInfoGroupVisible={setIsInfoGroupVisible}
          isInfoGroupVisible={isInfoGroupVisible}
          fetchConversations={fetchConversations}
        />


      )}
      {isInfoGroupVisible && (
        <InfoGroup
          selectedChat={selectedChat}
          onClose={() => setIsInfoGroupVisible(false)}
          userInfo={userInfo}
          handleBack={handleBack}
          step={step}
        />
      )}
      <Modal
        open={openModalFriend}
        closable={false}
        footer={null}
        width={400}
        centered
        destroyOnClose
      >
        <InfoFriend
          setUserInfo={setUserInfo}
          setSelectedChat={setSelectedChat}
          userInfo={userInfo}
          handleBack={handleBack}
          step={step}
          setStep={setStep}
          setOpenModalFriend={setOpenModalFriend}
          fetchConversations={fetchConversations}
        />
      </Modal>

    </div>
  );
};

export default FriendList;
