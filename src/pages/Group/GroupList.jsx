import React, { useState, useEffect } from "react";
import { Input, Avatar, List, Divider, Select, Button, Menu, Dropdown, message, Modal } from "antd";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import { deleteFriend, getListFriend } from "../../services/FriendService";
import { useDispatch, useSelector } from "react-redux";
import { getGroupById, getGroupConversation, getPrivateConversation } from "../../services/Conversation";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import InfoFriend from "../../components/ChatApp/InfoFriend";
import Swal from "sweetalert2";

const GroupList = () => {
  const [groups, setGroup] = useState([]);
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


  const handleBack = () => {
    setOpenModalFriend(false);
  }

  const fetchConversations = () => {


  }

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getGroupConversation(user.id);
        console.log(response);

        if (response.status === 'success' && Array.isArray(response.conversations)) {
          setGroup(response.conversations);
        }
      } catch (error) {
        console.error("Error fetching friend list:", error);
      }
    };

    fetchGroups();
  }, [user.id]);
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

    if (result.isConfirmed) {
      try {
        const response = await deleteFriend(user.id, friend.id);
        if (response.code === 200) {
          Swal.fire('Đã xóa!', 'Bạn đã xóa bạn thành công.', 'success');
          setFriends((prevFriends) =>
            prevFriends.filter((f) => f.id !== friend.id)
          );
        } else {
          Swal.fire('Thất bại', 'Xóa bạn không thành công.', 'error');
        }
      } catch (error) {
        console.error('Lỗi khi xóa bạn:', error);
        Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa bạn.', 'error');
      }
    }
  };
  const handleFindConversation = async (conversation) => {
    try {
      setSelectedChat(conversation);
      const response = await getGroupById(conversation.id);
      setSelectedChat(response.conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      {selectedChat === null ? (
        <div className="flex-1 bg-white p-6">
          <h1 className="text-xl font-semibold mb-4">Danh sách nhóm và cộng đồng</h1>
          <div className="flex justify-between items-center mb-4">
            <span>Nhóm và cộng đồng ({groups.length})</span>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm nhóm"
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

          <div>
            <List
              dataSource={groups}
              renderItem={(group) => {
                const menu = (
                  <Menu>
                    {/* <Menu.Item key="info" onClick={() => handleViewInfo(friend)}>
                        Xem thông tin
                      </Menu.Item> */}
                    <Menu.Item key="remove" onClick={() => handleDeleteFriend(group)}>
                      Rời nhóm
                    </Menu.Item>
                  </Menu>
                );

                return (
                  <List.Item className="flex items-center gap-4 justify-between">
                    <div onClick={() => handleFindConversation(group)}
                      className="flex flex-1 items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
                    >
                      <Avatar size={40} icon={<UserOutlined />} src={group.avatar} />
                      <div>
                        <span>{group.name}</span>
                        <p className="text-sm text-gray-500">
                          {group.no_of_member} thành viên
                        </p>
                      </div>

                    </div>

                    <Dropdown overlay={menu} trigger={['click']}>
                      <MoreOutlined className="text-xl cursor-pointer hover:text-gray-600" />
                    </Dropdown>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      ) : (
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          input={input}
          setMessages={setMessages}
          setInput={setInput}
          setChats={setChats}
          fetchConversations={fetchConversations}

        />
      )}
      {openModalFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-2 rounded-2xl shadow-lg max-w-md w-full">
            <InfoFriend
              userInfo={userInfo}
              handleBack={handleBack}
              step={step}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList;
