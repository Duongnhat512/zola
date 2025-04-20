import React, { useState } from "react";
import { Modal, Input, Button, Avatar, List } from "antd";

const SelectNewLeaderModal = ({ visible, onClose, members, onConfirm }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  
  console.log(selectedMember);

  
  return (
    <Modal
      title="Chọn trưởng nhóm mới"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Input placeholder="Tìm kiếm" className="mb-4" />
      <List
        itemLayout="horizontal"
        dataSource={members}
        renderItem={(item) => (
          <List.Item
            onClick={() => setSelectedMember(item)}
            className={`cursor-pointer px-2 py-1 rounded ${selectedMember?.id === item.id ? "bg-[#c0c0c0]" : ""}`}
            >
            <List.Item.Meta
              avatar={<Avatar src={item.avt} />}
              title={item.fullname}
              description={item.permission === "moderator" ? "Phó nhóm" : "Thành viên"}
            />
          </List.Item>
        )}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose}>Hủy</Button>
        <Button
          type="primary"
          onClick={() => {
            if (selectedMember) {
              onConfirm(selectedMember);
            }
          }}
          disabled={!selectedMember}
        >
          Chọn và tiếp tục
        </Button>
      </div>
    </Modal>
  );
};

export default SelectNewLeaderModal;