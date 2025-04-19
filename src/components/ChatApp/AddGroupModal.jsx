import { useEffect, useState } from "react";
import { Modal, Input, Avatar, Button, Radio, Upload, Divider, notification } from "antd";
import {
  UserOutlined,
  CloseOutlined,
  SearchOutlined,
  PlusOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { getFriendByPhoneAndName, getListFriend } from "../../services/FriendService";
import { useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";
import socket from "../../services/Socket"; // Import your socket instance
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho Toastify
import { toast } from "react-toastify"; // Import react-toastify

const AddGroupModal = ({ onClose, visible = true }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const user = useSelector((state) => state.user.user);

  const [contacts, setContacts] = useState([]);
  
  const handleFindContact = async () => {
    try {
      const response = await getFriendByPhoneAndName(user.id, searchTerm);
      if (response.code === 200) {
        setContacts(response.data);
      } else {
        console.error("Không tìm thấy người dùng với số điện thoại này.");
        return false;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleImageUpload = (info) => {
    console.log(info);
    if (info.file) {
      const file = info.file;
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getListFriend(user.id);
        if (response.code === 200 && Array.isArray(response.data)) {
          const detailedUsers = await Promise.all(
            response.data.map(async (request) => {
              try {
                const userDetail = await getUserById(request.user_friend_id);
                return userDetail?.user || null; // Ensure safe access to data
              } catch (error) {
                console.error("Error fetching user details:", error);
                return null;
              }
            })
          );
          setContacts(detailedUsers.filter((user) => user !== null)); // Filter out null values
        }
      } catch (error) {
        console.error("Error fetching friend list:", error);
      }
    };

    fetchFriends();
  }, [user.id]);

  useEffect(() => {
    socket.on("group_created", (data) => {
      console.log("Group created successfully:", data);
      // Thông báo cho người dùng về việc tạo nhóm thành công
      toast.success(`Nhóm ${data.conversation.name} đã được tạo thành công!`, {
        autoClose: 5000, // Thời gian tự động đóng sau 5 giây
        hideProgressBar: true, // Ẩn thanh tiến độ
        closeOnClick: true, // Đóng khi người dùng nhấn vào thông báo
        pauseOnHover: true, // Dừng khi hover
      });

      // Đóng modal sau khi nhóm được tạo
      onClose();
    });
    socket.on("new_member", (data) => {
      console.log("New member added to group:", data);
      // Thông báo có thành viên mới trong nhóm
      toast.info(`Có thành viên mới trong nhóm ${data.conversation.name}!`, {
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
    });

    return () => {
      socket.off("group_created");
      socket.off("new_group");
    };

  }, [socket, onClose]);

  const handleCreateGroup = () => {
    if (!groupName || selectedContacts.length < 2) {
      console.error("Group name or members are missing.");
      return;
    }
  
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(",")[1]; // Extract base64 data
  
        const groupData = {
          name: groupName,
          members: selectedContacts,
          file_name: imageFile.name,
          file_type: imageFile.type,
          file_size: imageFile.size,
          file_data: base64Data,
        };
  
        console.log("Group data to be sent:", groupData);
  
        socket.emit("create_group", groupData, (response) => {
          if (response.status === "success") {
            console.log("Group created successfully:", response);
            onClose();
            socket.emit("get_conversations", { user_id: user.id });
          } else {
            console.error("Failed to create group:", response.message);
          }
        });
      };
      reader.readAsDataURL(imageFile);
    } else {
      // Không có ảnh thì chỉ gửi name, members
      const groupData = {
        name: groupName,
        members: selectedContacts,
      };
  
      socket.emit("create_group", groupData, (response) => {
        if (response.status === "success") {
          console.log("Group created successfully:", response);
          onClose();
          socket.emit("get_conversations", { user_id: user.id });
        } else {
          console.error("Failed to create group:", response.message);
        }
      });
    }
  };
  

  const handleContactSelect = (e) => {
    const value = e.target.value;
    if (selectedContacts.includes(value)) {
      setSelectedContacts(selectedContacts.filter((item) => item !== value));
    } else {
      setSelectedContacts([...selectedContacts, value]);
    }
  };

  return (
    <Modal
      title={<div className="text-2xl font-semibold text-center pt-3">Tạo nhóm</div>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="rounded-xl overflow-hidden my-1"
      closeIcon={
        <CloseOutlined className="text-gray-500 hover:text-gray-700 transition-colors text-xl" />
      }
      centered
    >
      <div className="px-6 pb-6">
        {/* Group Name Input */}
        <div className="flex items-center mb-8 pt-3">
          <div className="relative mr-5">
            <Avatar
              src={previewImage || null}
              icon={!previewImage && <UserOutlined />}
              className="bg-blue-100 text-blue-500"
              size={70}
            />
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleImageUpload}
            >
              <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 border-2 border-white">
                <CameraOutlined className="text-sm text-gray-600" />
              </div>
            </Upload>
          </div>
          <Input
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            size="large"
            className="rounded-lg text-lg h-12"
          />
        </div>

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
                  src={contact.avt || "https://via.placeholder.com/150"}
                  icon={<UserOutlined />}
                  className="bg-blue-100 text-blue-500 flex items-center justify-center mr-4"
                  size={48}
                />
                <p className="font-medium text-gray-800 text-base">
                  {contact.fullname}
                </p>
              </div>
              <Radio
                value={contact.id}
                checked={selectedContacts.includes(contact.id)}
                onChange={handleContactSelect}
                className="scale-125"
              />
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between pt-3">
          <Button
            onClick={onClose}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 h-11 rounded-lg font-medium text-base"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 h-11 rounded-lg font-medium text-base"
            disabled={!groupName || selectedContacts.length === 0 || selectedContacts.length < 2}
            onClick={handleCreateGroup}
          >
            Tạo nhóm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddGroupModal;