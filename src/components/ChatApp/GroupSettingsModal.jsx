import React, { useState } from "react";
import { Modal, Switch, Button, Input, Tooltip, List, Avatar } from "antd";
import {
  CopyOutlined,
  ReloadOutlined,
  UserDeleteOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import socket from "../../services/Socket";
import Swal from 'sweetalert2';
import { useEffect } from "react";
import SelectNewLeaderModal from "./SelectNewLeaderModal";

const LeaderDeputyModal = ({ visible, onClose, leaders, onRemoveDeputy, onTransferLeader }) => {

  const tranferPermission = () => {
    Swal.fire({
      title: "Chuyển quyền trưởng nhóm",
      text: "Người được chọn sẽ trở thành trưởng nhóm và có mọi quyền quản lý nhóm. Bạn sẽ mất quyền quản lý nhưng vẫn là một thành viên của nhóm. Hành động này không thể phục hồi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Chuyển quyền",
      cancelButtonText: "Hủy",
      customClass: {
        container: 'my-swal-container'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onTransferLeader();
      }
    });
  }

  return (
    <Modal
      title="Trưởng & phó nhóm"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <List
        itemLayout="horizontal"
        dataSource={leaders}
        renderItem={(item) => (
          <List.Item
            actions={[
              item.permission === "moderator" && (
                <Button
                  type="text"
                  danger
                  icon={<UserDeleteOutlined />}
                  onClick={() => onRemoveDeputy(item, "member")}
                >
                  Xóa
                </Button>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.avt} />}
              title={item.fullname}
              description={item.permission === "owner" ? "Trưởng nhóm" : "Phó nhóm"}
            />
          </List.Item>
        )}
      />
      <div className="mt-4">
        <Button type="primary" block onClick={tranferPermission}>
          Chuyển quyền trưởng nhóm
        </Button>
      </div>
    </Modal>
  );
};

const GroupSettingsModal = ({ visible, onClose, groupSettings, grantPermission, onUpdateSettings, userMain, userOwner, seletedChat, disable }) => {
  const [settings, setSettings] = useState(groupSettings);
  const [leaderDeputyModalVisible, setLeaderDeputyModalVisible] = useState(false);
  const [selectNewLeaderModalVisible, setSelectNewLeaderModalVisible] = useState(false);

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

  const lowerPermission = () => {

  }

  const handleDeleteGroup = async () => {
    if (seletedChat && seletedChat.conversation_id) {
      const result = await Swal.fire({
        title: 'Xác nhận giải tán nhóm?',
        text: 'Bạn sẽ không thể khôi phục lại nhóm này!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        socket.emit("delete_conversation", { conversation_id: seletedChat.conversation_id });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Đã hủy', 'Nhóm vẫn được giữ nguyên.', 'info');
      }

    } else {
      console.error("No conversation selected or invalid conversation ID");
    }
    onClose();
  };

  const handleTransferLeader = (selectedMember) => {
    grantPermission(selectedMember, "owner");
    setSelectNewLeaderModalVisible(false);
    setLeaderDeputyModalVisible(false);
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
        {/* <div>
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
        </div> */}

        <div className="mt-6">

          {userMain?.permission === "owner" && (
            <div>
              <Button
                type="primary"
                icon={<TeamOutlined />}
                block
                className="mb-2"
                onClick={() => setLeaderDeputyModalVisible(true)}
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
          )}
        </div>
      </div>
      <LeaderDeputyModal
        visible={leaderDeputyModalVisible}
        onClose={() => setLeaderDeputyModalVisible(false)}
        leaders={groupSettings.leaders || []}
        onRemoveDeputy={grantPermission}
        onTransferLeader={() => setSelectNewLeaderModalVisible(true)}
      />
      <SelectNewLeaderModal
        visible={selectNewLeaderModalVisible}
        onClose={() => setSelectNewLeaderModalVisible(false)}
        members={groupSettings.members || []}
        onConfirm={handleTransferLeader}
      />
    </Modal>
  );
};

export default GroupSettingsModal;