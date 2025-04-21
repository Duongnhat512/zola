import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getListFriend } from "../../services/FriendService";
import { getUserById } from "../../services/UserService";
import { Avatar, Button, Checkbox, Input, Modal, Radio } from "antd";
import { CloseOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import socket from "../../services/Socket";
import { toast } from "react-toastify";

const AddMember = ({ visible = true, onClose, selectedChat }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const user = useSelector((state) => state.user.user);
  
    const handleFindContact = async () => {
      try {
        const response = await getFriendByPhoneAndName(user.id, searchTerm);
        if (response.code === 200) {
          setContacts(response.data);
        } else {
          console.error("Không tìm thấy người dùng với số điện thoại này.");
        }
      } catch (e) {
        console.log(e);
      }
    };
  
    const handleClose = () => {
      setSearchTerm("");
      setSelectedContacts([]);
      setContacts([]);
      onClose(); // <-- Gọi đúng prop
    };
  
    useEffect(() => {
      const fetchFriends = async () => {
        try {
          const response = await getListFriend(user.id);
    
          if (response.code === 200) {
            // Lấy danh sách user_id đã có trong nhóm
            const existingUserIds = selectedChat?.list_user_id.map(user => user.user_id) || [];
    
            // Lọc ra bạn bè chưa có trong nhóm
            const filteredFriends = response.data.filter(
              (friend) => !existingUserIds.includes(friend.user_friend_id)
            );
    
            // Lấy thông tin chi tiết của những bạn bè chưa có trong nhóm
            const detailedUsers = await Promise.all(
              filteredFriends.map(async (friend) => {
                try {
                  const res = await getUserById(friend.user_friend_id);
                  return res?.user || null;
                } catch (err) {
                  console.error("Lỗi khi lấy thông tin người dùng:", err);
                  return null;
                }
              })
            );
    
            // Cập nhật danh bạ
            setContacts(detailedUsers.filter(Boolean));
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách bạn bè:", error);
        }
      };
    
      fetchFriends();
    }, [user.id, selectedChat]);
    
  
    const handleContactSelect = (contactId) => {
        if (selectedContacts.includes(contactId)) {
            setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
          } else {
            setSelectedContacts([...selectedContacts, contactId]);
          }
    };
  
    const handleAddMembers = () => {
        if (selectedContacts.length === 0) {
          console.error("No members selected.");
          return;
        }
        
        selectedContacts.forEach((memberId) => {
          socket.emit("add_member", {
            conversation_id: selectedChat.conversation_id,
            user_id: memberId,
          });
        });
        console.log("Selected members:", selectedContacts);
        handleClose();
      };
    return (
      <Modal
        title={<div className="text-2xl font-semibold text-center pt-3">Thêm thành viên</div>}
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={600}
        className="rounded-xl overflow-hidden my-1"
        closeIcon={
          <CloseOutlined
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors text-xl"
          />
        }
        centered
      >
        <div className="px-6 pb-6">
          {/* Search Input */}
          <div className="flex items-center relative mb-5 space-x-4">
            <div className="relative flex-1">
              <Input
                placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                className="rounded-lg pl-12 h-12 text-base"
              />
              <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 h-12 rounded-lg font-medium text-base"
              onClick={handleFindContact}
            >
              Tìm kiếm
            </Button>
          </div>
  
          {/* Contact List */}
          <div className="max-h-80 overflow-y-auto mb-6 pr-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center flex-1">
                  <Avatar
                    src={contact.avt || "/default-avatar.jpg"}
                    icon={<UserOutlined />}
                    className="bg-blue-100 text-blue-500 flex items-center justify-center mr-4"
                    size={48}
                  />
                  <p className="font-medium text-gray-800 text-base">
                    {contact.fullname}
                  </p>
                </div>
                <Checkbox
                 value={contact.id}
                 checked={selectedContacts.includes(contact.id)}
                 onChange={() => handleContactSelect(contact.id)}
                 className="scale-125"
                />
              </div>
            ))}
          </div>
  
          {/* Footer Buttons */}
          <div className="flex justify-between pt-3">
            <Button
              onClick={handleClose}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 h-11 rounded-lg font-medium text-base"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 h-11 rounded-lg font-medium text-base"
              disabled={selectedContacts.length === 0}
              onClick={handleAddMembers}
            >
              Thêm thành viên
            </Button>
          </div>
        </div>
      </Modal>
    );
  };
  
  export default AddMember;
