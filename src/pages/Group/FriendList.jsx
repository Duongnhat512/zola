import React, { useState, useEffect } from "react";
import { Input, Avatar, List, Divider, Select, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getListFriend } from "../../services/FriendService";
import { useDispatch, useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";
import { setLoading } from "../../redux/UserSlice";
import { getPrivateConversation } from "../../services/Conversation";
import ChatWindow from "../../components/ChatApp/ChatWindow";

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [selectedChat, setSelectedChat] = useState(null);
  const [flag, setFlag] = useState(1);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const user = useSelector((state) => state.user.user);
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getListFriend(user.id);
        if (response.code === 200 && Array.isArray(response.data)) {
          const detailedUsers = await Promise.all(
            response.data.map(async (request) => {
              try {
                const userDetail = await getUserById(request.user_friend_id);
                console.log(userDetail);

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
          setFriends(
            detailedUsers.filter((user) => user !== null) // Filter out null values
          );
        }
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
        return a.name?.localeCompare(b.name || "");
      } else {
        return b.name?.localeCompare(a.name || "");
      }
    });

  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.fullname.charAt(0).toUpperCase();
    console.log(firstLetter);

    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {});

  const handleFindConversation = async (userId, friendId) => {
    try {
      const response = await getPrivateConversation(userId, friendId);
      console.log("Private conversation response:", response);
      if (response.status === "success") {
        // Handle successful conversation retrieval
        console.log("Conversation data:", response.conversation);
        if (response.conversation === null) {
          setSelectedChat({
            conversation_id: null,
            list_user_id: [friendId],
            list_message: [],
          });
        } else {
          setSelectedChat(response.conversation);
        }
        fetchUserDetails(response.conversation, friendId); // Fetch user details for the conversation
      } else {
        console.error("Error fetching conversation:", response.message);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };
  const fetchUserDetails = async (chat, friendId) => {
    console.log("Fetching user details...", chat);

    if (!chat || !chat.list_user_id) {
      chat = {
        list_user_id: [friendId],
        list_message: [],
      };
    }

    try {
      const updatedChats = await Promise.all(
        chat.list_user_id.map(async (userId) => {
          console.log("Fetching user details for userId:", userId);
          try {
            const response = await getUserById(userId);
            if (response.status === "success") {
              return {
                ...chat,
                user: response.user,
              };
            } else {
              console.error(
                "Không lấy được thông tin người dùng:",
                response.message
              );
              return {
                ...chat,
                user: null,
              };
            }
          } catch (error) {
            console.error("Lỗi khi gọi API lấy user:", error);
            return {
              ...chat,
              user: null,
            };
          }
        })
      );

      console.log("Updated Chats:", updatedChats);

      // Nếu bạn chỉ cần 1 user (ví dụ người còn lại trong cuộc trò chuyện), dùng cái đầu tiên
      setSelectedChat(updatedChats[0]);
    } catch (error) {
      console.error("Lỗi khi xử lý danh sách chats:", error);
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
                dataSource={groupedFriends[letter]} // Only show users for the current key
                renderItem={(friend) => (
                  <List.Item
                    onClick={() => handleFindConversation(user.id, friend.id)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex flex-1 items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer">
                      <Avatar
                        size={40}
                        icon={<UserOutlined />}
                        src={friend.avatar}
                      />
                      <span>{friend.fullname}</span>
                    </div>
                  </List.Item>
                )}
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
        />
      )}
    </div>
  );
};

export default FriendList;
