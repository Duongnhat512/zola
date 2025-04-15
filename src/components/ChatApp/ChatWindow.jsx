import React, { useEffect, useState } from "react";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";
import {
  EllipsisOutlined,
  CopyOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Input, Avatar, Button, Dropdown, Menu } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PaperClipOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { useRef } from "react";
const ChatWindow = ({
  selectedChat,
  input,
  setInput,
  messages,
  setMessages,
}) => {
  const selectedChatRef = useRef();
  const [emojiList, setEmojiList] = useState({});
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);
  const userMain = useSelector((state) => state.user.user);

  useEffect(() => {
    // console.log("Selected chat:", selectedChat);

    if (!selectedChat?.conversation_id) return;

    // Gửi yêu cầu lấy danh sách tin nhắn khi chọn đoạn chat
    socket.emit("get_messages", {
      conversation_id: selectedChat.conversation_id,
    });

    // Nhận danh sách tin nhắn
    socket.on("list_messages", (data) => {
      console.log("Received messages:", data);
      const dataSort = data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      const formattedMessages = dataSort.map((msg) => ({
        id: msg.message_id,
        sender: msg.sender_id === userMain.id ? "me" : "other",
        avatar: "/default-avatar.jpg",
        // msg.sender_id === userMain.id
        //   ? userMain.avatar || "/default-avatar.jpg"
        //   : selectedChat.user.avt || "/default-avatar.jpg",
        text: msg.message,
        media: msg.media,
        type: msg.type,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formattedMessages);
    });

    return () => {
      socket.off("list_messages");
    };
  }, [selectedChat?.conversation_id, selectedChat?.user_id, userMain.id]);

  useEffect(() => {
    socket.on("new_message", (msg) => {
      const currentChat = selectedChatRef.current;
      setMessages((prev) => [
        ...prev,
        {
          id: msg.message_id,
          sender: msg.sender_id === userMain.id ? "me" : "other",
          avatar:
            msg.sender_id === userMain.id
              ? userMain.avatar || "/default-avatar.jpg"
              : currentChat?.user?.avt || "/default-avatar.jpg",
          text: msg.message,
          media: msg.media,
          type: msg.type,
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });

    return () => {
      socket.off("new_message");
    };
  }, [userMain.id]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    // Gọi API để lấy danh sách emoji
    const fetchEmojis = async () => {
      try {
        const response = await fetch("https://api.github.com/emojis");
        const data = await response.json();
        setEmojiList(data);
      } catch (error) {
        console.error("Failed to fetch emojis:", error);
      }
    };

    fetchEmojis();
  }, []);
  const addEmojiToInput = (emojiUrl) => {
    const emojiUnicode = String.fromCodePoint(
      ...emojiUrl
        .split("/")
        .pop()
        .split(".")[0]
        .split("-")
        .map((hex) => parseInt(hex, 16))
    );
    setInput((prev) => prev + emojiUnicode);
    setIsEmojiPickerVisible(false);
  };
  const emojiDropdown = (
    <div className="grid grid-cols-8 gap-2 p-2 bg-white shadow-lg rounded-lg max-h-64 overflow-y-auto">
      {Object.entries(emojiList).map(([name, url]) => (
        <img
          key={name}
          src={url}
          alt={name}
          className="w-8 h-8 cursor-pointer"
          onClick={() => addEmojiToInput(url)} // Thêm emoji Unicode vào Input
        />
      ))}
    </div>
  );
  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      receiver_id: selectedChat?.list_user_id[0],
      message: input,
      type: "text",
      status: "sent",
    };
    socket.emit("send_private_message", msg, (response) => {
      console.log("====================================");
      console.log(msg + " " + userMain.id);
      console.log("====================================");
      if (response.status === "success") {
        console.log("Message sent successfully:", response);
        setMessages((prev) => [
          ...prev,
          {
            id: msg.message_id,
            sender: msg.sender_id === userMain.id ? "me" : "other",
            avatar:
              msg.sender_id === userMain.id
                ? userMain.avatar || "/default-avatar.jpg"
                : selectedChat.user.avt || "/default-avatar.jpg",
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        console.error("Failed to send message:", response.error);
      }
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`, // Tạo ID tạm thời cho tin nhắn
        sender: "me",
        avatar: userMain.avatar || "/default-avatar.jpg", // Avatar của người gửi
        text: input, // Nội dung tin nhắn
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "pending",
      },
    ]);

    setInput("");
  };
  const sendFile = (file) => {
    if (!file) return;

    const msg = {
      receiver_id: selectedChat?.list_user_id[0],
      file, // File to be sent
      type: "file",
      status: "sent",
    };

    socket.emit("send_private_file", msg, (response) => {
      if (response.status === "success") {
        console.log("File sent successfully:", response);
        setMessages((prev) => [
          ...prev,
          {
            id: response.message_id,
            sender: "me",
            avatar: userMain.avatar || "/default-avatar.jpg",
            text: file.name, // Display file name
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "file",
            fileUrl: response.file_url, // URL of the uploaded file
          },
        ]);
      } else {
        console.error("Failed to send file:", response.error);
      }
    });
  };

  const sendImage = async (image) => {
    if (!image) return;

    const tempId = `msg-${Date.now()}`;
    const now = new Date();

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];

      const fileMessage = {
        conversation_id: selectedChat?.conversation_id,
        sender_id: userMain.id,
        receiver_id: selectedChat?.list_user_id[0],
        file_name: image.name,
        file_type: image.type,
        file_size: image.size,
        file_data: `data:${image.type};base64,${base64Data}`,
        message: `Đã gửi ảnh: ${image.name}`,
        type: "image",
      };

      // Add temporary message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender: "me",
          avatar: userMain.avatar || "/default-avatar.jpg",
          text: "[Đang gửi ảnh...]",
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "pending",
          type: "image",
        },
      ]);

      socket.emit("send_private_file", fileMessage, (response) => {
        if (response.success) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    id: response.message_id || tempId,
                    status: "sent",
                    text: "[Ảnh đã gửi]",
                    time: response.time
                      ? new Date(response.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : m.time,
                    imageUrl: response.file_url,
                    sender: response.sender_id === userMain.id ? "me" : "other",
                    avatar:
                      response.sender_id === userMain.id
                        ? userMain.avatar || "/default-avatar.jpg"
                        : selectedChat?.user?.avt || "/default-avatar.jpg",
                  }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
          );
        }
      });
    };

    reader.readAsDataURL(image);
  };

  const messagesEndRef = useRef(null); // Tham chiếu đến phần cuối danh sách tin nhắn

  // Hàm cuộn đến tin nhắn cuối cùng
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const messageOptions = (msg) => (
    <Menu>
      <Menu.Item
        key="copy"
        icon={<CopyOutlined />}
        onClick={() => copyMessage(msg.text)}
      >
        Copy tin nhắn
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => deleteMessage(msg.id)}
      >
        Xóa tin nhắn ở phía tôi
      </Menu.Item>
      <Menu.Item
        key="revoke"
        icon={<UndoOutlined />}
        onClick={() => revokeMessage(msg.id)}
      >
        Thu hồi tin nhắn
      </Menu.Item>
    </Menu>
  );

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    console.log("Copied:", text);
  };

  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    console.log("Deleted message with ID:", id);
  };

  const revokeMessage = (id) => {
    // Gửi yêu cầu thu hồi tin nhắn qua socket
    socket.emit("revoke_message", { message_id: id }, (response) => {
      if (response.status === "success") {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        console.log("Message revoked:", id);
      } else {
        console.error("Failed to revoke message:", response.error);
      }
    });
  };
  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center flex-col text-center flex-1">
        <h1 className="text-2xl font-semibold text-gray-800">
          Chào mừng đến với <span className="text-blue-600">Zalo PC</span>!
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân,
          bạn bè được tối ưu hoá cho máy tính của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-white p-4 shadow flex items-center justify-between">
        <div className="flex items-center">
          <Avatar
            src={selectedChat?.user?.avt || "/default-avatar.jpg"}
            size="large"
            className="mr-3"
          />
          <div>
            <h2 className="font-semibold">{selectedChat.user?.fullname}</h2>
            <p className="text-sm text-gray-500">Vừa truy cập</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="flex gap-2 ml-2">
            <UserOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
          </Button>
          <button className="text-gray-600 hover:text-blue-500">
            <VideoCameraOutlined className="text-xl" title="Video call" />
          </button>
          <button className="text-gray-600 hover:text-blue-500">
            <SearchOutlined className="text-xl" title="Tìm kiếm" />
          </button>
          <button className="text-gray-600 hover:text-blue-500">
            <InfoCircleOutlined
              className="text-xl"
              title="Thông tin hộp thoại"
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "items-start"
            } gap-2`}
          >
            {msg.sender !== "me" && (
              <Avatar
                src={msg.avatar || "/default-avatar.jpg"}
                size="small"
                className="self-end"
              />
            )}
            <div
              className={`flex flex-col items-${
                msg.sender === "me" ? "end" : "start"
              }`}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "300px",
                    backgroundColor:
                      msg.sender === "me" ? "#d1e7ff" : "#ffffff",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {msg.type === "file" ? (
                    <img
                      src={msg.media}
                      alt={msg.message || "Đã gửi ảnh"}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    msg.message || msg.text
                  )}
                </div>

                <Dropdown
                  overlay={messageOptions(msg)}
                  trigger={["click"]}
                  placement={msg.sender === "me" ? "bottomRight" : "bottomLeft"}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  overlayStyle={{
                    width: "200px",
                    maxWidth: "300px",
                    wordWrap: "break-word",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      marginLeft: msg.sender === "me" ? "-50px" : "100px",
                      cursor: "pointer",
                      color: "#888",
                      position: "absolute",
                    }}
                  >
                    ⋮
                  </span>
                </Dropdown>
              </div>

              <span
                style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-4 mb-2 text-gray-600">
          <button
            className="hover:text-blue-500"
            title="Gửi ảnh"
            onClick={() => {
              const image = document.createElement("input");
              image.type = "file";
              image.accept = "image/*";
              image.onchange = (e) => sendImage(e.target.files[0]);
              image.click();
            }}
          >
            <PictureOutlined style={{ fontSize: "20px" }} />
          </button>
          <Dropdown
            overlay={emojiDropdown}
            trigger={["click"]}
            visible={isEmojiPickerVisible}
            onVisibleChange={(visible) => setIsEmojiPickerVisible(visible)}
          >
            <button className="hover:text-blue-500" title="Chọn Emoji">
              <SmileOutlined style={{ fontSize: "20px" }} />
            </button>
          </Dropdown>
          <button
            className="hover:text-blue-500"
            title="Gửi file"
            onClick={() => {
              const file = document.createElement("input");
              file.type = "file";
              file.onchange = (e) => sendFile(e.target.files[0]);
              file.click();
            }}
          >
            <PaperClipOutlined style={{ fontSize: "20px" }} />
          </button>
          <button className="hover:text-blue-500" title="Gửi tài liệu">
            <FileTextOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>

        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn"
            onPressEnter={sendMessage}
            className="rounded-full py-2 px-4 flex-1 mr-2"
          />
          <Button
            icon={<SendOutlined />}
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
