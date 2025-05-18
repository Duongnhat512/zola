import { Menu } from "antd";
import { CopyOutlined, DeleteOutlined, UndoOutlined, SwapRightOutlined } from "@ant-design/icons";
import { PushpinOutlined } from '@ant-design/icons'; // sử dụng icon ghim

const MessageOptions = ({ msg, permission, onCopy, onDelete, onRevoke, onForward, onPinMessage }) => {
  return (
    <Menu>
      <Menu.Item key="forward" icon={<SwapRightOutlined />} onClick={onForward}>
        Chuyển tiếp
      </Menu.Item>

      {permission !== "member" && (msg.pinned === false || msg.pinned == null) && (
        <Menu.Item key="pin" icon={<PushpinOutlined />} onClick={onPinMessage}>
          Ghim tin nhắn
        </Menu.Item>
      )}


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