import React, { useState, useEffect } from "react";
import { Input, Avatar, List, Divider, Select } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getFriendList, getListFriend } from "../../services/FriendService";
import { useDispatch, useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";
import { setLoading } from "../../redux/UserSlice";

const FriendList = () => {
  const user = useSelector((state) => state.user.user);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");

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

  return (
    <div className="flex h-screen">
      {/* Main Content */}
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
                <List.Item className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
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
    </div>
  );
};

export default FriendList;
