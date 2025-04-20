import React from "react";
import { Menu } from "antd";
import { CopyOutlined, DeleteOutlined, UndoOutlined } from "@ant-design/icons";

const MessageOptions = ({ msg, onCopy, onDelete, onRevoke }) => {
  return (
    <Menu>
      <Menu.Item key="copy" icon={<CopyOutlined />} onClick={() => onCopy(msg.text)}>
        Copy tin nhắn
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => onDelete(msg.id)}>
        Xóa tin nhắn ở phía tôi
      </Menu.Item>
      {msg.sender === "me" && (
        <Menu.Item key="revoke" icon={<UndoOutlined />} onClick={() => onRevoke(msg.id)}>
          Thu hồi tin nhắn
        </Menu.Item>
      )}
    </Menu>
  );
};

export default MessageOptions;