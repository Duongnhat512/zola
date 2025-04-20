import React, { useState } from "react";
import { Modal, Switch, Button, Input, Tooltip } from "antd";
import {
  CopyOutlined,
  ReloadOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import socket from "../../services/Socket";
import Swal from 'sweetalert2';

const GroupSettingsModal = ({ visible, onClose, groupSettings, onUpdateSettings,seletedChat }) => {
  const [settings, setSettings] = useState(groupSettings);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onUpdateSettings(settings);
    onClose();
  };


  const handleDeleteGroup = async () => {
    if (seletedChat && seletedChat.conversation_id) {
      const result = await Swal.fire({
        title: 'Xác nhận xóa nhóm?',
        text: 'Bạn sẽ không thể khôi phục lại nhóm này!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        reverseButtons: true,
      });
  
      if (result.isConfirmed) {
        socket.emit("delete_conversation", { conversation_id: seletedChat.conversation_id });
        Swal.fire('Đã xóa!', 'Nhóm đã được xóa thành công.', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Đã hủy', 'Nhóm vẫn được giữ nguyên.', 'info');
      }
      
    } else {
      console.error("No conversation selected or invalid conversation ID");
    }
    onClose();
  };
  

  return (
    <Modal
      title="Quản lý nhóm"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <div className="space-y-4">
        <div>
          <Switch
            checked={settings.changeGroupInfo}
            onChange={() => handleToggle("changeGroupInfo")}
          />
          <span className="ml-2">Thay đổi tên & ảnh đại diện của nhóm</span>
        </div>
        <div>
          <Switch
            checked={settings.pinMessages}
            onChange={() => handleToggle("pinMessages")}
          />
          <span className="ml-2">Ghim tin nhắn, ghi chú, bình chọn lên đầu hội thoại</span>
        </div>
        <div>
          <Switch
            checked={settings.createReminders}
            onChange={() => handleToggle("createReminders")}
          />
          <span className="ml-2">Tạo mới ghi chú, nhắc hẹn</span>
        </div>
        <div>
          <Switch
            checked={settings.createPolls}
            onChange={() => handleToggle("createPolls")}
          />
          <span className="ml-2">Tạo mới bình chọn</span>
        </div>
        <div>
          <Switch
            checked={settings.sendMessages}
            onChange={() => handleToggle("sendMessages")}
          />
          <span className="ml-2">Gửi tin nhắn</span>
        </div>
        <div>
          <Switch
            checked={settings.approveNewMembers}
            onChange={() => handleToggle("approveNewMembers")}
          />
          <span className="ml-2">Chế độ phê duyệt thành viên mới</span>
        </div>
        <div>
          <Switch
            checked={settings.markLeaderMessages}
            onChange={() => handleToggle("markLeaderMessages")}
          />
          <span className="ml-2">Đánh dấu tin nhắn từ trưởng/phó nhóm</span>
        </div>
        <div>
          <Switch
            checked={settings.allowNewMembersRead}
            onChange={() => handleToggle("allowNewMembersRead")}
          />
          <span className="ml-2">Cho phép thành viên mới đọc tin nhắn gần nhất</span>
        </div>
        <div>
          <Switch
            checked={settings.allowJoinLink}
            onChange={() => handleToggle("allowJoinLink")}
          />
          <span className="ml-2">Cho phép dùng link tham gia nhóm</span>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Input value="zalo.me/g/djvuq760" readOnly className="flex-1" />
          <Tooltip title="Sao chép link">
            <Button icon={<CopyOutlined />} />
          </Tooltip>
          <Tooltip title="Tạo link mới">
            <Button icon={<ReloadOutlined />} />
          </Tooltip>
        </div>
        <div className="mt-6">
          <Button
            type="primary"
            danger
            icon={<UserDeleteOutlined />}
            block
            className="mb-2"
          >
            Chặn khỏi nhóm
          </Button>
          <Button
            type="primary"
            icon={<TeamOutlined />}
            block
            className="mb-2"
          >
            Trưởng & phó nhóm
          </Button>
          <Button
          onClick={handleDeleteGroup}
            type="primary"
            danger
            icon={<DeleteOutlined />}
            block
          >
            Giải tán nhóm
          </Button>
        </div>
        
      </div>
    </Modal>
  );
};

export default GroupSettingsModal;