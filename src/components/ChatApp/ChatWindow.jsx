import React, { useEffect, useState } from "react";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";
import {
  EllipsisOutlined,
  CopyOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Input, Avatar, Button, Dropdown, Menu, Image } from "antd";
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
import AddMember from "../../pages/Group/AddMember";
import InfoGroup from "../../pages/Group/InfoGroup";
import { toast } from "react-toastify";
const ChatWindow = ({
  selectedChat,
  setChats,
  fetchConversations,
  isInfoGroupVisible,
  setIsInfoGroupVisible,
}) => {
  const selectedChatRef = useRef();
  const [emojiList, setEmojiList] = useState({});
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpen = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);
  const userMain = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!selectedChat?.conversation_id) return;
    socket.emit("get_messages", {
      conversation_id: selectedChat.conversation_id,
    });

    socket.on("list_messages", (data) => {
      const dataSort = data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      console.log("list_messages", dataSort);
      const formattedMessages = dataSort.map((msg) => ({
        id: msg.id,
        sender: msg.sender_id === userMain.id ? "me" : "other",
        avatar:
          msg.sender_id === userMain.id
            ? userMain.avatar || "/default-avatar.jpg"
            : msg.sender_avatar || "/default-avatar.jpg",
        text: msg.message,
        media: msg.media,
        type: msg.type,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        file_name: msg.file_name || null,
      }));
      
      setMessages(formattedMessages);
    });

    

    return () => {
      socket.off("list_messages");
    };
  }, [selectedChat?.conversation_id, selectedChat?.user_id, userMain.id]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect(); // Đảm bảo socket được kết nối
    }
  
    socket.on("connect", () => {
      console.log("Socket connected");
    });
  
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  
    socket.on("new_message", (msg) => {
      console.log("New message event received:", msg);

      const currentChat = selectedChatRef.current;
      if (currentChat?.conversation_id === msg.conversation_id) {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.message_id,
            sender: msg.sender_id === userMain.id ? "me" : "other",
            avatar:
              msg.sender_id === userMain.id
                ? userMain.avatar || "/default-avatar.jpg"
                : msg.sender_avatar || "/default-avatar.jpg",
            text: msg.message,
            media: msg.media,
            type: msg.type,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            file_name: msg.file_name || null,
          },
        ]);
      }
      // Cập nhật danh sách hội thoại với số lượng tin nhắn chưa đọc
      setChats((prevChats) => {
        // Cập nhật danh sách hội thoại
        const updatedChats = prevChats.map((chat) => {
          console.log("chat", chat);
          
          if (chat.conversation_id === msg.conversation_id) {
            const isCurrentChat =
              selectedChat?.conversation_id === msg.conversation_id;

            return {
              ...chat,
              last_message: {
                ...chat.last_message,
                message: msg.message,
                created_at: msg.created_at,
                type: msg.type,
              },
              unread_count: isCurrentChat ? 0 : (chat.unread_count || 0) + 1, // Tăng badge nếu không phải `selectedChat`
            };
          }
          return chat;
        });

        // Sắp xếp danh sách hội thoại theo thời gian tin nhắn mới nhất
        return updatedChats.sort(
          (a, b) =>
            new Date(b.last_message?.created_at || 0) -
            new Date(a.last_message?.created_at || 0)
        );
      });
      
    });
    return () => {
      socket.off("new_message");
      socket.off("connect");
      socket.off("disconnect");
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
  useEffect(() => {
    socket.on("message_deleted", (msg) => {
      const currentChat = selectedChatRef.current;
      console.log("Message deleted event received:", msg);

      if (currentChat?.conversation_id === msg.conversation_id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.message_id
              ? { ...m, text: msg.message, media: null, file_name: null }
              : m
          )
        );
      }
    });
   
    return () => {
      socket.off("message_deleted");
    };
  }, [userMain.id]); 

  useEffect(() => {
    const handleNewMember = (data) => {
      toast.info("Bạn đã được thêm vào group", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
      if (selectedChat?.conversation_id === data.conversation_id) {
        setSelectedChat((prev) => ({
          ...prev,
          list_user_id: [...prev.list_user_id, data.user_id],
        }));
      }
    };
    socket.on("new_member", handleNewMember);
    return () => {
      socket.off("new_member", handleNewMember);
    };
  },[socket, selectedChat?.conversation_id, fetchConversations]);
  
  
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
          onClick={() => addEmojiToInput(url)}
        />
      ))}
    </div>
  );
  const sendMessage = () => {
    if (!input.trim() && !previewImage && !selectedFile) return; // Không gửi nếu không có nội dung
    const tempId = `msg-${Date.now()}`;
    const isGroup = selectedChat?.list_user_id?.length > 2;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "me",
        avatar: userMain.avatar || "/default-avatar.jpg",
        text: input || null,
        media: previewImage || null,
        file_name: msg.file_name || null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "pending",
      },
    ]);
    const msg = {
      conversation_id: selectedChat?.conversation_id || null,
      receiver_id: selectedChat?.list_user_id[0] || null,
      message: input || null,
      file_name: selectedImage?.file_name || selectedFile?.file_name || null,
      file_type: selectedImage?.file_type || selectedFile?.file_type || null,
      file_size: selectedImage?.file_size || selectedFile?.file_size || null,
      file_data: selectedImage?.file_data || selectedFile?.file_data || null,
    };
    console.log("isGroup", isGroup);
    
    console.log("msg", msg);

    const event = isGroup ? "send_group_message" : "send_private_message";
    socket.emit(event, msg, (response) => {});
    socket.on("message_sent", (msg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: msg.message_id,
                text: msg.message || null,
                media: msg.media || null,
                file_name: msg.file_name || null,
                type: msg.type || "text",
                time: new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: "sent",
              }
            : m
        )
      );
      fetchConversations();
    });
    setInput("");
    setPreviewImage(null);
    setSelectedFile(null);
    setSelectedImage(null);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result); // Lưu ảnh xem trước vào state
        setSelectedImage({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_data: reader.result, // Base64 của ảnh
        }); // Lưu thông tin file vào state
      };
      reader.readAsDataURL(file); // Đọc file dưới dạng Base64
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_data: reader.result, // Base64 của file
        }); // Lưu thông tin file vào state
      };
      reader.readAsDataURL(file); // Đọc file dưới dạng Base64
    }
    console.log("Selected file:", file);
  };
  const messagesEndRef = useRef(null);
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
      {msg.sender === "me" && (
        <Menu.Item
          key="revoke"
          icon={<UndoOutlined />}
          onClick={() => revokeMessage(msg.id)}
        >
          Thu hồi tin nhắn
        </Menu.Item>
      )}
    </Menu>
  );
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    console.log("Copied:", text);
  };
  const deleteMessage = (idMessage) => {
    const payload = {
      user_id: userMain.id,
      message_id: idMessage,
    };
    console.log("hidden message payload:", payload);

    socket.emit("set_hidden_message", payload, (response) => {});
    setMessages((prev) => prev.filter((msg) => msg.id !== idMessage));
  };
  const revokeMessage = (idMessage) => {
    console.log("Revoke message:", idMessage);

    const payload = {
      user_id: userMain.id,
      message_id: idMessage,
    };
    console.log("Revoke message payload:", payload);
    socket.emit("delete_message", payload, (response) => {});
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === idMessage
          ? {
              ...msg,
              text: "Tin nhắn đã thu hồi",
              media: null,
              file_name: null,
            }
          : msg
      )
    );
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
            src={selectedChat?.avatar || "/default-avatar.jpg"}
            size="large"
            className="mr-3"
          />
          <div>
            <h2 className="font-semibold">{selectedChat?.name}</h2>
            {selectedChat?.list_user_id?.length > 2 ? (
              <p className="text-sm text-gray-500">
                {selectedChat?.list_user_id?.length} thành viên
              </p>
            ) : (
              <p className="text-sm text-gray-500">Vừa truy cập</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="flex gap-2 ml-2" onClick={handleOpen}>
            <UserOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
          </Button>
          <button className="text-gray-600 hover:text-blue-500">
            <VideoCameraOutlined className="text-xl" title="Video call" />
          </button>
          <button className="text-gray-600 hover:text-blue-500">
            <SearchOutlined className="text-xl" title="Tìm kiếm" />
          </button>
          <button
            className="text-gray-600 hover:text-blue-500"
            onClick={() => setIsInfoGroupVisible(!isInfoGroupVisible)}
          >
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
                  {/* Hiển thị ảnh nếu có */}
                  {msg.type === "image" && msg.media && (
                    <Image
                      src={msg.media}
                      alt="Đã gửi ảnh"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        marginTop: msg.text ? "8px" : "0", // Thêm khoảng cách nếu có text
                      }}
                    />
                  )}
                  {msg?.text && <p>{msg.text}</p>}

                  {msg.type === "document" && msg.file_name && (
                    <a
                      href={msg.media || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        marginTop: msg.text || msg.image ? "8px" : "0", // Thêm khoảng cách nếu có text hoặc ảnh
                        color: "#007bff",
                        textDecoration: "underline",
                      }}
                    >
                      {msg.file_name}
                    </a>
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
                  {msg.text !== "Tin nhắn đã thu hồi" && (
                    <span
                      style={{
                        fontSize: "16px",
                        marginLeft: msg.sender === "me" ? "-15px" : "0",
                        right: msg.sender !== "me" && "-15px",
                        cursor: "pointer",
                        color: "#888",
                        position: "absolute",
                      }}
                    >
                      ⋮
                    </span>
                  )}
                </Dropdown>
              </div>

              <span
                style={{
                  fontSize: "12px",
                  color: "#888",
                  marginTop: "4px",
                }}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {isModalVisible && (
        <AddMember
          selectedChat={selectedChat}
          visible={isModalVisible}
          onClose={handleClose}
        />
      )}
      <div className="p-4 bg-white border-t">
        {previewImage && (
          <div className="mb-4">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-xs rounded-lg"
            />
          </div>
        )}
        {selectedFile && (
          <div className="mb-4">
            <p className="text-gray-600">File: {selectedFile.file_name}</p>
          </div>
        )}
        <div className="flex items-center gap-4 mb-2 text-gray-600">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <PictureOutlined style={{ fontSize: "20px" }} />
          </label>

          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <PaperClipOutlined style={{ fontSize: "20px" }} />
          </label>

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
